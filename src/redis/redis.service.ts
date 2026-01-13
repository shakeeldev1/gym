import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private isConnected = false;
  private readonly logger = new Logger('RedisService');

  async onModuleInit() {
    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        enableOfflineQueue: false,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('✅ Connected to Redis');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        this.logger.warn('⚠️ Redis Connection Error (app will work without offline queuing):', err.message);
      });

      this.client.on('reconnecting', () => {
        this.logger.warn('🔄 Reconnecting to Redis...');
      });

      this.client.on('close', () => {
        this.isConnected = false;
        this.logger.warn('Redis connection closed');
      });
    } catch (error) {
      this.logger.warn('⚠️ Failed to initialize Redis:', error.message);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
        this.logger.log('Redis connection closed gracefully');
      } catch (error) {
        this.logger.warn('Error closing Redis connection:', error.message);
      }
    }
  }

  /**
   * Check if Redis is available
   */
  private isRedisAvailable(): boolean {
    return this.client !== null && this.isConnected;
  }

  // ==================== USER ONLINE STATUS ====================

  async setUserOnline(userId: string, socketId: string): Promise<void> {
    if (!this.isRedisAvailable()) return;
    try {
      const key = `user:${userId}:online`;
      await this.client!.set(key, socketId, 'EX', 24 * 60 * 60);
      await this.client!.sadd('users:online', userId);
    } catch (error) {
      this.logger.warn('Error setting user online:', error.message);
    }
  }

  async setUserOffline(userId: string): Promise<void> {
    if (!this.isRedisAvailable()) return;
    try {
      const key = `user:${userId}:online`;
      await this.client!.del(key);
      await this.client!.srem('users:online', userId);
    } catch (error) {
      this.logger.warn('Error setting user offline:', error.message);
    }
  }

  async isUserOnline(userId: string): Promise<boolean> {
    if (!this.isRedisAvailable()) return true; // Assume online if Redis unavailable
    try {
      const key = `user:${userId}:online`;
      return (await this.client!.exists(key)) === 1;
    } catch (error) {
      this.logger.warn('Error checking user online status:', error.message);
      return true; // Assume online if Redis unavailable
    }
  }

  async getUserSocketId(userId: string): Promise<string | null> {
    if (!this.isRedisAvailable()) return null;
    try {
      const key = `user:${userId}:online`;
      return await this.client!.get(key);
    } catch (error) {
      this.logger.warn('Error getting user socket ID:', error.message);
      return null;
    }
  }

  async getOnlineUsers(): Promise<string[]> {
    if (!this.isRedisAvailable()) return [];
    try {
      return await this.client!.smembers('users:online');
    } catch (error) {
      this.logger.warn('Error getting online users:', error.message);
      return [];
    }
  }

  // ==================== MESSAGE QUEUE ====================

  async queueMessageForUser(userId: string, message: any): Promise<void> {
    if (!this.isRedisAvailable()) {
      this.logger.debug('Redis unavailable - message not queued (will be lost if user offline)');
      return;
    }
    try {
      const key = `queue:${userId}:messages`;
      const queuedMessage = {
        ...message,
        queuedAt: new Date().toISOString(),
      };
      await this.client!.rpush(key, JSON.stringify(queuedMessage));
      await this.client!.expire(key, 7 * 24 * 60 * 60);
    } catch (error) {
      this.logger.warn('Error queueing message:', error.message);
    }
  }

  async getQueuedMessages(userId: string): Promise<any[]> {
    if (!this.isRedisAvailable()) return [];
    try {
      const key = `queue:${userId}:messages`;
      const messages = await this.client!.lrange(key, 0, -1);
      return messages.map(msg => JSON.parse(msg));
    } catch (error) {
      this.logger.warn('Error getting queued messages:', error.message);
      return [];
    }
  }

  async clearQueuedMessages(userId: string): Promise<void> {
    if (!this.isRedisAvailable()) return;
    try {
      const key = `queue:${userId}:messages`;
      await this.client!.del(key);
    } catch (error) {
      this.logger.warn('Error clearing queued messages:', error.message);
    }
  }

  async getQueueLength(userId: string): Promise<number> {
    if (!this.isRedisAvailable()) return 0;
    try {
      const key = `queue:${userId}:messages`;
      return await this.client!.llen(key);
    } catch (error) {
      this.logger.warn('Error getting queue length:', error.message);
      return 0;
    }
  }

  // ==================== TYPING INDICATORS ====================

  async setTypingIndicator(conversationId: string, userId: string): Promise<void> {
    if (!this.isRedisAvailable()) return;
    try {
      const key = `typing:${conversationId}:${userId}`;
      await this.client!.set(key, '1', 'EX', 5);
    } catch (error) {
      this.logger.warn('Error setting typing indicator:', error.message);
    }
  }

  async removeTypingIndicator(conversationId: string, userId: string): Promise<void> {
    if (!this.isRedisAvailable()) return;
    try {
      const key = `typing:${conversationId}:${userId}`;
      await this.client!.del(key);
    } catch (error) {
      this.logger.warn('Error removing typing indicator:', error.message);
    }
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    if (!this.isRedisAvailable()) return [];
    try {
      const pattern = `typing:${conversationId}:*`;
      const keys = await this.client!.keys(pattern);
      return keys.map(key => key.split(':')[2]);
    } catch (error) {
      this.logger.warn('Error getting typing users:', error.message);
      return [];
    }
  }

  // ==================== DELIVERY STATUS ====================

  async markMessageDelivered(messageId: string, userId: string): Promise<void> {
    if (!this.isRedisAvailable()) return;
    try {
      const key = `msg:${messageId}:delivered:${userId}`;
      await this.client!.set(key, '1', 'EX', 30 * 24 * 60 * 60);
    } catch (error) {
      this.logger.warn('Error marking message delivered:', error.message);
    }
  }

  async isMessageDelivered(messageId: string, userId: string): Promise<boolean> {
    if (!this.isRedisAvailable()) return false;
    try {
      const key = `msg:${messageId}:delivered:${userId}`;
      return (await this.client!.exists(key)) === 1;
    } catch (error) {
      this.logger.warn('Error checking message delivery:', error.message);
      return false;
    }
  }

  async markMessageRead(messageId: string, userId: string): Promise<void> {
    if (!this.isRedisAvailable()) return;
    try {
      const key = `msg:${messageId}:read:${userId}`;
      await this.client!.set(key, '1', 'EX', 30 * 24 * 60 * 60);
    } catch (error) {
      this.logger.warn('Error marking message read:', error.message);
    }
  }

  async isMessageRead(messageId: string, userId: string): Promise<boolean> {
    if (!this.isRedisAvailable()) return false;
    try {
      const key = `msg:${messageId}:read:${userId}`;
      return (await this.client!.exists(key)) === 1;
    } catch (error) {
      this.logger.warn('Error checking message read status:', error.message);
      return false;
    }
  }

  // ==================== GENERIC KEY-VALUE ====================

  async get(key: string): Promise<string | null> {
    if (!this.isRedisAvailable()) return null;
    try {
      return await this.client!.get(key);
    } catch (error) {
      this.logger.warn('Error getting key:', error.message);
      return null;
    }
  }

  async set(key: string, value: string, exSeconds?: number): Promise<void> {
    if (!this.isRedisAvailable()) return;
    try {
      if (exSeconds) {
        await this.client!.set(key, value, 'EX', exSeconds);
      } else {
        await this.client!.set(key, value);
      }
    } catch (error) {
      this.logger.warn('Error setting key:', error.message);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isRedisAvailable()) return;
    try {
      await this.client!.del(key);
    } catch (error) {
      this.logger.warn('Error deleting key:', error.message);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isRedisAvailable()) return false;
    try {
      return (await this.client!.exists(key)) === 1;
    } catch (error) {
      this.logger.warn('Error checking key existence:', error.message);
      return false;
    }
  }

  // ==================== ANALYTICS ====================

  async incrementMessageCount(userId: string, date: string): Promise<void> {
    if (!this.isRedisAvailable()) return;
    try {
      const key = `stats:messages:${userId}:${date}`;
      await this.client!.incr(key);
      await this.client!.expire(key, 90 * 24 * 60 * 60);
    } catch (error) {
      this.logger.warn('Error incrementing message count:', error.message);
    }
  }

  async getMessageCount(userId: string, date: string): Promise<number> {
    if (!this.isRedisAvailable()) return 0;
    try {
      const key = `stats:messages:${userId}:${date}`;
      const count = await this.client!.get(key);
      return count ? parseInt(count) : 0;
    } catch (error) {
      this.logger.warn('Error getting message count:', error.message);
      return 0;
    }
  }
}
