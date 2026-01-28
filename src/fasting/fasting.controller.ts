import { Controller, Post, Patch, Get, Request, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FastingService } from './fasting.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {CreateFastingDto} from './dto/create-fasting.dto'
import { EndFastingDto } from './dto/end-fasting.dto';

@ApiTags('Fasting')
@Controller('fasting')
export class FastingController {
  constructor(private readonly fastingService: FastingService) {}

  @UseGuards(AuthGuard)
  @Post('start')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Start fasting', description: 'Start a fasting session for the authenticated user.' })
  @ApiResponse({ status: 201, description: 'Fasting session started.' })
  startFasting(@Request() req, @Body() dto: CreateFastingDto) {
    return this.fastingService.startFasting(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('end')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'End fasting', description: 'End the active fasting session for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Fasting session ended.' })
  endFasting(@Request() req, @Body() dto: EndFastingDto) {
    return this.fastingService.endFasting(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('active')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get active fasting', description: 'Get the current active fasting session.' })
  @ApiResponse({ status: 200, description: 'Active fasting session returned.' })
  getActiveFasting(@Request() req) {
    return this.fastingService.getActiveFasting(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get fasting history', description: 'Retrieve fasting history for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Fasting history returned.' })
  getFastingHistory(@Request() req) {
    return this.fastingService.getFastingHistory(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('progress')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get fasting progress', description: 'Get fasting progress statistics.' })
  @ApiResponse({ status: 200, description: 'Fasting progress returned.' })
  getProgress(@Request() req) {
    return this.fastingService.getProgress(req.user.id);
  }
  
  @UseGuards(AuthGuard)
  @Get('my-fasting-plan')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get AI fasting plan', description: 'Get AI-generated fasting plan for the authenticated user.' })
  @ApiResponse({ status: 200, description: 'Fasting plan returned.' })
  getMyFastingPlan(@Request() req) {
    return this.fastingService.getAIFastingPlan(req.user.id);
  }
}
