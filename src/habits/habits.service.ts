import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Habit, HabitDocument } from './schemas/habit.schema';
import { Model, Types } from 'mongoose';
import { CreateHabitDto } from './dto/create-habit.dto';
import { LogHabitDto } from './dto/log-habit.dto';
import { HabitLog, HabitLogDocument } from './schemas/habit-log.schema';
import { HabitCalendarEntry } from './types';

@Injectable()
export class HabitsService {
    constructor(@InjectModel(Habit.name) private habitModel: Model<HabitDocument>, @InjectModel(HabitLog.name) private habitLogModel: Model<HabitLogDocument>) { }

    async createHabit(userId: string, dto: CreateHabitDto): Promise<Habit> {
        const newHabit = await this.habitModel.create({
            ...dto,
            user: userId,
        });
        return newHabit;
    }

    async getAllHabits(userId: string): Promise<{ habits: Habit[], total: number }> {
        const habits = await this.habitModel.find({ user: userId });
        const total = await this.habitModel.countDocuments({ user: userId });
        if (!habits) {
            return { total: 0, habits: [] };
        }
        return { total, habits };
    }

    async logHabit(userId: string, dto: LogHabitDto): Promise<Habit> {
        return this.habitLogModel.findOneAndUpdate(
            { user: userId, habit: dto.habitId, date: dto.date },
            { value: dto.value },
            { upsert: true, new: true }
        );
    }

    async getDailySummary(userId: string, date: string): Promise<{ habit: Habit, log: HabitLog | null }[]> {
        const habits = await this.habitModel.find({ user: userId });
        const summary = await Promise.all(habits.map(async (habit) => {
            const log = await this.habitLogModel.findOne({ user: userId, habit: habit._id, date });
            return { habit, log };
        }));
        return summary;
    }

    async getHabitStreak(userId: string, habitId: string) {
        const user = userId;
        const habit = habitId;

        const logs = await this.habitLogModel
            .find({
                user,
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
        const user = userId;
        const habit = habitId;

        const startDate = new Date(`${month}-01`);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);

        const logs = await this.habitLogModel
            .find({
                user,
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



}