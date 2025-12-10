import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type exerciseDocument = Exercise & Document;

@Schema({ timestamps: true })
export class Exercise {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ type: [String], default: [] })
    targetMuscles: string[];

    @Prop({ type: [String], default: [] })
    equipment: string[];

    @Prop()
    description?: string;

    @Prop()
    videoUrl?: string;

    @Prop()
    isCustom: boolean;

    @Prop({ type: String })
    createdBy?: string;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
ExerciseSchema.index({ name: 'text' });