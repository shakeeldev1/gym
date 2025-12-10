import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type programDocument = Program & Document;

@Schema({ timestamps: true })
export class Program {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop()
    description?: string;

    @Prop({ type: String })
    coachId?: string;

    @Prop({ default: false })
    isAiGenerated: boolean;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Workout" }], default: [] })
    workouts: Types.ObjectId[];

    @Prop({ type: [String], default: [] })
    tags?: string[];

    @Prop()
    durationWeeks?: number;

    @Prop({ type: Types.ObjectId, ref: 'User', default: null })
    assignedTo?: string;

}

export const ProgramSchema = SchemaFactory.createForClass(Program);