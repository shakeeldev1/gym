import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateSessionDto } from './dto/update-session.dto';
import { AddBlockDto } from './dto/add-block.dto';

@Controller('training/session')
export class SessionController {
    constructor(private readonly sessionService: SessionService) { }

    @Post("create")
    async createSession(@Body() dto: CreateSessionDto) {
        return this.sessionService.createSession(dto);
    }

    @UseGuards(AuthGuard)
    @Get("get-one/:id")
    async getSession(@Param('id') id: string) {
        return this.sessionService.getSession(id);
    }

    @UseGuards(AuthGuard)
    @Patch("update/:id")
    async updateSession(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
        return this.sessionService.updateSession(id, dto);
    }

    @UseGuards(AuthGuard)
    @Delete("delete/:id")
    async deleteSession(@Param('id') id: string) {
        return this.sessionService.deleteSession(id);
    }

    @UseGuards(AuthGuard)
    @Post("add-block/:id")
    async addBlockToSession(@Param('id') id: string,@Body() dto:AddBlockDto) {
        return this.sessionService.addBlockToSession(id,dto);
    }

    @UseGuards(AuthGuard)
    @Get("get-all")
    async getAllSessions() {
        return this.sessionService.getAllSessions();
    }

    @UseGuards(AuthGuard)
    @Get("my-sessions")
    async getMySessions(@Request() req) {
        const userId = req.user.id;
        return this.sessionService.getSessionsByUser(userId);
    }
}
