import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProfile, UserProfileDocument } from './schemas/userProfile.schema';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { User } from './schemas/user.schema';

@Injectable()
export class UserProfileService {
    constructor(
        @InjectModel(UserProfile.name)
        private readonly profileModel: Model<UserProfileDocument>,

        @InjectModel(User.name)
        private readonly userModel: Model<User>,
    ) { }

    async createProfile(dto: CreateUserProfileDto): Promise<UserProfile> {
        const profileExists = await this.profileModel.findOne({ userId: dto.userId });

        if (profileExists) {
            throw new BadRequestException('Profile already exists');
        }
        const profile = new this.profileModel(dto);
        return profile.save();
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
            notes
        } = body;
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

        await this.profileModel.findOneAndUpdate(
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
            },
            { new: true, upsert: true, runValidators: true }
        );

        return {
            message: "Profile updated successfully",
        };
    }

}
