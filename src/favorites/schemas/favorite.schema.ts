import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  itemId: string;

  @Prop({ required: true, enum: ['workout', 'meal', 'article', 'recipe', 'exercise', 'video'] })
  type: string;

  @Prop({ type: Object })
  metadata: Record<string, any>; // Cache item details for quick display
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
FavoriteSchema.index({ userId: 1, type: 1 });
FavoriteSchema.index({ userId: 1, itemId: 1, type: 1 }, { unique: true });
