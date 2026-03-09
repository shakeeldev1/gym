import {
  Body,
  Controller,
  Get,
  Post,
  Put,
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
import { BodyMetricsService } from './body-metrics.service';
import { CreateBodyMetricsDto, LogWeightDto } from './dto/body-metrics.dto';

@ApiTags('Body Metrics')
@ApiBearerAuth('JWT-auth')
@Controller('body-metrics')
export class BodyMetricsController {
  constructor(private readonly bodyMetricsService: BodyMetricsService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get latest body metrics' })
  @ApiResponse({ status: 200, description: 'Body metrics retrieved.' })
  async getBodyMetrics(@Request() req) {
    const metrics = await this.bodyMetricsService.getLatest(req.user.id);
    return { data: metrics };
  }

  @UseGuards(AuthGuard)
  @Post('weight')
  @ApiOperation({ summary: 'Log a weight entry' })
  @ApiResponse({ status: 201, description: 'Weight logged.' })
  async logWeight(@Request() req, @Body() dto: LogWeightDto) {
    return this.bodyMetricsService.logWeight(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('weight/history')
  @ApiOperation({ summary: 'Get weight history' })
  @ApiResponse({ status: 200, description: 'Weight history retrieved.' })
  async getWeightHistory(@Request() req) {
    const history = await this.bodyMetricsService.getWeightHistory(req.user.id);
    return { data: history };
  }

  @UseGuards(AuthGuard)
  @Put()
  @ApiOperation({ summary: 'Update body metrics' })
  @ApiResponse({ status: 200, description: 'Body metrics updated.' })
  async updateBodyMetrics(@Request() req, @Body() dto: CreateBodyMetricsDto) {
    return this.bodyMetricsService.update(req.user.id, dto);
  }
}
