import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto';
import { InjectModel } from '@nestjs/mongoose';
import { NutritionGoal } from './schemas/nutrition-goal.schema';
import { Model, Types } from 'mongoose';
import { UpdateNutritionGoalDto } from './dto/update-nutrition-goal.dto';

@Injectable()
export class NutritionGoalService {
    constructor(@InjectModel(NutritionGoal.name) private nutritionGoalModel: Model<NutritionGoal>) { }

    async createNutritionGoal(userId: number, dto: CreateNutritionGoalDto): Promise<{ message: string, NutritionGoal?: NutritionGoal }> {
        await this.nutritionGoalModel.updateMany(
            { user: userId, isActive: true },
            { isActive: false }
        );
        const newGoal = await this.nutritionGoalModel.create({
            user: new Types.ObjectId(userId.toString()),
            ...dto,
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            isActive: true
        });
        return { message: "Nutrition goal created successfully", NutritionGoal: newGoal };
    }

    async getActiveNutritionGoal(userId: number): Promise<NutritionGoal | null> {
        return this.nutritionGoalModel.findOne({ user: new Types.ObjectId(userId.toString()), isActive: true }).exec();
    }

    async updateNutritionGoal(goalId: string, dto: UpdateNutritionGoalDto) {
        const goal = await this.nutritionGoalModel.findByIdAndUpdate(goalId, dto, { new: true }).exec();
        if (!goal) throw new NotFoundException('Goal not found');
        return goal;
    }

    

}