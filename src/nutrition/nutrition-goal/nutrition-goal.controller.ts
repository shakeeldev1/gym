import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import {
  NutritionGoalService,
  NutritionPlanSuggestion,
} from './nutrition-goal.service';
import { CreateNutritionGoalDto } from './dto/create-nutrition-goal.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateNutritionGoalDto } from './dto/update-nutrition-goal.dto';

@ApiTags('Nutrition - Goal')
@ApiBearerAuth('JWT-auth')
@Controller('nutrition-goal')
export class NutritionGoalController {
  constructor(private readonly nutritionGoalService: NutritionGoalService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create nutrition goal',
    description: 'Set a new nutrition goal for the user.',
  })
  @ApiResponse({
    status: 201,
    description: 'Nutrition goal created successfully.',
  })
  createNutritionGoal(@Request() req, @Body() dto: CreateNutritionGoalDto) {
    const userId = req.user.id;
    return this.nutritionGoalService.createNutritionGoal(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Get('active')
  @ApiOperation({
    summary: 'Get active goal',
    description: 'Retrieve the currently active nutrition goal.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active nutrition goal retrieved successfully.',
  })
  async getActiveNutritionGoal(@Request() req) {
    const userId = req.user.id;
    return this.nutritionGoalService.getActiveNutritionGoal(userId);
  }

  @UseGuards(AuthGuard)
  @Put('update/:id')
  @ApiOperation({
    summary: 'Update nutrition goal',
    description: 'Update a nutrition goal by ID.',
  })
  @ApiParam({ name: 'id', description: 'Nutrition Goal ID' })
  @ApiResponse({
    status: 200,
    description: 'Nutrition goal updated successfully.',
  })
  update(@Param('id') id: string, @Body() dto: UpdateNutritionGoalDto) {
    return this.nutritionGoalService.updateNutritionGoal(id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('my-nutrition-plan')
  @ApiOperation({
    summary: 'Get AI nutrition plan',
    description: 'Retrieve personalized AI-generated nutrition plan.',
  })
  @ApiResponse({
    status: 200,
    description: 'Nutrition plan retrieved successfully.',
  })
  async getMyNutritionPlan(@Request() req): Promise<NutritionPlanSuggestion> {
    const userId = req.user.id;
    return this.nutritionGoalService.getAINutritionPlan(userId);
  }
}
