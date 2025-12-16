import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { NutritionLogService } from './nutrition-log.service';
import { DailyLogDto } from './dto/daily-log.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('nutrition-log')
export class NutritionLogController {
    constructor(private readonly nutritionLogService: NutritionLogService){}

    @UseGuards(AuthGuard)
    @Get('daily')
    getDailyLog(@Request() req,@Query() query: DailyLogDto) {
        return this.nutritionLogService.getDailyLog(req.user.id, query.date);
    }
}
