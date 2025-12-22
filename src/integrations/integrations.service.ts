import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserIntegration, UserIntegrationDocument } from './schemas/user-integration.schema';
import { Habit, HabitDocument } from './schemas/habit.schema';
import { TaskAutomation, TaskAutomationDocument } from './schemas/task-automation.schema';

@Injectable()
export class IntegrationsService {
    constructor(
        @InjectModel(UserIntegration.name) private integrationModel: Model<UserIntegrationDocument>,
        @InjectModel(Habit.name) private habitModel: Model<HabitDocument>,
        @InjectModel(TaskAutomation.name) private taskModel: Model<TaskAutomationDocument>
    ) {}

    // ---------- USER INTEGRATION ----------
    async addIntegration(userId: string, type: string, externalId?: string, accessToken?: string, refreshToken?: string) {
        const integration = await this.integrationModel.create({
            user: new Types.ObjectId(userId),
            type,
            externalId,
            accessToken,
            refreshToken,
            isActive: true,
        });
        return integration;
    }

    async getUserIntegrations(userId: string) {
        return this.integrationModel.find({ user: new Types.ObjectId(userId), isActive: true }).lean();
    }

    async deactivateIntegration(integrationId: string) {
        return this.integrationModel.findByIdAndUpdate(integrationId, { isActive: false }, { new: true });
    }

    // ---------- HABIT ----------
    async addHabit(userId: string, name: string) {
        const habit = await this.habitModel.create({ user: new Types.ObjectId(userId), name });
        return habit;
    }

    async getUserHabits(userId: string) {
        return this.habitModel.find({ user: new Types.ObjectId(userId), isActive: true }).lean();
    }

    async updateHabit(habitId: string, data: Partial<Habit>) {
        return this.habitModel.findByIdAndUpdate(habitId, data, { new: true });
    }

    // ---------- TASK AUTOMATION ----------
    async addTask(userId: string, title: string, description?: string, dueDate?: Date, type?: string) {
        const task = await this.taskModel.create({
            user: new Types.ObjectId(userId),
            title,
            description,
            dueDate,
            type,
            isActive: true,
            completed: false,
        });
        return task;
    }

    async getUserTasks(userId: string) {
        return this.taskModel.find({ user: new Types.ObjectId(userId), isActive: true }).lean();
    }

    async updateTask(taskId: string, data: Partial<TaskAutomation>) {
        return this.taskModel.findByIdAndUpdate(taskId, data, { new: true });
    }
}
