import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { LogHabitDto } from './dto/log-habit.dto';

@Controller('habits')
export class HabitsController {
    constructor(private readonly habitsService: HabitsService) { }

    @UseGuards(AuthGuard)
    @Post('create')
    async createHabit(@Request() req, @Body() dto: CreateHabitDto) {
        return this.habitsService.createHabit(req.user.id, dto);
    }

    @UseGuards(AuthGuard)
    @Get('all')
    async getAllHabits(@Request() req) {
        return this.habitsService.getAllHabits(req.user.id);
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
}
