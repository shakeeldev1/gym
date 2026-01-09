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

    // Get AI-generated fasting plan for user
    async getAIFastingPlan(userId: string): Promise<any> {
        const userObjectId = new Types.ObjectId(userId);

        // Get user fasting history to understand adherence
        const history = await this.fastingModel.find({ user: userObjectId }).sort({ startTime: -1 }).lean();

        const completedFasts = history.filter(f => f.actualDurationHours);
        const avgDuration = completedFasts.length
            ? completedFasts.reduce((sum, f) => sum + (f.actualDurationHours || 0), 0) / completedFasts.length
            : 0;

        // Generate AI recommendation based on history
        let recommendedWindow = '14:10'; // Default intermediate
        let dailySchedule = 'Eat 10:00 AM - 8:00 PM, Fast 8:00 PM - 10:00 AM';
        let guidance = '';

        if (avgDuration < 12) {
            // Beginner - shorter fasts
            recommendedWindow = '12:12';
            dailySchedule = 'Eat 8:00 AM - 8:00 PM, Fast 8:00 PM - 8:00 AM';
            guidance = 'Start with 12-hour overnight fasts. Stay hydrated during fasting window.';
        } else if (avgDuration >= 12 && avgDuration < 15) {
            // Intermediate
            recommendedWindow = '14:10';
            dailySchedule = 'Eat 10:00 AM - 8:00 PM, Fast 8:00 PM - 10:00 AM';
            guidance = 'Maintain 14-hour fasts for metabolic adaptation. Break fast with protein-rich meals.';
        } else {
            // Advanced
            recommendedWindow = '16:8';
            dailySchedule = 'Eat 12:00 PM - 8:00 PM, Fast 8:00 PM - 12:00 PM';
            guidance = 'Extended 16-hour fasts optimal for autophagy and fat adaptation. Ensure adequate electrolytes.';
        }

        return {
            userId,
            status: 'suggested',
            type: 'fasting-plan',
            recommendedWindow,
            dailySchedule,
            guidance,
            hydration: 'Water and electrolytes during fasting window; increase on intense workout days.',
            caution: 'Not medical advice. Avoid if pregnant, nursing, or with medical conditions. Consult physician if unsure.',
            meals: [
                {
                    name: 'Break-fast',
                    time: recommendedWindow.split(':')[0].padStart(2, '0') + ':00',
                    description: 'High protein + healthy fats. Examples: eggs + avocado, Greek yogurt + nuts',
                    proteinGrams: 30,
                },
                {
                    name: 'Lunch',
                    time: '13:00',
                    description: 'Balanced meal with lean protein, complex carbs, vegetables',
                    proteinGrams: 35,
                },
                {
                    name: 'Dinner',
                    time: '19:00',
                    description: 'Protein-forward meal; finish eating before fasting window',
                    proteinGrams: 35,
                },
            ],
            weeklySchedule: {
                monday: { window: recommendedWindow, notes: 'Standard fast day' },
                tuesday: { window: recommendedWindow, notes: 'Standard fast day' },
                wednesday: { window: recommendedWindow, notes: 'Standard fast day' },
                thursday: { window: recommendedWindow, notes: 'Standard fast day' },
                friday: { window: recommendedWindow, notes: 'Standard fast day' },
                saturday: { window: '12:12', notes: 'Shorter window for flexibility' },
                sunday: { window: '12:12', notes: 'Rest/recovery day with shorter window' },
            },
            completedFastsCount: completedFasts.length,
            averageDurationHours: parseFloat(avgDuration.toFixed(2)),
            progress: history.length,
            createdAt: new Date(),
        };
    }
}
