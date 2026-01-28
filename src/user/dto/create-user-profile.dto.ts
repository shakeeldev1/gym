import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsDate, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
    @ApiPropertyOptional({
        description: 'User ID (set by server)',
        example: '507f1f77bcf86cd799439011',
    })
    @IsOptional()
    @IsString()
    userId?: string;

    // YOUR DETAILS SECTION
    @ApiProperty({
        description: 'Full name',
        example: 'John Doe',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiPropertyOptional({
        description: 'Date of birth',
        example: '1990-05-01T00:00:00.000Z',
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    dateOfBirth?: Date;

    @ApiPropertyOptional({
        description: 'Measurement system',
        enum: MeasurementSystem,
        example: 'METRIC',
    })
    @IsOptional()
    @IsEnum(MeasurementSystem)
    measurementSystem?: MeasurementSystem;

    @ApiPropertyOptional({
        description: 'Gender',
        enum: Gender,
        example: 'MALE',
    })
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @ApiPropertyOptional({
        description: 'Height',
        example: 180,
    })
    @IsOptional()
    @IsNumber()
    height?: number;

    @ApiPropertyOptional({
        description: 'Weight',
        example: 75,
    })
    @IsOptional()
    @IsNumber()
    weight?: number;

    @ApiPropertyOptional({
        description: 'Main goals',
        example: ['weight_loss', 'fitness'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    mainGoals?: string[];

    @ApiPropertyOptional({
        description: 'Emotional commitment level',
        enum: EmotionalCommitmentLevel,
        example: 'HIGH',
    })
    @IsOptional()
    @IsEnum(EmotionalCommitmentLevel)
    emotionalCommitmentLevel?: EmotionalCommitmentLevel;

    @ApiPropertyOptional({
        description: 'Expected weight loss goal',
        example: 5,
    })
    @IsOptional()
    @IsNumber()
    expectedWeightLossGoal?: number;

    // PERSONAL & LIFESTYLE SECTION
    @ApiPropertyOptional({
        description: 'Pregnancy status',
        enum: PregnancyStatus,
        example: 'NOT_PREGNANT',
    })
    @IsOptional()
    @IsEnum(PregnancyStatus)
    pregnancyStatus?: PregnancyStatus;

    @ApiPropertyOptional({
        description: 'Stress sources',
        example: ['work', 'family'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    stressSource?: string[];

    @ApiPropertyOptional({
        description: 'Stress management techniques',
        example: ['meditation', 'walking'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    stressManagementTechniques?: string[];

    @ApiPropertyOptional({
        description: 'Sleep hours per night',
        example: 7,
    })
    @IsOptional()
    @IsNumber()
    sleepHoursPerNight?: number;

    @ApiPropertyOptional({
        description: 'Household size',
        example: 3,
    })
    @IsOptional()
    @IsNumber()
    householdSize?: number;

    @ApiPropertyOptional({
        description: 'Additional info',
        example: 'Works night shifts',
    })
    @IsOptional()
    @IsString()
    additionalInfo?: string;

    // NUTRITION SECTION
    @ApiPropertyOptional({
        description: 'Eating style',
        enum: EatingStyle,
        example: 'BALANCED',
    })
    @IsOptional()
    @IsEnum(EatingStyle)
    eatingStyle?: EatingStyle;

    @ApiPropertyOptional({
        description: 'Typical day of eating',
        example: '3 meals and 1 snack',
    })
    @IsOptional()
    @IsString()
    typicalDayOfEating?: string;

    @ApiPropertyOptional({
        description: 'Favorite food',
        example: 'Salmon',
    })
    @IsOptional()
    @IsString()
    favoriteFood?: string;

    @ApiPropertyOptional({
        description: 'Food allergies or intolerances',
        example: ['gluten'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    foodAllergiesIntolerances?: string[];

    @ApiPropertyOptional({
        description: 'Current medications',
        example: 'None',
    })
    @IsOptional()
    @IsString()
    currentMedications?: string;

    @ApiPropertyOptional({
        description: 'Medical conditions',
        example: ['hypertension'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    medicalConditions?: string[];

    // EXERCISE & MOVEMENT SECTION
    @ApiPropertyOptional({
        description: 'Current exercise level',
        enum: CurrentExerciseLevel,
        example: 'INTERMEDIATE',
    })
    @IsOptional()
    @IsEnum(CurrentExerciseLevel)
    currentExerciseLevel?: CurrentExerciseLevel;

    @ApiPropertyOptional({
        description: 'Typical workout routine',
        example: '3x/week strength training',
    })
    @IsOptional()
    @IsString()
    typicalWorkoutRoutine?: string;

    @ApiPropertyOptional({
        description: 'Enjoyed exercise types',
        example: ['strength', 'cycling'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    enjoyedExerciseTypes?: string[];

    @ApiPropertyOptional({
        description: 'Disliked exercise types',
        example: ['running'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    dislikedExerciseTypes?: string[];

    @ApiPropertyOptional({
        description: 'Exercise restrictions',
        example: ['knee pain'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    exerciseRestrictions?: string[];

    @ApiPropertyOptional({
        description: 'Training days per week',
        example: 3,
        minimum: 0,
        maximum: 7,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(7)
    trainingDaysPerWeek?: number;

    @ApiPropertyOptional({
        description: 'Preferred training location',
        enum: PreferredTrainingLocation,
        example: 'GYM',
    })
    @IsOptional()
    @IsEnum(PreferredTrainingLocation)
    preferredTrainingLocation?: PreferredTrainingLocation;

    @ApiPropertyOptional({
        description: 'Session length in minutes',
        example: 60,
        minimum: 5,
        maximum: 180,
    })
    @IsOptional()
    @IsNumber()
    @Min(5)
    @Max(180)
    sessionLengthMinutes?: number;

    // SUPPORT & ACCOUNTABILITY SECTION
    @ApiPropertyOptional({
        description: 'Past barriers to goals',
        example: ['time', 'motivation'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    pastBarriersToGoals?: string[];

    @ApiPropertyOptional({
        description: 'Motivation factors',
        example: ['health', 'confidence'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    motivationFactors?: string[];

    @ApiPropertyOptional({
        description: 'Accountability buddy preference',
        enum: AccountabilityBuddyPreference,
        example: 'YES',
    })
    @IsOptional()
    @IsEnum(AccountabilityBuddyPreference)
    accountabilityBuddyPreference?: AccountabilityBuddyPreference;

    @ApiPropertyOptional({
        description: 'Support level preference',
        enum: SupportLevelPreference,
        example: 'HIGH',
    })
    @IsOptional()
    @IsEnum(SupportLevelPreference)
    supportLevelPreference?: SupportLevelPreference;

    @ApiPropertyOptional({
        description: 'Additional notes',
        example: 'Prefers morning workouts',
    })
    @IsOptional()
    @IsString()
    additionalNotes?: string;

    // LEGACY FIELDS FOR BACKWARD COMPATIBILITY
    @ApiPropertyOptional({
        description: 'Age',
        example: 30,
    })
    @IsOptional()
    @IsNumber()
    age?: number;

    @ApiPropertyOptional({
        description: 'Available equipment',
        example: ['dumbbells'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    availableEquipment?: string[];

    @ApiPropertyOptional({
        description: 'Injuries',
        example: ['shoulder'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    injuries?: string[];

    @ApiPropertyOptional({
        description: 'Preferred days per week',
        example: 4,
    })
    @IsOptional()
    @IsNumber()
    preferredDaysPerWeek?: number;

    @ApiPropertyOptional({
        description: 'Experience level',
        example: 'beginner',
    })
    @IsOptional()
    @IsString()
    experienceLevel?: string;

    @ApiPropertyOptional({
        description: 'Activity level',
        enum: ActivityLevel,
        example: 'MODERATE',
    })
    @IsOptional()
    @IsEnum(ActivityLevel)
    activityLevel?: ActivityLevel;

    @ApiPropertyOptional({
        description: 'Workout style',
        enum: WorkoutStyle,
        example: 'STRENGTH',
    })
    @IsOptional()
    @IsEnum(WorkoutStyle)
    workoutStyle?: WorkoutStyle;

    @ApiPropertyOptional({
        description: 'Primary goal',
        enum: Goal,
        example: 'LOSE_WEIGHT',
    })
    @IsOptional()
    @IsEnum(Goal)
    goal?: Goal;

    @ApiPropertyOptional({
        description: 'Primary stress source',
        enum: StressSource,
        example: 'WORK',
    })
    @IsOptional()
    @IsEnum(StressSource)
    primaryStressSource?: StressSource;

    @ApiPropertyOptional({
        description: 'Preferred exercise location',
        enum: ExercisePreference,
        example: 'GYM',
    })
    @IsOptional()
    @IsEnum(ExercisePreference)
    preferredExerciseLocation?: ExercisePreference;

    @ApiPropertyOptional({
        description: 'Profile picture URL',
        example: 'https://cdn.example.com/profiles/user.jpg',
    })
    @IsOptional()
    @IsString()
    profilePicture?: string;

    @ApiPropertyOptional({
        description: 'Notes',
        example: 'Recovering from knee injury',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}
