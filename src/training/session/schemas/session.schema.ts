import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkoutSessionDocument = WorkoutSession & Document;

@Schema({ timestamps: true })
export class WorkoutSession {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Workout' })
    workoutId?: Types.ObjectId;

    @Prop()
    startTime?: Date;

    @Prop()
    endTime?: Date;

    @Prop({ type: [Object], default: [] })
    completedSets: any[];

    @Prop()
    totalVolume?: number;

    @Prop()
    caloriesBurned?: number;

    @Prop({ default: 0 })
    difficultyRating?: number;
}

export const WorkoutSessionSchema = SchemaFactory.createForClass(WorkoutSession);
