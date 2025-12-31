import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Gender, ActivityLevel, WorkoutStyle, Goal } from '../enums/user-profile.enums';
import { User } from './user.schema';

export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema({ timestamps: true })
export class UserProfile {
    @Prop({ type: String, enum: Gender, required: true })
    gender: Gender;

    @Prop({ type: Number, required: true })
    age: number;

    @Prop({ type: Number, required: true })
    weight: number;

    @Prop({ type: String, enum: ActivityLevel, required: true })
    activityLevel: ActivityLevel;

    @Prop({ type: String, enum: WorkoutStyle, required: true })
    workoutStyle: WorkoutStyle;

    @Prop({ type: String, enum: Goal, required: true })
    goal: Goal;

    @Prop({ type: String })
    profilePicture?: string;

    @Prop({ type: String })
    notes?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    userId: mongoose.Types.ObjectId;

    // Recommendation fields
    @Prop({ type: [String], default: [] })
    availableEquipment: string[]; // ['bodyweight', 'dumbbell', 'barbell', 'kettlebell', 'band', 'machine']

    @Prop({ type: [String], default: [] })
    injuries: string[]; // ['knee', 'shoulder', 'back', 'wrist', 'hip', 'ankle']

    @Prop({ type: Number, default: 3 })
    preferredDaysPerWeek: number;

    @Prop({ type: Number, default: 45 })
    sessionLengthMinutes: number;

    @Prop({ type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
    experienceLevel: string;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
