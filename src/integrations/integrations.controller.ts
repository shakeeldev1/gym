import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Integrations')
@ApiBearerAuth('JWT-auth')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  // ---------- USER INTEGRATION ----------
  @UseGuards(AuthGuard)
  @Post('integration')
  @ApiOperation({
    summary: 'Add integration',
    description: 'Connect a new third-party integration.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'google-fit' },
        externalId: { type: 'string', example: 'user-123' },
        accessToken: { type: 'string', example: 'ya29...' },
        refreshToken: { type: 'string', example: '1//...' },
      },
      required: ['type'],
    },
  })
  @ApiResponse({ status: 201, description: 'Integration added successfully.' })
  addIntegration(
    @Request() req,
    @Body()
    body: {
      type: string;
      externalId?: string;
      accessToken?: string;
      refreshToken?: string;
    },
  ) {
    return this.service.addIntegration(
      req.user.id,
      body.type,
      body.externalId,
      body.accessToken,
      body.refreshToken,
    );
  }

  @UseGuards(AuthGuard)
  @Get('integration')
  @ApiOperation({
    summary: 'Get integrations',
    description: 'Retrieve all connected integrations for the user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Integrations retrieved successfully.',
  })
  getIntegrations(@Request() req) {
    return this.service.getUserIntegrations(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('integration/:id')
  @ApiOperation({
    summary: 'Deactivate integration',
    description: 'Deactivate a specific integration.',
  })
  @ApiParam({ name: 'id', description: 'Integration ID' })
  @ApiResponse({
    status: 200,
    description: 'Integration deactivated successfully.',
  })
  deactivateIntegration(@Param('id') id: string) {
    return this.service.deactivateIntegration(id);
  }

  // ---------- HABIT ----------
  @UseGuards(AuthGuard)
  @Post('habit')
  @ApiOperation({ summary: 'Add habit', description: 'Create a new habit.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Morning Jog' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Habit created successfully.' })
  addHabit(@Request() req, @Body() body: { name: string }) {
    return this.service.addHabit(req.user.id, body.name);
  }

  @UseGuards(AuthGuard)
  @Get('habit')
  @ApiOperation({
    summary: 'Get habits',
    description: 'Retrieve all habits for the user.',
  })
  @ApiResponse({ status: 200, description: 'Habits retrieved successfully.' })
  getHabits(@Request() req) {
    return this.service.getUserHabits(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('habit/:id')
  @ApiOperation({
    summary: 'Update habit',
    description: 'Update a specific habit.',
  })
  @ApiParam({ name: 'id', description: 'Habit ID' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: 'Habit updated successfully.' })
  updateHabit(@Param('id') id: string, @Body() body: Partial<any>) {
    return this.service.updateHabit(id, body);
  }

  // ---------- TASK AUTOMATION ----------
  @UseGuards(AuthGuard)
  @Post('task')
  @ApiOperation({ summary: 'Add task', description: 'Create a new task.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Complete Report' },
        description: { type: 'string', example: 'Quarterly financial report' },
        dueDate: {
          type: 'string',
          format: 'date-time',
          example: '2024-12-31T23:59:59Z',
        },
        type: { type: 'string', example: 'work' },
      },
      required: ['title'],
    },
  })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  addTask(
    @Request() req,
    @Body()
    body: {
      title: string;
      description?: string;
      dueDate?: string;
      type?: string;
    },
  ) {
    const due = body.dueDate ? new Date(body.dueDate) : undefined;
    return this.service.addTask(
      req.user.id,
      body.title,
      body.description,
      due,
      body.type,
    );
  }

  @UseGuards(AuthGuard)
  @Get('task')
  @ApiOperation({
    summary: 'Get tasks',
    description: 'Retrieve all tasks for the user.',
  })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully.' })
  getTasks(@Request() req) {
    return this.service.getUserTasks(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch('task/:id')
  @ApiOperation({
    summary: 'Update task',
    description: 'Update a specific task.',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: 'Task updated successfully.' })
  updateTask(@Param('id') id: string, @Body() body: Partial<any>) {
    if (body.dueDate) body.dueDate = new Date(body.dueDate);
    return this.service.updateTask(id, body);
  }
}
