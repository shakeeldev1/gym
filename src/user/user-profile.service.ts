import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfile, UserProfileDocument } from './schemas/userProfile.schema';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { User } from './schemas/user.schema';
import { RecommendationService } from '../training/recommendation/recommendation.service';

@Injectable()
export class UserProfileService {
    constructor(
        @InjectModel(UserProfile.name)
        private readonly profileModel: Model<UserProfileDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<User>,

        private readonly recommendationService: RecommendationService,
    ) { }

    async createProfile(dto: CreateUserProfileDto): Promise<UserProfile> {
        const profileExists = await this.profileModel.findOne({ userId: dto.userId });

        if (profileExists) {
            throw new BadRequestException('Profile already exists');
        }
        const profile = new this.profileModel(dto);
        const saved = await profile.save();

        // Auto-generate AI-powered recommendation using comprehensive profile data
        // Trigger if we have sufficient information about goals and exercise preferences
        if (dto.userId && ((dto.mainGoals && dto.mainGoals.length > 0) || dto.currentExerciseLevel)) {
            try {
                console.log('Triggering AI recommendation generation with comprehensive profile...');
                await this.recommendationService.autoGenerateRecommendation(dto.userId as any);
                console.log('AI recommendation generated successfully');
            } catch (error) {
                console.error('Failed to auto-generate AI recommendations on create:', error);
                // Don't fail profile creation if recommendation fails
            }
        }

        return saved;
    }

    async updateProfile(userId: string, dto: UpdateUserProfileDto): Promise<UserProfile> {
        const profile = await this.profileModel.findOneAndUpdate({ userId }, dto, { new: true });
        if (!profile) throw new NotFoundException('User Profile not found');

        // Regenerate AI recommendations on every profile update so the plan stays in sync
        try {
            await this.recommendationService.autoGenerateRecommendation(userId);
        } catch (error) {
            console.error('Failed to regenerate AI recommendations on profile update:', error);
            // Do not block profile update if AI generation fails
        }

        return profile;
    }

    async getProfile(userId: string | object): Promise<UserProfile | null> {
        const profile = await this.profileModel.findOne({ userId });
        return profile || null;
    }

    async deleteProfile(userId: string | object): Promise<void> {
        await this.profileModel.deleteOne({ userId });
    }

    async updateUserAndProfile(userId: string, body: any) {
        const {
            fName,
            lName,
            email,
            phone,
            gender,
            age,
            weight,
            activityLevel,
            workoutStyle,
            goal,
            profilePicture,
            notes,
            availableEquipment,
            injuries,
            experienceLevel,
            preferredDaysPerWeek,
            sessionLengthMinutes,
        } = body;

        // Update user info
        await this.userModel.findByIdAndUpdate(
            userId,
            {
                ...(fName && { fName }),
                ...(lName && { lName }),
                ...(email && { email }),
                ...(phone && { phone }),
            },
            { new: true }
        );

        // Update profile
        const updatedProfile = await this.profileModel.findOneAndUpdate(
            { userId },
            {
                ...(gender && { gender }),
                ...(age && { age }),
                ...(weight && { weight }),
                ...(activityLevel && { activityLevel }),
                ...(workoutStyle && { workoutStyle }),
                ...(goal && { goal }),
                ...(profilePicture && { profilePicture }),
                ...(notes && { notes }),
                ...(availableEquipment && { availableEquipment }),
                ...(injuries && { injuries }),
                ...(experienceLevel && { experienceLevel }),
                ...(preferredDaysPerWeek && { preferredDaysPerWeek }),
                ...(sessionLengthMinutes && { sessionLengthMinutes }),
            },
            { new: true, upsert: true, runValidators: true }
        );

        // Always regenerate AI recommendations after any user/admin/coach update
        try {
            await this.recommendationService.autoGenerateRecommendation(userId);
        } catch (error) {
            console.error('Failed to auto-generate recommendations:', error);
            // Don't fail the entire profile update if recommendation generation fails
        }

        return {
            message: "Profile updated successfully",
            profileUpdated: true,
            recommendationGenerated: true,
        };
    }


}
