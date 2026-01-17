import { Body, Controller, Get, Param, Post, Query, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { LogHabitDto } from './dto/log-habit.dto';
import { HabitCalendarEntry } from './types';

@Controller('habits')
export class HabitsController {
    constructor(private readonly habitsService: HabitsService) { }

    @UseGuards(AuthGuard)
    @Post('create')
    async createHabit(@Request() req, @Body() dto: CreateHabitDto) {
        return this.habitsService.createHabit(req.user.id, dto);
    }

    @UseGuards(AuthGuard)
    @Post('assign/:userId')
    async assignHabitToUser(
        @Request() req, 
        @Param('userId') targetUserId: string,
        @Body() dto: CreateHabitDto
    ) {
        // Only admin/coach can assign habits to other users
        const userRole = req.user.role;
        if (userRole !== 'admin' && userRole !== 'coach') {
            throw new ForbiddenException('Only admin or coach can assign habits to users');
        }
        return this.habitsService.createHabit(targetUserId, dto);
    }

    @UseGuards(AuthGuard)
    @Get('all')
    async getAllHabits(@Request() req) {
        return this.habitsService.getAllHabits(req.user.id);
    }

    @UseGuards(AuthGuard)
    @Get('today')
    async getTodayHabits(@Request() req) {
        return this.habitsService.getTodayHabits(req.user.id);
    }

    @UseGuards(AuthGuard)
    @Post("log")
    async logHabit(@Request() req, @Body() dto: LogHabitDto) {
        return this.habitsService.logHabit(req.user.id, dto);
    }

    @UseGuards(AuthGuard)
    @Get("daily-summary")
    async getDailySummary(@Request() req, @Query('date') date: string) {
        return this.habitsService.getDailySummary(req.user.id, date);
    }

    @UseGuards(AuthGuard)
    @Get(":id/streak")
    async getHabitStreak(@Request() req, @Param('id') habitId: string) {
        return this.habitsService.getHabitStreak(req.user.id, habitId);
    }

    @UseGuards(AuthGuard)
    @Get(':id/calendar')
    async getHabitCalendar(
        @Param('habitId') habitId: string,
        @Query('month') month: string,
        @Request() req
    ): Promise<{ habitId: string; month: string; calendar: HabitCalendarEntry[] }> {
        return this.habitsService.getHabitCalendar(req.user.id, habitId, month);
    }

    @UseGuards(AuthGuard)
    @Post('suggestions/generate')
    async generateHabitSuggestions(@Request() req) {
        return this.habitsService.generateAIHabitSuggestions(req.user.id);
    }
    /**
     * Admin creates manual habit suggestion for user
     */
    @UseGuards(AuthGuard)
    @Post('suggestions/create/:userId')
    async createHabitSuggestion(
        @Request() req,
        @Param('userId') userId: string,
        @Body() dto: CreateHabitDto & { reason?: string; category?: string }
    ) {
        // Only admin/coach can create suggestions
        if (req.user.role !== 'admin' && req.user.role !== 'coach') {
            throw new ForbiddenException('Only admin or coach can create habit suggestions');
        }
        return this.habitsService.createHabitSuggestion(req.user.id, userId, dto);
    }

    /**
     * Admin views all pending habit suggestions
     */
    @UseGuards(AuthGuard)
    @Get('suggestions/pending')
    async getPendingSuggestions(@Request() req) {
        // Only admin/coach can view pending suggestions
        if (req.user.role !== 'admin' && req.user.role !== 'coach') {
            throw new ForbiddenException('Only admin or coach can view pending suggestions');
        }
        return this.habitsService.getPendingHabitSuggestions();
    }

    /**
     * Admin approves habit suggestion (creates actual habit)
     */
    @UseGuards(AuthGuard)
    @Post('suggestions/:id/approve')
    async approveHabitSuggestion(
        @Request() req,
        @Param('id') suggestionId: string
    ) {
        // Only admin/coach can approve
        if (req.user.role !== 'admin' && req.user.role !== 'coach') {
            throw new ForbiddenException('Only admin or coach can approve suggestions');
        }
        return this.habitsService.approveHabitSuggestion(suggestionId, req.user.id);
    }

    /**
     * Admin rejects habit suggestion
     */
    @UseGuards(AuthGuard)
    @Post('suggestions/:id/reject')
    async rejectHabitSuggestion(
        @Request() req,
        @Param('id') suggestionId: string,
        @Body() body: { reason?: string }
    ) {
        // Only admin/coach can reject
        if (req.user.role !== 'admin' && req.user.role !== 'coach') {
            throw new ForbiddenException('Only admin or coach can reject suggestions');
        }
        return this.habitsService.rejectHabitSuggestion(suggestionId, req.user.id, body.reason);
    }
}
