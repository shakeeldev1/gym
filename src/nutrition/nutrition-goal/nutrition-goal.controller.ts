import { Body, Controller, Get, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { NutritionGoalService } from './nutrition-goal.service';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateNutritionGoalDto } from './dto/update-nutrition-goal.dto';

@Controller('nutrition-goal')
export class NutritionGoalController {
    constructor(private readonly nutritionGoalService: NutritionGoalService) { }

    @UseGuards(AuthGuard)
    @Post("create")
    createNutritionGoal(@Request() req, @Body() dto: CreateNutritionGoalDto) {
        const userId = req.user.id;
        return this.nutritionGoalService.createNutritionGoal(userId, dto);
    }

    @UseGuards(AuthGuard)
    @Get("active")
    async getActiveNutritionGoal(@Request() req) {
        const userId = req.user.id;
        return this.nutritionGoalService.getActiveNutritionGoal(userId);
    }

    @UseGuards(AuthGuard)
    @Put('update/:id')
    update(@Param('id') id: string, @Body() dto: UpdateNutritionGoalDto) {
        return this.nutritionGoalService.updateNutritionGoal(id, dto);
    }

}
