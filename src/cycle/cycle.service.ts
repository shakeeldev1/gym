import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MenstrualCycle, MenstrualCycleDocument } from './schemas/menstrual-cycle.schema';
import { LogPeriodDto, LogSymptomsDto } from './dto/cycle.dto';

@Injectable()
export class CycleService {
  constructor(
    @InjectModel(MenstrualCycle.name)
    private cycleModel: Model<MenstrualCycleDocument>,
  ) {}

  async getCycleData(userId: string): Promise<any> {
    let cycle = await this.cycleModel.findOne({ userId });
    if (!cycle) {
      cycle = await this.cycleModel.create({ userId });
    }

    const now = new Date();
    const predictions = this.calculatePredictions(cycle, now);

    return {
      data: {
        lastPeriodStart: cycle.lastPeriodStart,
        lastPeriodEnd: cycle.lastPeriodEnd,
        cycleLength: cycle.cycleLength,
        periodLength: cycle.periodLength,
        currentPhase: predictions.currentPhase,
        nextPeriodPredicted: predictions.nextPeriod,
        ovulationPredicted: predictions.ovulation,
        periodLogs: cycle.periodLogs?.slice(-10) || [],
        symptomLogs: cycle.symptomLogs?.slice(-10) || [],
      },
    };
  }

  async logPeriod(userId: string, dto: LogPeriodDto): Promise<any> {
    let cycle = await this.cycleModel.findOne({ userId });
    if (!cycle) {
      cycle = await this.cycleModel.create({ userId });
    }

    const periodEntry = {
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      flow: dto.flow,
      notes: dto.notes,
    };

    cycle.periodLogs.push(periodEntry);
    cycle.lastPeriodStart = new Date(dto.startDate);
    if (dto.endDate) {
      cycle.lastPeriodEnd = new Date(dto.endDate);
    }

    await cycle.save();
    return { message: 'Period logged successfully' };
  }

  async logSymptoms(userId: string, dto: LogSymptomsDto): Promise<any> {
    let cycle = await this.cycleModel.findOne({ userId });
    if (!cycle) {
      cycle = await this.cycleModel.create({ userId });
    }

    cycle.symptomLogs.push({
      date: new Date(),
      symptoms: dto.symptoms,
      severity: dto.severity,
      notes: dto.notes,
    });

    await cycle.save();
    return { message: 'Symptoms logged successfully' };
  }

  async getInsights(userId: string): Promise<any> {
    const cycle = await this.cycleModel.findOne({ userId });
    if (!cycle || cycle.periodLogs.length < 2) {
      return {
        data: {
          averageCycleLength: cycle?.cycleLength || 28,
          averagePeriodLength: cycle?.periodLength || 5,
          cycleRegularity: 'Not enough data',
          totalCyclesTracked: cycle?.periodLogs?.length || 0,
          tips: [
            'Track at least 3 cycles for more accurate predictions',
            'Log symptoms daily for better insights',
            'Stay hydrated and maintain a balanced diet during your cycle',
          ],
        },
      };
    }

    // Calculate averages from logs
    const logs = cycle.periodLogs.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    const cycleLengths: number[] = [];
    for (let i = 1; i < logs.length; i++) {
      const diff = Math.round(
        (new Date(logs[i].startDate).getTime() - new Date(logs[i - 1].startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      if (diff > 15 && diff < 60) cycleLengths.push(diff);
    }

    const avgCycle =
      cycleLengths.length > 0
        ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
        : cycle.cycleLength;

    const variance =
      cycleLengths.length > 1
        ? Math.sqrt(
            cycleLengths.reduce((sum, l) => sum + (l - avgCycle) ** 2, 0) /
              cycleLengths.length,
          )
        : 0;

    return {
      data: {
        averageCycleLength: avgCycle,
        averagePeriodLength: cycle.periodLength,
        cycleRegularity: variance <= 3 ? 'Regular' : variance <= 7 ? 'Somewhat Irregular' : 'Irregular',
        totalCyclesTracked: logs.length,
        tips: [
          'Your cycle data shows improved tracking consistency',
          'Consider logging symptoms for better pattern recognition',
          'Exercise can help manage PMS symptoms',
        ],
      },
    };
  }

  async getPredictions(userId: string): Promise<any> {
    const cycle = await this.cycleModel.findOne({ userId });
    if (!cycle || !cycle.lastPeriodStart) {
      return {
        data: {
          message: 'Not enough data for predictions. Please log your period start date.',
        },
      };
    }

    const now = new Date();
    const predictions = this.calculatePredictions(cycle, now);

    return {
      data: {
        nextPeriod: predictions.nextPeriod,
        ovulation: predictions.ovulation,
        fertileWindow: predictions.fertileWindow,
        currentPhase: predictions.currentPhase,
        daysUntilNextPeriod: predictions.daysUntilNextPeriod,
      },
    };
  }

  private calculatePredictions(cycle: MenstrualCycle, now: Date) {
    const lastStart = cycle.lastPeriodStart ? new Date(cycle.lastPeriodStart) : null;
    if (!lastStart) {
      return {
        currentPhase: 'Unknown',
        nextPeriod: null,
        ovulation: null,
        fertileWindow: null,
        daysUntilNextPeriod: null,
      };
    }

    const cycleLen = cycle.cycleLength || 28;
    const periodLen = cycle.periodLength || 5;
    const daysSinceLastPeriod = Math.floor(
      (now.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    const dayInCycle = daysSinceLastPeriod % cycleLen;

    // Calculate phases
    let currentPhase: string;
    if (dayInCycle < periodLen) {
      currentPhase = 'Menstrual';
    } else if (dayInCycle < cycleLen / 2 - 2) {
      currentPhase = 'Follicular';
    } else if (dayInCycle < cycleLen / 2 + 2) {
      currentPhase = 'Ovulation';
    } else {
      currentPhase = 'Luteal';
    }

    const nextPeriod = new Date(lastStart);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLen * Math.ceil(daysSinceLastPeriod / cycleLen));
    if (nextPeriod <= now) {
      nextPeriod.setDate(nextPeriod.getDate() + cycleLen);
    }

    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    const daysUntilNextPeriod = Math.ceil(
      (nextPeriod.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      currentPhase,
      nextPeriod,
      ovulation: ovulationDate,
      fertileWindow: { start: fertileStart, end: fertileEnd },
      daysUntilNextPeriod,
    };
  }
}
