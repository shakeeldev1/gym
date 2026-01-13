import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sleep } from '../../mindset-recovery/schemas/sleep.schema';
import { Breathwork } from '../../mindset-recovery/schemas/breathwork.schema';
import { Meditation } from '../../mindset-recovery/schemas/meditation.schema';
import { SleepSuggestion } from '../../mindset-recovery/schemas/sleep-suggestion.schema';
import { MeditationSuggestion } from '../../mindset-recovery/schemas/meditation-suggestion.schema';
import { BreathworkSuggestion } from '../../mindset-recovery/schemas/breathwork-suggestion.schema';
import { Meal } from '../../nutrition/meal/schemas/meal.schema';
import { RecoveryPlan } from '../../mindset-recovery/schemas/recovery-plan.schema';
import { MealType } from '../../nutrition/meal/enum/meal-type.enum';
import { NutritionGoal } from '../../nutrition/nutrition-goal/schemas/nutrition-goal.schema';
import { Fasting } from '../../fasting/schemas/fasting.schema';
import { GoalType } from '../../nutrition/nutrition-goal/enum/goal-type.enum';
import { AIGeneratedProgram } from './ai-recommendation.service';
import { UserProfile } from '../../user/schemas/userProfile.schema';

/**
 * AIDataPopulatorService
 * 
 * This service takes AI-generated recommendations and creates SUGGESTIONS (not actual records)
 * that require admin approval before being converted to actual data entries.
 * Creates 21-day plans for all wellness activities.
 */
@Injectable()
export class AIDataPopulatorService {
  constructor(
    @InjectModel(Sleep.name) private sleepModel: Model<Sleep>,
    @InjectModel(Breathwork.name) private breathworkModel: Model<Breathwork>,
    @InjectModel(Meditation.name) private meditationModel: Model<Meditation>,
    @InjectModel(SleepSuggestion.name) private sleepSuggestionModel: Model<SleepSuggestion>,
    @InjectModel(MeditationSuggestion.name) private meditationSuggestionModel: Model<MeditationSuggestion>,
    @InjectModel(BreathworkSuggestion.name) private breathworkSuggestionModel: Model<BreathworkSuggestion>,
    @InjectModel(Meal.name) private mealModel: Model<Meal>,
    @InjectModel(RecoveryPlan.name) private recoveryPlanModel: Model<RecoveryPlan>,
    @InjectModel(NutritionGoal.name) private nutritionGoalModel: Model<NutritionGoal>,
    @InjectModel(Fasting.name) private fastingModel: Model<Fasting>,
    @InjectModel(UserProfile.name) private userProfileModel: Model<UserProfile>,
  ) {}

  /**
   * Populate all wellness data from AI recommendations and profile
   * Called after profile submission with AI program generated
   */
  async populateAIGeneratedData(
    userId: string,
    aiProgram: AIGeneratedProgram,
    userProfile: any,
  ): Promise<{ success: boolean; populated: string[] }> {
    const userObjectId = new Types.ObjectId(userId);
    const populated: string[] = [];

    try {
      // 1. Populate Sleep data from AI sleep plan
      if (aiProgram.sleepPlan) {
        await this.populateSleepSuggestions(userObjectId, aiProgram.sleepPlan, userProfile);
        populated.push('sleep-suggestions');
      }

      // 2. Populate Recovery Plan (includes recovery insights) - as suggestion
      if (aiProgram.recoveryPlan) {
        await this.populateRecoveryPlanSuggestion(userObjectId, aiProgram.recoveryPlan);
        populated.push('recovery-suggestion');
      }

      // 3. Populate Meditation data from recovery plan - as suggestions
      if (aiProgram.recoveryPlan?.stressManagement) {
        await this.populateMeditationSuggestions(userObjectId, aiProgram.recoveryPlan);
        populated.push('meditation-suggestions');
      }

      // 4. Populate Breathwork data from recovery plan - as suggestions
      if (aiProgram.recoveryPlan?.stressManagement) {
        await this.populateBreathworkSuggestions(userObjectId, aiProgram.recoveryPlan);
        populated.push('breathwork-suggestions');
      }

      // 5. Populate Meal data from nutrition plan
      if (aiProgram.nutritionPlan?.meals && aiProgram.nutritionPlan.meals.length > 0) {
        await this.populateMealData(userObjectId, aiProgram.nutritionPlan);
        populated.push('meals');
      }

      // 6. Populate Nutrition Goal from AI nutrition plan
      if (aiProgram.nutritionPlan) {
        await this.populateNutritionGoal(userObjectId, aiProgram.nutritionPlan, userProfile);
        populated.push('nutrition-goal');
      }

      // 7. Populate Fasting records from AI fasting plan
      if (aiProgram.fastingPlan) {
        await this.populateFastingData(userObjectId, aiProgram.fastingPlan);
        populated.push('fasting');
      }

      console.log(`✅ Successfully populated AI data for user ${userId}:`, populated);
      return { success: true, populated };
    } catch (error) {
      console.error(`❌ Failed to populate AI data for user ${userId}:`, error);
      return { success: false, populated };
    }
  }

  /**
   * Create sleep SUGGESTIONS (not actual records) for 21 days
   * These require admin approval before becoming actual sleep records
   */
  private async populateSleepSuggestions(
    userId: Types.ObjectId,
    sleepPlan: any,
    userProfile: any,
  ): Promise<void> {
    const targetHours = this.parseSleepHours(
      sleepPlan.targetHours || userProfile?.sleepHoursPerNight || '7-9'
    );
    const quality = 4; // Default quality score (1-5)
    const reason = `AI recommends ${sleepPlan.targetHours}hrs sleep based on your profile. Pre-sleep routine: ${sleepPlan.preSleepRoutine}. Wake routine: ${sleepPlan.wakeRoutine}`;

    // Create sleep SUGGESTIONS for next 21 days
    const sleepSuggestions: any[] = [];
    for (let i = 0; i < 21; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      sleepSuggestions.push({
        userId,
        durationHours: targetHours,
        quality,
        date,
        notes: `Day ${i + 1} of 21-day AI sleep plan`,
        reason,
        aiGenerated: true,
        status: 'pending', // Requires admin approval
      } as any);
    }

    if (sleepSuggestions.length > 0) {
      await this.sleepSuggestionModel.insertMany(sleepSuggestions);
      console.log(`✅ Created ${sleepSuggestions.length} sleep SUGGESTIONS (pending approval) for user ${userId}`);
    }
  }

  /**
   * Create recovery plan as AI-generated with pending approval status
   */
  private async populateRecoveryPlanSuggestion(
    userId: Types.ObjectId,
    recoveryPlan: any,
  ): Promise<void> {
    const plan = {
      user: userId,
      isActive: false, // Not active until admin approves
      startDate: new Date(),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
      restDaysPerWeek: recoveryPlan.restDaysPerWeek || 1,
      mobilityMinutesPerDay: recoveryPlan.mobilityMinutesPerDay || 10,
      stressManagement: recoveryPlan.stressManagement,
      hydration: recoveryPlan.hydration,
      notes: 'AI-generated 21-day recovery plan - pending admin approval',
      isAiGenerated: true,
      source: 'ai-pending',
    };

    await this.recoveryPlanModel.create(plan);
    console.log(`✅ Created recovery plan SUGGESTION (pending approval) for user ${userId}`);
  }

  /**
   * Create meditation SUGGESTIONS for 21 days (pending admin approval)
   */
  private async populateMeditationSuggestions(
    userId: Types.ObjectId,
    recoveryPlan: any,
  ): Promise<void> {
    const meditationSuggestions: any[] = [];
    const stressManagement = recoveryPlan.stressManagement || '';
    
    // Extract meditation recommendations
    const meditationDuration = this.extractDurationFromText(stressManagement, 10);
    const meditationType = this.extractMeditationType(stressManagement);
    const reason = `AI recommends daily meditation for stress management: ${stressManagement}`;

    // Create meditation SUGGESTIONS for next 21 days
    for (let i = 0; i < 21; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(Math.floor(Math.random() * 6) + 6, Math.floor(Math.random() * 60), 0, 0);

      meditationSuggestions.push({
        userId,
        durationMinutes: meditationDuration,
        type: meditationType,
        date,
        notes: `Day ${i + 1} of 21-day AI meditation plan`,
        reason,
        aiGenerated: true,
        status: 'pending',
      } as any);
    }

    if (meditationSuggestions.length > 0) {
      await this.meditationSuggestionModel.insertMany(meditationSuggestions);
      console.log(`✅ Created ${meditationSuggestions.length} meditation SUGGESTIONS (pending approval) for user ${userId}`);
    }
  }

  /**
   * Create breathwork SUGGESTIONS for 21 days (pending admin approval)
   */
  private async populateBreathworkSuggestions(
    userId: Types.ObjectId,
    recoveryPlan: any,
  ): Promise<void> {
    const breathworkSuggestions: any[] = [];
    const stressManagement = recoveryPlan.stressManagement || '';
    
    // Extract breathwork recommendations
    const breathworkDuration = this.extractDurationFromText(stressManagement, 5);
    const breathworkType = this.extractBreathworkType(stressManagement);
    const reason = `AI recommends daily breathwork for stress relief: ${stressManagement}`;

    // Create breathwork SUGGESTIONS for next 21 days
    for (let i = 0; i < 21; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(20 + (i % 2), Math.floor(Math.random() * 60), 0, 0);

      breathworkSuggestions.push({
        userId,
        durationMinutes: breathworkDuration,
        technique: breathworkType,
        date,
        notes: `Day ${i + 1} of 21-day AI breathwork plan`,
        reason,
        aiGenerated: true,
        status: 'pending',
      } as any);
    }

    if (breathworkSuggestions.length > 0) {
      await this.breathworkSuggestionModel.insertMany(breathworkSuggestions);
      console.log(`✅ Created ${breathworkSuggestions.length} breathwork SUGGESTIONS (pending approval) for user ${userId}`);
    }
  }

  /**
   * Populate meal records from AI nutrition plan
   */
  private async populateMealData(
    userId: Types.ObjectId,
    nutritionPlan: any,
  ): Promise<void> {
    const mealRecords: any[] = [];
    const meals = nutritionPlan.meals || [];

    // Map meal names to types
    const mealTypeMap = {
      'breakfast': MealType.BREAKFAST,
      'lunch': MealType.LUNCH,
      'dinner': MealType.DINNER,
      'snack': MealType.SNACK,
    };

    // Create meal records for next 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(0, 0, 0, 0);

      for (const meal of meals) {
        const mealName = (meal.name || '').toLowerCase();
        const mealType = mealTypeMap[mealName] || MealType.BREAKFAST;

        // Parse time from meal recommendation
        const timeMatch = (meal.time || '').match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          const mealDate = new Date(date);
          mealDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]));

          mealRecords.push({
            user: userId,
            mealType,
            date: mealDate,
            items: [
              {
                food: undefined as any,
                recipe: undefined as any,
                name: meal.name || 'AI Suggested Meal',
                quantity: 1,
              },
            ],
            description: meal.description,
            notes: `AI Recommendation - ${meal.name}. Protein: ${meal.proteinGrams || 0}g, Carbs: ${meal.carbsGrams || 0}g, Fats: ${meal.fatsGrams || 0}g. ${meal.notes || ''}`,
            status: 'planned',
          } as any);
        }
      }
    }

    if (mealRecords.length > 0) {
      await this.mealModel.insertMany(mealRecords);
      console.log(`✅ Created ${mealRecords.length} meal records for user ${userId}`);
    }
  }

  /**
   * Extract sleep hours from text like "7-9" or "8"
   */
  private parseSleepHours(text: string): number {
    const match = text.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const first = parseFloat(match[1]);
      const range = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
      if (range) {
        return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
      }
      return first;
    }
    return 7; // Default
  }

  /**
   * Extract duration in minutes from text
   */
  private extractDurationFromText(text: string, defaultDuration: number): number {
    const match = text.match(/(\d+)\s*(?:minute|min|minute|minutes)/i);
    return match ? parseInt(match[1]) : defaultDuration;
  }

  /**
   * Extract meditation type from recommendations
   */
  private extractMeditationType(text: string): string {
    const types = ['mindfulness', 'guided', 'breathing', 'visualization', 'body scan'];
    for (const type of types) {
      if (text.toLowerCase().includes(type)) {
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }
    return 'Mindfulness';
  }

  /**
   * Extract breathwork type from recommendations
   */
  private extractBreathworkType(text: string): string {
    const types = ['box breathing', '4-7-8', 'diaphragmatic', 'alternate nostril', 'tactical breathing'];
    for (const type of types) {
      if (text.toLowerCase().includes(type.toLowerCase())) {
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    }
    return 'Box Breathing';
  }

  /**
   * Create nutrition goal from AI nutrition plan
   */
  private async populateNutritionGoal(
    userId: Types.ObjectId,
    nutritionPlan: any,
    userProfile: any,
  ): Promise<void> {
    // Determine goal type from user profile
    const mainGoals = userProfile?.mainGoals || [];
    let goalType = GoalType.MAINTAIN;

    if (mainGoals.includes('weight loss')) {
      goalType = GoalType.CUT;
    } else if (mainGoals.includes('muscle gain') || mainGoals.includes('strength')) {
      goalType = GoalType.BULK;
    } else if (mainGoals.includes('weight gain')) {
      goalType = GoalType.BULK;
    } else if (mainGoals.includes('overall health')) {
      goalType = GoalType.MAINTAIN;
    }

    const goal = {
      user: userId,
      goalType,
      caloriesTarget: nutritionPlan.dailyCalories || 2000,
      proteinTarget: nutritionPlan.proteinTargetGrams || 150,
      carbsTarget: nutritionPlan.carbsTargetGrams || 200,
      fatsTarget: nutritionPlan.fatsTargetGrams || 70,
      startDate: new Date(),
      endDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000), // 8 weeks
      isActive: true,
    };

    await this.nutritionGoalModel.create(goal);
    console.log(`✅ Created nutrition goal for user ${userId}`);
  }

  /**
   * Populate fasting records from AI fasting plan
   */
  private async populateFastingData(
    userId: Types.ObjectId,
    fastingPlan: any,
  ): Promise<void> {
    // Extract fasting window from recommendation
    const windowMatch = (fastingPlan.recommendedWindow || '').match(/(\d+):(\d+)/);
    let fastingDuration = 14; // Default 14-hour fast

    if (windowMatch) {
      // Parse fasting window (e.g., "14:10" means 14 hours fasting, 10 hours eating)
      fastingDuration = parseInt(windowMatch[1]);
    }

    // Only create fasting records if user opted in (not warned against)
    const shouldCreateFasting = !fastingPlan.caution?.toLowerCase().includes('avoid');

    if (shouldCreateFasting && fastingDuration > 0) {
      const fastingRecords: any[] = [];

      // Create fasting records for next 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const startTime = new Date(date);
        startTime.setHours(20, 0, 0, 0); // Start at 8 PM
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + fastingDuration, 0, 0, 0);

        fastingRecords.push({
          user: userId,
          startTime,
          endTime,
          goalDurationHours: fastingDuration,
          actualDurationHours: fastingDuration,
          isActive: i === 0, // Only first day is active
          notes: `AI Recommendation: ${fastingPlan.recommendedWindow}. Guidance: ${fastingPlan.guidance}. Hydration: ${fastingPlan.hydration}`,
          status: 'planned',
        } as any);
      }

      if (fastingRecords.length > 0) {
        await this.fastingModel.insertMany(fastingRecords);
        console.log(`✅ Created ${fastingRecords.length} fasting records for user ${userId}`);
      }
    } else {
      console.log(`⚠️ Fasting plan skipped for user ${userId} (not recommended or no duration)`);
    }
  }
}

