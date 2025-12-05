import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Gender, ActivityLevel, WorkoutStyle, Goal } from '../enums/user-profile.enums';

export class CreateUserProfileDto {
    @IsEnum(Gender)
    gender: Gender;

    @IsNumber()
    age: number;

    @IsNumber()
    weight: number;

    @IsEnum(ActivityLevel)
    activityLevel: ActivityLevel;

    @IsEnum(WorkoutStyle)
    workoutStyle: WorkoutStyle;

    @IsEnum(Goal)
    goal: Goal;

    @IsOptional()
    @IsString()
    profilePicture?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    userId: string;
}
