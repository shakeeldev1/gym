import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('Session') private sessionModel: Model<any>,
    @InjectModel('NutritionGoal') private nutritionGoalModel: Model<any>,
    @InjectModel('HabitLog') private habitLogModel: Model<any>,
    @InjectModel('SleepLog') private sleepLogModel: Model<any>,
  ) {}

  async getSummary(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todaySessions, nutritionGoal, todayHabits, lastSleep] =
      await Promise.all([
        this.sessionModel.countDocuments({
          user: userId,
          sessionDate: { $gte: today, $lt: tomorrow },
        }),
        this.nutritionGoalModel
          .findOne({ userId, isActive: true })
          .select('calorieTarget proteinTarget carbsTarget fatsTarget')
          .lean(),
        this.habitLogModel.countDocuments({
          userId,
          date: { $gte: today, $lt: tomorrow },
        }),
        this.sleepLogModel
          .findOne({ userId })
          .sort({ createdAt: -1 })
          .select('durationHours quality')
          .lean(),
      ]);

    return {
      data: {
        todayWorkouts: todaySessions,
        nutritionGoal: nutritionGoal || null,
        habitsCompleted: todayHabits,
        lastSleep: lastSleep || null,
        greeting: this.getGreeting(),
        quickStats: {
          workoutsThisWeek: await this.getWeeklyWorkoutCount(userId),
        },
      },
    };
  }

  async getTodayGoals(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [sessions, nutritionGoal] = await Promise.all([
      this.sessionModel
        .find({ user: userId, sessionDate: { $gte: today, $lt: tomorrow } })
        .lean(),
      this.nutritionGoalModel
        .findOne({ userId, isActive: true })
        .lean() as Promise<any>,
    ]);

    return {
      data: {
        workoutGoal: { target: 1, completed: sessions.length },
        nutritionGoal: nutritionGoal
          ? {
              calorieTarget: nutritionGoal.calorieTarget,
              proteinTarget: nutritionGoal.proteinTarget,
            }
          : null,
        waterGoal: { target: 8, completed: 0 }, // Placeholder until water tracking is implemented
        sleepGoal: { target: 8, completed: 0 },
      },
    };
  }

  async getUpcomingActivities(userId: string): Promise<any> {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const sessions = await this.sessionModel
      .find({
        user: userId,
        sessionDate: { $gte: now, $lte: nextWeek },
        completed: false,
      })
      .sort({ sessionDate: 1 })
      .limit(10)
      .lean();

    return {
      data: sessions.map((s: any) => ({
        id: s._id,
        type: 'workout',
        title: s.notes || 'Training Session',
        date: s.sessionDate,
        completed: s.completed,
      })),
    };
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  private async getWeeklyWorkoutCount(userId: string): Promise<number> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return this.sessionModel.countDocuments({
      user: userId,
      sessionDate: { $gte: weekStart },
      completed: true,
    });
  }
}
