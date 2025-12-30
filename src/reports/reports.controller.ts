import { Controller, Get, Post, Delete, Body, Param, Query, Request, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Request() req, @Body() createReportDto: CreateReportDto) {
    try {
      const coachId = req.user.id;
      if (!coachId) {
        throw new HttpException('User ID not found in token', HttpStatus.UNAUTHORIZED);
      }
      return await this.reportsService.create(coachId, createReportDto);
    } catch (error) {
      console.error('Error creating report:', error);
      throw new HttpException(
        error.message || 'Failed to create report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  findAll(@Request() req, @Query('type') type?: string) {
    return this.reportsService.findAll(req.user.id, type);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.reportsService.findOne(id, req.user.id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.reportsService.remove(id, req.user.id);
  }
}
