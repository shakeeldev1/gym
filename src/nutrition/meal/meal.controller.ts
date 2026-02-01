import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MealService } from './meal.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateMealDto } from './dto/update-meal.dto';

@ApiTags('Nutrition - Meal')
@ApiBearerAuth('JWT-auth')
@Controller('nutrition/meals')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create meal',
    description: 'Create a new meal log.',
  })
  @ApiResponse({ status: 201, description: 'Meal created successfully.' })
  async createMeal(@Request() req, @Body() dto: CreateMealDto) {
    const userId = req.user.id;
    return this.mealService.createMeal(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Get('find-by-date')
  @ApiOperation({
    summary: 'Get meals by date',
    description: 'Retrieve meals for a specific date.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format',
    example: '2024-01-28',
  })
  @ApiResponse({ status: 200, description: 'Meals retrieved successfully.' })
  async getMealsByDate(@Request() req, @Query('date') date: string) {
    const userId = req.user.id;
    return this.mealService.getMealsByDate(userId, date);
  }

  @UseGuards(AuthGuard)
  @Get('today')
  @ApiOperation({
    summary: "Get today's meals",
    description: 'Retrieve meals for the current day.',
  })
  @ApiResponse({
    status: 200,
    description: "Today's meals retrieved successfully.",
  })
  async getTodayMeals(@Request() req) {
    const userId = req.user.id;
    return this.mealService.getTodayMeals(userId);
  }

  @UseGuards(AuthGuard)
  @Get('find-by-id/:id')
  @ApiOperation({
    summary: 'Get meal by ID',
    description: 'Retrieve a meal by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Meal ID' })
  @ApiResponse({ status: 200, description: 'Meal retrieved successfully.' })
  async getMealById(@Param('id') id: string) {
    return this.mealService.getMealById(id);
  }

  @UseGuards(AuthGuard)
  @Patch('update/:id')
  @ApiOperation({ summary: 'Update meal', description: 'Update a meal by ID.' })
  @ApiParam({ name: 'id', description: 'Meal ID' })
  @ApiResponse({ status: 200, description: 'Meal updated successfully.' })
  async updateMeal(@Param('id') id: string, @Body() dto: UpdateMealDto) {
    return this.mealService.updateMeal(id, dto);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete meal', description: 'Delete a meal by ID.' })
  @ApiParam({ name: 'id', description: 'Meal ID' })
  @ApiResponse({ status: 200, description: 'Meal deleted successfully.' })
  async deleteMeal(@Param('id') id: string) {
    return this.mealService.deleteMeal(id);
  }
}
