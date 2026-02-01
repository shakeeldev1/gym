import {
  BadRequestException,
  Controller,
  Get,
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
import { NutritionLogService } from './nutrition-log.service';
import { DailyLogDto } from './dto/daily-log.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProgressPeriod } from './dto/progress.dto';

@ApiTags('Nutrition - Log')
@ApiBearerAuth('JWT-auth')
@Controller('nutrition-log')
export class NutritionLogController {
  constructor(private readonly nutritionLogService: NutritionLogService) {}

  @UseGuards(AuthGuard)
  @Get('daily')
  @ApiOperation({
    summary: 'Get daily log',
    description: 'Retrieve nutrition log for a specific date.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily log retrieved successfully.',
  })
  getDailyLog(@Request() req, @Query() query: DailyLogDto) {
    return this.nutritionLogService.getDailyLog(req.user.id, query.date);
  }

  @UseGuards(AuthGuard)
  @Get('today')
  @ApiOperation({
    summary: "Get today's log",
    description: 'Retrieve nutrition log for the current day.',
  })
  @ApiResponse({
    status: 200,
    description: "Today's log retrieved successfully.",
  })
  getTodayLog(@Request() req) {
    const today = new Date().toISOString().split('T')[0];
    return this.nutritionLogService.getDailyLog(req.user.id, today);
  }

  @UseGuards(AuthGuard)
  @Get('progress')
  @ApiOperation({
    summary: 'Get progress',
    description: 'Retrieve nutrition progress.',
  })
  @ApiQuery({
    name: 'period',
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
    description: 'Progress period',
  })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully.' })
  async getProgress(@Request() req, @Query('period') period: ProgressPeriod) {
    if (!period || !['daily', 'weekly', 'monthly'].includes(period)) {
      throw new BadRequestException(
        'Invalid period. Must be one of: daily, weekly, monthly',
      );
    }
    return this.nutritionLogService.getProgress(req.user.id, period);
  }
}
