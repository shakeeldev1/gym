import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
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
  async startRunningPlan(@Request() req, @Param('id') id: string) {
    return this.plansService.startRunningPlan(req.user.id, id);
  }

  @UseGuards(AuthGuard)
  @Get('running/:id/progress')
  @ApiOperation({ summary: 'Get running plan progress' })
  @ApiResponse({ status: 200, description: 'Progress retrieved.' })
  async getRunningPlanProgress(@Request() req, @Param('id') id: string) {
    const progress = await this.plansService.getPlanProgress(req.user.id, id);
    return { data: progress };
  }

  @UseGuards(AuthGuard)
  @Post('seed')
  @ApiOperation({ summary: 'Seed default plans' })
  @ApiResponse({ status: 201, description: 'Plans seeded.' })
  async seed() {
    return this.plansService.seedDefaultPlans();
  }
}
