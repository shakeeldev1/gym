import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('habits')
export class HabitsController {
    constructor(private readonly habitsService: HabitsService){}

    @UseGuards(AuthGuard)
    @Post('create')
    async createHabit(@Request() req,@Body() dto:CreateHabitDto){
        return this.habitsService.createHabit(req.user.id, dto);
    }

    @UseGuards(AuthGuard)
    @Get('all')
    async getAllHabits(@Request() req){
        return this.habitsService.getAllHabits(req.user.id);
    }

}
