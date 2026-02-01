import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Param,
  Patch,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateWellnessStatusDto } from './dto/update-wellness-status.dto';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(AuthGuard)
  @Get('overview')
  @ApiOperation({
    summary: 'Get analytics overview',
    description: 'Retrieve high-level analytics overview for the user.',
  })
  @ApiResponse({ status: 200, description: 'Overview retrieved successfully.' })
  async getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getOverview({ startDate, endDate });
  }

  @UseGuards(AuthGuard)
  @Get('user-stats')
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Retrieve detailed statistics for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully.',
  })
  async getUserStats(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.analyticsService.getUserStats(userId);
  }

  @UseGuards(AuthGuard)
  @Get('user-activity')
  @ApiOperation({
    summary: 'Get user activity',
    description: 'Retrieve recent activity logs for the user.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of activities to retrieve (default: 5)',
  })
  @ApiResponse({
    status: 200,
    description: 'User activity retrieved successfully.',
  })
  async getUserActivity(@Req() req: any, @Query('limit') limit?: string) {
    const userId = req.user?.id || req.user?.sub;
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.analyticsService.getUserActivity(userId, limitNum);
  }

  @UseGuards(AuthGuard)
  @Get('athlete/:id')
  @ApiOperation({
    summary: 'Get athlete stats',
    description:
      'Retrieve statistics for a specific athlete (for coaches/admins).',
  })
  @ApiParam({ name: 'id', description: 'Athlete User ID' })
  @ApiResponse({
    status: 200,
    description: 'Athlete statistics retrieved successfully.',
  })
  async getAthleteStats(@Param('id') athleteId: string) {
    return this.analyticsService.getAthleteStats(athleteId);
  }

  @UseGuards(AuthGuard)
  @Patch('wellness/status')
  @ApiOperation({
    summary: 'Update wellness status',
    description: 'Update the wellness status for the user.',
  })
  @ApiBody({ type: UpdateWellnessStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Wellness status updated successfully.',
  })
  async updateWellnessStatus(
    @Req() req: any,
    @Body() dto: UpdateWellnessStatusDto,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.analyticsService.updateWellnessStatus(userId, dto);
  }

  @UseGuards(AuthGuard)
  @Get('daily-stats')
  @ApiOperation({
    summary: 'Get daily stats',
    description: 'Retrieve statistics for a specific day.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date for stats (ISO 8601 format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily statistics retrieved successfully.',
  })
  async getDailyStats(@Req() req: any, @Query('date') date?: string) {
    const userId = req.user?.id || req.user?.sub;
    return this.analyticsService.getDailyStats(userId, date);
  }
}
