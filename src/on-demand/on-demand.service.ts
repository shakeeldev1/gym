import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OnDemandVideo, OnDemandVideoDocument } from './schemas/on-demand-video.schema';

@Injectable()
export class OnDemandService {
  constructor(
    @InjectModel(OnDemandVideo.name)
    private videoModel: Model<OnDemandVideoDocument>,
  ) {}

  async getVideos(category?: string): Promise<OnDemandVideo[]> {
    const filter: any = { isActive: true };
    if (category && category !== 'All') filter.category = category;
    return this.videoModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async getById(id: string): Promise<OnDemandVideo> {
    const video = await this.videoModel.findById(id);
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async logWorkout(id: string, body?: any): Promise<{ message: string }> {
    // Increment view count and optionally record metadata from body
    await this.videoModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    // TODO: If workout logs collection exists, save details (duration, device, etc.)
    // For now, accept and ignore body to preserve payload coming from clients.

    return { message: 'Workout logged' };
  }

  async seed(): Promise<{ message: string; count: number }> {
    const count = await this.videoModel.countDocuments();
    if (count > 0) return { message: 'Videos already seeded', count };

    const videos: Partial<OnDemandVideo>[] = [
      { title: 'Full Body Strength Blast', description: 'Complete strength training session targeting all major muscle groups.', videoUrl: 'https://example.com/videos/strength-blast.mp4', thumbnailUrl: '', category: 'Strength', difficulty: 'intermediate', duration: 45, caloriesBurn: 400, instructor: 'Coach Mike', equipment: ['dumbbells'], tags: ['strength', 'full_body'] },
      { title: 'HIIT Cardio Crusher', description: 'High intensity interval training to maximize your cardio fitness.', videoUrl: 'https://example.com/videos/hiit-cardio.mp4', thumbnailUrl: '', category: 'HIIT', difficulty: 'advanced', duration: 30, caloriesBurn: 450, instructor: 'Coach Sarah', equipment: [], tags: ['hiit', 'cardio', 'no_equipment'] },
      { title: 'Morning Yoga Flow', description: 'Gentle yoga flow to start your day with energy and flexibility.', videoUrl: 'https://example.com/videos/yoga-flow.mp4', thumbnailUrl: '', category: 'Yoga', difficulty: 'beginner', duration: 20, caloriesBurn: 150, instructor: 'Coach Lisa', equipment: ['yoga_mat'], tags: ['yoga', 'morning', 'flexibility'] },
      { title: 'Core Power', description: 'Intense core workout for abs, obliques, and lower back.', videoUrl: 'https://example.com/videos/core-power.mp4', thumbnailUrl: '', category: 'Core', difficulty: 'intermediate', duration: 25, caloriesBurn: 250, instructor: 'Coach Alex', equipment: [], tags: ['core', 'abs'] },
      { title: 'Cardio Dance Party', description: 'Fun dance-based cardio workout.', videoUrl: 'https://example.com/videos/dance-cardio.mp4', thumbnailUrl: '', category: 'Cardio', difficulty: 'beginner', duration: 35, caloriesBurn: 350, instructor: 'Coach Jade', equipment: [], tags: ['cardio', 'dance', 'fun'] },
      { title: 'Total Body Stretching', description: 'Deep stretch routine for improved flexibility and recovery.', videoUrl: 'https://example.com/videos/stretching.mp4', thumbnailUrl: '', category: 'Stretching', difficulty: 'beginner', duration: 20, caloriesBurn: 80, instructor: 'Coach Lisa', equipment: ['yoga_mat'], tags: ['stretching', 'recovery'] },
      { title: 'Full Body Burn', description: 'Combination of strength and cardio for total body conditioning.', videoUrl: 'https://example.com/videos/full-body.mp4', thumbnailUrl: '', category: 'Full Body', difficulty: 'intermediate', duration: 40, caloriesBurn: 400, instructor: 'Coach Mike', equipment: ['dumbbells', 'mat'], tags: ['full_body', 'conditioning'] },
    ];

    const created = await this.videoModel.insertMany(videos);
    return { message: 'Videos seeded', count: created.length };
  }
}
