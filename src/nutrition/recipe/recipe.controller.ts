import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { udpateRecipeDto } from './dto/update-recipe.dto';

@Controller('nutrition/recipe')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) { }

    @UseGuards(AuthGuard)
    @Post('generate')
    async generateRecipe(@Body() dto: CreateRecipeDto, @Request() req) {
        const userId = req.user.id;
        dto.createdBy = userId;
        return this.recipeService.generateRecipe(dto);
    }

    @UseGuards(AuthGuard)
    @Get("all")
    async getAllRecipes() {
        return this.recipeService.getAllRecipes();
    }

    @UseGuards(AuthGuard)
    @Get("my")
    async myRecipe(@Request() req) {
        const userId = req.user.id;
        return this.recipeService.getRecipesByUser(userId);
    }

    @UseGuards(AuthGuard)
    @Get("get-by-id/:id")
    async getRecipeById(@Param('id') id: string) {
        return this.recipeService.getRecipeById(id);
    }

    @UseGuards(AuthGuard)
    @Patch('update/:id')
    async updateRecipe(@Param('id') id:string,@Body() dto:udpateRecipeDto){
        return this.recipeService.updateRecipe(id,dto);
    }

    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    async deleteRecipe(@Param('id') id: string) {
    return this.recipeService.deleteRecipe(id);
    }
}