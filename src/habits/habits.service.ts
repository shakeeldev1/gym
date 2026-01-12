import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Habit, HabitDocument } from './schemas/habit.schema';
import { Model, Types } from 'mongoose';
import { CreateHabitDto } from './dto/create-habit.dto';
import { LogHabitDto } from './dto/log-habit.dto';
import { HabitLog, HabitLogDocument } from './schemas/habit-log.schema';
import { HabitCalendarEntry } from './types';
import { DailyResetService } from 'src/common/services/daily-reset.service';
import { HabitSuggestion, HabitSuggestionDocument } from './schemas/habit-suggestion.schema';

@Injectable()
export class HabitsService {
    constructor(
        @InjectModel(Habit.name) private habitModel: Model<HabitDocument>,
        @InjectModel(HabitLog.name) private habitLogModel: Model<HabitLogDocument>,
        @InjectModel(HabitSuggestion.name) private habitSuggestionModel: Model<HabitSuggestionDocument>,
        private dailyResetService: DailyResetService
    ) { }

    async createHabit(userId: string, dto: CreateHabitDto): Promise<Habit> {
        const newHabit = await this.habitModel.create({
            ...dto,
            user: userId,
        });
        return newHabit;
    }

    async getAllHabits(userId: string): Promise<{ habits: Habit[], total: number }> {
        // Handle both string and ObjectId formats
        const userObjectId = new Types.ObjectId(userId);
        const habits = await this.habitModel.find({ 
            $or: [
                { user: userObjectId },
                { user: userId }
            ]
        });
        const total = await this.habitModel.countDocuments({ 
            $or: [
                { user: userObjectId },
                { user: userId }
            ]
        });
        if (!habits) {
            return { total: 0, habits: [] };
        }
        return { total, habits };
    }

    /**
     * Get today's habits with their completion status
     * This ensures tasks are shown fresh each day
     * Includes habits from all sources: user-created, admin-assigned, and AI-suggested (approved)
     */
    async getTodayHabits(userId: string): Promise<{ habits: any[], total: number, date: string, suggestedCount: number }> {
        const today = this.dailyResetService.formatDateToString(new Date());
        const { start: startDate, end: endDate } = this.dailyResetService.getTodayDateRange();
        
        // Convert userId to ObjectId if it's a string
        const userObjectId = new Types.ObjectId(userId);
        
        // Get all active habits for the user
        const habits = await this.habitModel.find({ 
            $or: [
                { user: userObjectId },
                { user: userId }
            ],
            active: true  // Only show active habits
        });
        
        // Track how many are from AI suggestions
        let suggestedCount = 0;
        
        const habitsWithStatus = await Promise.all(habits.map(async (habit) => {
            // Query HabitLog with proper date range (not string comparison)
            const log = await this.habitLogModel.findOne({
                $or: [
                    { user: userObjectId },
                    { user: userId }
                ],
                habit: habit._id,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            });
            
            // Determine completion based on log value
            let completed = false;
            if (log) {
                if (typeof log.value === 'boolean') {
                    completed = log.value;
                } else if (typeof log.value === 'number') {
                    completed = log.value > 0;
                }
            }
            
            // Check if this habit came from AI suggestion
            const suggestion = await this.habitSuggestionModel.findOne({
                name: habit.name,
                userId: userObjectId,
                status: 'approved',
                aiGenerated: true
            });
            
            if (suggestion) {
                suggestedCount++;
            }
            
            return {
                ...habit.toObject(),
                completed,
                logged: !!log,
                value: log?.value || null,
                source: suggestion ? 'ai-suggested' : 'user-created',  // Show habit source
            };
        }));

        return {
            habits: habitsWithStatus,
            total: habits.length,
            date: today,
            suggestedCount  // Count of AI-suggested habits
        };
    }

    async logHabit(userId: string, dto: LogHabitDto): Promise<Habit> {
        return this.habitLogModel.findOneAndUpdate(
            { user: userId, habit: dto.habitId, date: dto.date },
            { value: dto.value },
            { upsert: true, new: true }
        );
    }

    async getDailySummary(userId: string, date: string): Promise<{ habit: Habit, log: HabitLog | null }[]> {
        const userObjectId = new Types.ObjectId(userId);
        const habits = await this.habitModel.find({ 
            $or: [
                { user: userObjectId },
                { user: userId }
            ]
        });
        const summary = await Promise.all(habits.map(async (habit) => {
            const log = await this.habitLogModel.findOne({ 
                $or: [
                    { user: userObjectId },
                    { user: userId }
                ],
                habit: habit._id, 
                date 
            });
            return { habit, log };
        }));
        return summary;
    }

    async getHabitStreak(userId: string, habitId: string) {
        const userObjectId = new Types.ObjectId(userId);
        const user = { $or: [{ user: userObjectId }, { user: userId }] };
        const habit = habitId;

        const logs = await this.habitLogModel
            .find({
                ...user,
                habit,
                $or: [
                    { completed: true },
                    { value: { $gt: 0 } }
                ]
            })
            .sort({ date: -1 })
            .lean()
            .exec();

        if (logs.length === 0) {
            return {
                habitId,
                currentStreak: 0,
                longestStreak: 0,
                lastCompletedDate: null,
                missedToday: true,
            };
        }

        let currentStreak = 0;
        let longestStreak = 0;
        let streak = 0;

        let previousDate: Date | null = null;

        for (const log of logs) {
            const currentDate = new Date(log.date);
            currentDate.setHours(0, 0, 0, 0);

            if (!previousDate) {
                streak = 1;
            } else {
                const diff =
                    (previousDate.getTime() - currentDate.getTime()) /
                    (1000 * 60 * 60 * 24);

                if (diff === 1) {
                    streak++;
                } else {
                    longestStreak = Math.max(longestStreak, streak);
                    streak = 1;
                }
            }

            previousDate = currentDate;
        }

        longestStreak = Math.max(longestStreak, streak);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastDate = new Date(logs[0].date);
        lastDate.setHours(0, 0, 0, 0);

        const diffFromToday =
            (today.getTime() - lastDate.getTime()) /
            (1000 * 60 * 60 * 24);

        currentStreak = diffFromToday <= 1 ? streak : 0;

        return {
            habitId,
            currentStreak,
            longestStreak,
            lastCompletedDate: lastDate,
            missedToday: diffFromToday > 0,
        };
    }


    async getHabitCalendar(
        userId: string,
        habitId: string,
        month: string // YYYY-MM
    ) {
        const userObjectId = new Types.ObjectId(userId);
        const user = { $or: [{ user: userObjectId }, { user: userId }] };
        const habit = habitId;

        const startDate = new Date(`${month}-01`);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);

        const logs = await this.habitLogModel
            .find({
                ...user,
                habit,
                date: { $gte: startDate, $lte: endDate },
                $or: [
                    { completed: true },
                    { value: { $gt: 0 } }
                ]
            })
            .lean()
            .exec();

        const completedDates = new Set(
            logs.map(log => {
                const d = new Date(log.date);
                d.setHours(0, 0, 0, 0);
                return d.toISOString().split('T')[0];
            })
        );

        // Fix: explicitly type calendar array
        const calendar: HabitCalendarEntry[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            const isoDate = current.toISOString().split('T')[0];

            calendar.push({
                date: isoDate,
                completed: completedDates.has(isoDate),
            });

            current.setDate(current.getDate() + 1);
        }

        return {
            habitId,
            month,
            calendar,
        };
    }

    // ==================== AI HABIT SUGGESTIONS ====================

    /**
     * Generate AI habit suggestions for a user based on their profile
     */
    async generateAIHabitSuggestions(userId: string): Promise<HabitSuggestion[]> {
        const userObjectId = new Types.ObjectId(userId);

        // Simple AI logic - in production, this would call an actual AI service
        const suggestions = [
            {
                userId: userObjectId,
                name: 'Drink 8 Glasses of Water',
                type: 'NUMERIC' as 'NUMERIC',
                targetValue: 8,
                unit: 'glasses',
                description: 'Stay hydrated throughout the day',
                reason: 'Proper hydration improves energy levels and cognitive function',
                category: 'health',
                aiGenerated: true,
                status: 'pending'
            },
            {
                userId: userObjectId,
                name: 'Morning Meditation',
                type: 'BOOLEAN' as 'BOOLEAN',
                description: '10 minutes of mindfulness meditation',
                reason: 'Meditation reduces stress and improves mental clarity',
                category: 'mindfulness',
                aiGenerated: true,
                status: 'pending'
            },
            {
                userId: userObjectId,
                name: 'Evening Stretch',
                type: 'BOOLEAN' as 'BOOLEAN',
                description: '15 minutes of stretching before bed',
                reason: 'Stretching improves flexibility and aids better sleep',
                category: 'fitness',
                aiGenerated: true,
                status: 'pending'
            }
        ];

        // Create suggestions in database
        const createdSuggestions = await this.habitSuggestionModel.insertMany(suggestions);
        return createdSuggestions;
    }

    /**
     * Admin creates manual habit suggestion for user
     */
    async createHabitSuggestion(
        adminId: string,
        userId: string,
        dto: CreateHabitDto & { reason?: string; category?: string }
    ): Promise<HabitSuggestion> {
        const userObjectId = new Types.ObjectId(userId);
        const adminObjectId = new Types.ObjectId(adminId);

        const suggestion = await this.habitSuggestionModel.create({
            userId: userObjectId,
            suggestedBy: adminObjectId,
            name: dto.name,
            type: dto.type,
            targetValue: dto.targetValue,
            unit: dto.unit,
            reason: dto.reason,
            category: dto.category,
            aiGenerated: false,
            status: 'pending'
        });

        return suggestion;
    }

    /**
     * Get all pending habit suggestions for admin review
     */
    async getPendingHabitSuggestions(): Promise<HabitSuggestion[]> {
        return this.habitSuggestionModel
            .find({ status: 'pending' })
            .populate('userId', 'fName lName email')
            .populate('suggestedBy', 'fName lName email')
            .sort({ createdAt: -1 })
            .exec();
    }

    // NOTE: Removed getUserHabitSuggestions - Users see all habits in /habits/today endpoint

    /**
     * Admin approves habit suggestion and creates actual habit
     */
    async approveHabitSuggestion(
        suggestionId: string,
        adminId: string
    ): Promise<{ suggestion: HabitSuggestion; habit: Habit }> {
        const adminObjectId = new Types.ObjectId(adminId);
        
        const suggestion = await this.habitSuggestionModel.findById(suggestionId);
        if (!suggestion) {
            throw new NotFoundException('Habit suggestion not found');
        }

        // Update suggestion status
        suggestion.status = 'approved';
        suggestion.approvedAt = new Date();
        suggestion.approvedBy = adminObjectId;
        await suggestion.save();

        // Create actual habit for the user
        const habit = await this.habitModel.create({
            user: suggestion.userId,
            name: suggestion.name,
            type: suggestion.type,
            targetValue: suggestion.targetValue,
            unit: suggestion.unit,
            active: true
        });

        return { suggestion, habit };
    }

    /**
     * Admin rejects habit suggestion
     */
    async rejectHabitSuggestion(
        suggestionId: string,
        adminId: string,
        reason?: string
    ): Promise<HabitSuggestion> {
        const adminObjectId = new Types.ObjectId(adminId);
        
        const suggestion = await this.habitSuggestionModel.findById(suggestionId);
        if (!suggestion) {
            throw new NotFoundException('Habit suggestion not found');
        }

        suggestion.status = 'rejected';
        suggestion.rejectedAt = new Date();
        suggestion.approvedBy = adminObjectId;
        suggestion.rejectionReason = reason;
        await suggestion.save();

        return suggestion;
    }


}