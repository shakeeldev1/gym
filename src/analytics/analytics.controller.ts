import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common'
import { AnalyticsService } from "./analytics.service"
import { AuthGuard } from '../auth/auth.guard'

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
    const userId = req.user.sub
    return this.analyticsService.getUserStats(userId)
  }

  @UseGuards(AuthGuard)
  @Get('user-activity')
  async getUserActivity(
    @Req() req: any,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub
    const limitNum = limit ? parseInt(limit, 10) : 5
    return this.analyticsService.getUserActivity(userId, limitNum)
  }
}
