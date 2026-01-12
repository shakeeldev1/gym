import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HabitsService } from './habits/habits.service';
import { SleepService } from './sleep/sleep.service';

async function seed() {
  const app = await NestFactory.create(AppModule);

  const habitsService = app.get(HabitsService);
  const sleepService = app.get(SleepService);

  // Use a test user ID (replace with actual user ID from your database)
  const testUserId = 'YOUR_USER_ID_HERE'; // Get this from actual user in DB

  try {
    console.log('🌱 Starting seed...');

    // Seed habits
    console.log('\n📋 Creating test habits...');
    const habits = await Promise.all([
      habitsService.createHabit(testUserId, {
        name: 'Morning Run',
        type: 'BOOLEAN',
      }),
      habitsService.createHabit(testUserId, {
        name: 'Drink Water',
        type: 'NUMERIC',
        targetValue: 8,
        unit: 'glasses',
      }),
      habitsService.createHabit(testUserId, {
        name: 'Read 30 mins',
        type: 'BOOLEAN',
      }),
    ]);

    console.log(`✅ Created ${habits.length} habits`);
    habits.forEach((h) => console.log(`   - ${h.name}`));

    // Seed sleep logs
    console.log('\n😴 Creating test sleep logs...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sleepLogs = await Promise.all([
      sleepService.createSleepLog(testUserId, {
        date: today.toISOString(),
        bedtime: new Date(today.getTime() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
        wakeTime: today.toISOString(),
        durationHours: 8,
        quality: 4,
        notes: 'Today sleep log',
        status: 'done',
      }),
      sleepService.createSleepLog(testUserId, {
        date: yesterday.toISOString(),
        bedtime: new Date(yesterday.getTime() - 9 * 60 * 60 * 1000).toISOString(),
        wakeTime: yesterday.toISOString(),
        durationHours: 7,
        quality: 3,
        notes: 'Yesterday sleep log',
        status: 'done',
      }),
    ]);

    console.log(`✅ Created ${sleepLogs.length} sleep logs`);

    // Test the daily endpoints
    console.log('\n🧪 Testing daily endpoints...');
    const todayHabits = await habitsService.getTodayHabits(testUserId);
    console.log(`✅ GET /habits/today returned: ${todayHabits.habits.length} habits`);

    const todaySleep = await sleepService.getTodaySleepLogs(testUserId);
    console.log(`✅ GET /sleep/today/logs returned: ${todaySleep.logs.length} logs`);

    console.log('\n✨ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  }

  await app.close();
}

seed();
