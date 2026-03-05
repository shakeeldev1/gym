import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto';
import { InjectModel } from '@nestjs/mongoose';
import { NutritionGoal } from './schemas/nutrition-goal.schema';
import { Model, Types } from 'mongoose';
import { UpdateNutritionGoalDto } from './dto/update-nutrition-goal.dto';
import { GoalType } from './enum/goal-type.enum';

export interface NutritionPlanSuggestion {
    userId: string;
    status: 'suggested';
    type: 'nutrition-plan';
    goal: string;
    overview: string;
    dailyCalories: number;
    proteinTargetGrams: number;
    carbsTargetGrams: number;
    fatsTargetGrams: number;
    mealsPerDay: number;
    meals: Array<{
        name: string;
        time: string;
        description: string;
        proteinGrams: number;
        calories: number;
        macros: { protein: number; carbs: number; fats: number };
    }>;
    supplementationTips: string[];
    hydration: string;
    foodPrep: string[];
    notes: string;
    createdAt: Date;
}

@Injectable()
export class NutritionGoalService {
    constructor(@InjectModel(NutritionGoal.name) private nutritionGoalModel: Model<NutritionGoal>) { }

    async createNutritionGoal(userId: string, dto: CreateNutritionGoalDto): Promise<{ message: string, NutritionGoal?: NutritionGoal }> {
        await this.nutritionGoalModel.updateMany(
            { user: new Types.ObjectId(userId), isActive: true },
            { isActive: false }
        );
        const newGoal = await this.nutritionGoalModel.create({
            user: new Types.ObjectId(userId),
            ...dto,
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            isActive: true
        });
        return { message: "Nutrition goal created successfully", NutritionGoal: newGoal };
    }

    async getActiveNutritionGoal(userId: any): Promise<NutritionGoal | null> {
        const userObjectId = new Types.ObjectId(userId?.toString?.() || userId);
        return this.nutritionGoalModel.findOne({
            $or: [
                { user: userObjectId },
                { user: userId?.toString?.() || userId },
            ],
            isActive: true,
        }).exec();
    }

    async updateNutritionGoal(goalId: string, dto: UpdateNutritionGoalDto) {
        const goal = await this.nutritionGoalModel.findByIdAndUpdate(goalId, dto, { new: true }).exec();
        if (!goal) throw new NotFoundException('Goal not found');
        return goal;
    }

    

    // Get AI-generated nutrition plan for user
    async getAINutritionPlan(userId: string): Promise<NutritionPlanSuggestion> {
        const userObjectId = new Types.ObjectId(userId.toString());

        const activeGoal = await this.nutritionGoalModel.findOne({
            $or: [
                { user: userObjectId },
                { user: userId },
            ],
            isActive: true,
        }).lean();

        const goalTypeValue = activeGoal?.goalType;

        // Base defaults
        let dailyCalories = activeGoal?.caloriesTarget ?? 2200;
        let proteinGrams = activeGoal?.proteinTarget ?? 150;
        let carbsGrams = activeGoal?.carbsTarget ?? 200;
        let fatsGrams = activeGoal?.fatsTarget ?? 73;
        let goalName = 'maintenance';
        let overview = 'Balanced nutrition for maintenance and health.';

        switch (goalTypeValue) {
            case GoalType.BULK:
                dailyCalories = activeGoal?.caloriesTarget ?? 2600;
                proteinGrams = activeGoal?.proteinTarget ?? 200;
                carbsGrams = activeGoal?.carbsTarget ?? 260;
                fatsGrams = activeGoal?.fatsTarget ?? 87;
                goalName = 'muscle-gain';
                overview = 'High protein, sufficient calories for muscle synthesis. Focus on compound lifts + adequate recovery.';
                break;
            case GoalType.CUT:
                dailyCalories = activeGoal?.caloriesTarget ?? 1800;
                proteinGrams = activeGoal?.proteinTarget ?? 160;
                carbsGrams = activeGoal?.carbsTarget ?? 150;
                fatsGrams = activeGoal?.fatsTarget ?? 60;
                goalName = 'weight-loss';
                overview = 'Caloric deficit with high protein to preserve muscle. Include regular strength training.';
                break;
            case GoalType.MAINTAIN:
                dailyCalories = activeGoal?.caloriesTarget ?? 2200;
                proteinGrams = activeGoal?.proteinTarget ?? 150;
                carbsGrams = activeGoal?.carbsTarget ?? 200;
                fatsGrams = activeGoal?.fatsTarget ?? 73;
                goalName = 'maintenance';
                overview = 'Balanced nutrition for maintenance and health.';
                break;
            case GoalType.CUSTOM:
                goalName = 'custom';
                overview = 'Custom nutrition targets based on your inputs.';
                break;
            default:
                break;
        }

        return {
            userId,
            status: 'suggested',
            type: 'nutrition-plan',
            goal: goalName,
            overview,
            dailyCalories,
            proteinTargetGrams: proteinGrams,
            carbsTargetGrams: carbsGrams,
            fatsTargetGrams: fatsGrams,
            mealsPerDay: 3,
            meals: [
                {
                    name: 'Breakfast',
                    time: '08:00',
                    description: 'Eggs (3) + oatmeal (50g) + berries + olive oil',
                    proteinGrams: 25,
                    calories: 450,
                    macros: { protein: 25, carbs: 50, fats: 15 },
                },
                {
                    name: 'Lunch',
                    time: '12:30',
                    description: 'Grilled chicken (150g) + brown rice (100g) + broccoli + avocado',
                    proteinGrams: 40,
                    calories: 550,
                    macros: { protein: 40, carbs: 60, fats: 18 },
                },
                {
                    name: 'Dinner',
                    time: '19:00',
                    description: 'Salmon (150g) + sweet potato (150g) + spinach salad + olive oil',
                    proteinGrams: 38,
                    calories: 600,
                    macros: { protein: 38, carbs: 55, fats: 22 },
                },
            ],
            supplementationTips: [
                'Multivitamin (daily)',
                'Omega-3 fatty acids (2-3g EPA/DHA daily)',
                'Vitamin D3 (2000-4000 IU daily)',
                'Creatine monohydrate (5g daily) - optional for muscle gain',
                'Protein powder (1-2 servings post-workout)',
            ],
            hydration: 'Minimum 3.5 liters per day (adjust for sweat/activity)',
            foodPrep: [
                'Batch cook proteins (chicken, fish) on Sunday',
                'Pre-cut vegetables for easy assembly',
                'Store meals in glass containers (3-4 days max)',
                'Keep frozen vegetables as backup',
            ],
            notes: 'Adjust calories +/- 200 based on weekly progress. Prioritize consistency over perfection.',
            createdAt: new Date(),
        };
    }

}