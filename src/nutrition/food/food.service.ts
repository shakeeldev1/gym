import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Food } from './schemas/food.schema';
import { Model } from 'mongoose';
import { CreateFoodDto } from './dto/create-food.dto';
import { updateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodService {
    constructor(@InjectModel(Food.name) private foodModel: Model<Food>) { }

    async createFoodItem(dto: CreateFoodDto): Promise<{ message: string, newFoodItem: Food }> {
        const newFoodItem = await this.foodModel.create(dto);
        return { message: "Food item created successfully", newFoodItem };
    }

    async getAllFoodItems(): Promise<{ totalItems: number, allFoodItems: Food[] }> {
        const allFoodItems = await this.foodModel.find().exec();
        const totalItems = await this.foodModel.countDocuments().exec();
        return { totalItems, allFoodItems }
    }

    async getFoodItemById(id: string): Promise<Food> {
        const foodItem = await this.foodModel.findById(id).exec();
        if (!foodItem) {
            throw new NotFoundException('Food item not found');
        }
        return foodItem;
    }

    async findFoodItemByBarcode(barcode: string): Promise<{ message: string, foodItem: Food }> {
        const foodItem = await this.foodModel.findOne({ barcode }).exec();
        if (!foodItem) {
            throw new NotFoundException('Food item not found');
        }
        return { message: "Food item found", foodItem };
    }

    async updateFoodItem(id: string, dto: updateFoodDto): Promise<{ message: string, updateFoodItem: Food }> {
        const updateFoodItem = await this.foodModel.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!updateFoodItem) {
            throw new NotFoundException('Food item not found');
        }
        return { message: "Food item updated successfully", updateFoodItem };
    }

    async deleteFoodItem(id: string): Promise<{ message: string }> {
        const deleteFoodItem = await this.foodModel.findByIdAndDelete(id).exec();
        if (!deleteFoodItem) {
            throw new NotFoundException('Food item not found');
        }
        return { message: "Food item deleted successfully" };
    }
}
