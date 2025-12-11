// src/training/session/schemas/session.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'WorkoutBlock' }], default: [] })
  blocks: Types.ObjectId[];

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  notes?: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
