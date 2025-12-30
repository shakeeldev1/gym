import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Fasting } from '../fasting/schemas/fasting.schema'
import { Habit } from '../habits/schemas/habit.schema'
import { Session } from '../training/session/schemas/session.schema'
import { Meal } from '../nutrition/meal/schemas/meal.schema'
import { Meditation } from '../mindset-recovery/schemas/meditation.schema'
import { Sleep } from '../mindset-recovery/schemas/sleep.schema'

type OverviewParams = {
  startDate?: string
  endDate?: string
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Fasting.name) private fastingModel: Model<Fasting>,
    @InjectModel(Habit.name) private habitModel: Model<Habit>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(Meal.name) private mealModel: Model<Meal>,
    @InjectModel(Meditation.name) private meditationModel: Model<Meditation>,
    @InjectModel(Sleep.name) private sleepModel: Model<Sleep>,
  ) {}

  async getOverview(params: OverviewParams) {
    const { startDate, endDate } = params
    const dateFilter: any = {}
    
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    const [workoutsCompleted, mealsLogged, meditationSessions, fastingSessions, sleepLogs] = await Promise.all([
      this.sessionModel.countDocuments(dateFilter),
      this.mealModel.countDocuments(dateFilter),
      this.meditationModel.countDocuments(dateFilter),
      this.fastingModel.countDocuments(dateFilter),
      this.sleepModel.countDocuments(dateFilter),
    ])

    const sleepDocs = await this.sleepModel.find(dateFilter).select('durationHours').lean()
    const totalSleepHours = sleepDocs.reduce((sum, doc) => sum + (doc.durationHours || 0), 0)
    const avgSleepHours = sleepDocs.length ? (totalSleepHours / sleepDocs.length).toFixed(1) : '0'

    return {
      range: { startDate, endDate },
      workoutsCompleted,
      mealsLogged,
      avgSleepHours: parseFloat(avgSleepHours),
      meditationSessions,
      fastingSessions,
    }
  }

  async getUserStats(userId: string) {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalWorkouts,
      weekWorkouts,
      totalMeals,
      todayMeals,
      totalFasting,
      monthFasting,
      totalMeditation,
      weekMeditation
    ] = await Promise.all([
      this.sessionModel.countDocuments({ user: userId }),
      this.sessionModel.countDocuments({ user: userId, createdAt: { $gte: weekStart } }),
      this.mealModel.countDocuments({ user: userId }),
      this.mealModel.countDocuments({ user: userId, createdAt: { $gte: todayStart } }),
      this.fastingModel.countDocuments({ user: userId }),
      this.fastingModel.countDocuments({ user: userId, createdAt: { $gte: monthStart } }),
      this.meditationModel.countDocuments({ user: userId }),
      this.meditationModel.countDocuments({ user: userId, createdAt: { $gte: weekStart } })
    ])

    return {
      workouts: {
        completed: totalWorkouts,
        thisWeek: weekWorkouts
      },
      meals: {
        total: totalMeals,
        today: todayMeals
      },
      fasting: {
        total: totalFasting,
        thisMonth: monthFasting
      },
      meditation: {
        total: totalMeditation,
        thisWeek: weekMeditation
      }
    }
  }

  async getUserActivity(userId: string, limit: number = 5) {
    // Get recent activities from different collections
    const [sessions, meals, fasting, meditation, sleep] = await Promise.all([
      this.sessionModel.find({ user: userId }).sort({ createdAt: -1 }).limit(2).lean(),
      this.mealModel.find({ user: userId }).sort({ createdAt: -1 }).limit(2).lean(),
      this.fastingModel.find({ user: userId }).sort({ createdAt: -1 }).limit(1).lean(),
      this.meditationModel.find({ user: userId }).sort({ createdAt: -1 }).limit(1).lean(),
      this.sleepModel.find({ user: userId }).sort({ createdAt: -1 }).limit(1).lean()
    ])

    // Combine and format activities
    const activities = [
      ...sessions.map(s => ({
        type: 'training',
        description: 'Completed workout session',
        createdAt: s.createdAt,
        timestamp: s.createdAt
      })),
      ...meals.map(m => ({
        type: 'nutrition',
        description: `Logged ${m.name || 'meal'} - ${m.calories || 0} calories`,
        createdAt: m.createdAt,
        timestamp: m.createdAt
      })),
      ...fasting.map(f => ({
        type: 'fasting',
        description: `Completed ${((f.endTime?.getTime() - f.startTime?.getTime()) / 3600000).toFixed(1)}-hour fast`,
        createdAt: f.createdAt,
        timestamp: f.createdAt
      })),
      ...meditation.map(m => ({
        type: 'meditation',
        description: `Completed ${m.duration || 10}-minute meditation`,
        createdAt: m.createdAt,
        timestamp: m.createdAt
      })),
      ...sleep.map(s => ({
        type: 'sleep',
        description: `Logged ${s.durationHours || 0} hours of sleep`,
        createdAt: s.createdAt,
        timestamp: s.createdAt
      }))
    ]

    // Sort by timestamp and limit
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    return {
      activities: activities.slice(0, limit)
    }
  }
}
