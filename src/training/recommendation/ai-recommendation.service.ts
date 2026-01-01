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
    } catch (error: any) {
      const message = error?.message || 'Unknown AI error';
      const isModelUnavailable = message.includes('All Gemini models failed');

      // Downgrade to warn for model-availability errors; allow caller to fallback
      if (isModelUnavailable) {
        console.warn('AI Recommendation unavailable (model not enabled). Using fallback.', message);
        const err = new Error('AI_MODEL_UNAVAILABLE');
        (err as any).code = 'AI_MODEL_UNAVAILABLE';
        throw err;
      }

      console.error('AI Recommendation Error:', error);
      throw new BadRequestException(
        `Failed to generate AI recommendation: ${message}`,
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

    // Build comprehensive user context from new profile fields
    const userContext = `
USER COMPREHENSIVE PROFILE:

PERSONAL DETAILS:
- Full Name: ${profile.fullName || 'Not provided'}
- Age: ${profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : 'Not specified'}
- Measurement System: ${profile.measurementSystem || 'metric'}
- Height: ${profile.height ? `${profile.height}${profile.measurementSystem === 'imperial' ? ' inches' : ' cm'}` : 'Not provided'}
- Weight: ${profile.weight ? `${profile.weight}${profile.measurementSystem === 'imperial' ? ' lbs' : ' kg'}` : 'Not provided'}
- Main Goals: ${profile.mainGoals?.join(', ') || 'Not specified'}
- Emotional Commitment Level: ${profile.emotionalCommitmentLevel || 'Not specified'}
- Expected Weight Loss Goal: ${profile.expectedWeightLossGoal ? `${profile.expectedWeightLossGoal}${profile.measurementSystem === 'imperial' ? ' lbs' : ' kg'}` : 'Not specified'}

LIFESTYLE & HEALTH:
- Pregnancy Status: ${profile.pregnancyStatus || 'Not applicable'}
- Stress Sources: ${profile.stressSource?.join(', ') || 'None specified'}
- Stress Management: ${profile.stressManagementTechniques?.join(', ') || 'None specified'}
- Sleep: ${profile.sleepHoursPerNight || 'Not specified'} hours per night
- Household Size: ${profile.householdSize || 'Not specified'}
- Additional Info: ${profile.additionalInfo || 'None'}

NUTRITION:
- Eating Style: ${profile.eatingStyle || 'Not specified'}
- Typical Day Eating: ${profile.typicalDayOfEating || 'Not described'}
- Favorite Foods: ${profile.favoriteFood || 'Not specified'}
- Food Allergies/Intolerances: ${profile.foodAllergiesIntolerances?.join(', ') || 'None'}
- Current Medications: ${profile.currentMedications || 'None'}
- Medical Conditions: ${profile.medicalConditions?.join(', ') || 'None'}

EXERCISE & MOVEMENT:
- Current Exercise Level: ${profile.currentExerciseLevel || profile.experienceLevel || 'Not specified'}
- Typical Workout Routine: ${profile.typicalWorkoutRoutine || 'Not described'}
- Enjoyed Exercise Types: ${profile.enjoyedExerciseTypes?.join(', ') || 'Not specified'}
- Disliked Exercise Types: ${profile.dislikedExerciseTypes?.join(', ') || 'Not specified'}
- Exercise Restrictions/Pain: ${profile.exerciseRestrictions?.join(', ') || profile.injuries?.join(', ') || 'None'}
- Training Days Per Week: ${profile.trainingDaysPerWeek || profile.preferredDaysPerWeek || 3}
- Preferred Training Location: ${profile.preferredTrainingLocation || 'Not specified'}
- Session Length: ${profile.sessionLengthMinutes || 45} minutes
- Available Equipment: ${profile.availableEquipment?.join(', ') || 'Bodyweight only'}

SUPPORT & ACCOUNTABILITY:
- Past Barriers to Goals: ${profile.pastBarriersToGoals?.join(', ') || 'Not specified'}
- Motivation Factors: ${profile.motivationFactors?.join(', ') || 'Not specified'}
- Accountability Buddy Preference: ${profile.accountabilityBuddyPreference || 'None'}
- Support Level Preference: ${profile.supportLevelPreference || 'Moderate'}
- Additional Notes: ${profile.additionalNotes || 'None'}

USER'S SPECIFIC REQUEST: ${userDescription}
`;

    const prompt = `You are a professional fitness coach, nutritionist, and wellness expert creating a HIGHLY PERSONALIZED complete wellness program based on comprehensive user onboarding data.

${userContext}

AVAILABLE EXERCISES TO RECOMMEND:
${availableExercises}

TASK:
Create a detailed ${duration}-week personalized program that:
1. DEEPLY considers their comprehensive profile (goals, lifestyle, health conditions, preferences, barriers, motivations)
2. Matches their current exercise level and enjoyed exercise types
3. Avoids disliked exercises and any movements that conflict with their restrictions/pain areas
4. Addresses their specific request, main goals, and emotional commitment level
5. Takes into account their stress sources and suggests appropriate stress management
6. Considers their eating style, allergies, and medical conditions in nutrition planning
7. Addresses their past barriers and leverages their motivation factors
8. Provides support/accountability aligned with their preferences
9. Is realistic for their household size, sleep patterns, and lifestyle
10. Includes progression strategy tailored to their experience
11. Suggests a simple fasting window ONLY if appropriate given pregnancy status, medical conditions, and goals
12. Provides comprehensive sleep and recovery guidance based on current sleep hours

CRITICAL SAFETY CONSIDERATIONS:
- If pregnant or has medical conditions: provide conservative recommendations with medical consultation advice
- If has exercise restrictions/pain: completely avoid contraindicated movements
- If has food allergies: exclude all allergens from meal suggestions
- If takes medications: note potential interactions with fasting/intense exercise
- If underweight or has eating disorders history: DO NOT recommend calorie restriction or fasting

Please respond in JSON format with this structure:
{
  "programName": "Program Title (personalized to their goals)",
  "duration": ${duration},
  "reasoning": "Why this SPECIFIC program works for THIS person's unique profile, goals, barriers, and motivations",
  "weeklySchedule": "Description of weekly structure considering their training days preference and location",
  "exercises": [
    { "day": "Monday", "exerciseName": "Exercise from available list", "sets": 3, "reps": "8-10", "rest": 90, "notes": "Form tips, modifications for their restrictions, or motivation reminders" }
  ],
  "progressionNotes": "How to progress over weeks based on their experience and goals",
  "nutritionTips": "Brief nutrition recommendations aligned with eating style and goals",
  "nutritionPlan": {
    "overview": "Nutrition strategy considering eating style, allergies, household size, favorite foods",
    "dailyCalories": 0,
    "proteinTargetGrams": 0,
    "carbsTargetGrams": 0,
    "fatsTargetGrams": 0,
    "meals": [
      { "name": "Breakfast", "time": "8:00", "description": "Meal respecting their eating style and allergies", "proteinGrams": 0, "carbsGrams": 0, "fatsGrams": 0, "notes": "" }
    ]
  },
  "sleepPlan": {
    "targetHours": "Based on current sleep hours, gradually improve",
    "sleepWindow": "Realistic window for their lifestyle",
    "preSleepRoutine": "Routine incorporating their stress management techniques",
    "wakeRoutine": "Morning routine aligned with their goals",
    "notes": "Address their specific sleep challenges" 
  },
  "recoveryPlan": {
    "restDaysPerWeek": 1,
    "mobilityMinutesPerDay": 10,
    "stressManagement": "Specific techniques from their preferred stress management methods",
    "hydration": "Water targets appropriate for their exercise level",
    "notes": "Recovery aligned with their barriers and lifestyle"
  },
  "fastingPlan": {
    "recommendedWindow": "e.g., 14:10 ONLY if safe given pregnancy/medical status",
    "guidance": "How to execute safely for their profile",
    "hydration": "Hydration reminders",
    "caution": "Specific cautions for their medical conditions, pregnancy status, medications"
  }
}

Rules:
- BE HIGHLY SPECIFIC to this user's comprehensive profile
- Reference their specific goals, barriers, motivations, and preferences throughout
- Keep meals aligned with their eating style and exclude ALL allergens
- If user has medical conditions/pregnancy: provide conservative recommendations + require medical consultation
- If fasting seems unsafe: set fastingPlan to a cautious note instead of a window
- Use their preferred training location and enjoyed exercises
- Address their past barriers with specific strategies
- Leverage their motivation factors to keep them engaged

Create a comprehensive, DEEPLY PERSONALIZED program that feels custom-made for THIS specific person.`;

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
