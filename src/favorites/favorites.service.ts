import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';
import { AddFavoriteDto } from './dto/favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name)
    private favoriteModel: Model<FavoriteDocument>,
  ) {}

  async getFavorites(userId: string): Promise<{
    workouts: Favorite[];
    meals: Favorite[];
    articles: Favorite[];
  }> {
    const all = await this.favoriteModel.find({ userId }).sort({ createdAt: -1 }).exec();
    return {
      workouts: all.filter((f) => ['workout', 'exercise', 'video'].includes(f.type)),
      meals: all.filter((f) => ['meal', 'recipe'].includes(f.type)),
      articles: all.filter((f) => f.type === 'article'),
    };
  }

  async addFavorite(userId: string, dto: AddFavoriteDto): Promise<Favorite> {
    try {
      return await this.favoriteModel.create({
        userId,
        itemId: dto.itemId,
        type: dto.type,
        metadata: dto.metadata,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Item already in favorites');
      }
      throw error;
    }
  }

  async removeFavorite(userId: string, itemId: string): Promise<{ message: string }> {
    await this.favoriteModel.findOneAndDelete({ userId, itemId }).exec();
    return { message: 'Removed from favorites' };
  }

  async isFavorite(userId: string, itemId: string): Promise<boolean> {
    const count = await this.favoriteModel.countDocuments({ userId, itemId });
    return count > 0;
  }
}
