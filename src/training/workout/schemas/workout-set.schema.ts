import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WorkoutSetDocument = WorkoutSet & Document;

@Schema({ timestamps: true })
export class WorkoutSet {
    @Prop()
    setNumber?: number;

    @Prop()
    reps?: number;

    @Prop()
    weight?: number;

    @Prop()
    repsInReverse?: number;

    @Prop()
    restTime?: number;

    @Prop()
    tempo?: string;

    @Prop({ default: false })
    isAMRAP?: boolean;

    @Prop()
    autoSuggestedWeight?: number;

    @Prop({ default: false })
    completed?: boolean;
}

export const WorkoutSetSchema = SchemaFactory.createForClass(WorkoutSet);
