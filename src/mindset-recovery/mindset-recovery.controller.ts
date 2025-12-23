import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { MindsetRecoveryService } from './mindset-recovery.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateMeditationDto } from './dto/create-meditation.dto';

@Controller('mindset-recovery')
export class MindsetRecoveryController {
    constructor(private readonly mindsetRecoveryService: MindsetRecoveryService) { }

    @UseGuards(AuthGuard)
    @Post("meditation")
    async addMeditation(@Request() req, @Body() dto: CreateMeditationDto) {
        return this.mindsetRecoveryService.addMeditation(req.user.id, dto);
    }


}
