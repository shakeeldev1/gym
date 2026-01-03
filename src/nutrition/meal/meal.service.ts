import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meal } from './schemas/meal.schema';
import { Model, Types } from 'mongoose';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealService {
    constructor(@InjectModel(Meal.name) private mealModel: Model<Meal>) { }

    private validateItems(items: any[]) {
        items.forEach((item) => {
            if (!item.food && !item.recipe) {
                throw new BadRequestException(
                    'Each item must contain either food or recipe',
                );
            }
            if (item.food && item.recipe) {
                throw new BadRequestException(
                    'Item cannot contain both food and recipe',
                );
            }
        });
    }

    async createMeal(userId: string, dto: CreateMealDto): Promise<{ message: string, meal: Meal }> {
        this.validateItems(dto.items);
        const createdMeal = await this.mealModel.create({
            user: new Types.ObjectId(userId),
            date: new Date(dto.date),
            items: dto.items,
            mealType: dto.mealType,
        });
        return { message: "Meal created successfully", meal: createdMeal };
    }

    async getMealsByDate(userId: string, date: string): Promise<Meal[]> {
        const start = new Date(date);
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
        const userObjectId = new Types.ObjectId(userId);

        console.log('[getMealsByDate] userId:', userId, 'userObjectId:', userObjectId, 'date:', date, 'start:', start, 'end:', end);

        const meals = await this.mealModel.find({
            $or: [
                { user: userObjectId },
                { user: userId },
            ],
            date: { $gte: start, $lt: end },
        }).populate('items.food items.recipe').exec();

        console.log('[getMealsByDate] found meals:', meals.length);

        return meals;
    }

    async getMealById(id: string): Promise<Meal> {
        const meal = await this.mealModel.findById(id)
            .populate({
                path: 'items.food',
                model: 'Food',
            })
            .populate({
                path: 'items.recipe',
                model: 'Recipe',
            }).exec();
        if (!meal) {
            throw new NotFoundException('Meal not found');
        }
        return meal;
    }

    async updateMeal(id: string, dto: UpdateMealDto): Promise<Meal> {
        if (dto.items) {
            this.validateItems(dto.items);
        }
        const updatedMeal = await this.mealModel.findByIdAndUpdate(id, dto, { new: true })
            .populate({
                path: 'items.food',
                model: 'Food',
            })
            .populate({
                path: 'items.recipe',
                model: 'Recipe',
            }).exec();
        if (!updatedMeal) {
            throw new NotFoundException('Meal not found');
        }
        return updatedMeal;
    }

    async deleteMeal(id: string): Promise<{ message: string }> {
        const deletedMeal = await this.mealModel.findByIdAndDelete(id).exec();
        if (!deletedMeal) {
            throw new NotFoundException('Meal not found');
        }
        return { message: 'Meal deleted successfully' };
    }
}