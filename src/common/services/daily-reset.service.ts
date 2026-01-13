import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Service to handle daily reset logic for recurring tasks
 * This ensures that tasks reset each day at midnight (00:00)
 * Includes automatic cron job to reset all modules daily
 */
@Injectable()
export class DailyResetService {
  private resetCallbacks: Array<() => Promise<void>> = [];

  /**
   * Register a callback to be executed at midnight
   */
  registerResetCallback(callback: () => Promise<void>) {
    this.resetCallbacks.push(callback);
  }

  /**
   * Cron job that runs every day at midnight (00:00)
   * Triggers all registered reset callbacks
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyReset() {
    console.log(`🕛 Daily Reset triggered at ${new Date().toISOString()}`);
    
    for (const callback of this.resetCallbacks) {
      try {
        await callback();
      } catch (error) {
        console.error('❌ Error in daily reset callback:', error);
      }
    }
    
    console.log(`✅ Daily Reset completed for ${this.resetCallbacks.length} modules`);
  }

  /**
   * Check if a date is today
   */
  isToday(date: Date | string): boolean {
    const providedDate = new Date(date);
    const today = new Date();
    return (
      providedDate.getFullYear() === today.getFullYear() &&
      providedDate.getMonth() === today.getMonth() &&
      providedDate.getDate() === today.getDate()
    );
  }

  /**
   * Check if a date is in the past
   */
  isPast(date: Date | string): boolean {
    const providedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    providedDate.setHours(0, 0, 0, 0);
    return providedDate < today;
  }

  /**
   * Get today's date at midnight UTC
   */
  getTodayMidnight(): Date {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Get tomorrow's date at midnight UTC
   */
  getTomorrowMidnight(): Date {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Get date range for today
   */
  getTodayDateRange(): { start: Date; end: Date } {
    const start = this.getTodayMidnight();
    const end = this.getTomorrowMidnight();
    return { start, end };
  }

  /**
   * Format date to YYYY-MM-DD string
   */
  formatDateToString(date: Date | string): string {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get date range for a specific month
   */
  getMonthDateRange(year: number, month: number): { start: Date; end: Date } {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    return { start, end };
  }

  /**
   * Check if task should be shown as incomplete for a new day
   * Used to reset completed tasks for recurring activities
   */
  shouldResetTask(lastCompletedDate: Date | string): boolean {
    return !this.isToday(lastCompletedDate);
  }

  /**
   * Get days since date
   */
  getDaysSince(date: Date | string): number {
    const providedDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - providedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Get milliseconds until next midnight
   */
  getMillisecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - now.getTime();
  }
}
