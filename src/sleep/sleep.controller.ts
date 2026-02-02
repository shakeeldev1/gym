import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { SleepService } from './sleep.service';
import { CreateSleepLogDto } from './dto/create-sleep-log.dto';

@ApiTags('Sleep')
@ApiBearerAuth('JWT-auth')
@Controller('sleep')
export class SleepController {
  constructor(private readonly sleepService: SleepService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Create sleep log',
    description: 'Create a new sleep log entry.',
  })
  @ApiResponse({ status: 201, description: 'Sleep log created successfully.' })
  async createSleepLog(@Request() req, @Body() dto: CreateSleepLogDto) {
    return this.sleepService.createSleepLog(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('all')
  @ApiOperation({
    summary: 'Get all sleep logs',
    description: 'Retrieve all sleep logs for the user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sleep logs retrieved successfully.',
  })
  async getAllSleepLogs(@Request() req) {
    return this.sleepService.getAllSleepLogs(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('today/logs')
  @ApiOperation({
    summary: "Get today's sleep logs",
    description: 'Retrieve sleep logs for the current day.',
  })
  @ApiResponse({
    status: 200,
    description: "Today's sleep logs retrieved successfully.",
  })
  async getTodaySleepLogs(@Request() req) {
    return this.sleepService.getTodaySleepLogs(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('date')
  @ApiOperation({
    summary: 'Get sleep logs by date',
    description: 'Retrieve sleep logs for a specific date.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date in YYYY-MM-DD format/ISO',
  })
  @ApiResponse({
    status: 200,
    description: 'Sleep logs retrieved successfully.',
  })
  async getSleepLogsByDate(@Request() req, @Query('date') date: string) {
    return this.sleepService.getSleepLogsByDate(req.user.id, date);
  }

  @UseGuards(AuthGuard)
  @Get('range')
  @ApiOperation({
    summary: 'Get sleep logs by range',
    description: 'Retrieve sleep logs within a date range.',
  })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date' })
  @ApiResponse({
    status: 200,
    description: 'Sleep logs retrieved successfully.',
  })
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
  @ApiOperation({
    summary: 'Get average metrics',
    description: 'Calculate average sleep metrics over a period.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look back (default: 7)',
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description: 'Average metrics retrieved successfully.',
  })
  async getAverageSleepMetrics(@Request() req, @Query('days') days?: string) {
    const daysBack = days ? parseInt(days, 10) : 7;
    return this.sleepService.getAverageSleepMetrics(req.user.id, daysBack);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Update sleep log',
    description: 'Update a sleep log by ID.',
  })
  @ApiParam({ name: 'id', description: 'Sleep Log ID' })
  @ApiResponse({ status: 200, description: 'Sleep log updated successfully.' })
  async updateSleepLog(
    @Request() req,
    @Param('id') logId: string,
    @Body() dto: Partial<CreateSleepLogDto>,
  ) {
    return this.sleepService.updateSleepLog(req.user.id, logId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete sleep log',
    description: 'Delete a sleep log by ID.',
  })
  @ApiParam({ name: 'id', description: 'Sleep Log ID' })
  @ApiResponse({ status: 200, description: 'Sleep log deleted successfully.' })
  async deleteSleepLog(@Request() req, @Param('id') logId: string) {
    await this.sleepService.deleteSleepLog(req.user.id, logId);
    return { message: 'Sleep log deleted successfully' };
  }
}
