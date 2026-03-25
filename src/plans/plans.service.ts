import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RunningPlan, RunningPlanDocument } from './schemas/running-plan.schema';
import { TrainingPlan, TrainingPlanDocument } from './schemas/training-plan.schema';
import { UserPlanProgress, UserPlanProgressDocument } from './schemas/user-plan-progress.schema';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(RunningPlan.name)
    private runningPlanModel: Model<RunningPlanDocument>,
    @InjectModel(TrainingPlan.name)
    private trainingPlanModel: Model<TrainingPlanDocument>,
    @InjectModel(UserPlanProgress.name)
    private userPlanProgressModel: Model<UserPlanProgressDocument>,
  ) {}

  async getRunningPlans(goal?: string): Promise<RunningPlan[]> {
    const filter: any = { isActive: true };
    if (goal && goal !== 'All') filter.goal = goal;
    return this.runningPlanModel.find(filter).sort({ durationWeeks: 1 }).exec();
  }

  async startRunningPlan(userId: string, planId: string, body?: any): Promise<UserPlanProgress> {
    const plan = await this.runningPlanModel.findById(planId);
    if (!plan) throw new NotFoundException('Running plan not found');

    const existing = await this.userPlanProgressModel.findOne({ userId, planId });
    if (existing && existing.status === 'active') {
      throw new ConflictException('Plan already started');
    }

    if (existing) {
      existing.status = 'active';
      existing.currentWeek = 1;
      existing.completedRuns = [];
      existing.startedAt = new Date();
      existing.completedAt = null as any;
      return existing.save();
    }

    return this.userPlanProgressModel.create({
      userId,
      planId,
      planType: 'running',
      status: 'active',
      startedAt: new Date(),
    });
  }

  async getPlanProgress(userId: string, planId: string): Promise<UserPlanProgress | null> {
    return this.userPlanProgressModel.findOne({ userId, planId }).exec();
  }

  // ============== TRAINING PLANS ==============

  async getTrainingPlans(type?: string): Promise<TrainingPlan[]> {
    const filter: any = { isActive: true };
    if (type) filter.type = type;
    return this.trainingPlanModel.find(filter).sort({ level: 1 }).exec();
  }

  async getGymPlans(): Promise<TrainingPlan[]> {
    return this.getTrainingPlans('gym');
  }

  async getHomePlans(): Promise<TrainingPlan[]> {
    return this.getTrainingPlans('home');
  }

  async startTrainingPlan(userId: string, planId: string, body?: any): Promise<UserPlanProgress> {
    const plan = await this.trainingPlanModel.findById(planId);
    if (!plan) throw new NotFoundException('Training plan not found');

    const existing = await this.userPlanProgressModel.findOne({ userId, planId });
    if (existing && existing.status === 'active') {
      throw new ConflictException('Plan already started');
    }

    if (existing) {
      existing.status = 'active';
      existing.currentWeek = 1;
      existing.completedRuns = [];
      existing.startedAt = new Date();
      existing.completedAt = null as any;
      return existing.save();
    }

    return this.userPlanProgressModel.create({
      userId,
      planId,
      planType: 'training',
      status: 'active',
      startedAt: new Date(),
    });
  }

  async seedDefaultPlans(): Promise<{ message: string; runningCount: number; trainingCount: number }> {
    let runningCount = 0;
    let trainingCount = 0;

    const existingRunning = await this.runningPlanModel.countDocuments();
    if (existingRunning > 0) {
      runningCount = existingRunning;
    } else {

    const plans: Partial<RunningPlan>[] = [
      {
        name: 'Couch to 5K',
        description: 'Start from zero and build up to running 5K in 8 weeks.',
        goal: '5K',
        difficulty: 'beginner',
        durationWeeks: 8,
        runsPerWeek: 3,
        weeks: [
          {
            weekNumber: 1,
            runs: [
              { day: 'Mon', type: 'easy', distance: 2, duration: 20, description: 'Walk/run intervals: 1 min run, 2 min walk' },
              { day: 'Wed', type: 'easy', distance: 2, duration: 20, description: 'Walk/run intervals: 1 min run, 2 min walk' },
              { day: 'Sat', type: 'easy', distance: 2.5, duration: 25, description: 'Walk/run intervals: 1.5 min run, 2 min walk' },
            ],
          },
        ],
      },
      {
        name: '5K Speed Builder',
        description: 'Improve your 5K time with intervals and tempo runs.',
        goal: '5K',
        difficulty: 'intermediate',
        durationWeeks: 6,
        runsPerWeek: 4,
        weeks: [
          {
            weekNumber: 1,
            runs: [
              { day: 'Mon', type: 'easy', distance: 4, duration: 25, pace: '6:15/km' },
              { day: 'Wed', type: 'interval', distance: 5, duration: 30, description: '6x400m at 5K pace with 200m jog' },
              { day: 'Fri', type: 'tempo', distance: 4, duration: 22, pace: '5:30/km' },
              { day: 'Sun', type: 'long', distance: 6, duration: 38, pace: '6:20/km' },
            ],
          },
        ],
      },
      {
        name: 'First 10K',
        description: 'Graduate from 5K to 10K in 8 weeks.',
        goal: '10K',
        difficulty: 'beginner',
        durationWeeks: 8,
        runsPerWeek: 3,
        weeks: [
          {
            weekNumber: 1,
            runs: [
              { day: 'Tue', type: 'easy', distance: 4, duration: 28, description: 'Easy conversational pace' },
              { day: 'Thu', type: 'tempo', distance: 3, duration: 18, description: 'Comfortably hard pace' },
              { day: 'Sun', type: 'long', distance: 6, duration: 40, description: 'Slow and steady' },
            ],
          },
        ],
      },
      {
        name: '10K Performance',
        description: 'Train for a competitive 10K with structured workouts.',
        goal: '10K',
        difficulty: 'advanced',
        durationWeeks: 10,
        runsPerWeek: 5,
        weeks: [
          {
            weekNumber: 1,
            runs: [
              { day: 'Mon', type: 'easy', distance: 6, duration: 35, pace: '5:50/km' },
              { day: 'Tue', type: 'interval', distance: 8, duration: 40, description: '8x800m at 10K pace' },
              { day: 'Thu', type: 'tempo', distance: 6, duration: 30, pace: '5:00/km' },
              { day: 'Sat', type: 'easy', distance: 5, duration: 30, pace: '6:00/km' },
              { day: 'Sun', type: 'long', distance: 12, duration: 70, pace: '5:50/km' },
            ],
          },
        ],
      },
      {
        name: 'Half Marathon Starter',
        description: 'Build up to 21.1km over 12 weeks.',
        goal: 'Half Marathon',
        difficulty: 'intermediate',
        durationWeeks: 12,
        runsPerWeek: 4,
        weeks: [
          {
            weekNumber: 1,
            runs: [
              { day: 'Mon', type: 'easy', distance: 5, duration: 30 },
              { day: 'Wed', type: 'tempo', distance: 5, duration: 28 },
              { day: 'Fri', type: 'easy', distance: 4, duration: 25 },
              { day: 'Sun', type: 'long', distance: 10, duration: 60 },
            ],
          },
        ],
      },
      {
        name: 'Marathon Beginner',
        description: 'Your first marathon in 16 weeks. Slow, steady, and safe.',
        goal: 'Marathon',
        difficulty: 'intermediate',
        durationWeeks: 16,
        runsPerWeek: 4,
        weeks: [
          {
            weekNumber: 1,
            runs: [
              { day: 'Tue', type: 'easy', distance: 5, duration: 30 },
              { day: 'Thu', type: 'tempo', distance: 5, duration: 28 },
              { day: 'Sat', type: 'easy', distance: 4, duration: 25 },
              { day: 'Sun', type: 'long', distance: 12, duration: 75 },
            ],
          },
        ],
      },
    ];

    const created = await this.runningPlanModel.insertMany(plans);
    runningCount = created.length;
    }

    const existingTraining = await this.trainingPlanModel.countDocuments();
    if (existingTraining > 0) {
      trainingCount = existingTraining;
    } else {
      const trainingPlans: Partial<TrainingPlan>[] = [
        // ===== GYM PLANS =====
        {
          name: 'Beginner Full Body',
          description: 'A complete gym introduction targeting all major muscle groups. Perfect for those new to weight training.',
          type: 'gym',
          level: 'beginner',
          duration: '8 weeks',
          daysPerWeek: 3,
          equipment: 'Full Gym',
          focus: ['Full Body', 'Strength'],
          weeks: [{
            weekNumber: 1,
            days: [
              { day: 'Mon', exercises: [
                { name: 'Barbell Squat', sets: 3, reps: '10', rest: '90s' },
                { name: 'Bench Press', sets: 3, reps: '10', rest: '90s' },
                { name: 'Bent-Over Row', sets: 3, reps: '10', rest: '90s' },
                { name: 'Overhead Press', sets: 3, reps: '10', rest: '60s' },
                { name: 'Plank', sets: 3, reps: '30s', rest: '45s' },
              ]},
              { day: 'Wed', exercises: [
                { name: 'Leg Press', sets: 3, reps: '12', rest: '90s' },
                { name: 'Dumbbell Chest Fly', sets: 3, reps: '12', rest: '60s' },
                { name: 'Lat Pulldown', sets: 3, reps: '12', rest: '60s' },
                { name: 'Lateral Raises', sets: 3, reps: '15', rest: '45s' },
                { name: 'Bicycle Crunches', sets: 3, reps: '15', rest: '45s' },
              ]},
              { day: 'Fri', exercises: [
                { name: 'Romanian Deadlift', sets: 3, reps: '10', rest: '90s' },
                { name: 'Incline Dumbbell Press', sets: 3, reps: '10', rest: '60s' },
                { name: 'Seated Cable Row', sets: 3, reps: '12', rest: '60s' },
                { name: 'Dumbbell Curl', sets: 2, reps: '12', rest: '45s' },
                { name: 'Tricep Pushdown', sets: 2, reps: '12', rest: '45s' },
              ]},
            ],
          }],
        },
        {
          name: 'Hypertrophy Push/Pull/Legs',
          description: 'A classic PPL split designed for muscle growth. Intermediate lifters looking to add size.',
          type: 'gym',
          level: 'intermediate',
          duration: '12 weeks',
          daysPerWeek: 6,
          equipment: 'Full Gym',
          focus: ['Hypertrophy', 'Muscle Building'],
          weeks: [{
            weekNumber: 1,
            days: [
              { day: 'Mon', exercises: [
                { name: 'Bench Press', sets: 4, reps: '8-10', rest: '90s' },
                { name: 'Overhead Press', sets: 4, reps: '8-10', rest: '90s' },
                { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s' },
                { name: 'Cable Fly', sets: 3, reps: '12-15', rest: '45s' },
                { name: 'Tricep Dips', sets: 3, reps: '10-12', rest: '60s' },
                { name: 'Overhead Tricep Extension', sets: 3, reps: '12', rest: '45s' },
              ]},
              { day: 'Tue', exercises: [
                { name: 'Deadlift', sets: 4, reps: '6-8', rest: '120s' },
                { name: 'Pull-Ups', sets: 4, reps: '8-10', rest: '90s' },
                { name: 'Barbell Row', sets: 4, reps: '8-10', rest: '90s' },
                { name: 'Face Pulls', sets: 3, reps: '15', rest: '45s' },
                { name: 'Barbell Curl', sets: 3, reps: '10-12', rest: '45s' },
                { name: 'Hammer Curl', sets: 3, reps: '12', rest: '45s' },
              ]},
              { day: 'Wed', exercises: [
                { name: 'Barbell Squat', sets: 4, reps: '8-10', rest: '120s' },
                { name: 'Romanian Deadlift', sets: 4, reps: '10', rest: '90s' },
                { name: 'Leg Press', sets: 3, reps: '12', rest: '90s' },
                { name: 'Leg Curl', sets: 3, reps: '12', rest: '60s' },
                { name: 'Calf Raises', sets: 4, reps: '15', rest: '45s' },
              ]},
            ],
          }],
        },
        {
          name: 'Advanced Strength Program',
          description: 'Heavy compound lifts with progressive overload. For experienced lifters chasing strength PRs.',
          type: 'gym',
          level: 'advanced',
          duration: '10 weeks',
          daysPerWeek: 5,
          equipment: 'Full Gym',
          focus: ['Strength', 'Power'],
          weeks: [{
            weekNumber: 1,
            days: [
              { day: 'Mon', exercises: [
                { name: 'Back Squat', sets: 5, reps: '5', rest: '180s', notes: 'Work up to top set' },
                { name: 'Front Squat', sets: 3, reps: '6', rest: '120s' },
                { name: 'Bulgarian Split Squat', sets: 3, reps: '8 each', rest: '90s' },
                { name: 'Leg Extension', sets: 3, reps: '12', rest: '60s' },
              ]},
              { day: 'Tue', exercises: [
                { name: 'Bench Press', sets: 5, reps: '5', rest: '180s', notes: 'Work up to top set' },
                { name: 'Close-Grip Bench', sets: 3, reps: '8', rest: '90s' },
                { name: 'Weighted Dips', sets: 3, reps: '8', rest: '90s' },
                { name: 'Dumbbell Fly', sets: 3, reps: '12', rest: '60s' },
              ]},
              { day: 'Thu', exercises: [
                { name: 'Deadlift', sets: 5, reps: '3', rest: '180s', notes: 'Work up to top set' },
                { name: 'Barbell Row', sets: 4, reps: '6', rest: '120s' },
                { name: 'Weighted Pull-Ups', sets: 4, reps: '6', rest: '90s' },
                { name: 'Barbell Shrugs', sets: 3, reps: '10', rest: '60s' },
              ]},
            ],
          }],
        },
        {
          name: 'Gym HIIT Circuit',
          description: 'High-intensity circuit training using gym equipment. Burns fat while building functional strength.',
          type: 'gym',
          level: 'intermediate',
          duration: '6 weeks',
          daysPerWeek: 4,
          equipment: 'Full Gym',
          focus: ['Fat Loss', 'Conditioning'],
          weeks: [{
            weekNumber: 1,
            days: [
              { day: 'Mon', exercises: [
                { name: 'Kettlebell Swings', sets: 4, reps: '20', rest: '30s' },
                { name: 'Battle Ropes', sets: 4, reps: '30s', rest: '30s' },
                { name: 'Box Jumps', sets: 4, reps: '12', rest: '30s' },
                { name: 'Medicine Ball Slams', sets: 4, reps: '15', rest: '30s' },
                { name: 'Rowing Machine', sets: 4, reps: '250m', rest: '60s' },
              ]},
            ],
          }],
        },

        // ===== HOME PLANS =====
        {
          name: 'Bodyweight Basics',
          description: 'No equipment needed. Build a solid foundation of strength and mobility from home.',
          type: 'home',
          level: 'beginner',
          duration: '8 weeks',
          daysPerWeek: 3,
          equipment: 'None',
          focus: ['Full Body', 'Bodyweight'],
          weeks: [{
            weekNumber: 1,
            days: [
              { day: 'Mon', exercises: [
                { name: 'Push-Ups', sets: 3, reps: '10', rest: '60s', notes: 'Knee push-ups if needed' },
                { name: 'Bodyweight Squats', sets: 3, reps: '15', rest: '60s' },
                { name: 'Plank', sets: 3, reps: '30s', rest: '45s' },
                { name: 'Glute Bridges', sets: 3, reps: '15', rest: '45s' },
                { name: 'Superman Hold', sets: 3, reps: '20s', rest: '45s' },
              ]},
              { day: 'Wed', exercises: [
                { name: 'Incline Push-Ups', sets: 3, reps: '12', rest: '60s' },
                { name: 'Lunges', sets: 3, reps: '10 each', rest: '60s' },
                { name: 'Mountain Climbers', sets: 3, reps: '20', rest: '45s' },
                { name: 'Dead Bugs', sets: 3, reps: '10 each', rest: '45s' },
                { name: 'Wall Sit', sets: 3, reps: '30s', rest: '45s' },
              ]},
              { day: 'Fri', exercises: [
                { name: 'Diamond Push-Ups', sets: 3, reps: '8', rest: '60s' },
                { name: 'Jump Squats', sets: 3, reps: '12', rest: '60s' },
                { name: 'Bicycle Crunches', sets: 3, reps: '20', rest: '45s' },
                { name: 'Single-Leg Glute Bridge', sets: 3, reps: '10 each', rest: '45s' },
                { name: 'Burpees', sets: 3, reps: '8', rest: '60s' },
              ]},
            ],
          }],
        },
        {
          name: 'Home HIIT Burner',
          description: 'Fast-paced intervals to maximize calorie burn. No equipment, just effort.',
          type: 'home',
          level: 'intermediate',
          duration: '6 weeks',
          daysPerWeek: 4,
          equipment: 'None',
          focus: ['Fat Loss', 'Cardio', 'HIIT'],
          weeks: [{
            weekNumber: 1,
            days: [
              { day: 'Mon', exercises: [
                { name: 'Burpees', sets: 4, reps: '12', rest: '30s' },
                { name: 'High Knees', sets: 4, reps: '30s', rest: '15s' },
                { name: 'Jump Lunges', sets: 4, reps: '10 each', rest: '30s' },
                { name: 'Mountain Climbers', sets: 4, reps: '20', rest: '15s' },
                { name: 'Plank Jacks', sets: 4, reps: '15', rest: '30s' },
              ]},
            ],
          }],
        },
        {
          name: 'Dumbbell Home Strength',
          description: 'Build real strength at home with just a pair of dumbbells.',
          type: 'home',
          level: 'intermediate',
          duration: '10 weeks',
          daysPerWeek: 4,
          equipment: 'Dumbbells',
          focus: ['Strength', 'Muscle Building'],
          weeks: [{
            weekNumber: 1,
            days: [
              { day: 'Mon', exercises: [
                { name: 'Dumbbell Goblet Squat', sets: 4, reps: '12', rest: '60s' },
                { name: 'Dumbbell Romanian Deadlift', sets: 4, reps: '10', rest: '60s' },
                { name: 'Dumbbell Lunges', sets: 3, reps: '10 each', rest: '60s' },
                { name: 'Calf Raises (weighted)', sets: 3, reps: '15', rest: '45s' },
              ]},
              { day: 'Tue', exercises: [
                { name: 'Dumbbell Floor Press', sets: 4, reps: '10', rest: '60s' },
                { name: 'Dumbbell Row', sets: 4, reps: '10 each', rest: '60s' },
                { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', rest: '60s' },
                { name: 'Dumbbell Curl', sets: 3, reps: '12', rest: '45s' },
                { name: 'Overhead Tricep Extension', sets: 3, reps: '12', rest: '45s' },
              ]},
            ],
          }],
        },
        {
          name: 'Advanced Calisthenics',
          description: 'Master advanced bodyweight skills. Achieve muscle-ups, handstands, and pistol squats.',
          type: 'home',
          level: 'advanced',
          duration: '12 weeks',
          daysPerWeek: 5,
          equipment: 'Pull-Up Bar',
          focus: ['Calisthenics', 'Skill Work'],
          weeks: [{
            weekNumber: 1,
            days: [
              { day: 'Mon', exercises: [
                { name: 'Handstand Practice', sets: 5, reps: '30s', rest: '90s', notes: 'Wall-assisted initially' },
                { name: 'Archer Push-Ups', sets: 4, reps: '6 each', rest: '90s' },
                { name: 'Pseudo Planche Push-Ups', sets: 3, reps: '8', rest: '90s' },
                { name: 'L-Sit Hold', sets: 3, reps: '15s', rest: '60s' },
              ]},
              { day: 'Tue', exercises: [
                { name: 'Pull-Ups', sets: 5, reps: '8', rest: '90s' },
                { name: 'Muscle-Up Negatives', sets: 4, reps: '3', rest: '120s', notes: 'Jump to top, slow negative' },
                { name: 'Front Lever Raises', sets: 3, reps: '5', rest: '90s' },
                { name: 'Skin the Cat', sets: 3, reps: '5', rest: '90s' },
              ]},
              { day: 'Thu', exercises: [
                { name: 'Pistol Squat Progressions', sets: 4, reps: '5 each', rest: '90s' },
                { name: 'Nordic Curl Negatives', sets: 3, reps: '5', rest: '90s' },
                { name: 'Dragon Flag Progressions', sets: 3, reps: '5', rest: '90s' },
                { name: 'Single-Leg Calf Raises', sets: 3, reps: '15 each', rest: '45s' },
              ]},
            ],
          }],
        },
      ];

      const createdTraining = await this.trainingPlanModel.insertMany(trainingPlans);
      trainingCount = createdTraining.length;
    }

    return { message: 'Plans seeded', runningCount, trainingCount };
  }
}
