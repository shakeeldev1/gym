import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BodyMetrics, BodyMetricsDocument } from './schemas/body-metrics.schema';
import { CreateBodyMetricsDto, LogWeightDto } from './dto/body-metrics.dto';

@Injectable()
export class BodyMetricsService {
  constructor(
    @InjectModel(BodyMetrics.name)
    private bodyMetricsModel: Model<BodyMetricsDocument>,
  ) {}

  async getLatest(userId: string): Promise<BodyMetrics | null> {
    return this.bodyMetricsModel
      .findOne({ userId })
      .sort({ measurementDate: -1 })
      .exec();
  }

  async logWeight(userId: string, dto: LogWeightDto): Promise<BodyMetrics> {
    const date = dto.date ? new Date(dto.date) : new Date();

    // Try to find existing entry for this date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await this.bodyMetricsModel.findOne({
      userId,
      measurementDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      existing.weight = dto.weight;
      if (existing.height) {
        existing.bmi = this.calculateBmi(dto.weight, existing.height);
      }
      return existing.save();
    }

    // Get latest height for BMI calculation
    const latest = await this.getLatest(userId);
    const height = latest?.height;
    const bmi = height ? this.calculateBmi(dto.weight, height) : undefined;

    return this.bodyMetricsModel.create({
      userId,
      weight: dto.weight,
      height,
      bmi,
      measurementDate: date,
    });
  }

  async getWeightHistory(userId: string): Promise<BodyMetrics[]> {
    return this.bodyMetricsModel
      .find({ userId, weight: { $exists: true, $ne: null } })
      .sort({ measurementDate: -1 })
      .limit(90)
      .select('weight measurementDate bmi')
      .exec();
  }

  async update(userId: string, dto: CreateBodyMetricsDto): Promise<BodyMetrics> {
    const data: any = { ...dto };
    if (dto.measurementDate) {
      data.measurementDate = new Date(dto.measurementDate);
    }
    if (dto.weight && dto.height) {
      data.bmi = this.calculateBmi(dto.weight, dto.height);
    }

    const latest = await this.bodyMetricsModel
      .findOne({ userId })
      .sort({ measurementDate: -1 })
      .exec();

    if (latest) {
      Object.assign(latest, data);
      return latest.save();
    }

    return this.bodyMetricsModel.create({ userId, ...data });
  }

  private calculateBmi(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }
}
