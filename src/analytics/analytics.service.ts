import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
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
    const userObjectId = new Types.ObjectId(userId)
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
      this.sessionModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }] }),
      this.sessionModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }], createdAt: { $gte: weekStart } } as any),
      this.mealModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }] }),
      this.mealModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }], date: { $gte: todayStart } }),
      this.fastingModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }] }),
      this.fastingModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }], startTime: { $gte: monthStart } }),
      this.meditationModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }] }),
      this.meditationModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }], date: { $gte: weekStart } })
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
    const userObjectId = new Types.ObjectId(userId)
    // Get recent activities from different collections
    const [sessions, meals, fasting, meditation, sleep] = await Promise.all([
      this.sessionModel.find({ $or: [{ user: userObjectId }, { user: userId }] }).sort({ _id: -1 }).limit(2).lean(),
      this.mealModel.find({ $or: [{ user: userObjectId }, { user: userId }] }).sort({ date: -1 }).limit(2).lean(),
      this.fastingModel.find({ $or: [{ user: userObjectId }, { user: userId }] }).sort({ startTime: -1 }).limit(1).lean(),
      this.meditationModel.find({ $or: [{ user: userObjectId }, { user: userId }] }).sort({ date: -1 }).limit(1).lean(),
      this.sleepModel.find({ $or: [{ user: userObjectId }, { user: userId }] }).sort({ date: -1 }).limit(1).lean()
    ])

    // Combine and format activities
    const activities = [
      ...sessions.map((s: any) => ({
        type: 'training',
        description: 'Completed workout session',
        createdAt: s.createdAt || s._id.getTimestamp(),
        timestamp: s.createdAt || s._id.getTimestamp()
      })),
      ...meals.map((m: any) => ({
        type: 'nutrition',
        description: `Logged meal`,
        createdAt: m.createdAt || m.date,
        timestamp: m.createdAt || m.date
      })),
      ...fasting.map((f: any) => ({
        type: 'fasting',
        description: `Completed ${f.endTime ? ((f.endTime.getTime() - f.startTime.getTime()) / 3600000).toFixed(1) : 'ongoing'}-hour fast`,
        createdAt: f.createdAt || f.startTime,
        timestamp: f.createdAt || f.startTime
      })),
      ...meditation.map((m: any) => ({
        type: 'meditation',
        description: `Completed ${m.durationMinutes || 10}-minute meditation`,
        createdAt: m.createdAt || m.date,
        timestamp: m.createdAt || m.date
      })),
      ...sleep.map((s: any) => ({
        type: 'sleep',
        description: `Logged ${s.durationHours || 0} hours of sleep`,
        createdAt: s.createdAt || s.date,
        timestamp: s.createdAt || s.date
      }))
    ]

    // Sort by timestamp and limit
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    
    return {
      activities: activities.slice(0, limit)
    }
  }

  async getAthleteStats(userId: string) {
    const userObjectId = new Types.ObjectId(userId)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalSessions,
      completedSessions,
      recentSessions,
      mealsLogged,
      fastingTotal,
      meditationTotal,
      sleepDocs,
      habitsTotal,
    ] = await Promise.all([
      this.sessionModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }] }),
      this.sessionModel.countDocuments({ $and: [
        { $or: [{ user: userObjectId }, { user: userId }] },
        { $or: [{ status: 'completed' }, { completed: true }] }
      ] } as any),
      this.sessionModel
        .find({ $or: [{ user: userObjectId }, { user: userId }], createdAt: { $gte: weekStart } } as any)
        .sort({ createdAt: -1 })
        .limit(5)
        .select(['notes', 'status', 'date', 'createdAt'])
        .lean(),
      this.mealModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }] }),
      this.fastingModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }] }),
      this.meditationModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }] }),
      this.sleepModel.find({ $or: [{ user: userObjectId }, { user: userId }], date: { $gte: monthStart } } as any).select(['durationHours', 'date']).lean(),
      this.habitModel.countDocuments({ $or: [{ user: userObjectId }, { user: userId }] }),
    ])

    const totalSleepHours = sleepDocs.reduce((sum, doc: any) => sum + (doc.durationHours || 0), 0)
    const avgSleepHours = sleepDocs.length ? parseFloat((totalSleepHours / sleepDocs.length).toFixed(1)) : 0
    const completionRate = totalSessions ? Math.round((completedSessions / totalSessions) * 100) : 0

    const recent = recentSessions.map((s: any) => ({
      note: s.notes || 'Training Session',
      status: s.status || (s.completed ? 'completed' : 'scheduled'),
      date: s.date || s.createdAt,
    }))

    return {
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        completionRate,
        recent,
      },
      meals: { total: mealsLogged },
      fasting: { total: fastingTotal },
      meditation: { total: meditationTotal },
      sleep: { avgHours: avgSleepHours },
      habits: { total: habitsTotal },
    }
  }
}
