import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Request, UseGuards } from '@nestjs/common';
import { MealService } from './meal.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateMealDto } from './dto/update-meal.dto';

@Controller('nutrition/meals')
export class MealController {
    constructor(private readonly mealService: MealService) { }

    @UseGuards(AuthGuard)
    @Post("create")
    async createMeal(@Request() req, @Body() dto: CreateMealDto) {
        const userId = req.user.id;
        return this.mealService.createMeal(userId, dto);
    }

    @UseGuards(AuthGuard)
    @Get("find-by-date")
    async getMealsByDate(@Request() req, @Query("date") date: string) {
        const userId = req.user.id;
        return this.mealService.getMealsByDate(userId, date);
    }

    @UseGuards(AuthGuard)
    @Get("today")
    async getTodayMeals(@Request() req) {
        const userId = req.user.id;
        return this.mealService.getTodayMeals(userId);
    }

    @UseGuards(AuthGuard)
    @Get("find-by-id/:id")
    async getMealById(@Param("id") id:string){
        return this.mealService.getMealById(id);
    }

    @UseGuards(AuthGuard)
    @Patch("update/:id")
    async updateMeal(@Param("id") id:string, @Body() dto:UpdateMealDto){
        return this.mealService.updateMeal(id,dto);
    }

    @Delete("delete/:id")
    async deleteMeal(@Param("id") id:string){
        return this.mealService.deleteMeal(id);
    }
}
