import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Req() req: any) {
    return this.dashboardService.getSummary(req.user.sub);
  }

  @Get('goals/today')
  async getTodayGoals(@Req() req: any) {
    return this.dashboardService.getTodayGoals(req.user.sub);
  }

  @Get('upcoming')
  async getUpcomingActivities(@Req() req: any) {
    return this.dashboardService.getUpcomingActivities(req.user.sub);
  }
}
