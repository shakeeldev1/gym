import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { MindsetRecoveryService } from './mindset-recovery.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateMeditationDto } from './dto/create-meditation.dto';
import { CreateBreathworkDto } from './dto/create-breathwork.dto';
import { CreateSleepDto } from './dto/create-sleep.dto';
import { GetMindsetProgressDto } from './dto/get-progress.dto';

@Controller('mindset-recovery')
export class MindsetRecoveryController {
    constructor(private readonly mindsetRecoveryService: MindsetRecoveryService) { }

    @UseGuards(AuthGuard)
    @Post("meditation")
    async addMeditation(@Request() req, @Body() dto: CreateMeditationDto) {
        return this.mindsetRecoveryService.addMeditation(req.user.id, dto);
    }


    @UseGuards(AuthGuard)
    @Get("meditations")
    async getMeditations(@Request() req, @Query('date') date?: string) {
        return this.mindsetRecoveryService.getMeditations(req.user.id, date);
    }

    @UseGuards(AuthGuard)
    @Post("breathwork")
    async addBreathwork(@Request() req, @Body() dto: CreateBreathworkDto) {
        return this.mindsetRecoveryService.addBreathwork(req.user.id, dto);
    }

    @UseGuards(AuthGuard)
    @Get("breathworks")
    async getBreathworks(@Request() req, @Query('date') date?: string) {
        return this.mindsetRecoveryService.getBreathworks(req.user.id, date);
    }

    @UseGuards(AuthGuard)
    @Post("sleep")
    async addSleep(@Request() req, @Body() dto: CreateSleepDto) {
        return this.mindsetRecoveryService.addSleep(req.user.id, dto);
    }

    @UseGuards(AuthGuard)
    @Get("sleeps")
    async getSleeps(@Request() req, @Query('date') date?: string) {
        return this.mindsetRecoveryService.getSleeps(req.user.id, date);
    }

    @UseGuards(AuthGuard)
    @Get('progress')
    async getProgress(@Request() req, @Query() query: GetMindsetProgressDto) {
        return this.mindsetRecoveryService.getProgress(req.user.id, query.period, query.date);
    }
}
