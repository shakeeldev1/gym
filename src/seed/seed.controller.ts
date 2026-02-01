import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { HabitsService } from 'src/habits/habits.service';
import { SleepService } from 'src/sleep/sleep.service';

@ApiTags('Seed')
@ApiBearerAuth('JWT-auth')
@Controller('seed')
export class SeedController {
  constructor(
    private readonly habitsService: HabitsService,
    private readonly sleepService: SleepService,
  ) {}

  /**
   * Create test data for the current user
   * Usage: POST /seed/test-data
   * This will create sample habits and sleep logs for testing daily reset
   */
  @UseGuards(AuthGuard)
  @Post('test-data')
  @ApiOperation({
    summary: 'Seed test data',
    description: 'Create sample habits and sleep logs for testing.',
  })
  @ApiResponse({ status: 201, description: 'Test data created successfully.' })
  async seedTestData(@Request() req) {
    const userId = req.user.id;

    try {
      // Create test habits
      const habits = await Promise.all([
        this.habitsService.createHabit(userId, {
          name: 'Morning Run',
          type: 'BOOLEAN',
        }),
        this.habitsService.createHabit(userId, {
          name: 'Drink Water',
          type: 'NUMERIC',
          targetValue: 8,
          unit: 'glasses',
        }),
        this.habitsService.createHabit(userId, {
          name: 'Read 30 mins',
          type: 'BOOLEAN',
        }),
      ]);

      // Create test sleep logs
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const sleepLogs = await Promise.all([
        this.sleepService.createSleepLog(userId, {
          date: today.toISOString(),
          bedtime: new Date(
            today.getTime() - 10 * 60 * 60 * 1000,
          ).toISOString(),
          wakeTime: today.toISOString(),
          durationHours: 8,
          quality: 4,
          notes: 'Today sleep log',
          status: 'done',
        }),
        this.sleepService.createSleepLog(userId, {
          date: yesterday.toISOString(),
          bedtime: new Date(
            yesterday.getTime() - 9 * 60 * 60 * 1000,
          ).toISOString(),
          wakeTime: yesterday.toISOString(),
          durationHours: 7,
          quality: 3,
          notes: 'Yesterday sleep log',
          status: 'done',
        }),
      ]);

      return {
        message: '✅ Test data created successfully',
        data: {
          habitsCreated: habits.length,
          sleepLogsCreated: sleepLogs.length,
          habits: habits.map((h: any) => ({
            id: h._id?.toString() || h._id,
            name: h.name,
          })),
          sleepLogs: sleepLogs.map((s: any) => ({
            id: s._id?.toString() || s._id,
            date: s.date,
            hours: s.durationHours,
          })),
        },
      };
    } catch (error) {
      return {
        message: '❌ Error creating test data',
        error: error.message,
      };
    }
  }

  /**
   * Fix existing habits by setting active: true
   * Usage: POST /seed/fix-habits
   * This will update all habits with active=false to active=true
   */
  @UseGuards(AuthGuard)
  @Post('fix-habits')
  @ApiOperation({
    summary: 'Fix habits',
    description: 'Set active=true for all existing habits.',
  })
  @ApiResponse({ status: 201, description: 'Habits fixed successfully.' })
  async fixHabits(@Request() req) {
    const userId = req.user.id;

    try {
      // Update all user's habits to active: true
      const result = await this.habitsService['habitModel'].updateMany(
        { user: userId, active: { $ne: true } },
        { $set: { active: true } },
      );

      return {
        message: '✅ Habits fixed successfully',
        data: {
          matched: result.matchedCount || 0,
          modified: result.modifiedCount || 0,
        },
      };
    } catch (error) {
      return {
        message: '❌ Error fixing habits',
        error: error.message,
      };
    }
  }
}
