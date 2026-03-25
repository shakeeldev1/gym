import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { LogHabitDto } from './dto/log-habit.dto';
import { HabitCalendarEntry } from './types';
import { ApiAdminOnly } from 'src/common/decorators/api-admin.decorator';

@ApiTags('Habits')
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create new habit',
    description:
      'Create a new habit for the authenticated user. Supports both boolean (yes/no) and numeric tracking.',
  })
  @ApiResponse({
    status: 201,
    description: 'Habit created successfully',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Drink Water',
        type: 'NUMERIC',
        targetValue: 8,
        unit: 'glasses',
        userId: '507f1f77bcf86cd799439012',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createHabit(@Request() req, @Body() dto: CreateHabitDto) {
    return this.habitsService.createHabit(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Post('assign/:userId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Assign habit to user (Admin/Coach only)',
    description:
      'Assign a habit to a specific user. Only accessible to admin and coach roles.',
  })
  @ApiAdminOnly()
  @ApiParam({
    name: 'userId',
    description: 'Target user ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 201,
    description: 'Habit assigned successfully',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Morning Meditation',
        type: 'BOOLEAN',
        userId: '507f1f77bcf86cd799439012',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin or Coach access required',
  })
  async assignHabitToUser(
    @Request() req,
    @Param('userId') targetUserId: string,
    @Body() dto: CreateHabitDto,
  ) {
    // Only admin/coach can assign habits to other users
    const userRole = req.user.role;
    if (userRole !== 'admin' && userRole !== 'coach') {
      throw new ForbiddenException(
        'Only admin or coach can assign habits to users',
      );
    }
    return this.habitsService.createHabit(targetUserId, dto);
  }

  @UseGuards(AuthGuard)
  @Get('all')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all user habits',
    description: 'Retrieve all habits for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Habits retrieved successfully',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Drink Water',
          type: 'NUMERIC',
          targetValue: 8,
          unit: 'glasses',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllHabits(@Request() req) {
    return this.habitsService.getAllHabits(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('today')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Get today's habits",
    description: 'Retrieve all habits for today with their completion status',
  })
  @ApiResponse({
    status: 200,
    description: "Today's habits retrieved successfully",
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Drink Water',
          type: 'NUMERIC',
          targetValue: 8,
          unit: 'glasses',
          completed: 6,
          isCompleted: false,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTodayHabits(@Request() req) {
    return this.habitsService.getTodayHabits(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post('log')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Log habit completion',
    description:
      'Log habit completion for a specific date. Value can be boolean (true/false) or numeric depending on habit type.',
  })
  @ApiResponse({
    status: 201,
    description: 'Habit logged successfully',
    schema: {
      example: {
        habitId: '507f1f77bcf86cd799439011',
        date: '2024-01-28',
        value: 8,
        completed: true,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid habit data' })
  async logHabit(@Request() req, @Body() dto: LogHabitDto) {
    return this.habitsService.logHabit(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('daily-summary')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get daily habit summary',
    description: 'Get summary of habit completion for a specific date.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    description: 'Date for summary (YYYY-MM-DD)',
    example: '2024-01-28',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily summary retrieved successfully.',
  })
  async getDailySummary(@Request() req, @Query('date') date: string) {
    return this.habitsService.getDailySummary(req.user.id, date);
  }

  @UseGuards(AuthGuard)
  @Get(':id/streak')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get habit streak',
    description: 'Get current and longest streak for a specific habit.',
  })
  @ApiParam({ name: 'id', description: 'Habit ID' })
  @ApiResponse({
    status: 200,
    description: 'Streak info retrieved successfully.',
  })
  async getHabitStreak(@Request() req, @Param('id') habitId: string) {
    return this.habitsService.getHabitStreak(req.user.id, habitId);
  }

  @UseGuards(AuthGuard)
  @Get(':habitId/calendar')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get habit calendar',
    description: 'Get monthly completion calendar for a specific habit.',
  })
  @ApiParam({ name: 'habitId', description: 'Habit ID' })
  @ApiQuery({
    name: 'month',
    required: true,
    description: 'Month in YYYY-MM format',
    example: '2024-01',
  })
  @ApiResponse({ status: 200, description: 'Calendar retrieved successfully.' })
  async getHabitCalendar(
    @Param('habitId') habitId: string,
    @Query('month') month: string,
    @Request() req,
  ): Promise<{
    habitId: string;
    month: string;
    calendar: HabitCalendarEntry[];
  }> {
    return this.habitsService.getHabitCalendar(req.user.id, habitId, month);
  }

  @UseGuards(AuthGuard)
  @Post('suggestions/generate')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Generate AI habit suggestions',
    description: 'Generate personalized habit suggestions using AI.',
  })
  @ApiResponse({
    status: 200,
    description: 'Suggestions generated successfully.',
  })
  async generateHabitSuggestions(@Request() req) {
    return this.habitsService.generateAIHabitSuggestions(req.user.id);
  }

  /**
   * Admin creates manual habit suggestion for user
   */
  @UseGuards(AuthGuard)
  @Post('suggestions/create/:userId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create habit suggestion',
    description: 'Admin/Coach creates a habit suggestion for a user.',
  })
  @ApiAdminOnly()
  @ApiParam({ name: 'userId', description: 'Target User ID' })
  @ApiResponse({ status: 201, description: 'Suggestion created successfully.' })
  async createHabitSuggestion(
    @Request() req,
    @Param('userId') userId: string,
    @Body() dto: CreateHabitDto & { reason?: string; category?: string },
  ) {
    // Only admin/coach can create suggestions
    if (req.user.role !== 'admin' && req.user.role !== 'coach') {
      throw new ForbiddenException(
        'Only admin or coach can create habit suggestions',
      );
    }
    return this.habitsService.createHabitSuggestion(req.user.id, userId, dto);
  }

  /**
   * Admin views all pending habit suggestions
   */
  @UseGuards(AuthGuard)
  @Get('suggestions/pending')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get pending suggestions',
    description: 'Get all pending habit suggestions (Admin/Coach only).',
  })
  @ApiAdminOnly()
  @ApiResponse({
    status: 200,
    description: 'Pending suggestions retrieved successfully.',
  })
  async getPendingSuggestions(@Request() req) {
    // Only admin/coach can view pending suggestions
    if (req.user.role !== 'admin' && req.user.role !== 'coach') {
      throw new ForbiddenException(
        'Only admin or coach can view pending suggestions',
      );
    }
    return this.habitsService.getPendingHabitSuggestions();
  }

  /**
   * Admin approves habit suggestion (creates actual habit)
   */
  @UseGuards(AuthGuard)
  @Post('suggestions/:id/approve')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Approve suggestion',
    description: 'Approve a habit suggestion and convert it to a real habit.',
  })
  @ApiAdminOnly()
  @ApiParam({ name: 'id', description: 'Suggestion ID' })
  @ApiResponse({
    status: 201,
    description: 'Suggestion approved successfully.',
  })
  async approveHabitSuggestion(
    @Request() req,
    @Param('id') suggestionId: string,
  ) {
    // Only admin/coach can approve
    if (req.user.role !== 'admin' && req.user.role !== 'coach') {
      throw new ForbiddenException(
        'Only admin or coach can approve suggestions',
      );
    }
    return this.habitsService.approveHabitSuggestion(suggestionId, req.user.id);
  }

  /**
   * Admin rejects habit suggestion
   */
  @UseGuards(AuthGuard)
  @Post('suggestions/:id/reject')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reject suggestion',
    description: 'Reject a habit suggestion.',
  })
  @ApiAdminOnly()
  @ApiParam({ name: 'id', description: 'Suggestion ID' })
  @ApiBody({
    schema: { type: 'object', properties: { reason: { type: 'string' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Suggestion rejected successfully.',
  })
  async rejectHabitSuggestion(
    @Request() req,
    @Param('id') suggestionId: string,
    @Body() body: { reason?: string },
  ) {
    // Only admin/coach can reject
    if (req.user.role !== 'admin' && req.user.role !== 'coach') {
      throw new ForbiddenException(
        'Only admin or coach can reject suggestions',
      );
    }
    return this.habitsService.rejectHabitSuggestion(
      suggestionId,
      req.user.id,
      body.reason,
    );
  }
}
