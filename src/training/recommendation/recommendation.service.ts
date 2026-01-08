import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exercise } from '../exercise/exercise.schema';
import { UserProfile } from '../../user/schemas/userProfile.schema';
import { Recommendation, RecommendationDocument } from './recommendation.schema';
import { Session } from '../session/schemas/session.schema';
import { NutritionGoal } from '../../nutrition/nutrition-goal/schemas/nutrition-goal.schema';
import { Fasting } from '../../fasting/schemas/fasting.schema';
import { Sleep } from '../../mindset-recovery/schemas/sleep.schema';
import { RecoveryPlan } from '../../mindset-recovery/schemas/recovery-plan.schema';
import { GoalType } from '../../nutrition/nutrition-goal/enum/goal-type.enum';
import { WorkoutBlock } from '../workout/schemas/workout-block.schema';
import { WorkoutSet } from '../workout/schemas/workout-set.schema';
import { BlockType } from '../workout/enums/blocktype.enum';
import { AIRecommendationService } from './ai-recommendation.service';
import { AIDataPopulatorService } from './ai-data-populator.service';
import { BadRequestException } from '@nestjs/common';

interface RecommendationRequest {
  userId: string;
}

export interface ExerciseRecommendation {
  exercise: Exercise;
  sets: number;
  reps: string;
  rest: number;
  alternates: Exercise[];
}

export interface SessionRecommendation {
  name: string;
  duration: number;
  exercises: ExerciseRecommendation[];
  notes: string;
}

@Injectable()
export class RecommendationService {
  constructor(
    @InjectModel(Exercise.name) private exerciseModel: Model<Exercise>,
    @InjectModel(UserProfile.name) private userProfileModel: Model<UserProfile>,
    @InjectModel(Recommendation.name) private recommendationModel: Model<RecommendationDocument>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(NutritionGoal.name) private nutritionGoalModel: Model<NutritionGoal>,
    @InjectModel(Fasting.name) private fastingModel: Model<Fasting>,
    @InjectModel(Sleep.name) private sleepModel: Model<Sleep>,
    @InjectModel(RecoveryPlan.name) private recoveryPlanModel: Model<RecoveryPlan>,
    @InjectModel(WorkoutBlock.name) private workoutBlockModel: Model<WorkoutBlock>,
    @InjectModel(WorkoutSet.name) private workoutSetModel: Model<WorkoutSet>,
    private aiRecommendationService: AIRecommendationService,
    private aiDataPopulatorService: AIDataPopulatorService,
  ) {}

  async getRecommendations(dto: RecommendationRequest): Promise<SessionRecommendation> {
    // Get user profile
    const profile = await this.userProfileModel.findOne({ userId: dto.userId }).lean();
    
    if (!profile) {
      throw new Error('User profile not found. Please complete your profile first.');
    }

    // Get all exercises matching user's equipment and level
    const availableExercises = await this.exerciseModel.find({
      $or: [
        { equipment: { $in: profile.availableEquipment || [] } },
        { equipment: { $size: 0 } }, // bodyweight exercises
      ],
      difficulty: { $in: this.getDifficultyRange(profile.experienceLevel || 'beginner') },
    }).lean();

    // Filter out contraindicated exercises
    const safeExercises = availableExercises.filter(ex => 
      !ex.contraindications?.some(c => profile.injuries?.includes(c))
    );

    // Build session with movement patterns
    const session: SessionRecommendation = {
      name: 'Personalized Starter Session',
      duration: profile.sessionLengthMinutes || 45,
      exercises: [],
      notes: `Tailored for ${profile.goal} with ${profile.experienceLevel || 'beginner'} experience`,
    };

    // Select exercises by pattern
    const patterns = ['squat', 'hinge', 'push', 'pull', 'carry', 'core'];
    
    for (const pattern of patterns) {
      const patternExercises = safeExercises.filter(ex => ex.movementPattern === pattern);
      
      if (patternExercises.length === 0) continue;

      // Pick best exercise for this pattern
      const selected = this.selectBestExercise(patternExercises, profile);
      
      if (!selected) continue;

      // Get alternates
      const alternates = patternExercises
        .filter(ex => ex._id.toString() !== selected._id.toString())
        .slice(0, 3);

      // Calculate volume based on experience
      const volume = this.calculateVolume(profile.experienceLevel || 'beginner', (profile.goal as string) || 'muscle-gain');

      session.exercises.push({
        exercise: selected as Exercise,
        sets: volume.sets,
        reps: volume.reps,
        rest: volume.rest,
        alternates: alternates as Exercise[],
      });
    }

    return session;
  }

  private getDifficultyRange(level: string): string[] {
    const ranges = {
      beginner: ['beginner'],
      intermediate: ['beginner', 'intermediate'],
      advanced: ['intermediate', 'advanced'],
    };
    return ranges[level] || ['beginner'];
  }

  private selectBestExercise(exercises: any[], profile: any): any {
    // Prioritize exercises matching goal tags
    const goalMap = {
      BuildMuscle: 'hypertrophy',
      LoseWeight: 'conditioning',
      GainWeight: 'hypertrophy',
      StayHealthy: 'endurance',
    };

    const targetGoal = goalMap[profile.goal] || 'strength';

    // Find exercises with matching goal tags
    const goalMatched = exercises.filter(ex => ex.goalTags?.includes(targetGoal));
    
    if (goalMatched.length > 0) {
      return goalMatched[0];
    }

    // Fallback to first available
    return exercises[0];
  }

  private calculateVolume(level: string, goal: string) {
    const volumes = {
      beginner: { sets: 2, reps: '10-12', rest: 90 },
      intermediate: { sets: 3, reps: '8-10', rest: 75 },
      advanced: { sets: 4, reps: '6-8', rest: 60 },
    };

    const base = volumes[level] || volumes.beginner;

    // Adjust for goal
    if (goal === 'BuildMuscle' || goal === 'GainWeight') {
      base.sets += 1;
      base.reps = '8-12';
    } else if (goal === 'LoseWeight') {
      base.reps = '12-15';
      base.rest = 60;
    }

    return base;
  }

  // Save AI-generated recommendation into collection for coach review
  async saveAIRecommendation(userId: string, program: any): Promise<any> {
    // Pull a lightweight snapshot of the user profile so the UI can display context
    const profile = await this.userProfileModel.findOne({ userId }).lean();

    // Deduplicate exercises by name to avoid repetition across different days
    const seenExercises = new Set<string>();
    const exercises = (program.exercises || [])
      .filter((ex: any) => {
        const key = `${ex.exerciseName || ex.name}`.toLowerCase().trim();
        if (seenExercises.has(key)) return false;
        seenExercises.add(key);
        return true;
      })
      .map((ex: any) => ({
        exerciseId: undefined,
        name: ex.exerciseName || ex.name || 'Exercise',
        sets: ex.sets || 3,
        reps: ex.reps || '8-10',
        rest: ex.rest || 90,
        equipment: ex.equipment || [],
        videoUrl: ex.videoUrl || '',
        alternateExerciseIds: [],
        setDetails: Array.from({ length: (ex.sets || 3) }, (_, i) => ({
          setNumber: i + 1,
          reps: ex.reps || '8-10',
          restTime: ex.rest || 90,
          tempo: undefined,
          isAMRAP: false,
        })),
      }))

    // Normalize plan sections to ensure UI is never empty
    const np = program.nutritionPlan || {};
    const nutritionPlan = {
      overview: np.overview || program.nutritionTips || 'Balanced plate: lean protein, vegetables, smart carbs, healthy fats.',
      dailyCalories: np.dailyCalories ?? null,
      proteinTargetGrams: np.proteinTargetGrams ?? null,
      carbsTargetGrams: np.carbsTargetGrams ?? null,
      fatsTargetGrams: np.fatsTargetGrams ?? null,
      meals: (np.meals && np.meals.length ? np.meals : [
        { name: 'Breakfast', time: '08:00', description: 'Eggs + oats + berries', proteinGrams: 25 },
        { name: 'Lunch', time: '12:30', description: 'Chicken + rice + veggies', proteinGrams: 35 },
        { name: 'Dinner', time: '19:00', description: 'Fish + potatoes + salad', proteinGrams: 35 },
      ]),
    };

    const sp = program.sleepPlan || {};
    const sleepPlan = {
      targetHours: sp.targetHours || '7-9',
      sleepWindow: sp.sleepWindow || '22:30-06:30',
      preSleepRoutine: sp.preSleepRoutine || 'Dim lights, no screens 60 min before bed, light stretch, breathing x5 min.',
      wakeRoutine: sp.wakeRoutine || 'Wake at consistent time, light exposure within 30 min, hydrate.',
      notes: sp.notes || '',
    };

    const rp = program.recoveryPlan || {};
    const recoveryPlan = {
      restDaysPerWeek: rp.restDaysPerWeek ?? 1,
      mobilityMinutesPerDay: rp.mobilityMinutesPerDay ?? 10,
      stressManagement: rp.stressManagement || '2-5 min breathing/box breathing daily.',
      hydration: rp.hydration || '35-45 ml/kg/day; more if sweating.',
      notes: rp.notes || '',
    };

    const fp = program.fastingPlan || {};
    const fastingPlan = {
      recommendedWindow: fp.recommendedWindow || 'Skip if unsafe; otherwise consider 14:10 as a gentle start.',
      guidance: fp.guidance || 'If chosen: eat protein-forward meals, stay hydrated, avoid if dizzy/underweight/pregnant.',
      hydration: fp.hydration || 'Water/electrolytes during fasting window.',
      caution: fp.caution || 'Not medical advice. Avoid fasting if medical conditions; consult a physician.',
    };

    // Build comprehensive snapshot from all available profile fields
    const userProfileSnapshot = profile
      ? {
          experienceLevel: profile.experienceLevel || profile.currentExerciseLevel || 'beginner',
          availableEquipment: (profile.availableEquipment && profile.availableEquipment.length > 0)
            ? profile.availableEquipment
            : [],
          injuries: (profile.injuries && profile.injuries.length > 0)
            ? profile.injuries
            : (profile.exerciseRestrictions && profile.exerciseRestrictions.length > 0 ? profile.exerciseRestrictions : []),
          preferredDaysPerWeek: profile.preferredDaysPerWeek ?? profile.trainingDaysPerWeek ?? 3,
          sessionLengthMinutes: profile.sessionLengthMinutes ?? 45,
        }
      : {
          experienceLevel: 'beginner',
          availableEquipment: [],
          injuries: [],
          preferredDaysPerWeek: 3,
          sessionLengthMinutes: 45,
        };

    const doc = await this.recommendationModel.create({
      userId: new Types.ObjectId(userId),
      status: 'pending',
      name: program.programName || 'AI Program',
      description: program.reasoning || program.weeklySchedule,
      duration: program.duration || 60,
      exercises,
      notes: program.progressionNotes || program.weeklySchedule,
      nutritionPlan,
      sleepPlan,
      recoveryPlan,
      fastingPlan,
      userProfileSnapshot,
    })

    return doc.toObject();
  }

  async autoGenerateRecommendation(userId: string): Promise<RecommendationDocument> {
    try {
      // Delete previous pending recommendations to avoid duplicates
      const userObjectId = new Types.ObjectId(userId);
      await this.recommendationModel.deleteMany({
        $or: [
          { userId: userObjectId },
          { userId },
          { 'userId._id': userObjectId },
          { 'userId._id': userId },
        ],
        status: 'pending',
      });

      // Get profile
      const profile = await this.userProfileModel.findOne({ userId }).lean();
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Build user description from their comprehensive profile
      const userDescription = this.buildUserDescriptionFromProfile(profile);

      const aiProgram = await this.aiRecommendationService.generateAIRecommendation({
        userId,
        userDescription,
        programDuration: 8, // Default 8-week program
        specificGoals: profile.mainGoals,
      });

      console.log('Generated personalized AI program for user:', userId);

      // Persist AI-generated program as pending recommendation for coach review
      const savedRec = await this.saveAIRecommendation(userId, aiProgram);

      // ✅ NEW: Populate actual wellness data (sleep, meals, breathwork, meditation)
      // from AI recommendations into the database
      try {
        await this.aiDataPopulatorService.populateAIGeneratedData(
          userId,
          aiProgram,
          profile,
        );
        console.log('✅ AI-generated wellness data populated for user:', userId);
      } catch (populationError) {
        console.error('⚠️ Failed to populate AI wellness data, but recommendation saved:', populationError);
        // Don't throw - recommendation is already saved
      }

      return savedRec;
    } catch (error: any) {
      const message = error?.message || 'Unknown AI error';
      const isModelUnavailable = message.includes('All Gemini models failed') || error?.code === 'AI_MODEL_UNAVAILABLE';

      if (isModelUnavailable) {
        console.warn('AI model unavailable; falling back to basic recommendation.');
      } else {
        console.error('Failed to auto-generate AI recommendation:', error);
      }

      // Fallback to basic recommendation if AI fails (e.g., missing/invalid Gemini models)
      return await this.generateBasicRecommendationSafe(userId);
    }
  }

  // Generate fallback basic recommendation if AI fails
  private async generateBasicRecommendation(userId: string): Promise<RecommendationDocument> {
    const profile = await this.userProfileModel.findOne({ userId }).lean();
    if (!profile) {
      throw new Error('User profile not found');
    }

    const session = await this.getRecommendations({ userId });

    const exercisesWithDetails = await Promise.all(
      session.exercises.map(async (ex) => {
        const fullEx = await this.exerciseModel.findById((ex.exercise as any)._id).lean();
        if (!fullEx) {
          return {
            exerciseId: undefined,
            name: 'Exercise',
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest,
            equipment: [],
            videoUrl: '',
            alternateExerciseIds: [],
          };
        }
        const alternates = await this.exerciseModel.find({
          _id: { $in: ex.alternates.map((a: any) => a._id) }
        }).lean();
        
        return {
          exerciseId: fullEx._id,
          name: fullEx.name,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          equipment: fullEx.equipment,
          videoUrl: fullEx.videoUrl,
          alternateExerciseIds: alternates.map(a => a._id),
        };
      })
    );

    const recommendation = await this.recommendationModel.create({
      userId,
      status: 'pending',
      name: session.name,
      duration: session.duration,
      exercises: exercisesWithDetails,
      notes: session.notes,
      nutritionPlan: {
        overview: 'Balanced plate: lean protein, vegetables, smart carbs, healthy fats.',
      },
      sleepPlan: {
        targetHours: '7-9',
        sleepWindow: '22:30-06:30',
        preSleepRoutine: 'Dim lights, no screens 60 min before bed, light stretch.',
        wakeRoutine: 'Wake at consistent time, light exposure within 30 min.',
      },
      recoveryPlan: {
        restDaysPerWeek: 1,
        mobilityMinutesPerDay: 10,
        stressManagement: 'Daily breathing exercises.',
        hydration: '35-45 ml/kg/day',
      },
      userProfileSnapshot: {
        experienceLevel: profile.experienceLevel,
        availableEquipment: profile.availableEquipment,
        injuries: profile.injuries,
        preferredDaysPerWeek: profile.preferredDaysPerWeek,
        sessionLengthMinutes: profile.sessionLengthMinutes,
      },
    });

    return recommendation;
  }

  // Basic recommendation that never throws, used when AI/Gemini is unavailable
  private async generateBasicRecommendationSafe(userId: string): Promise<RecommendationDocument> {
    try {
      return await this.generateBasicRecommendation(userId);
    } catch (error) {
      console.error('Basic recommendation failed, returning minimal fallback:', error);
      const recommendation = await this.recommendationModel.create({
        userId,
        status: 'pending',
        name: 'Starter Program',
        duration: 45,
        exercises: [
          {
            name: 'Bodyweight Squat',
            sets: 3,
            reps: '10-12',
            rest: 60,
            equipment: [],
            videoUrl: '',
            alternateExerciseIds: [],
          },
          {
            name: 'Push-Up (Incline if needed)',
            sets: 3,
            reps: '8-10',
            rest: 60,
            equipment: [],
            videoUrl: '',
            alternateExerciseIds: [],
          },
          {
            name: 'Glute Bridge',
            sets: 3,
            reps: '12-15',
            rest: 45,
            equipment: [],
            videoUrl: '',
            alternateExerciseIds: [],
          },
          {
            name: 'Plank',
            sets: 3,
            reps: '30-45s',
            rest: 45,
            equipment: [],
            videoUrl: '',
            alternateExerciseIds: [],
          },
        ],
        notes: 'Fallback plan when AI is unavailable. Focus on form and consistency.',
        nutritionPlan: {
          overview: 'Balanced plate: lean protein, vegetables, smart carbs, healthy fats.',
        },
        sleepPlan: {
          targetHours: '7-9',
          sleepWindow: '22:30-06:30',
          preSleepRoutine: 'Dim lights, no screens 60 min before bed, light stretch.',
          wakeRoutine: 'Wake at consistent time, light exposure within 30 min.',
        },
        recoveryPlan: {
          restDaysPerWeek: 1,
          mobilityMinutesPerDay: 10,
          stressManagement: 'Daily breathing exercises.',
          hydration: '35-45 ml/kg/day',
        },
      });
      return recommendation;
    }
  }

  // Build detailed user description from comprehensive profile
  private buildUserDescriptionFromProfile(profile: any): string {
    return `
User Profile Summary:
- Name: ${profile.fullName || 'User'}
- Age: ${profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- Main Goals: ${profile.mainGoals?.join(', ') || 'Not specified'}
- Current Exercise Level: ${profile.currentExerciseLevel || profile.experienceLevel || 'Beginner'}
- Available Equipment: ${profile.availableEquipment?.join(', ') || profile.availableEquipment?.join(', ') || 'Bodyweight only'}
- Exercise Restrictions: ${profile.exerciseRestrictions?.join(', ') || profile.injuries?.join(', ') || 'None'}
- Training Days Per Week: ${profile.trainingDaysPerWeek || 3}
- Session Length: ${profile.sessionLengthMinutes || 45} minutes
- Preferred Training Location: ${profile.preferredTrainingLocation || 'Not specified'}
- Eating Style: ${profile.eatingStyle || 'Not specified'}
- Medical Conditions: ${profile.medicalConditions?.join(', ') || 'None'}
- Pregnancy Status: ${profile.pregnancyStatus || 'Not applicable'}
- Sleep Hours: ${profile.sleepHoursPerNight || 'Not specified'} per night
- Stress Sources: ${profile.stressSource?.join(', ') || 'Not specified'}
- Stress Management Techniques: ${profile.stressManagementTechniques?.join(', ') || 'Not specified'}
- Past Barriers to Goals: ${profile.pastBarriersToGoals?.join(', ') || 'Not specified'}
- Motivation Factors: ${profile.motivationFactors?.join(', ') || 'Not specified'}
- Support Level Preference: ${profile.supportLevelPreference || 'Moderate'}

Please create a comprehensive 8-week personalized program based on this complete profile.
    `.trim();
  }

  // Get recommendations for user
  async getRecommendationsForUser(userId: string, status?: string): Promise<any> {
    // Primary query (respect status when provided)
    const query: any = { userId };
    if (status) query.status = status;

    let recs = await this.recommendationModel.find(query).sort({ createdAt: -1 }).lean() as any[];

    // If none found with status filter, try without status to return latest any-status
    if ((!recs || recs.length === 0) && status) {
      const anyStatus = await this.recommendationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .lean() as any[];
      if (anyStatus && anyStatus.length > 0) {
        recs = anyStatus;
      }
    }

    // If still none found for this user, auto-generate one pending recommendation
    if (!recs || recs.length === 0) {
      try {
        const generated = await this.autoGenerateRecommendation(userId);
        if (generated) {
          // normalize single doc into array
          return [this.normalizePlans(generated)];
        }
      } catch (e) {
        // Fall through and return empty if generation fails
        console.error('Auto-generate recommendation failed:', e);
      }
      return [];
    }

    const normalized = (recs || []).map((r: any) => this.normalizePlans(r));
    const augmented = await Promise.all(normalized.map(r => this.augmentRecommendationWithStatus(r)));
    return augmented;
  }

  // Get single recommendation
  async getRecommendation(recommendationId: string): Promise<any> {
    const doc = await this.recommendationModel.findById(recommendationId).lean();
    if (!doc) return null;
    const norm = this.normalizePlans(doc);
    return this.augmentRecommendationWithStatus(norm);
  }

  // Update recommendation (coach can modify)
  async updateRecommendation(
    recommendationId: string,
    updates: {
      exercises?: any[];
      coachNotes?: string;
      name?: string;
      nutritionPlan?: any;
      sleepPlan?: any;
      recoveryPlan?: any;
      fastingPlan?: any;
    },
    coachId?: string
  ): Promise<any> {
    const updateData: any = {
      ...updates,
      assignedBy: coachId,
    };

    const doc = await this.recommendationModel.findByIdAndUpdate(
      recommendationId,
      updateData,
      { new: true }
    ).lean();
    return doc ? this.normalizePlans(doc) : null;
  }

  // Approve recommendation
  async approveRecommendation(recommendationId: string, coachId?: string): Promise<any> {
    const doc = await this.recommendationModel.findByIdAndUpdate(
      recommendationId,
      {
        status: 'approved',
        approvedAt: new Date(),
        assignedBy: coachId,
      },
      { new: true }
    ).lean();

    if (!doc) return null;

    const normalized = this.normalizePlans(doc);

    // Normalize user id safely (string or ObjectId) to avoid runtime errors
    const rawUserId: any = (normalized as any).userId?._id || (normalized as any).userId || doc.userId;
    if (!rawUserId || !Types.ObjectId.isValid(rawUserId.toString())) {
      throw new Error('Invalid userId on recommendation');
    }
    const userObjectId = new Types.ObjectId(rawUserId.toString());
    
    try {
      // Clean up any prior auto-generated sessions/blocks/sets for this user to avoid duplicates
      await this.deleteAutoGeneratedSessions(userObjectId);

      // Execute all side-effects and check for failures
      const results = await Promise.allSettled([
        this.createSessionFromRecommendation({ ...normalized, userId: userObjectId }),
        this.applyNutritionGoal({ ...normalized, userId: userObjectId }),
        this.applyFastingPlan({ ...normalized, userId: userObjectId }),
        this.applySleepPlan({ ...normalized, userId: userObjectId }),
        this.applyRecoveryPlan({ ...normalized, userId: userObjectId }),
      ]);

      // Log any failures but don't rollback - allow partial success
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const labels = ['Session', 'Nutrition', 'Fasting', 'Sleep', 'Recovery'];
          console.error(`Failed to apply ${labels[index]} plan:`, result.reason);
        }
      });
    } catch (err) {
      console.error('Approval side-effects error:', err);
    }

    // Keep the approved recommendation so clients can still fetch applied plans (nutrition, fasting, recovery)
    return normalized;
  }

  // Remove previous AI-generated sessions/blocks/sets so updates replace, not append
  private async deleteAutoGeneratedSessions(userId: Types.ObjectId) {
    try {
      const sessions = await this.sessionModel.find({
        $or: [
          { user: userId },
          { user: userId.toString() },
          { 'user._id': userId },
          { 'user._id': userId.toString() },
        ],
        notes: /rec:/i,
      }).lean();

      if (!sessions.length) return;

      const blockIds: Types.ObjectId[] = [];
      const setIds: Types.ObjectId[] = [];

      sessions.forEach((s: any) => {
        if (Array.isArray(s.blocks)) {
          s.blocks.forEach((b: any) => {
            if (Types.ObjectId.isValid(b?.toString())) {
              blockIds.push(new Types.ObjectId(b));
            }
          });
        }
      });

      if (blockIds.length) {
        const blocks = await this.workoutBlockModel.find({ _id: { $in: blockIds } }).lean();
        blocks.forEach((b: any) => {
          if (Array.isArray(b.sets)) {
            b.sets.forEach((sid: any) => {
              if (Types.ObjectId.isValid(sid?.toString())) {
                setIds.push(new Types.ObjectId(sid));
              }
            });
          }
        });
      }

      await this.sessionModel.deleteMany({ _id: { $in: sessions.map((s: any) => s._id) } });
      if (blockIds.length) await this.workoutBlockModel.deleteMany({ _id: { $in: blockIds } });
      if (setIds.length) await this.workoutSetModel.deleteMany({ _id: { $in: setIds } });

      console.log(`Deleted ${sessions.length} auto-generated session(s) before creating new plan`);
    } catch (err) {
      console.error('Failed to delete auto-generated sessions', err);
    }
  }

  // Reject recommendation
  async rejectRecommendation(
    recommendationId: string,
    reason: string,
    coachId?: string
  ): Promise<any> {
    const doc = await this.recommendationModel.findByIdAndUpdate(
      recommendationId,
      {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(),
        assignedBy: coachId,
      },
      { new: true }
    ).lean();
    return doc ? this.normalizePlans(doc) : null;
  }

  // Get pending recommendations count
  async getPendingCount(): Promise<number> {
    return this.recommendationModel.countDocuments({ status: 'pending' });
  }

  // Get all pending recommendations (for coach dashboard)
  async getPendingRecommendations(limit: number = 10): Promise<any> {
    const recs = await this.recommendationModel
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'fName lName email role')
      .lean() as any;

    return (recs || []).map((r: any) => this.normalizePlans(r));
  }

  // Ensure recommendation has default plan sections so UI never sees empty objects
  private normalizePlans(rec: any) {
    let exercises = (rec.exercises && rec.exercises.length ? rec.exercises : [
      {
        name: 'Full-body circuit',
        sets: 3,
        reps: '10-12',
        rest: 60,
        equipment: ['bodyweight'],
        videoUrl: '',
        alternateExerciseIds: [],
      },
      {
        name: 'Walking / light cardio',
        sets: 1,
        reps: '20-30 min',
        rest: 0,
        equipment: [],
        videoUrl: '',
        alternateExerciseIds: [],
      },
    ]);

    // Ensure each exercise includes setDetails for UI consumption
    exercises = (exercises || []).map((ex: any) => {
      const totalSets = typeof ex.sets === 'number' && ex.sets > 0 ? ex.sets : 1;
      const repsText = ex.reps ?? '10';
      const restTime = ex.rest ?? 60;
      const existing = ex.setDetails && Array.isArray(ex.setDetails) ? ex.setDetails : null;
      const setDetails = existing && existing.length
        ? existing
        : Array.from({ length: totalSets }, (_, i) => ({
            setNumber: i + 1,
            reps: repsText,
            restTime,
            tempo: undefined,
            isAMRAP: false,
          }));
      return {
        ...ex,
        setDetails,
      };
    });

    const np = rec.nutritionPlan || {};
    const nutritionPlan = {
      overview: np.overview || rec.nutritionTips || 'Balanced plate: lean protein, vegetables, smart carbs, healthy fats.',
      dailyCalories: np.dailyCalories ?? 2100,
      proteinTargetGrams: np.proteinTargetGrams ?? 140,
      carbsTargetGrams: np.carbsTargetGrams ?? 220,
      fatsTargetGrams: np.fatsTargetGrams ?? 70,
      meals: np.meals && np.meals.length ? np.meals : [
        { name: 'Breakfast', time: '08:00', description: 'Eggs + oats + berries', proteinGrams: 25 },
        { name: 'Lunch', time: '12:30', description: 'Chicken + rice + veggies', proteinGrams: 35 },
        { name: 'Dinner', time: '19:00', description: 'Fish + potatoes + salad', proteinGrams: 35 },
      ],
    };

    const sp = rec.sleepPlan || {};
    const sleepPlan = {
      targetHours: sp.targetHours || '7-9',
      sleepWindow: sp.sleepWindow || '22:30-06:30',
      preSleepRoutine: sp.preSleepRoutine || 'Dim lights, no screens 60 min before bed, light stretch, breathing x5 min.',
      wakeRoutine: sp.wakeRoutine || 'Wake at consistent time, light exposure within 30 min, hydrate.',
      notes: sp.notes || '',
    };

    const rp = rec.recoveryPlan || {};
    const recoveryPlan = {
      restDaysPerWeek: rp.restDaysPerWeek ?? 1,
      mobilityMinutesPerDay: rp.mobilityMinutesPerDay ?? 10,
      stressManagement: rp.stressManagement || '2-5 min breathing/box breathing daily.',
      hydration: rp.hydration || '35-45 ml/kg/day; more if sweating.',
      notes: rp.notes || '',
    };

    const fp = rec.fastingPlan || {};
    const fastingPlan = {
      recommendedWindow: fp.recommendedWindow || 'Skip if unsafe; otherwise consider 14:10 as a gentle start.',
      guidance: fp.guidance || 'If chosen: protein-forward meals, stay hydrated, avoid if dizzy/underweight/pregnant.',
      hydration: fp.hydration || 'Water/electrolytes during fasting window.',
      caution: fp.caution || 'Not medical advice. Avoid fasting if medical conditions; consult a physician.',
    };

    return {
      ...rec,
      exercises,
      nutritionPlan,
      sleepPlan,
      recoveryPlan,
      fastingPlan,
    };
  }

  // Attach live status and IDs from linked session/block
  private async augmentRecommendationWithStatus(rec: any): Promise<any> {
    try {
      const out: any = { ...rec };
      const blockId = (rec.linkedBlockId && (rec.linkedBlockId._id || rec.linkedBlockId)) || null;
      if (!blockId) return out;

      // Load block with completedExercises and populated sets + exercises
      const block: any = await this.workoutBlockModel
        .findById(blockId)
        .populate([
          { path: 'sets', select: 'setNumber reps restTime tempo isAMRAP completed' },
          { path: 'exercises', select: 'name equipment difficulty movementPattern videoUrl' },
        ])
        .lean();
      if (!block) return out;

      const completedExerciseIds = (block.completedExercises || []).map((id: any) => id.toString());
      const setStatusMap = new Map<string, boolean>();
      (block.sets || []).forEach((s: any) => {
        setStatusMap.set((s._id || s).toString(), !!s.completed);
      });

      // Build exercise doc map for quick lookup
      const exerciseDocMap = new Map<string, any>();
      (block.exercises || []).forEach((ex: any) => {
        if (ex && ex._id) exerciseDocMap.set(ex._id.toString(), ex);
      });

      out.exercises = (rec.exercises || []).map((ex: any) => {
        const exId = (ex.exerciseId && (ex.exerciseId._id || ex.exerciseId)) || null;
        const completed = exId ? completedExerciseIds.includes(exId.toString()) : false;
        const setIds: any[] = Array.isArray(ex.setIds) ? ex.setIds : [];
        const setDetails = (ex.setDetails || []).map((sd: any, idx: number) => {
          const sid = setIds[idx] && (setIds[idx]._id || setIds[idx]) || null;
          const sCompleted = sid ? !!setStatusMap.get(sid.toString()) : false;
          return {
            ...sd,
            id: sid ? sid.toString() : undefined,
            completed: sCompleted,
          };
        });
        return {
          ...ex,
          id: exId ? exId.toString() : undefined,
          completed,
          exercise: exId ? exerciseDocMap.get(exId.toString()) || null : null,
          setDetails,
        };
      });

      // Attach linked block snapshot for convenience
      out.linkedBlock = {
        _id: (block._id || blockId).toString(),
        restBetweenExercises: block.restBetweenExercises ?? 0,
        completedExercises: (block.completedExercises || []).map((id: any) => id.toString()),
        exercises: (block.exercises || []).map((ex: any) => ({
          _id: ex?._id?.toString?.() || undefined,
          name: ex?.name,
          equipment: ex?.equipment,
          difficulty: ex?.difficulty,
          movementPattern: ex?.movementPattern,
          videoUrl: ex?.videoUrl,
        })),
        sets: (block.sets || []).map((s: any) => ({
          _id: s?._id?.toString?.() || undefined,
          setNumber: s?.setNumber,
          reps: s?.reps,
          restTime: s?.restTime,
          tempo: s?.tempo,
          isAMRAP: s?.isAMRAP,
          completed: !!s?.completed,
        })),
      };

      return out;
    } catch (e) {
      console.error('augmentRecommendationWithStatus failed', e);
      return rec;
    }
  }

  // Create a simple training session record so the user can follow the approved plan
  private async createSessionFromRecommendation(rec: any) {
    try {
      const baseNote = `${rec.name || 'Program'} - ${rec.description || rec.notes || ''}`.trim();
      const notes = `${baseNote} [rec:${rec._id}]`;
      const userId = new Types.ObjectId(rec.userId);
      // At this point prior auto-generated sessions are already deleted; no need to skip on existing

      // Try to map exercises to WorkoutBlock/WorkoutSet
      console.log(`Creating workout block for ${rec.exercises?.length || 0} exercises...`);
      const creation = await this.createWorkoutBlockFromExercises(rec.exercises);
      const blockId = creation?.blockId || null;

      const session = await this.sessionModel.create({
        user: userId,
        blocks: blockId ? [blockId] : [],
        completed: false,
        notes,
      });
      
      console.log(`✓ Created session ${session._id} with ${blockId ? 1 : 0} workout block(s)`);

      // Attach linkage back to recommendation for client status/ids mapping
      if (blockId) {
        const exercisesWithIds = (rec.exercises || []).map((ex: any, idx: number) => ({
          ...ex,
          exerciseId: creation?.exerciseIds?.[idx] || ex.exerciseId,
          setIds: creation?.setIdsByExercise?.[idx] || [],
        }));
        await this.recommendationModel.findByIdAndUpdate(
          rec._id,
          {
            linkedSessionId: session._id,
            linkedBlockId: blockId,
            exercises: exercisesWithIds,
          },
          { new: true }
        ).lean();
      }
    } catch (err) {
      console.error('Failed to create session from recommendation', err);
      throw err;
    }
  }

  // Create a WorkoutBlock and sets from exercises; best-effort name matching to Exercise collection
  private async createWorkoutBlockFromExercises(exercises: any[]): Promise<{ blockId: Types.ObjectId, setIdsByExercise: Types.ObjectId[][], exerciseIds: Types.ObjectId[] } | null> {
    try {
      if (!exercises || exercises.length === 0) return null;

      const exerciseIds: Types.ObjectId[] = [];
      const setIdsByExercise: Types.ObjectId[][] = [];
      const allSetIds: Types.ObjectId[] = [];

      for (const ex of exercises) {
        // Try to find Exercise by name (case-insensitive)
        const name = this.normalizeName(ex.name || ex.exercise?.name || '');
        const found = name
          ? await this.exerciseModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }).select('_id').lean()
          : null;
        if (found?._id) {
          exerciseIds.push(found._id as Types.ObjectId);
        } else {
          exerciseIds.push(undefined as unknown as Types.ObjectId);
        }

        // Create WorkoutSet documents per exercise set
        const perExerciseSetIds: Types.ObjectId[] = [];
        const totalSets = (Array.isArray(ex.setDetails) && ex.setDetails.length)
          ? ex.setDetails.length
          : (typeof ex.sets === 'number' && ex.sets > 0 ? ex.sets : 1);

        for (let i = 0; i < totalSets; i++) {
          const detail = Array.isArray(ex.setDetails) ? ex.setDetails[i] : undefined;
          const reps = detail?.reps ?? ex.reps;
          const restTime = detail?.restTime ?? ex.rest ?? 60;
          const setDoc = await this.workoutSetModel.create({
            setNumber: allSetIds.length + 1,
            reps: this.parseReps(reps),
            restTime,
            tempo: undefined,
            isAMRAP: false,
          });
          perExerciseSetIds.push(setDoc._id as Types.ObjectId);
          allSetIds.push(setDoc._id as Types.ObjectId);
        }
        setIdsByExercise.push(perExerciseSetIds);
      }

      const block = await this.workoutBlockModel.create({
        type: BlockType.NORMAL,
        exercises: exerciseIds,
        sets: allSetIds,
        restBetweenExercises: 0,
      });

      return { blockId: block._id as Types.ObjectId, setIdsByExercise, exerciseIds };
    } catch (err) {
      console.error('Failed to create workout block from exercises', err);
      return null;
    }
  }

  private parseReps(reps: any): number | undefined {
    if (reps == null) return undefined;
    if (typeof reps === 'number') return reps;
    if (typeof reps === 'string') {
      const match = reps.match(/\d+/);
      return match ? Number(match[0]) : undefined;
    }
    return undefined;
  }

  private normalizeName(name: string): string {
    return (name || '').trim().replace(/\s+/g, ' ');
  }

  private async applyNutritionGoal(rec: any) {
    try {
      // deactivate previous active goals
      const userId = new Types.ObjectId(rec.userId);
      const deactivated = await this.nutritionGoalModel.updateMany({ user: userId, isActive: true }, { isActive: false });
      if (deactivated.modifiedCount > 0) {
        console.log(`Deactivated ${deactivated.modifiedCount} previous nutrition goal(s)`);
      }

      // attempt to infer goal type from user profile
      const profile = await this.userProfileModel.findOne({ userId: rec.userId }).lean();
      const goalType = this.mapGoalType(profile?.goal);

      const goal: any = {
        user: userId,
        goalType,
        caloriesTarget: rec.nutritionPlan?.dailyCalories ?? 2100,
        proteinTarget: rec.nutritionPlan?.proteinTargetGrams ?? 140,
        carbsTarget: rec.nutritionPlan?.carbsTargetGrams ?? 220,
        fatsTarget: rec.nutritionPlan?.fatsTargetGrams ?? 70,
        startDate: new Date(),
        isActive: true,
      };

      const created = await this.nutritionGoalModel.create(goal);
      console.log(`✓ Created nutrition goal (${goalType}): ${goal.caloriesTarget} cal, ${goal.proteinTarget}p/${goal.carbsTarget}c/${goal.fatsTarget}f`);
    } catch (err) {
      console.error('Failed to apply nutrition goal', err);
      throw err;
    }
  }

  private mapGoalType(goal?: string): GoalType {
    const g = (goal || '').toLowerCase();
    if (g.includes('lose') || g.includes('cut') || g.includes('weight loss')) return GoalType.CUt;
    if (g.includes('gain') || g.includes('bulk') || g.includes('muscle')) return GoalType.BULK;
    if (g.includes('maintain') || g.includes('recomp') || g.includes('stay')) return GoalType.MAINTAIN;
    return GoalType.CUSTOM;
  }

  private async applyFastingPlan(rec: any) {
    try {
      const windowText = rec.fastingPlan?.recommendedWindow || '';
      const hoursMatch = windowText.match(/(\d{1,2})[:]?\d{0,2}/);
      const goalHours = hoursMatch ? Number(hoursMatch[1]) : rec.fastingPlan?.goalHours || undefined;

      const userId = new Types.ObjectId(rec.userId);
      const deactivated = await this.fastingModel.updateMany({ user: userId, isActive: true }, { isActive: false });
      if (deactivated.modifiedCount > 0) {
        console.log(`Deactivated ${deactivated.modifiedCount} previous fasting plan(s)`);
      }

      const created = await this.fastingModel.create({
        user: userId,
        startTime: new Date(),
        goalDurationHours: goalHours,
        goalHours,
        notes: `${rec.fastingPlan?.guidance || ''} ${rec.fastingPlan?.caution || ''}`.trim(),
        isActive: true,
      });
      
      console.log(`✓ Created fasting plan: ${goalHours ? goalHours + 'h window' : 'no specific window'}`);
    } catch (err) {
      console.error('Failed to apply fasting plan', err);
      throw err;
    }
  }

  private async applySleepPlan(rec: any) {
    try {
      const targetText = rec.sleepPlan?.targetHours || '7-9';
      const range = targetText.match(/(\d+)[^\d]+(\d+)/);
      const avgHours = range ? (Number(range[1]) + Number(range[2])) / 2 : Number(targetText) || 8;

      const created = await this.sleepModel.create({
        user: new Types.ObjectId(rec.userId),
        durationHours: avgHours,
        quality: undefined,
        notes: `${rec.sleepPlan?.preSleepRoutine || ''} ${rec.sleepPlan?.wakeRoutine || ''}`.trim(),
        date: new Date(),
      });
      
      console.log(`✓ Created sleep target: ${avgHours}h (from "${targetText}")`);
    } catch (err) {
      console.error('Failed to apply sleep plan', err);
      throw err;
    }
  }

  private async applyRecoveryPlan(rec: any) {
    try {
      const userId = new Types.ObjectId(rec.userId);
      await this.recoveryPlanModel.updateMany({ user: userId, isActive: true }, { isActive: false, endDate: new Date() });

      const plan = await this.recoveryPlanModel.create({
        user: userId,
        restDaysPerWeek: rec.recoveryPlan?.restDaysPerWeek ?? 1,
        mobilityMinutesPerDay: rec.recoveryPlan?.mobilityMinutesPerDay ?? 10,
        stressManagement: rec.recoveryPlan?.stressManagement || '2-5 min breathing/box breathing daily.',
        hydration: rec.recoveryPlan?.hydration || '35-45 ml/kg/day; more if sweating.',
        notes: rec.recoveryPlan?.notes || '',
        isActive: true,
        startDate: new Date(),
      });

      console.log(`✓ Created recovery plan: ${plan.mobilityMinutesPerDay}m mobility, ${plan.restDaysPerWeek} rest days`);
    } catch (err) {
      console.error('Failed to apply recovery plan', err);
      throw err;
    }
  }

}
