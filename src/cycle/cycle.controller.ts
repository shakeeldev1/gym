import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CycleService } from './cycle.service';
import { LogPeriodDto, LogSymptomsDto } from './dto/cycle.dto';

@ApiTags('Menstrual Cycle')
@ApiBearerAuth('JWT-auth')
@Controller('cycle')
export class CycleController {
  constructor(private readonly cycleService: CycleService) {}

  @UseGuards(AuthGuard)
  @Get('data')
  @ApiOperation({ summary: 'Get cycle data and current phase' })
  @ApiResponse({ status: 200, description: 'Cycle data retrieved.' })
  async getCycleData(@Request() req) {
    return this.cycleService.getCycleData(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('period')
  @ApiOperation({ summary: 'Log period start/end' })
  @ApiResponse({ status: 201, description: 'Period logged.' })
  async logPeriod(@Request() req, @Body() dto: LogPeriodDto) {
    return this.cycleService.logPeriod(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Post('symptoms')
  @ApiOperation({ summary: 'Log symptoms' })
  @ApiResponse({ status: 201, description: 'Symptoms logged.' })
  async logSymptoms(@Request() req, @Body() dto: LogSymptomsDto) {
    return this.cycleService.logSymptoms(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('insights')
  @ApiOperation({ summary: 'Get cycle insights and averages' })
  @ApiResponse({ status: 200, description: 'Insights retrieved.' })
  async getInsights(@Request() req) {
    return this.cycleService.getInsights(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('predictions')
  @ApiOperation({ summary: 'Get cycle predictions' })
  @ApiResponse({ status: 200, description: 'Predictions retrieved.' })
  async getPredictions(@Request() req) {
    return this.cycleService.getPredictions(req.user.id);
  }
}
