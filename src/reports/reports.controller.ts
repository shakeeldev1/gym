import { Controller, Get, Post, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Request() req, @Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(req.user.userId, createReportDto);
  }

  @Get()
  findAll(@Request() req, @Query('type') type?: string) {
    return this.reportsService.findAll(req.user.userId, type);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.reportsService.findOne(id, req.user.userId);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.reportsService.remove(id, req.user.userId);
  }
}
