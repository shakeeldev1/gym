import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Fasting, FastingDocument } from './schemas/fasting.schema';
import { Model, Types } from 'mongoose';
import { CreateFastingDto } from './dto/create-fasting.dto';
import { EndFastingDto } from './dto/end-fasting.dto';

@Injectable()
export class FastingService {
    constructor(@InjectModel(Fasting.name) private fastingModel: Model<FastingDocument>) { }

    async startFasting(userId: string, dto: CreateFastingDto) {
        await this.fastingModel.updateMany(
            { user: new Types.ObjectId(userId), isActive: true },
            { isActive: false }
        );

        const newFast = await this.fastingModel.create({
            user: new Types.ObjectId(userId),
            startTime: new Date(),
            goalDurationHours: dto.goalDurationHours,
            goalHours: dto.goalHours,
            notes: dto.notes,
            isActive: true
        });

        return newFast;
    }

    async endFasting(userId: string, dto: EndFastingDto) {
        const activeFast = await this.fastingModel.findOne({
            user: new Types.ObjectId(userId),
            isActive: true
        });

        if (!activeFast) throw new Error('No active fast found');

        const endTime = new Date();
        const durationHours = (endTime.getTime() - activeFast.startTime.getTime()) / 1000 / 3600;

        activeFast.endTime = endTime;
        activeFast.actualDurationHours = Number(durationHours.toFixed(2));
        activeFast.isActive = false;
        if (dto.notes) activeFast.notes = dto.notes;

        await activeFast.save();
        return activeFast;
    }

    async getActiveFasting(userId: string) {
        return this.fastingModel.findOne({
            user: new Types.ObjectId(userId),
            isActive: true
        });
    }

    async getFastingHistory(userId: string) {
        return this.fastingModel.find({ user: new Types.ObjectId(userId) }).sort({ startTime: -1 });
    }

    async getProgress(userId: string) {
        const userObjectId = new Types.ObjectId(userId);
        const fasts = await this.fastingModel.find({ user: userObjectId }).sort({ startTime: 1 }).lean();

        let currentStreak = 0;
        let longestStreak = 0;
        let prevDate: Date | null = null;
        let totalHours = 0;

        const dailyMap: Record<string, { hours: number; goalHours?: number }> = {};

        // Inside getProgress()
        for (const fast of fasts) {
            if (!fast.startTime || !fast.endTime) continue; // skip invalid entries

            const startDay = fast.startTime.toISOString().split("T")[0];
            const duration = (fast.endTime.getTime() - fast.startTime.getTime()) / 1000 / 3600;
            totalHours += duration;

            // Daily map
            if (!dailyMap[startDay]) {
                dailyMap[startDay] = { hours: duration, goalHours: fast.goalHours };
            } else {
                dailyMap[startDay].hours += duration;
            }

            // Streak logic
            const currentDate = new Date(startDay);
            if (prevDate) {
                const diffDays = (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
                if (diffDays === 1) {
                    currentStreak += 1;
                } else if (diffDays > 1) {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            if (currentStreak > longestStreak) longestStreak = currentStreak;
            prevDate = currentDate;
        }

        const fastDates = Object.keys(dailyMap);
        const averageDuration = fastDates.length ? totalHours / fastDates.length : 0;
        const weeklySummary: Record<string, { totalHours: number }> = {};
        const monthlySummary: Record<string, { totalHours: number }> = {};

        for (const dateStr of fastDates) {
            const date = new Date(dateStr);
            const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() + 6) / 7)}`;
            const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

            weeklySummary[week] = weeklySummary[week] || { totalHours: 0 };
            weeklySummary[week].totalHours += dailyMap[dateStr].hours;

            monthlySummary[month] = monthlySummary[month] || { totalHours: 0 };
            monthlySummary[month].totalHours += dailyMap[dateStr].hours;
        }

        return {
            currentStreak,
            longestStreak,
            averageDuration: parseFloat(averageDuration.toFixed(2)),
            daily: dailyMap,
            weekly: weeklySummary,
            monthly: monthlySummary,
        };
    }
}
