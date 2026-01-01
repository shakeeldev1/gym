import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { 
    MeasurementSystem,
    EmotionalCommitmentLevel,
    PregnancyStatus,
    EatingStyle,
    CurrentExerciseLevel,
    PreferredTrainingLocation,
    AccountabilityBuddyPreference,
    SupportLevelPreference,
    // Legacy enums
    Gender,
    ActivityLevel,
    WorkoutStyle,
    Goal,
    StressSource,
    ExercisePreference,
    SupportLevel
} from '../enums/user-profile.enums';
import { User } from './user.schema';

export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema({ timestamps: true })
export class UserProfile {
    // YOUR DETAILS SECTION
    @Prop({ type: String, required: true })
    fullName: string;

    @Prop({ type: Date })
    dateOfBirth?: Date;

    @Prop({ type: String, enum: MeasurementSystem, default: MeasurementSystem.Metric })
    measurementSystem: MeasurementSystem;

    @Prop({ type: String, enum: Gender })
    gender?: Gender;

    @Prop({ type: Number })
    height?: number; // in cm or inches

    @Prop({ type: Number })
    weight?: number; // in kg or lbs

    @Prop({ type: [String], default: [] })
    mainGoals: string[]; // weight loss, muscle gain, strength, endurance, flexibility, overall health, energy, confidence

    @Prop({ type: String, enum: EmotionalCommitmentLevel, default: EmotionalCommitmentLevel.Moderate })
    emotionalCommitmentLevel: EmotionalCommitmentLevel;

    @Prop({ type: Number })
    expectedWeightLossGoal?: number; // in kg or lbs

    // PERSONAL & LIFESTYLE SECTION
    @Prop({ type: String, enum: PregnancyStatus, default: PregnancyStatus.No })
    pregnancyStatus: PregnancyStatus;

    @Prop({ type: [String], default: [] })
    stressSource: string[]; // work, family, relationships, finances, health, other

    @Prop({ type: [String], default: [] })
    stressManagementTechniques: string[]; // meditation, exercise, yoga, journaling, breathing, nature, hobbies, sleep

    @Prop({ type: Number })
    sleepHoursPerNight?: number;

    @Prop({ type: Number })
    householdSize?: number;

    @Prop({ type: String })
    additionalInfo?: string;

    // NUTRITION SECTION
    @Prop({ type: String, enum: EatingStyle })
    eatingStyle?: EatingStyle;

    @Prop({ type: String })
    typicalDayOfEating?: string;

    @Prop({ type: String })
    favoriteFood?: string;

    @Prop({ type: [String], default: [] })
    foodAllergiesIntolerances: string[]; // dairy, gluten, nuts, shellfish, eggs, soy, none

    @Prop({ type: String })
    currentMedications?: string;

    @Prop({ type: [String], default: [] })
    medicalConditions: string[]; // diabetes, hypertension, heart disease, thyroid, arthritis, asthma, none

    // EXERCISE & MOVEMENT SECTION
    @Prop({ type: String, enum: CurrentExerciseLevel })
    currentExerciseLevel?: CurrentExerciseLevel;

    @Prop({ type: String })
    typicalWorkoutRoutine?: string;

    @Prop({ type: [String], default: [] })
    enjoyedExerciseTypes: string[]; // running, strength training, yoga, pilates, cycling, swimming, sports, walking

    @Prop({ type: [String], default: [] })
    dislikedExerciseTypes: string[]; // same options

    @Prop({ type: [String], default: [] })
    exerciseRestrictions: string[]; // knee pain, shoulder pain, back pain, hip pain, ankle pain, none

    @Prop({ type: Number, min: 0, max: 7, default: 3 })
    trainingDaysPerWeek: number;

    @Prop({ type: String, enum: PreferredTrainingLocation })
    preferredTrainingLocation?: PreferredTrainingLocation;

    @Prop({ type: Number, default: 45 })
    sessionLengthMinutes: number;

    // SUPPORT & ACCOUNTABILITY SECTION
    @Prop({ type: [String], default: [] })
    pastBarriersToGoals: string[]; // time, motivation, money, health, social pressure, work stress, family, other

    @Prop({ type: [String], default: [] })
    motivationFactors: string[]; // results, health, confidence, community, coach support, competition, progress tracking

    @Prop({ type: String, enum: AccountabilityBuddyPreference, default: AccountabilityBuddyPreference.No })
    accountabilityBuddyPreference: AccountabilityBuddyPreference;

    @Prop({ type: String, enum: SupportLevelPreference, default: SupportLevelPreference.Moderate })
    supportLevelPreference: SupportLevelPreference;

    @Prop({ type: String })
    additionalNotes?: string;

    // SYSTEM FIELDS
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    userId: mongoose.Types.ObjectId;

    // LEGACY FIELDS FOR BACKWARD COMPATIBILITY
    @Prop({ type: Number })
    age?: number;

    @Prop({ type: [String], default: [] })
    availableEquipment: string[];

    @Prop({ type: [String], default: [] })
    injuries: string[];

    @Prop({ type: Number, default: 3 })
    preferredDaysPerWeek: number;

    @Prop({ type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
    experienceLevel: string;

    @Prop({ type: String, enum: ActivityLevel })
    activityLevel?: ActivityLevel;

    @Prop({ type: String, enum: WorkoutStyle })
    workoutStyle?: WorkoutStyle;

    @Prop({ type: String, enum: Goal })
    goal?: Goal;

    @Prop({ type: String, enum: StressSource })
    primaryStressSource?: StressSource;

    @Prop({ type: String, enum: ExercisePreference })
    preferredExerciseLocation?: ExercisePreference;

    @Prop({ type: String, enum: SupportLevel })
    preferredSupportLevelLegacy?: SupportLevel;

    @Prop({ type: String })
    profilePicture?: string;

    @Prop({ type: String })
    notes?: string;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
