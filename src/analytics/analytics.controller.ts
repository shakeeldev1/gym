import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
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
}
