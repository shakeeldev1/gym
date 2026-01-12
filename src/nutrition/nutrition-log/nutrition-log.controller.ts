import { BadRequestException, Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { NutritionLogService } from './nutrition-log.service';
import { DailyLogDto } from './dto/daily-log.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProgressPeriod } from './dto/progress.dto';

@Controller('nutrition-log')
export class NutritionLogController {
    constructor(private readonly nutritionLogService: NutritionLogService){}

    @UseGuards(AuthGuard)
    @Get('daily')
    getDailyLog(@Request() req,@Query() query: DailyLogDto) {
        return this.nutritionLogService.getDailyLog(req.user.id, query.date);
    }

    @UseGuards(AuthGuard)
    @Get('today')
    getTodayLog(@Request() req) {
        const today = new Date().toISOString().split('T')[0];
        return this.nutritionLogService.getDailyLog(req.user.id, today);
    }

    @UseGuards(AuthGuard)
    @Get('progress')
    async getProgress(@Request() req,@Query('period') period:ProgressPeriod) {
        if(!period || !['daily', 'weekly', 'monthly'].includes(period)) {
            throw new BadRequestException('Invalid period. Must be one of: daily, weekly, monthly');
        }
        return this.nutritionLogService.getProgress(req.user.id, period);
    }
}
