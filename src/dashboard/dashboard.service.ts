import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel('Session') private sessionModel: Model<any>,
    @InjectModel('NutritionGoal') private nutritionGoalModel: Model<any>,
    @InjectModel('HabitLog') private habitLogModel: Model<any>,
    @InjectModel('SleepLog') private sleepLogModel: Model<any>,
    @InjectModel('Meal') private mealModel: Model<any>,
    @InjectModel('Habit') private habitModel: Model<any>,
  ) {}

  async getSummary(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userObjectId = new Types.ObjectId(userId);

    const [
      todayCompletedSessions,
      todayTotalSessions,
      nutritionGoal,
      todayHabits,
      lastSleep,
      todayMeals,
      waterIntake,
    ] = await Promise.all([
      this.sessionModel.countDocuments({
        user: userObjectId,
        sessionDate: { $gte: today, $lt: tomorrow },
        completed: true,
      }),
      this.sessionModel.countDocuments({
        user: userObjectId,
        sessionDate: { $gte: today, $lt: tomorrow },
      }),
      this.nutritionGoalModel
        .findOne({ user: userObjectId, isActive: true })
        .select('caloriesTarget proteinTarget carbsTarget fatsTarget')
        .lean(),
      this.habitLogModel.countDocuments({
        user: userObjectId,
        date: { $gte: today, $lt: tomorrow },
      }),
      this.sleepLogModel
        .findOne({ user: userObjectId })
        .sort({ createdAt: -1 })
        .select('durationHours quality')
        .lean(),
      this.mealModel.countDocuments({
        user: userObjectId,
        date: { $gte: today, $lt: tomorrow },
        status: 'done',
      }),
      this.getWaterIntake(userObjectId, today, tomorrow),
    ]);

    // Estimate active minutes: ~30 min per completed session
    const activeMinutes = todayCompletedSessions * 30;
    // Estimate calories burned: ~250 kcal per completed session
    const caloriesBurned = todayCompletedSessions * 250;

    return {
      data: {
        // Fields for Flutter app
        workoutsCompleted: todayCompletedSessions,
        caloriesBurned,
        activeMinutes,
        waterIntake,
        stepsToday: 0, // No step sensor integration yet
        caloriesConsumed: todayMeals * 500, // Estimate per meal

        // Fields for web client
        todayWorkouts: todayTotalSessions,
        nutritionGoal: nutritionGoal || null,
        habitsCompleted: todayHabits,
        lastSleep: lastSleep || null,
        greeting: this.getGreeting(),
        quickStats: {
          workoutsThisWeek: await this.getWeeklyWorkoutCount(userObjectId),
        },
      },
    };
  }

  async getTodayGoals(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userObjectId = new Types.ObjectId(userId);

    const [sessions, nutritionGoal, lastSleep, waterIntake] =
      await Promise.all([
        this.sessionModel
          .find({
            user: userObjectId,
            sessionDate: { $gte: today, $lt: tomorrow },
          })
          .lean(),
        this.nutritionGoalModel
          .findOne({ user: userObjectId, isActive: true })
          .lean() as Promise<any>,
        this.sleepLogModel
          .findOne({
            user: userObjectId,
            date: { $gte: today, $lt: tomorrow },
          })
          .select('durationHours')
          .lean() as Promise<any>,
        this.getWaterIntake(userObjectId, today, tomorrow),
      ]);

    return {
      data: {
        workoutGoal: { target: 1, completed: sessions.length },
        nutritionGoal: nutritionGoal
          ? {
              calorieTarget: nutritionGoal.caloriesTarget,
              proteinTarget: nutritionGoal.proteinTarget,
            }
          : null,
        waterGoal: { target: 8, completed: waterIntake },
        sleepGoal: {
          target: 8,
          completed: lastSleep?.durationHours || 0,
        },
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

  private async getWeeklyWorkoutCount(userId: Types.ObjectId): Promise<number> {
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

  private async getWaterIntake(
    userId: Types.ObjectId,
    today: Date,
    tomorrow: Date,
  ): Promise<number> {
    try {
      // Find water-related habit
      const waterHabit = await this.habitModel
        .findOne({
          name: { $regex: /water|hydrat/i },
        })
        .select('_id')
        .lean();

      if (!waterHabit) return 0;

      const log = await this.habitLogModel
        .findOne({
          user: userId,
          habit: (waterHabit as any)._id,
          date: { $gte: today, $lt: tomorrow },
        })
        .select('value')
        .lean();

      if (!log) return 0;
      const val = (log as any).value;
      return typeof val === 'number' ? val : val ? 1 : 0;
    } catch {
      return 0;
    }
  }
}
