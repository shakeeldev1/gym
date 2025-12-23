import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Habit } from './schemas/habit.schema';
import { Model } from 'mongoose';
import { CreateHabitDto } from './dto/create-habit.dto';

@Injectable()
export class HabitsService {
    constructor(@InjectModel(Habit.name) private habitModel: Model<Habit>) { }

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


}
