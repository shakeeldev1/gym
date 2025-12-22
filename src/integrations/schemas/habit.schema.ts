import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitDocument = Habit & Document;

@Schema({ timestamps: true })
export class Habit {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    name: string; // e.g., 'Drink Water', 'Meditation'

    @Prop({ default: 0 })
    streak: number;

    @Prop({ default: 0 })
    completion: number; // % of habit completion

    @Prop({ default: true })
    isActive: boolean;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);
