import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SleepLog, SleepLogDocument } from './schemas/sleep-log.schema';
import { DailyResetService } from 'src/common/services/daily-reset.service';
import { CreateSleepLogDto } from './dto/create-sleep-log.dto';

@Injectable()
export class SleepService {
  constructor(
    @InjectModel(SleepLog.name) private sleepLogModel: Model<SleepLogDocument>,
    private dailyResetService: DailyResetService,
  ) {}

  /**
   * Create a new sleep log for a user
   */
  async createSleepLog(userId: string, dto: CreateSleepLogDto): Promise<SleepLog> {
    const newLog = await this.sleepLogModel.create({
      user: userId,
      ...dto,
    });
    return newLog;
  }

  /**
   * Get all sleep logs for a user
   */
  async getAllSleepLogs(userId: string): Promise<{ logs: SleepLog[]; total: number }> {
    // Handle both string and ObjectId formats
    let userQuery: any;
    try {
      const userObjectId = new Types.ObjectId(userId);
      userQuery = { $or: [{ user: userObjectId }, { user: userId }] };
    } catch {
      userQuery = { user: userId };
    }

    const logs = await this.sleepLogModel.find(userQuery).sort({ date: -1 });
    const total = await this.sleepLogModel.countDocuments(userQuery);
    return { logs, total };
  }

  /**
   * Get today's sleep logs (daily reset - shows only today's logs)
   * This ensures sleep tracking appears fresh each day
   */
  async getTodaySleepLogs(userId: string): Promise<{ logs: SleepLog[]; total: number; date: string }> {
    const today = this.dailyResetService.formatDateToString(new Date());
    const { start: startDate, end: endDate } = this.dailyResetService.getTodayDateRange();

    // Convert userId to ObjectId if it's a string (handle both formats)
    let userQuery: any;
    try {
      const userObjectId = new Types.ObjectId(userId);
      userQuery = { $or: [{ user: userObjectId }, { user: userId }] };
    } catch {
      userQuery = { user: userId };
    }

    const logs = await this.sleepLogModel.find({
      ...userQuery,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: -1 });

    const total = logs.length;

    return {
      logs,
      total,
      date: today,
    };
  }

  /**
   * Get sleep logs for a specific date
   */
  async getSleepLogsByDate(userId: string, date: string): Promise<SleepLog[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Handle both string and ObjectId formats
    let userQuery: any;
    try {
      const userObjectId = new Types.ObjectId(userId);
      userQuery = { $or: [{ user: userObjectId }, { user: userId }] };
    } catch {
      userQuery = { user: userId };
    }

    return this.sleepLogModel.find({
      ...userQuery,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }

  /**
   * Get sleep logs for a date range
   */
  async getSleepLogsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ logs: SleepLog[]; total: number }> {
    // Handle both string and ObjectId formats
    let userQuery: any;
    try {
      const userObjectId = new Types.ObjectId(userId);
      userQuery = { $or: [{ user: userObjectId }, { user: userId }] };
    } catch {
      userQuery = { user: userId };
    }

    const logs = await this.sleepLogModel.find({
      ...userQuery,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: -1 });

    return { logs, total: logs.length };
  }

  /**
   * Get average sleep metrics (e.g., for the last 7 days)
   */
  async getAverageSleepMetrics(userId: string, daysBack: number = 7): Promise<{
    averageHours: number;
    averageQuality: number;
    totalLogsCount: number;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);

    // Handle both string and ObjectId formats
    let userQuery: any;
    try {
      const userObjectId = new Types.ObjectId(userId);
      userQuery = { $or: [{ user: userObjectId }, { user: userId }] };
    } catch {
      userQuery = { user: userId };
    }

    const logs = await this.sleepLogModel.find({
      ...userQuery,
      date: { $gte: startDate },
    });

    if (logs.length === 0) {
      return {
        averageHours: 0,
        averageQuality: 0,
        totalLogsCount: 0,
      };
    }

    const totalHours = logs.reduce((sum, log) => sum + (log.durationHours || 0), 0);
    const totalQuality = logs.reduce((sum, log) => sum + (log.quality || 0), 0);

    return {
      averageHours: totalHours / logs.length,
      averageQuality: totalQuality / logs.length,
      totalLogsCount: logs.length,
    };
  }

  /**
   * Update a sleep log
   */
  async updateSleepLog(userId: string, logId: string, dto: Partial<CreateSleepLogDto>): Promise<SleepLog | null> {
    // Handle both string and ObjectId formats
    let userQuery: any;
    try {
      const userObjectId = new Types.ObjectId(userId);
      userQuery = { $or: [{ user: userObjectId }, { user: userId }] };
    } catch {
      userQuery = { user: userId };
    }

    return this.sleepLogModel.findOneAndUpdate(
      { _id: logId, ...userQuery },
      dto,
      { new: true },
    );
  }

  /**
   * Delete a sleep log
   */
  async deleteSleepLog(userId: string, logId: string): Promise<void> {
    // Handle both string and ObjectId formats
    let userQuery: any;
    try {
      const userObjectId = new Types.ObjectId(userId);
      userQuery = { $or: [{ user: userObjectId }, { user: userId }] };
    } catch {
      userQuery = { user: userId };
    }

    await this.sleepLogModel.deleteOne({ _id: logId, ...userQuery });
  }
}
