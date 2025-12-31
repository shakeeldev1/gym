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

        // Auto-generate recommendation on first profile create when we have key fields
        if (dto.experienceLevel && dto.availableEquipment && dto.availableEquipment.length > 0) {
            try {
                await this.recommendationService.autoGenerateRecommendation(dto.userId as any);
            } catch (error) {
                console.error('Failed to auto-generate recommendations on create:', error);
            }
        }

        return saved;
    }

    async updateProfile(userId: string, dto: UpdateUserProfileDto): Promise<UserProfile> {
        const profile = await this.profileModel.findOneAndUpdate({ userId }, dto, { new: true });
        if (!profile) throw new NotFoundException('User Profile not found');
        return profile;
    }

    async getProfile(userId: string | object): Promise<UserProfile | null> {
        const profile = await this.profileModel.findOne({ userId });
        return profile || null;
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

        // Auto-generate recommendations if profile has required fields
        if (experienceLevel && availableEquipment && availableEquipment.length > 0) {
            try {
                await this.recommendationService.autoGenerateRecommendation(userId);
            } catch (error) {
                console.error('Failed to auto-generate recommendations:', error);
                // Don't fail the entire profile update if recommendation generation fails
            }
        }

        return {
            message: "Profile updated successfully",
            profileUpdated: true,
            recommendationGenerated: experienceLevel && availableEquipment?.length > 0,
        };
    }


}
