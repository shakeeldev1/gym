import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe } from './schemas/recipe.schema';
import { Model } from 'mongoose';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { udpateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipeService {
    constructor(@InjectModel(Recipe.name) private recipeModel: Model<Recipe>) { }

    async generateRecipe(dto: CreateRecipeDto): Promise<{ message: string, recipe: Recipe }> {
        const newRecipe = await this.recipeModel.create(dto);
        return { message: 'Recipe generated successfully', recipe: newRecipe };
    }

    async getAllRecipes(): Promise<{ message: string, totalRecipes: number, recipes: Recipe[] }> {
        const recipes = await this.recipeModel.find({isPublic:true}).populate('ingredients.food').exec();
        const totalRecipes = await this.recipeModel.countDocuments({isPublic:true}).exec();
        if (!recipes) {
            throw new NotFoundException('No recipes found');
        }
        return { message: 'Recipes retrieved successfully', totalRecipes, recipes };
    }

    async getRecipesByUser(userId: string): Promise<{ message: string, totalRecipes: number, recipes: Recipe[] }> {
        const recipes = await this.recipeModel.find({ createdBy: userId }).populate('ingredients.food').exec();
        const totalRecipes = await this.recipeModel.countDocuments({ createdBy: userId }).exec();
        if (!recipes) {
            throw new NotFoundException('No recipes found for this user');
        }
        return { message: 'User recipes retrieved successfully', totalRecipes, recipes };
    }

    async getRecipeById(id: string): Promise<{ message: string, recipe?: Recipe }> {
        const recipe = await this.recipeModel.findById(id).populate('ingredients.food').exec();
        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }
        return { message: 'Recipe retrieved successfully', recipe };
    }

    async updateRecipe(id: string, dto: udpateRecipeDto): Promise<{ message: string, recipe?: Recipe }> {
        const updatedRecipe = await this.recipeModel.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!updatedRecipe) {
            throw new NotFoundException('Recipe not found');
        }
        return { message: 'Recipe updated successfully', recipe: updatedRecipe };
    }

    async deleteRecipe(id: string): Promise<{ message: string }> {
        const deletedRecipe = await this.recipeModel.findByIdAndDelete(id).exec();
        if (!deletedRecipe) {
            throw new NotFoundException('Recipe not found');
        }
        return { message: 'Recipe deleted successfully' };
    }
}