import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiAdminOnly } from 'src/common/decorators/api-admin.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { PlansService } from './plans.service';

@ApiTags('Plans')
@ApiBearerAuth('JWT-auth')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @UseGuards(AuthGuard)
  @Get('running')
  @ApiOperation({ summary: 'Get running plans' })
  @ApiQuery({ name: 'goal', required: false })
  @ApiResponse({ status: 200, description: 'Running plans retrieved.' })
  async getRunningPlans(@Query('goal') goal?: string) {
    const plans = await this.plansService.getRunningPlans(goal);
    return { data: plans };
  }

  @UseGuards(AuthGuard)
  @Post('running/:id/start')
  @ApiOperation({ summary: 'Start a running plan' })
  @ApiResponse({ status: 201, description: 'Plan started.' })
  async startRunningPlan(@Request() req, @Param('id') id: string, @Body() body?: any) {
    return this.plansService.startRunningPlan(req.user.id, id, body);
  }

  @UseGuards(AuthGuard)
  @Get('running/:id/progress')
  @ApiOperation({ summary: 'Get running plan progress' })
  @ApiResponse({ status: 200, description: 'Progress retrieved.' })
  async getRunningPlanProgress(@Request() req, @Param('id') id: string) {
    const progress = await this.plansService.getPlanProgress(req.user.id, id);
    return { data: progress };
  }

  // ============== TRAINING PLANS ==============

  @UseGuards(AuthGuard)
  @Get('training')
  @ApiOperation({ summary: 'Get all training plans' })
  @ApiResponse({ status: 200, description: 'Training plans retrieved.' })
  async getTrainingPlans() {
    const plans = await this.plansService.getTrainingPlans();
    return { data: plans };
  }

  @UseGuards(AuthGuard)
  @Get('training/gym')
  @ApiOperation({ summary: 'Get gym training plans' })
  @ApiResponse({ status: 200, description: 'Gym plans retrieved.' })
  async getGymPlans() {
    const plans = await this.plansService.getGymPlans();
    return { data: plans };
  }

  @UseGuards(AuthGuard)
  @Get('training/home')
  @ApiOperation({ summary: 'Get home training plans' })
  @ApiResponse({ status: 200, description: 'Home plans retrieved.' })
  async getHomePlans() {
    const plans = await this.plansService.getHomePlans();
    return { data: plans };
  }

  @UseGuards(AuthGuard)
  @Post('training/:id/start')
  @ApiOperation({ summary: 'Start a training plan' })
  @ApiResponse({ status: 201, description: 'Training plan started.' })
  async startTrainingPlan(@Request() req, @Param('id') id: string, @Body() body?: any) {
    return this.plansService.startTrainingPlan(req.user.id, id, body);
  }

  @UseGuards(AuthGuard)
  @Post('seed')
  @ApiOperation({ summary: 'Seed default plans' })
  @ApiAdminOnly()
  @ApiResponse({ status: 201, description: 'Plans seeded.' })
  async seed() {
    return this.plansService.seedDefaultPlans();
  }
}
