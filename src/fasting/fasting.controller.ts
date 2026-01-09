import { Controller, Post, Patch, Get, Request, UseGuards, Body } from '@nestjs/common';
import { FastingService } from './fasting.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {CreateFastingDto} from './dto/create-fasting.dto'
import { EndFastingDto } from './dto/end-fasting.dto';

@Controller('fasting')
export class FastingController {
  constructor(private readonly fastingService: FastingService) {}

  @UseGuards(AuthGuard)
  @Post('start')
  startFasting(@Request() req, @Body() dto: CreateFastingDto) {
    return this.fastingService.startFasting(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('end')
  endFasting(@Request() req, @Body() dto: EndFastingDto) {
    return this.fastingService.endFasting(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('active')
  getActiveFasting(@Request() req) {
    return this.fastingService.getActiveFasting(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('history')
  getFastingHistory(@Request() req) {
    return this.fastingService.getFastingHistory(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('progress')
  getProgress(@Request() req) {
    return this.fastingService.getProgress(req.user.id);
  }
  
  @UseGuards(AuthGuard)
  @Get('my-fasting-plan')
  getMyFastingPlan(@Request() req) {
    return this.fastingService.getAIFastingPlan(req.user.id);
  }
}
