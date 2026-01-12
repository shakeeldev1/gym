import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Fasting } from '../fasting/schemas/fasting.schema'
import { Habit } from '../habits/schemas/habit.schema'
import { HabitLog } from '../habits/schemas/habit-log.schema'
import { Session } from '../training/session/schemas/session.schema'
import { Meal } from '../nutrition/meal/schemas/meal.schema'
import { Meditation } from '../mindset-recovery/schemas/meditation.schema'
import { Sleep } from '../mindset-recovery/schemas/sleep.schema'
import { Breathwork } from '../mindset-recovery/schemas/breathwork.schema'
import { UpdateWellnessStatusDto } from './dto/update-wellness-status.dto'
import { DailyStatsResponseDto, CategoryStats } from './dto/daily-stats-response.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { DailyResetService } from 'src/common/services/daily-reset.service'

type OverviewParams = {
  startDate?: string
  endDate?: string
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Fasting.name) private fastingModel: Model<Fasting>,
    @InjectModel(Habit.name) private habitModel: Model<Habit>,
    @InjectModel(HabitLog.name) private habitLogModel: Model<HabitLog>,
    @InjectModel(Session.name) private sessionModel: Model<Session>,
    @InjectModel(Meal.name) private mealModel: Model<Meal>,
    @InjectModel(Meditation.name) private meditationModel: Model<Meditation>,
    @InjectModel(Sleep.name) private sleepModel: Model<Sleep>,
    @InjectModel(Breathwork.name) private breathworkModel: Model<Breathwork>,
    private dailyResetService: DailyResetService,
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
    const userFilter = { $or: [{ user: userObjectId }, { user: userId }] }
    const doneFilter = { $or: [{ status: 'done' }, { status: { $exists: false } }] }
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
      this.sessionModel.countDocuments(userFilter),
      this.sessionModel.countDocuments({ ...userFilter, createdAt: { $gte: weekStart } } as any),
      this.mealModel.countDocuments({ ...userFilter, ...doneFilter }),
      this.mealModel.countDocuments({ ...userFilter, ...doneFilter, date: { $gte: todayStart } }),
      this.fastingModel.countDocuments({ ...userFilter, ...doneFilter }),
      this.fastingModel.countDocuments({ ...userFilter, ...doneFilter, startTime: { $gte: monthStart } }),
      this.meditationModel.countDocuments({ ...userFilter, ...doneFilter }),
      this.meditationModel.countDocuments({ ...userFilter, ...doneFilter, date: { $gte: weekStart } })
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
    const userFilter = { $or: [{ user: userObjectId }, { user: userId }] }
    // Get recent activities from different collections
    const [sessions, meals, fasting, meditation, sleep] = await Promise.all([
      this.sessionModel.find(userFilter).sort({ _id: -1 }).limit(2).lean(),
      this.mealModel.find(userFilter).sort({ date: -1 }).limit(2).lean(),
      this.fastingModel.find(userFilter).sort({ startTime: -1 }).limit(1).lean(),
      this.meditationModel.find(userFilter).sort({ date: -1 }).limit(1).lean(),
      this.sleepModel.find(userFilter).sort({ date: -1 }).limit(1).lean()
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
    const userFilter = { $or: [{ user: userObjectId }, { user: userId }] }
    const doneFilter = { $or: [{ status: 'done' }, { status: { $exists: false } }] }
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
      this.sessionModel.countDocuments(userFilter),
      this.sessionModel.countDocuments({ $and: [
        userFilter,
        { $or: [{ status: 'completed' }, { completed: true }] }
      ] } as any),
      this.sessionModel
        .find({ ...userFilter, createdAt: { $gte: weekStart } } as any)
        .sort({ createdAt: -1 })
        .limit(5)
        .select(['notes', 'status', 'date', 'createdAt'])
        .lean(),
      this.mealModel.countDocuments({ ...userFilter, ...doneFilter }),
      this.fastingModel.countDocuments({ ...userFilter, ...doneFilter }),
      this.meditationModel.countDocuments({ ...userFilter, ...doneFilter }),
      this.sleepModel.find({ ...userFilter, date: { $gte: monthStart } } as any).select(['durationHours', 'date']).lean(),
      this.habitModel.countDocuments(userFilter),
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

  async updateWellnessStatus(userId: string, dto: UpdateWellnessStatusDto) {
    const userObjectId = new Types.ObjectId(userId)
    const userFilter = { $or: [{ user: userObjectId }, { user: userId }] }
    const modelMap: Record<UpdateWellnessStatusDto['type'], Model<any>> = {
      meal: this.mealModel,
      meditation: this.meditationModel,
      breathwork: this.breathworkModel,
      sleep: this.sleepModel,
      fasting: this.fastingModel,
    }

    const realModel = modelMap[dto.type]
    if (!realModel) throw new BadRequestException('Unsupported type')

    const updated = await realModel.findOneAndUpdate(
      { _id: dto.id, ...userFilter },
      { status: dto.status },
      { new: true }
    )

    if (!updated) throw new NotFoundException('Record not found')

    return { message: 'Status updated', item: updated }
  }

  async getDailyStats(userId: string, dateStr?: string): Promise<DailyStatsResponseDto> {
    const userObjectId = new Types.ObjectId(userId)
    const userFilter = { $or: [{ user: userObjectId }, { user: userId }] }

    // Use DailyResetService for consistent date handling
    const targetDate = dateStr ? new Date(dateStr) : new Date()
    const { start: dayStart, end: dayEnd } = this.dailyResetService.getTodayDateRange()
    
    // If a specific date was requested, calculate its range
    let queryStart = dayStart
    let queryEnd = dayEnd
    
    if (dateStr) {
      queryStart = new Date(Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate(),
        0, 0, 0, 0
      ))
      
      queryEnd = new Date(Date.UTC(
        targetDate.getUTCFullYear(),
        targetDate.getUTCMonth(),
        targetDate.getUTCDate() + 1,
        0, 0, 0, 0
      ))
    }

    // Format date string for comparison (YYYY-MM-DD)
    const dateString = this.dailyResetService.formatDateToString(queryStart)

    // Define targets for each category
    const targets = {
      sleep: 8, // 8 hours
      workout: 1, // 1 session
      nutrition: 3, // 3 meals
      meditation: 1, // 1 session (30 mins)
      breathwork: 1, // 1 session
      habits: 0, // Will be calculated based on active habits
    }

    // Get data for today in parallel
    const [
      sleepData,
      workoutSessions,
      nutritionCount,
      meditationCount,
      breathworkCount,
      activeHabits,
      completedHabits,
    ] = await Promise.all([
      // Sleep: Only get sleep if status is 'done'
      this.sleepModel.findOne({
        ...userFilter,
        date: { $gte: queryStart, $lt: queryEnd },
        status: 'done'  // Only count completed sleep
      } as any)
        .select('durationHours status')
        .sort({ createdAt: -1 })
        .lean(),

      // Workout: Count sessions by sessionDate (not createdAt)
      this.sessionModel.countDocuments({
        ...userFilter,
        sessionDate: { $gte: queryStart, $lt: queryEnd },
        completed: true
      } as any),

      // Nutrition: Count done meals for today
      this.mealModel.countDocuments({
        ...userFilter,
        date: { $gte: queryStart, $lt: queryEnd },
        status: 'done'
      } as any),

      // Meditation: Count done meditation sessions for today
      this.meditationModel.countDocuments({
        ...userFilter,
        date: { $gte: queryStart, $lt: queryEnd },
        status: 'done'
      } as any),

      // Breathwork: Count done breathwork sessions for today
      this.breathworkModel.countDocuments({
        ...userFilter,
        date: { $gte: queryStart, $lt: queryEnd },
        status: 'done'
      } as any),

      // Get active habits count
      this.habitModel.countDocuments({ 
        ...userFilter,
        active: true 
      } as any),

      // Get habit logs for today (completed habits)
      this.habitLogModel.countDocuments({
        ...userFilter,
        date: dateString
      } as any),
    ])

    // Calculate completed values
    const sleepCompleted = sleepData?.durationHours || 0
    const workoutCompleted = workoutSessions
    const nutritionCompleted = nutritionCount
    const meditationCompleted = meditationCount
    const breathworkCompleted = breathworkCount

    // Update habits target
    targets.habits = activeHabits > 0 ? activeHabits : 0

    // Build category stats
    const categories: CategoryStats[] = [
      {
        category: 'Sleep',
        completed: sleepCompleted,
        target: targets.sleep,
        percentage: Math.min(Math.round((sleepCompleted / targets.sleep) * 100), 100),
        remaining: Math.max(targets.sleep - sleepCompleted, 0),
      },
      {
        category: 'Workout',
        completed: workoutCompleted,
        target: targets.workout,
        percentage: Math.min(Math.round((workoutCompleted / targets.workout) * 100), 100),
        remaining: Math.max(targets.workout - workoutCompleted, 0),
      },
      {
        category: 'Nutrition',
        completed: nutritionCompleted,
        target: targets.nutrition,
        percentage: Math.min(Math.round((nutritionCompleted / targets.nutrition) * 100), 100),
        remaining: Math.max(targets.nutrition - nutritionCompleted, 0),
      },
      {
        category: 'Meditation',
        completed: meditationCompleted,
        target: targets.meditation,
        percentage: Math.min(Math.round((meditationCompleted / targets.meditation) * 100), 100),
        remaining: Math.max(targets.meditation - meditationCompleted, 0),
      },
      {
        category: 'Breathwork',
        completed: breathworkCompleted,
        target: targets.breathwork,
        percentage: Math.min(Math.round((breathworkCompleted / targets.breathwork) * 100), 100),
        remaining: Math.max(targets.breathwork - breathworkCompleted, 0),
      },
    ]

    // Add habits only if there are active habits
    if (activeHabits > 0) {
      categories.push({
        category: 'Habits',
        completed: completedHabits,
        target: targets.habits,
        percentage: Math.min(Math.round((completedHabits / targets.habits) * 100), 100),
        remaining: Math.max(targets.habits - completedHabits, 0),
      })
    }

    // Calculate overall completion
    const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0)
    const overallCompletion = Math.round(totalPercentage / categories.length)

    // Calculate summary
    const totalActivities = categories.length
    const completedActivities = categories.filter(cat => cat.percentage === 100).length
    const pendingActivities = totalActivities - completedActivities

    return {
      date: dateString,
      overallCompletion,
      categories,
      summary: {
        totalActivities,
        completedActivities,
        pendingActivities,
      },
    }
  }
}
