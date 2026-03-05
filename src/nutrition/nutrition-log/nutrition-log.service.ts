import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meal } from '../meal/schemas/meal.schema';
import { Model, Types } from 'mongoose';
import { PopulatedMeal } from './interfaces/populated-meal.interface';
import { NutritionGoal } from '../nutrition-goal/schemas/nutrition-goal.schema';
import { ProgressPeriod } from './dto/progress.dto';

@Injectable()
export class NutritionLogService {
    constructor(
        @InjectModel(Meal.name) private mealModel: Model<Meal>,
        @InjectModel(NutritionGoal.name) private nutritionGoalModel: Model<NutritionGoal>,
    ) { }


    async getDailyLog(userId: string, date: string) {
        const userObjectId = new Types.ObjectId(userId);

        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const meals = await this.mealModel
            .find({
                user: userObjectId,
                date: { $gte: start, $lte: end },
            })
            .populate('items.food', 'calories protein carbs fats')
            .populate('items.recipe', 'calories protein carbs fats')
            .lean<PopulatedMeal[]>()
            .exec();

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        for (const meal of meals) {
            for (const item of meal.items) {
                if (item.food) {
                    totalCalories += (item.food.calories || 0) * (item.quantity / 100);
                    totalProtein += (item.food.protein || 0) * (item.quantity / 100);
                    totalCarbs += (item.food.carbs || 0) * (item.quantity / 100);
                    totalFats += (item.food.fats || 0) * (item.quantity / 100);
                }

                if (item.recipe) {
                    totalCalories += (item.recipe.calories || 0) * item.quantity;
                    totalProtein += (item.recipe.protein || 0) * item.quantity;
                    totalCarbs += (item.recipe.carbs || 0) * item.quantity;
                    totalFats += (item.recipe.fats || 0) * item.quantity;
                }
            }
        }

        return {
            date,
            meals,
            totalMacros: {
                calories: Math.round(totalCalories),
                protein: Math.round(totalProtein),
                carbs: Math.round(totalCarbs),
                fats: Math.round(totalFats),
            },
        };
    }

    async getProgress(userId: string, period: ProgressPeriod) {
        const userObjectId = new Types.ObjectId(userId);

        // 1️⃣ Get active goal
        const goal = await this.nutritionGoalModel.findOne({
            user: userObjectId,
            isActive: true,
        }).lean();

        if (!goal) {
            return { message: 'No active nutrition goal found', progress: [] };
        }

        const startDate = goal.startDate;
        const endDate = goal.endDate || new Date();

        // 2️⃣ Fetch meals
        const meals = await this.mealModel
            .find({
                user: userObjectId,
                date: { $gte: startDate, $lte: endDate },
            })
            .populate('items.food', 'calories protein carbs fats')
            .populate('items.recipe', 'calories protein carbs fats')
            .lean<any[]>()
            .exec();

        const progressMap = new Map<string, any>();

        // 3️⃣ Aggregate
        for (const meal of meals) {
            const mealDate = new Date(meal.date);
            let key = '';

            if (period === 'daily') key = formatDate(mealDate);
            if (period === 'weekly') key = getWeekKey(mealDate);
            if (period === 'monthly') key = getMonthKey(mealDate);

            if (!progressMap.has(key)) {
                progressMap.set(key, {
                    totalCalories: 0,
                    totalProtein: 0,
                    totalCarbs: 0,
                    totalFats: 0,
                    targetCalories: goal.caloriesTarget,
                    targetProtein: goal.proteinTarget,
                    targetCarbs: goal.carbsTarget,
                    targetFats: goal.fatsTarget,
                });
            }

            const entry = progressMap.get(key);

            for (const item of meal.items) {
                if (item.food) {
                    entry.totalCalories += (item.food.calories || 0) * (item.quantity / 100);
                    entry.totalProtein += (item.food.protein || 0) * (item.quantity / 100);
                    entry.totalCarbs += (item.food.carbs || 0) * (item.quantity / 100);
                    entry.totalFats += (item.food.fats || 0) * (item.quantity / 100);
                }

                if (item.recipe) {
                    entry.totalCalories += (item.recipe.calories || 0) * item.quantity;
                    entry.totalProtein += (item.recipe.protein || 0) * item.quantity;
                    entry.totalCarbs += (item.recipe.carbs || 0) * item.quantity;
                    entry.totalFats += (item.recipe.fats || 0) * item.quantity;
                }
            }
        }
        const progress = Array.from(progressMap.entries()).map(([date, data]) => ({
            date,
            achieved: {
                calories: Math.round(data.totalCalories),
                protein: Math.round(data.totalProtein),
                carbs: Math.round(data.totalCarbs),
                fats: Math.round(data.totalFats),
            },
            target: {
                calories: data.targetCalories,
                protein: data.targetProtein,
                carbs: data.targetCarbs,
                fats: data.targetFats,
            },
            percentage: {
                calories: Math.round((data.totalCalories / data.targetCalories) * 100),
                protein: Math.round((data.totalProtein / data.targetProtein) * 100),
                carbs: Math.round((data.totalCarbs / data.targetCarbs) * 100),
                fats: Math.round((data.totalFats / data.targetFats) * 100),
            },
        }));

        return {
            period,
            progress,
        };
    }


}


function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function getWeekKey(date: Date): string {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays = Math.floor(
        (date.getTime() - firstDayOfYear.getTime()) / 86400000
    );
    const week = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${week}`;
}

function getMonthKey(date: Date): string {
    const month = date.getMonth() + 1;
    return `${date.getFullYear()}-${month.toString().padStart(2, '0')}`;
}
