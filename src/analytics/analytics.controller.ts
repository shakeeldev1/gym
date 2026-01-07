import { Controller, Get, Query, UseGuards, Req, Param, Patch, Body } from '@nestjs/common'
import { AnalyticsService } from "./analytics.service"
import { AuthGuard } from '../auth/auth.guard'
import { UpdateWellnessStatusDto } from './dto/update-wellness-status.dto'

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(AuthGuard)
  @Get('overview')
  async getOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getOverview({ startDate, endDate })
  }

  @UseGuards(AuthGuard)
  @Get('user-stats')
  async getUserStats(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub
    return this.analyticsService.getUserStats(userId)
  }

  @UseGuards(AuthGuard)
  @Get('user-activity')
  async getUserActivity(
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.id || req.user?.sub
    const limitNum = limit ? parseInt(limit, 10) : 5
    return this.analyticsService.getUserActivity(userId, limitNum)
  }

  @UseGuards(AuthGuard)
  @Get('athlete/:id')
  async getAthleteStats(@Param('id') athleteId: string) {
    return this.analyticsService.getAthleteStats(athleteId)
  }

  @UseGuards(AuthGuard)
  @Patch('wellness/status')
  async updateWellnessStatus(@Req() req: any, @Body() dto: UpdateWellnessStatusDto) {
    const userId = req.user?.id || req.user?.sub
    return this.analyticsService.updateWellnessStatus(userId, dto)
  }

  @UseGuards(AuthGuard)
  @Get('daily-stats')
  async getDailyStats(
    @Req() req: any,
    @Query('date') date?: string,
  ) {
    const userId = req.user?.id || req.user?.sub
    return this.analyticsService.getDailyStats(userId, date)
  }
}
