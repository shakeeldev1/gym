import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { FastingService } from './fasting.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateFastingDto } from './dto/create-fasting.dto';

@Controller('fasting')
export class FastingController {
    constructor(private readonly fastingService:FastingService){}

    @UseGuards(AuthGuard)
    @Post('start')
    async startFasting(@Request() req, @Body() dto: CreateFastingDto){
        return this.fastingService.startFasting(req.user.id, dto);
    }
}
