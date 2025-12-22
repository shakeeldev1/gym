import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { FastingService } from './fasting.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateFastingDto } from './dto/create-fasting.dto';
import { EndFastingDto } from './dto/end-fasting.dto';

@Controller('fasting')
export class FastingController {
    constructor(private readonly fastingService:FastingService){}

    @UseGuards(AuthGuard)
    @Post('start')
    async startFasting(@Request() req, @Body() dto: CreateFastingDto){
        return this.fastingService.startFasting(req.user.id, dto);
    }

    @UseGuards(AuthGuard)
    @Patch('end')
    async endFasting(@Request() req,@Body() dto:EndFastingDto){
        return this.fastingService.endFasting(req.user.id, dto);
    }

    @UseGuards(AuthGuard)
    @Get("history")
    async getFastingHistory(@Request() req){
        return this.fastingService.getFastingHistory(req.user.id);
    }
}
