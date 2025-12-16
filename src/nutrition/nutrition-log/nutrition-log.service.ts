import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meal } from '../meal/schemas/meal.schema';
import { Model, Types } from 'mongoose';
import { PopulatedMeal } from './interfaces/populated-meal.interface';

@Injectable()
export class NutritionLogService {
    constructor(
        @InjectModel(Meal.name) private mealModel: Model<Meal>,
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
            .populate('items.food', 'calories protein carbs fat')
            .populate('items.recipe', 'calories protein carbs fat')
            .lean<PopulatedMeal[]>()
            .exec();

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        for (const meal of meals) {
            for (const item of meal.items) {
                if (item.food) {
                    totalCalories += item.food.calories * (item.quantity / 100);
                    totalProtein += item.food.protein * (item.quantity / 100);
                    totalCarbs += item.food.carbs * (item.quantity / 100);
                    totalFat += item.food.fat * (item.quantity / 100);
                }

                if (item.recipe) {
                    totalCalories += item.recipe.calories * item.quantity;
                    totalProtein += item.recipe.protein * item.quantity;
                    totalCarbs += item.recipe.carbs * item.quantity;
                    totalFat += item.recipe.fat * item.quantity;
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
                fat: Math.round(totalFat),
            },
        };
    }
}
