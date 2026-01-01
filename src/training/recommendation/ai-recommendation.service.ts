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
  console.warn(
    '⚠️ @google/generative-ai package not installed. AI recommendations disabled.',
  );
}

/* =========================
   DTOs & Interfaces
========================= */

export interface AIRecommendationRequest {
  userId: string;
  userDescription: string;
  programDuration?: number;
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

/* =========================
   Service
========================= */

@Injectable()
export class AIRecommendationService {
  private genAI: any;

  private readonly modelCandidates = [
    'models/gemini-3-flash-preview', // Frontier intelligence at high speed (recommended)
    'models/gemini-3-pro-preview',  // Most advanced for complex reasoning and coding
    'models/gemini-2.5-flash',      // Stable production backbone for general use
    'models/gemini-2.5-pro',        // Stable production backbone for deep reasoning
  ];

  constructor(
    @InjectModel(Exercise.name)
    private exerciseModel: Model<Exercise>,

    @InjectModel(UserProfile.name)
    private userProfileModel: Model<UserProfile>,
  ) {
    if (!GoogleGenerativeAI) {
      throw new Error(
        'Google Generative AI SDK not available. Install @google/generative-ai.',
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable not set');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /* =========================
     PUBLIC — Non-Streaming
  ========================= */



  async generateAIRecommendation(
    dto: AIRecommendationRequest,
  ): Promise<AIGeneratedProgram> {
    try {
      const profile = await this.userProfileModel
        .findOne({ userId: dto.userId })
        .lean();

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

      const result = await this.safeGenerateContent(prompt);
      const responseText = result.response.text();

      return this.parseAIResponse(responseText);
    } catch (error: any) {
      const message = error?.message || 'Unknown AI error';

      if (message.includes('All Gemini models failed')) {
        const err = new Error('AI_MODEL_UNAVAILABLE');
        (err as any).code = 'AI_MODEL_UNAVAILABLE';
        throw err;
      }

      throw new BadRequestException(
        `Failed to generate AI recommendation: ${message}`,
      );
    }
  }

  /* =========================
     PUBLIC — Streaming
  ========================= */

  async *streamAIRecommendation(
    dto: AIRecommendationRequest,
  ): AsyncGenerator<string, void, unknown> {
    const profile = await this.userProfileModel
      .findOne({ userId: dto.userId })
      .lean();

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

    const model = await this.getAvailableModel();
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }

  /* =========================
     GEMINI CORE LOGIC
  ========================= */

  private async safeGenerateContent(prompt: string) {
    const model = await this.getAvailableModel();
    return model.generateContent(prompt);
  }

  private async getAvailableModel() {
    let lastError: any;

    for (const modelName of this.modelCandidates) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });

        // Lightweight probe to verify access
        await model.generateContent('ping');
        return model;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';

        if (msg.includes('404') || msg.includes('not found')) {
          continue;
        }

        throw err;
      }
    }

    throw new Error(
      'All Gemini models failed. Verify API enablement, billing, and model access.',
    );
  }

  /* =========================
     PROMPT BUILDER
  ========================= */

  private buildAIPrompt(
    profile: any,
    userDescription: string,
    duration: number,
    availableExercises: string,
  ): string {
    const userContext = `
USER COMPREHENSIVE PROFILE:

PERSONAL DETAILS:
- Full Name: ${profile.fullName || 'Not provided'}
- Age: ${profile.dateOfBirth
        ? new Date().getFullYear() -
        new Date(profile.dateOfBirth).getFullYear()
        : 'Not specified'
      }
- Measurement System: ${profile.measurementSystem || 'metric'}
- Height: ${profile.height || 'Not provided'}
- Weight: ${profile.weight || 'Not provided'}
- Main Goals: ${profile.mainGoals?.join(', ') || 'Not specified'}

LIFESTYLE & HEALTH:
- Pregnancy Status: ${profile.pregnancyStatus || 'Not applicable'}
- Sleep: ${profile.sleepHoursPerNight || 'Not specified'} hours
- Stress Sources: ${profile.stressSource?.join(', ') || 'None'}

EXERCISE:
- Exercise Level: ${profile.currentExerciseLevel || 'Not specified'}
- Training Days: ${profile.trainingDaysPerWeek || 3}
- Equipment: ${profile.availableEquipment?.join(', ') || 'Bodyweight'}

USER REQUEST:
${userDescription}
`;

    const jsonSchema = `
{
  "programName": "string (program title)",
  "duration": number (weeks),
  "reasoning": "string (brief explanation)",
  "weeklySchedule": "string (overview of week)",
  "exercises": [
    {
      "day": "string (e.g., Monday)",
      "exerciseName": "string",
      "sets": number,
      "reps": "string (e.g., '8-10')",
      "rest": number (seconds),
      "notes": "string"
    }
  ],
  "progressionNotes": "string",
  "nutritionPlan": {
    "overview": "string",
    "meals": [
      {
        "name": "string",
        "time": "string (HH:MM)",
        "description": "string",
        "proteinGrams": number
      }
    ]
  },
  "sleepPlan": {
    "targetHours": "string (e.g., '7-9')",
    "sleepWindow": "string (e.g., '22:30-06:30')",
    "preSleepRoutine": "string",
    "wakeRoutine": "string"
  },
  "recoveryPlan": {
    "restDaysPerWeek": number,
    "mobilityMinutesPerDay": number,
    "stressManagement": "string",
    "hydration": "string"
  },
  "fastingPlan": {
    "recommendedWindow": "string",
    "guidance": "string",
    "hydration": "string",
    "caution": "string"
  }
}
`;

    return `You are a professional fitness coach and wellness expert.

${userContext}

AVAILABLE EXERCISES:
${availableExercises}

TASK: Create a ${duration}-week personalized wellness program.

OUTPUT REQUIREMENTS:
- Respond ONLY with valid JSON (no markdown, no explanation, no code blocks).
- Start with { and end with }
- Use this exact schema:
${jsonSchema}

Generate the program now (JSON only):`;
  }

  /* =========================
     RESPONSE PARSER
  ========================= */

  private parseAIResponse(responseText: string): AIGeneratedProgram {
    try {
      // Handle markdown code blocks (```json { ... } ```)
      let jsonStr = responseText;
      const mdMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (mdMatch && mdMatch[1]) {
        jsonStr = mdMatch[1].trim();
      }

      // Fallback: extract first JSON object
      if (!jsonStr.includes('{')) {
        throw new Error('No JSON object found in response');
      }

      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON object');
      }

      const program = JSON.parse(jsonMatch[0]) as AIGeneratedProgram;

      if (!program.programName || !Array.isArray(program.exercises)) {
        throw new Error('Invalid AI program structure');
      }

      program.exercises = program.exercises.map((ex) => ({
        day: ex.day || 'Unknown',
        exerciseName: ex.exerciseName || '',
        sets: ex.sets || 3,
        reps: ex.reps || '8-10',
        rest: ex.rest || 90,
        notes: ex.notes || '',
      }));

      program.nutritionPlan = program.nutritionPlan || { meals: [] };
      program.sleepPlan = program.sleepPlan || { targetHours: '7-9' };
      program.recoveryPlan = program.recoveryPlan || {};
      program.fastingPlan = program.fastingPlan || {};

      return program;
    } catch (error: any) {
      const msg = error?.message || 'Unknown parse error';
      throw new BadRequestException(
        `Failed to parse AI response: ${msg}`,
      );
    }
  }
}
