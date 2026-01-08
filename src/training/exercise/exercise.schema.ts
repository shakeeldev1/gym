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
    videoPublicId?: string;

    @Prop()
    posterUrl?: string;

    @Prop()
    posterPublicId?: string;

    @Prop()
    isCustom: boolean;

    @Prop({ type: String })
    createdBy?: string;

    // Recommendation fields
    @Prop({ type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
    difficulty: string;

    @Prop({ type: String, enum: ['squat', 'hinge', 'push', 'pull', 'carry', 'core', 'accessory'] })
    movementPattern?: string;

    @Prop({ type: [String], default: [] })
    contraindications: string[]; // ['knee', 'shoulder', 'back', 'wrist']

    @Prop({ type: [String], default: [] })
    goalTags: string[]; // ['strength', 'hypertrophy', 'endurance', 'conditioning']

    @Prop({ type: [String], default: [] })
    progressionPath: string[]; // IDs of easier/harder variants

    @Prop({ type: [String], default: [] })
    alternateExerciseIds: string[]; // IDs of alternate/substitute exercises
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
ExerciseSchema.index({ name: 'text' });