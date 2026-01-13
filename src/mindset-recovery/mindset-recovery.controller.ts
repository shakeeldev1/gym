import { Body, Controller, Get, Post, Query, Request, UseGuards, Param } from '@nestjs/common';
import { MindsetRecoveryService } from './mindset-recovery.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateMeditationDto } from './dto/create-meditation.dto';
import { CreateBreathworkDto } from './dto/create-breathwork.dto';
import { CreateSleepDto } from './dto/create-sleep.dto';
import { GetMindsetProgressDto } from './dto/get-progress.dto';
import { RecoveryPlan } from './schemas/recovery-plan.schema';

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
    @Get("meditation/all")
    async getAllMeditations() {
        return this.mindsetRecoveryService.getAllMeditations();
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
    @Get("meditation/today")
    async getTodayMeditations(@Request() req) {
        const today = new Date().toISOString().split('T')[0];
        return this.mindsetRecoveryService.getMeditations(req.user.id, today);
    }

    @UseGuards(AuthGuard)
    @Get("breathwork/today")
    async getTodayBreathworks(@Request() req) {
        const today = new Date().toISOString().split('T')[0];
        return this.mindsetRecoveryService.getBreathworks(req.user.id, today);
    }

    @UseGuards(AuthGuard)
    @Get('recovery-plan/active')
    async getActiveRecoveryPlan(@Request() req) {
        return this.mindsetRecoveryService.getActiveRecoveryPlan(req.user.id);
    }

    @UseGuards(AuthGuard)
    @Get('progress')
    async getProgress(@Request() req, @Query() query: GetMindsetProgressDto) {
        return this.mindsetRecoveryService.getProgress(req.user.id, query.period, query.date);
    }
    
    @UseGuards(AuthGuard)
    @Get('my-recovery-plan')
    async getMyRecoveryPlan(@Request() req) {
        return this.mindsetRecoveryService.getAIRecoveryPlan(req.user.id);
    }

    // ==================== AI SUGGESTIONS ENDPOINTS ====================

    @UseGuards(AuthGuard)
    @Get('suggestions/sleep/:userId')
    async getSleepSuggestions(@Request() req, @Param('userId') userId: string) {
        // TODO: Add admin role check
        return this.mindsetRecoveryService.getSleepSuggestions(userId);
    }

    @UseGuards(AuthGuard)
    @Post('suggestions/sleep/:id/approve')
    async approveSleepSuggestion(@Request() req, @Param('id') suggestionId: string) {
        // TODO: Add admin role check
        return this.mindsetRecoveryService.approveSleepSuggestion(suggestionId, req.user.id);
    }

    @UseGuards(AuthGuard)
    @Post('suggestions/sleep/approve-all/:userId')
    async approveAllSleepSuggestions(@Request() req, @Param('userId') userId: string) {
        // TODO: Add admin role check
        return this.mindsetRecoveryService.approveAllSleepSuggestions(userId, req.user.id);
    }

    @UseGuards(AuthGuard)
    @Get('suggestions/meditation/:userId')
    async getMeditationSuggestions(@Request() req, @Param('userId') userId: string) {
        // TODO: Add admin role check
        return this.mindsetRecoveryService.getMeditationSuggestions(userId);
    }

    @UseGuards(AuthGuard)
    @Post('suggestions/meditation/:id/approve')
    async approveMeditationSuggestion(@Request() req, @Param('id') suggestionId: string) {
        // TODO: Add admin role check
        return this.mindsetRecoveryService.approveMeditationSuggestion(suggestionId, req.user.id);
    }

    @UseGuards(AuthGuard)
    @Post('suggestions/meditation/approve-all/:userId')
    async approveAllMeditationSuggestions(@Request() req, @Param('userId') userId: string) {
        // TODO: Add admin role check
        return this.mindsetRecoveryService.approveAllMeditationSuggestions(userId, req.user.id);
    }

    @UseGuards(AuthGuard)
    @Get('suggestions/breathwork/:userId')
    async getBreathworkSuggestions(@Request() req, @Param('userId') userId: string) {
        // TODO: Add admin role check
        return this.mindsetRecoveryService.getBreathworkSuggestions(userId);
    }

    @UseGuards(AuthGuard)
    @Post('suggestions/breathwork/:id/approve')
    async approveBreathworkSuggestion(@Request() req, @Param('id') suggestionId: string) {
        // TODO: Add admin role check
        return this.mindsetRecoveryService.approveBreathworkSuggestion(suggestionId, req.user.id);
    }

    @UseGuards(AuthGuard)
    @Post('suggestions/breathwork/approve-all/:userId')
    async approveAllBreathworkSuggestions(@Request() req, @Param('userId') userId: string) {
        // TODO: Add admin role check
        return this.mindsetRecoveryService.approveAllBreathworkSuggestions(userId, req.user.id);
    }
}
