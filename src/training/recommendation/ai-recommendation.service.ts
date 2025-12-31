import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise } from '../exercise/exercise.schema';
import { UserProfile } from '../../user/schemas/userProfile.schema';

let GoogleGenerativeAI: any;

try {
  const module = require('@google/generative-ai');
  GoogleGenerativeAI = module.GoogleGenerativeAI;
} catch (error) {
  console.warn('⚠️ @google/generative-ai package not installed. AI recommendations will be disabled until package is installed.');
}

export interface AIRecommendationRequest {
  userId: string;
  userDescription: string;
  programDuration?: number; // weeks
  specificGoals?: string[];
}

export interface AIGeneratedProgram {
  programName: string;
  duration: number;
  reasoning: string;
  weeklySchedule: string;
  exercises: Array<{
    day: string;
    exerciseName: string;
    sets: number;
    reps: string;
    rest: number;
    notes: string;
  }>;
  progressionNotes: string;
  nutritionTips?: string;
  nutritionPlan?: {
    overview?: string;
    dailyCalories?: number;
    proteinTargetGrams?: number;
    carbsTargetGrams?: number;
    fatsTargetGrams?: number;
    meals?: Array<{
      name: string;
      time?: string;
      description?: string;
      proteinGrams?: number;
      carbsGrams?: number;
      fatsGrams?: number;
      notes?: string;
    }>;
  };
  sleepPlan?: {
    targetHours: string;
    sleepWindow?: string;
    preSleepRoutine?: string;
    wakeRoutine?: string;
    notes?: string;
  };
  recoveryPlan?: {
    restDaysPerWeek?: number;
    mobilityMinutesPerDay?: number;
    stressManagement?: string;
    hydration?: string;
    notes?: string;
  };
  fastingPlan?: {
    recommendedWindow?: string;
    guidance?: string;
    hydration?: string;
    caution?: string;
  };
}

@Injectable()
export class AIRecommendationService {
  private genAI: any;
  private model: any;
  private readonly modelCandidates = [
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash-001',
    'gemini-1.0-pro-latest',
    'gemini-pro',
  ];

  constructor(
    @InjectModel(Exercise.name) private exerciseModel: Model<Exercise>,
    @InjectModel(UserProfile.name) private userProfileModel: Model<UserProfile>,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!GoogleGenerativeAI) {
      throw new Error(
        'Google Generative AI not initialized. Please install @google/generative-ai: npm install @google/generative-ai'
      );
    }
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.getFirstAvailableModel();
  }

  async generateAIRecommendation(
    dto: AIRecommendationRequest,
  ): Promise<AIGeneratedProgram> {
    try {
      // Get user profile for context
      const profile = await this.userProfileModel.findOne({ userId: dto.userId }).lean();
      if (!profile) {
        throw new BadRequestException('User profile not found');
      }

      // Get available exercises for the system to reference
      const exercises = await this.exerciseModel.find().lean();
      const exerciseNames = exercises.map((e) => e.name).join(', ');

      // Build the prompt
      const prompt = this.buildAIPrompt(
        profile,
        dto.userDescription,
        dto.programDuration || 8,
        exerciseNames,
      );

      // Call Gemini API (with model fallback if 404)
      const result = await this.safeGenerateContent(prompt);
      const responseText = result.response.text();

      // Parse the response
      const program = this.parseAIResponse(responseText);

      return program;
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      throw new BadRequestException(
        `Failed to generate AI recommendation: ${error.message}`,
      );
    }
  }

  // Try model list until one succeeds (handles 404 model-not-found issues)
  private getFirstAvailableModel() {
    let lastError: any = null;
    for (const name of this.modelCandidates) {
      try {
        return this.genAI.getGenerativeModel({ model: name });
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('No Gemini model could be initialized');
  }

  private async safeGenerateContent(prompt: string) {
    for (const name of this.modelCandidates) {
      const model = this.genAI.getGenerativeModel({ model: name });
      try {
        return await model.generateContent(prompt);
      } catch (err: any) {
        const message = err?.message || '';
        if (message.includes('404') || message.includes('not found')) {
          continue; // try next model
        }
        throw err;
      }
    }
    throw new Error('All Gemini models failed (404). Please verify API access and enabled models.');
  }

  private buildAIPrompt(
    profile: any,
    userDescription: string,
    duration: number,
    availableExercises: string,
  ): string {
    const experienceMap = {
      beginner: 'beginner with 0-3 months experience',
      intermediate: 'intermediate with 3-12 months experience',
      advanced: 'advanced with 1+ years experience',
    };

    const prompt = `You are a professional fitness coach creating a complete wellness program (training + nutrition guidance + sleep/recovery + fasting suggestion when appropriate).

USER PROFILE:
- Experience Level: ${experienceMap[profile.experienceLevel] || 'beginner'}
- Available Equipment: ${profile.availableEquipment?.join(', ') || 'bodyweight only'}
- Injuries/Constraints: ${profile.injuries?.join(', ') || 'none'}
- Goals: ${profile.goal || 'general fitness'}
- Preferred Days Per Week: ${profile.preferredDaysPerWeek || 4}
- Session Length: ${profile.sessionLengthMinutes || 60} minutes
- User's Specific Request: ${userDescription}

AVAILABLE EXERCISES TO RECOMMEND:
${availableExercises}

TASK:
Create a detailed ${duration}-week personalized program that:
1. Matches their experience level and available equipment
2. Avoids exercises that conflict with injuries/constraints
3. Addresses their specific request and goals
4. Is realistic and sustainable
5. Includes progression strategy
6. Provides concise nutrition guidance (not medical advice)
7. Suggests a simple fasting window ONLY if appropriate and safe; include cautions
8. Includes sleep and recovery guidance

Please respond in JSON format with this structure:
{
  "programName": "Program Title",
  "duration": ${duration},
  "reasoning": "Why this program works for them",
  "weeklySchedule": "Description of weekly structure (e.g., Upper/Lower split)",
  "exercises": [
    { "day": "Monday", "exerciseName": "Exercise Name", "sets": 3, "reps": "8-10", "rest": 90, "notes": "Form tips or modifications" }
  ],
  "progressionNotes": "How to progress over the weeks",
  "nutritionTips": "Brief nutrition recommendations",
  "nutritionPlan": {
    "overview": "Concise nutrition strategy",
    "dailyCalories": 0,
    "proteinTargetGrams": 0,
    "carbsTargetGrams": 0,
    "fatsTargetGrams": 0,
    "meals": [
      { "name": "Breakfast", "time": "8:00", "description": "Example meal", "proteinGrams": 0, "carbsGrams": 0, "fatsGrams": 0, "notes": "" }
    ]
  },
  "sleepPlan": {
    "targetHours": "7-9",
    "sleepWindow": "22:30-06:30",
    "preSleepRoutine": "Simple routine",
    "wakeRoutine": "Morning light exposure",
    "notes": "" 
  },
  "recoveryPlan": {
    "restDaysPerWeek": 1,
    "mobilityMinutesPerDay": 10,
    "stressManagement": "Breathing/meditation guidance",
    "hydration": "Water targets",
    "notes": ""
  },
  "fastingPlan": {
    "recommendedWindow": "e.g., 14:10 if suitable",
    "guidance": "How to execute safely",
    "hydration": "Hydration reminders",
    "caution": "Who should avoid or consult a doctor"
  }
}

Rules:
- Keep meals simple and general; do NOT prescribe for medical conditions.
- If user has injuries, avoid contraindicated exercises.
- If fasting seems unsafe (e.g., underweight, pregnancy, medical conditions if hinted), set fastingPlan to a cautious note instead of a window.

Create a comprehensive, personalized program based on the user's profile and request.`;

    return prompt;
  }

  private parseAIResponse(responseText: string): AIGeneratedProgram {
    try {
      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const program = JSON.parse(jsonMatch[0]) as AIGeneratedProgram;

      // Validate required fields
      if (
        !program.programName ||
        !program.reasoning ||
        !Array.isArray(program.exercises)
      ) {
        throw new Error('Invalid program structure');
      }

      // Ensure exercises have required fields
      program.exercises = program.exercises.map((ex) => ({
        day: ex.day || 'Unknown',
        exerciseName: ex.exerciseName || '',
        sets: ex.sets || 3,
        reps: ex.reps || '8-10',
        rest: ex.rest || 90,
        notes: ex.notes || '',
      }));

      // Normalize optional plans
      program.nutritionPlan = program.nutritionPlan || { meals: [] };
      program.sleepPlan = program.sleepPlan || { targetHours: '7-9' };
      program.recoveryPlan = program.recoveryPlan || {};
      program.fastingPlan = program.fastingPlan || {};

      return program;
    } catch (error) {
      console.error('Parse Error:', error);
      throw new BadRequestException(
        'Failed to parse AI response. Please try again.',
      );
    }
  }

  // Stream AI response for real-time generation
  async *streamAIRecommendation(
    dto: AIRecommendationRequest,
  ): AsyncGenerator<string, void, unknown> {
    try {
      const profile = await this.userProfileModel.findOne({ userId: dto.userId }).lean();
      if (!profile) {
        throw new BadRequestException('User profile not found');
      }

      const exercises = await this.exerciseModel.find().lean();
      const exerciseNames = exercises.map((e) => e.name).join(', ');

      const prompt = this.buildAIPrompt(
        profile,
        dto.userDescription,
        dto.programDuration || 8,
        exerciseNames,
      );

      const result = await this.model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error('Stream Error:', error);
      throw new BadRequestException(
        `Failed to stream AI recommendation: ${error.message}`,
      );
    }
  }
}
