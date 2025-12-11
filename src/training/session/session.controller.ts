import { Body, Controller, Post } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('training/session')
export class SessionController {
    constructor(private readonly sessionService: SessionService) { }

    @Post("create")
    async createSession(@Body() dto:CreateSessionDto) {
        return this.sessionService.createSession(dto);
    }
}
