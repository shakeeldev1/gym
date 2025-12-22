import { Controller, Post, Body, Get, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('integrations')
export class IntegrationsController {
    constructor(private readonly service: IntegrationsService) {}

    // ---------- USER INTEGRATION ----------
    @UseGuards(AuthGuard)
    @Post('integration')
    addIntegration(@Request() req, @Body() body: { type: string; externalId?: string; accessToken?: string; refreshToken?: string }) {
        return this.service.addIntegration(req.user.id, body.type, body.externalId, body.accessToken, body.refreshToken);
    }

    @UseGuards(AuthGuard)
    @Get('integration')
    getIntegrations(@Request() req) {
        return this.service.getUserIntegrations(req.user.id);
    }

    @UseGuards(AuthGuard)
    @Patch('integration/:id')
    deactivateIntegration(@Param('id') id: string) {
        return this.service.deactivateIntegration(id);
    }

    // ---------- HABIT ----------
    @UseGuards(AuthGuard)
    @Post('habit')
    addHabit(@Request() req, @Body() body: { name: string }) {
        return this.service.addHabit(req.user.id, body.name);
    }

    @UseGuards(AuthGuard)
    @Get('habit')
    getHabits(@Request() req) {
        return this.service.getUserHabits(req.user.id);
    }

    @UseGuards(AuthGuard)
    @Patch('habit/:id')
    updateHabit(@Param('id') id: string, @Body() body: Partial<any>) {
        return this.service.updateHabit(id, body);
    }

    // ---------- TASK AUTOMATION ----------
    @UseGuards(AuthGuard)
    @Post('task')
    addTask(@Request() req, @Body() body: { title: string; description?: string; dueDate?: string; type?: string }) {
        const due = body.dueDate ? new Date(body.dueDate) : undefined;
        return this.service.addTask(req.user.id, body.title, body.description, due, body.type);
    }

    @UseGuards(AuthGuard)
    @Get('task')
    getTasks(@Request() req) {
        return this.service.getUserTasks(req.user.id);
    }

    @UseGuards(AuthGuard)
    @Patch('task/:id')
    updateTask(@Param('id') id: string, @Body() body: Partial<any>) {
        if (body.dueDate) body.dueDate = new Date(body.dueDate);
        return this.service.updateTask(id, body);
    }
}
