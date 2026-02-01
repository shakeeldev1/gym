import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create report',
    description: 'Create a new report (Coach only).',
  })
  @ApiResponse({ status: 201, description: 'Report created successfully.' })
  async create(@Request() req, @Body() createReportDto: CreateReportDto) {
    try {
      const coachId = req.user.id;
      if (!coachId) {
        throw new HttpException(
          'User ID not found in token',
          HttpStatus.UNAUTHORIZED,
        );
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
  @ApiOperation({
    summary: 'Get all reports',
    description: 'Retrieve all reports for the authenticated coach.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by report type',
  })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully.' })
  findAll(@Request() req, @Query('type') type?: string) {
    return this.reportsService.findAll(req.user.id, type);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get report by ID',
    description: 'Retrieve a specific report by ID.',
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully.' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.reportsService.findOne(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete report',
    description: 'Delete a report by ID.',
  })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully.' })
  remove(@Request() req, @Param('id') id: string) {
    return this.reportsService.remove(id, req.user.id);
  }
}
