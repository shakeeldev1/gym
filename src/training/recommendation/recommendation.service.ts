import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Exercise } from '../exercise/exercise.schema';
import { UserProfile } from '../../user/schemas/userProfile.schema';
import { Recommendation, RecommendationDocument } from './recommendation.schema';

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
      const volume = this.calculateVolume(profile.experienceLevel || 'beginner', profile.goal);

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

  // Auto-generate recommendation on profile completion
  async autoGenerateRecommendation(userId: string): Promise<RecommendationDocument> {
    try {
      // Delete previous pending recommendations
      await this.recommendationModel.deleteMany({ userId, status: 'pending' });

      // Get profile
      const profile = await this.userProfileModel.findOne({ userId }).lean();
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Generate session
      const session = await this.getRecommendations({ userId });

      // Get detailed exercises
      const exercisesWithDetails = await Promise.all(
        session.exercises.map(async (ex) => {
          const fullEx = await this.exerciseModel.findById((ex.exercise as any)._id).lean();
          if (!fullEx) {
            throw new Error(`Exercise not found for ID: ${(ex.exercise as any)._id}`);
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

      // Create recommendation document
      const recommendation = await this.recommendationModel.create({
        userId,
        status: 'pending',
        name: session.name,
        duration: session.duration,
        exercises: exercisesWithDetails,
        notes: session.notes,
        userProfileSnapshot: {
          experienceLevel: profile.experienceLevel,
          availableEquipment: profile.availableEquipment,
          injuries: profile.injuries,
          preferredDaysPerWeek: profile.preferredDaysPerWeek,
          sessionLengthMinutes: profile.sessionLengthMinutes,
        },
      });

      return recommendation;
    } catch (error) {
      console.error('Failed to auto-generate recommendation:', error);
      throw error;
    }
  }

  // Get recommendations for user
  async getRecommendationsForUser(userId: string, status?: string): Promise<any> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }
    return this.recommendationModel.find(query).sort({ createdAt: -1 }).lean() as any;
  }

  // Get single recommendation
  async getRecommendation(recommendationId: string): Promise<any> {
    const doc = await this.recommendationModel.findById(recommendationId).lean();
    return doc || null;
  }

  // Update recommendation (coach can modify)
  async updateRecommendation(
    recommendationId: string,
    updates: {
      exercises?: any[];
      coachNotes?: string;
      name?: string;
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
    return doc || null;
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
    return doc || null;
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
    return doc || null;
  }

  // Get pending recommendations count
  async getPendingCount(): Promise<number> {
    return this.recommendationModel.countDocuments({ status: 'pending' });
  }

  // Get all pending recommendations (for coach dashboard)
  async getPendingRecommendations(limit: number = 10): Promise<any> {
    return this.recommendationModel
      .find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean() as any;
  }

}
