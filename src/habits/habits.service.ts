import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Habit, HabitDocument } from './schemas/habit.schema';
import { Model } from 'mongoose';
import { CreateHabitDto } from './dto/create-habit.dto';
import { LogHabitDto } from './dto/log-habit.dto';
import { HabitLog, HabitLogDocument } from './schemas/habit-log.schema';

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

}
