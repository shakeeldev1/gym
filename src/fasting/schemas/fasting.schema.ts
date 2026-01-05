import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FastingDocument = Fasting & Document;

@Schema({ timestamps: true })
export class Fasting {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  startTime: Date;

  @Prop()
  endTime?: Date;

  @Prop()
  goalDurationHours?: number; 

  @Prop()
  actualDurationHours?: number;

  @Prop()
  goalHours?: number;

  @Prop()
  notes?: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ enum: ['planned', 'done', 'missed', 'skipped'], default: 'planned' })
  status: string;
}

export const FastingSchema = SchemaFactory.createForClass(Fasting);
