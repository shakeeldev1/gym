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

    const prompt = `You are a professional fitness coach creating a personalized workout program.

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
Create a detailed ${duration}-week personalized workout program that:
1. Matches their experience level and equipment
2. Avoids exercises that conflict with their injuries
3. Addresses their specific request and goals
4. Is realistic and sustainable
5. Includes progression strategy

Please respond in JSON format with this structure:
{
  "programName": "Program Title",
  "duration": ${duration},
  "reasoning": "Why this program works for them",
  "weeklySchedule": "Description of weekly structure (e.g., Upper/Lower split)",
  "exercises": [
    {
      "day": "Monday",
      "exerciseName": "Exercise Name",
      "sets": 3,
      "reps": "8-10",
      "rest": 90,
      "notes": "Form tips or modifications"
    }
  ],
  "progressionNotes": "How to progress over the weeks",
  "nutritionTips": "Brief nutrition recommendations"
}

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
