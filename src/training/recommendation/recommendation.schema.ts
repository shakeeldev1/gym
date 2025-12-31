import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type RecommendationDocument = Recommendation & Document;

interface ExerciseDetail {
  exerciseId: Types.ObjectId;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  equipment: string[];
  videoUrl?: string;
  alternateExerciseIds: Types.ObjectId[];
}

@Schema({ timestamps: true })
export class Recommendation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedBy?: Types.ObjectId; // Coach who modified this

  @Prop({ type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true })
  status: string;

  @Prop({ type: String, default: 'Auto-generated personalized program' })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Number, default: 60 })
  duration: number; // minutes

  @Prop({ type: [Object], default: [] })
  exercises: ExerciseDetail[];

  @Prop()
  notes?: string;

  @Prop()
  coachNotes?: string;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Date })
  approvedAt?: Date;

  @Prop({ type: Date })
  rejectedAt?: Date;

  @Prop({ type: Object })
  userProfileSnapshot?: {
    experienceLevel: string;
    availableEquipment: string[];
    injuries: string[];
    preferredDaysPerWeek: number;
    sessionLengthMinutes: number;
  };
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);
RecommendationSchema.index({ userId: 1, status: 1 });
RecommendationSchema.index({ userId: 1, createdAt: -1 });
