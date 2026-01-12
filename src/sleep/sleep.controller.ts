import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { SleepService } from './sleep.service';
import { CreateSleepLogDto } from './dto/create-sleep-log.dto';

@Controller('sleep')
export class SleepController {
  constructor(private readonly sleepService: SleepService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createSleepLog(@Request() req, @Body() dto: CreateSleepLogDto) {
    return this.sleepService.createSleepLog(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('all')
  async getAllSleepLogs(@Request() req) {
    return this.sleepService.getAllSleepLogs(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('today/logs')
  async getTodaySleepLogs(@Request() req) {
    return this.sleepService.getTodaySleepLogs(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('date')
  async getSleepLogsByDate(@Request() req, @Query('date') date: string) {
    return this.sleepService.getSleepLogsByDate(req.user.id, date);
  }

  @UseGuards(AuthGuard)
  @Get('range')
  async getSleepLogsByDateRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.sleepService.getSleepLogsByDateRange(
      req.user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @UseGuards(AuthGuard)
  @Get('metrics/average')
  async getAverageSleepMetrics(@Request() req, @Query('days') days?: string) {
    const daysBack = days ? parseInt(days, 10) : 7;
    return this.sleepService.getAverageSleepMetrics(req.user.id, daysBack);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateSleepLog(
    @Request() req,
    @Param('id') logId: string,
    @Body() dto: Partial<CreateSleepLogDto>,
  ) {
    return this.sleepService.updateSleepLog(req.user.id, logId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteSleepLog(@Request() req, @Param('id') logId: string) {
    await this.sleepService.deleteSleepLog(req.user.id, logId);
    return { message: 'Sleep log deleted successfully' };
  }
}
