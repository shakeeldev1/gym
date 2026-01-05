import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Meal } from '../nutrition/meal/schemas/meal.schema'
import { Meditation } from '../mindset-recovery/schemas/meditation.schema'
import { Breathwork } from '../mindset-recovery/schemas/breathwork.schema'
import { Sleep } from '../mindset-recovery/schemas/sleep.schema'
import { Fasting } from '../fasting/schemas/fasting.schema'

@Injectable()
export class WellnessCronService {
  private readonly logger = new Logger(WellnessCronService.name)

  constructor(
    @InjectModel(Meal.name) private readonly mealModel: Model<Meal>,
    @InjectModel(Meditation.name) private readonly meditationModel: Model<Meditation>,
    @InjectModel(Breathwork.name) private readonly breathworkModel: Model<Breathwork>,
    @InjectModel(Sleep.name) private readonly sleepModel: Model<Sleep>,
    @InjectModel(Fasting.name) private readonly fastingModel: Model<Fasting>,
  ) {}

  // Runs nightly to mark uncompleted planned items as missed, keeping streaks accurate.
  @Cron('0 59 23 * * *')
  async markPlannedAsMissed() {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [meals, meditations, breathworks, sleeps, fastings] = await Promise.all([
      this.mealModel.updateMany(
        { status: 'planned', date: { $lt: startOfToday } },
        { status: 'missed' },
      ),
      this.meditationModel.updateMany(
        { status: 'planned', date: { $lt: startOfToday } },
        { status: 'missed' },
      ),
      this.breathworkModel.updateMany(
        { status: 'planned', date: { $lt: startOfToday } },
        { status: 'missed' },
      ),
      this.sleepModel.updateMany(
        { status: 'planned', date: { $lt: startOfToday } },
        { status: 'missed' },
      ),
      this.fastingModel.updateMany(
        { status: 'planned', startTime: { $lt: startOfToday } },
        { status: 'missed' },
      ),
    ])

    this.logger.log(
      `Missed sweep complete: meals=${meals.modifiedCount}, meditations=${meditations.modifiedCount}, breathworks=${breathworks.modifiedCount}, sleeps=${sleeps.modifiedCount}, fastings=${fastings.modifiedCount}`,
    )
  }
}
