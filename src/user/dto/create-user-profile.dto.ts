import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
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

export class CreateUserProfileDto {
    // User ID (set by controller from auth token)
    @IsOptional()
    @IsString()
    userId?: string;

    // YOUR DETAILS SECTION
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dateOfBirth?: Date;

    @IsOptional()
    @IsEnum(MeasurementSystem)
    measurementSystem?: MeasurementSystem;

    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @IsOptional()
    @IsNumber()
    height?: number;

    @IsOptional()
    @IsNumber()
    weight?: number;

    @IsOptional()
    @IsArray()
    mainGoals?: string[];

    @IsOptional()
    @IsEnum(EmotionalCommitmentLevel)
    emotionalCommitmentLevel?: EmotionalCommitmentLevel;

    @IsOptional()
    @IsNumber()
    expectedWeightLossGoal?: number;

    // PERSONAL & LIFESTYLE SECTION
    @IsOptional()
    @IsEnum(PregnancyStatus)
    pregnancyStatus?: PregnancyStatus;

    @IsOptional()
    @IsArray()
    stressSource?: string[];

    @IsOptional()
    @IsArray()
    stressManagementTechniques?: string[];

    @IsOptional()
    @IsNumber()
    sleepHoursPerNight?: number;

    @IsOptional()
    @IsNumber()
    householdSize?: number;

    @IsOptional()
    @IsString()
    additionalInfo?: string;

    // NUTRITION SECTION
    @IsOptional()
    @IsEnum(EatingStyle)
    eatingStyle?: EatingStyle;

    @IsOptional()
    @IsString()
    typicalDayOfEating?: string;

    @IsOptional()
    @IsString()
    favoriteFood?: string;

    @IsOptional()
    @IsArray()
    foodAllergiesIntolerances?: string[];

    @IsOptional()
    @IsString()
    currentMedications?: string;

    @IsOptional()
    @IsArray()
    medicalConditions?: string[];

    // EXERCISE & MOVEMENT SECTION
    @IsOptional()
    @IsEnum(CurrentExerciseLevel)
    currentExerciseLevel?: CurrentExerciseLevel;

    @IsOptional()
    @IsString()
    typicalWorkoutRoutine?: string;

    @IsOptional()
    @IsArray()
    enjoyedExerciseTypes?: string[];

    @IsOptional()
    @IsArray()
    dislikedExerciseTypes?: string[];

    @IsOptional()
    @IsArray()
    exerciseRestrictions?: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(7)
    trainingDaysPerWeek?: number;

    @IsOptional()
    @IsEnum(PreferredTrainingLocation)
    preferredTrainingLocation?: PreferredTrainingLocation;

    @IsOptional()
    @IsNumber()
    @Min(5)
    @Max(180)
    sessionLengthMinutes?: number;

    // SUPPORT & ACCOUNTABILITY SECTION
    @IsOptional()
    @IsArray()
    pastBarriersToGoals?: string[];

    @IsOptional()
    @IsArray()
    motivationFactors?: string[];

    @IsOptional()
    @IsEnum(AccountabilityBuddyPreference)
    accountabilityBuddyPreference?: AccountabilityBuddyPreference;

    @IsOptional()
    @IsEnum(SupportLevelPreference)
    supportLevelPreference?: SupportLevelPreference;

    @IsOptional()
    @IsString()
    additionalNotes?: string;

    // LEGACY FIELDS FOR BACKWARD COMPATIBILITY
    @IsOptional()
    @IsNumber()
    age?: number;

    @IsOptional()
    @IsArray()
    availableEquipment?: string[];

    @IsOptional()
    @IsArray()
    injuries?: string[];

    @IsOptional()
    @IsNumber()
    preferredDaysPerWeek?: number;

    @IsOptional()
    @IsString()
    experienceLevel?: string;

    @IsOptional()
    @IsEnum(ActivityLevel)
    activityLevel?: ActivityLevel;

    @IsOptional()
    @IsEnum(WorkoutStyle)
    workoutStyle?: WorkoutStyle;

    @IsOptional()
    @IsEnum(Goal)
    goal?: Goal;

    @IsOptional()
    @IsEnum(StressSource)
    primaryStressSource?: StressSource;

    @IsOptional()
    @IsEnum(ExercisePreference)
    preferredExerciseLocation?: ExercisePreference;

    @IsOptional()
    @IsString()
    profilePicture?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
