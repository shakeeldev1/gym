import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RunningPlan, RunningPlanDocument } from './schemas/running-plan.schema';
import { UserPlanProgress, UserPlanProgressDocument } from './schemas/user-plan-progress.schema';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(RunningPlan.name)
    private runningPlanModel: Model<RunningPlanDocument>,
    @InjectModel(UserPlanProgress.name)
    private userPlanProgressModel: Model<UserPlanProgressDocument>,
  ) {}

  async getRunningPlans(goal?: string): Promise<RunningPlan[]> {
    const filter: any = { isActive: true };
    if (goal && goal !== 'All') filter.goal = goal;
    return this.runningPlanModel.find(filter).sort({ durationWeeks: 1 }).exec();
  }

  async startRunningPlan(userId: string, planId: string): Promise<UserPlanProgress> {
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

  async seedDefaultPlans(): Promise<{ message: string; count: number }> {
    const existingCount = await this.runningPlanModel.countDocuments();
    if (existingCount > 0) {
      return { message: 'Plans already seeded', count: existingCount };
    }

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
    return { message: 'Running plans seeded', count: created.length };
  }
}
