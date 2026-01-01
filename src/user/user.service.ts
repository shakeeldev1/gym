import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterDto } from 'src/auth/dto/registerUser.dto';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { ChangePasswordDto } from './dto/changePassword';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from 'src/auth/mail.service';
import { UserProfileService } from './user-profile.service';
import { Fasting } from '../fasting/schemas/fasting.schema';
import { Habit } from '../habits/schemas/habit.schema';
import { HabitLog } from '../habits/schemas/habit-log.schema';
import { Meditation } from '../mindset-recovery/schemas/meditation.schema';
import { Sleep } from '../mindset-recovery/schemas/sleep.schema';
import { Breathwork } from '../mindset-recovery/schemas/breathwork.schema';
import { Meal } from '../nutrition/meal/schemas/meal.schema';
import { NutritionGoal } from '../nutrition/nutrition-goal/schemas/nutrition-goal.schema';
import { Session } from '../training/session/schemas/session.schema';
import { WorkoutBlock } from '../training/workout/schemas/workout-block.schema';
import { WorkoutSet } from '../training/workout/schemas/workout-set.schema';
import { Performance } from '../training/performance/schemas/performance.schema';
import { Report } from '../reports/schemas/report.schema';
import { UserIntegration } from '../integrations/schemas/user-integration.schema';
import { Recommendation } from '../training/recommendation/recommendation.schema';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Fasting.name) private fastingModel: Model<Fasting>,
        @InjectModel(Habit.name) private habitModel: Model<Habit>,
        @InjectModel(HabitLog.name) private habitLogModel: Model<HabitLog>,
        @InjectModel(Meditation.name) private meditationModel: Model<Meditation>,
        @InjectModel(Sleep.name) private sleepModel: Model<Sleep>,
        @InjectModel(Breathwork.name) private breathworkModel: Model<Breathwork>,
        @InjectModel(Meal.name) private mealModel: Model<Meal>,
        @InjectModel(NutritionGoal.name) private nutritionGoalModel: Model<NutritionGoal>,
        @InjectModel(Session.name) private sessionModel: Model<Session>,
        @InjectModel(WorkoutBlock.name) private workoutBlockModel: Model<WorkoutBlock>,
        @InjectModel(WorkoutSet.name) private workoutSetModel: Model<WorkoutSet>,
        @InjectModel(Performance.name) private performanceModel: Model<Performance>,
        @InjectModel(Report.name) private reportModel: Model<Report>,
        @InjectModel(UserIntegration.name) private userIntegrationModel: Model<UserIntegration>,
        @InjectModel(Recommendation.name) private recommendationModel: Model<Recommendation>,
        private readonly profileService: UserProfileService,
        private readonly mailService: MailService
    ) { }

    async createUser(registerUserDto: RegisterDto) {
        try {
            return await this.userModel.create({
                fName: registerUserDto.fName,
                lName: registerUserDto.lName,
                email: registerUserDto.email,
                password: registerUserDto.password,
                otp: registerUserDto.otp,
                otpExpire: registerUserDto.otpExpire
            });
        } catch (error: unknown) {
            const e = error as { code?: number };
            const DUPELICATE_KEY_ERROR_CODE = 11000;
            if (e.code === DUPELICATE_KEY_ERROR_CODE) {
                throw new ConflictException('Email already exists');
            } else {
                throw error;
            }
        }
    }

    async findByEmail(email: string) {
        return this.userModel.findOne({ email });
    }

    async findUserById(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new UnauthorizedException('Invalid user id');
        }
        const objectId = new Types.ObjectId(id);
        const user = await this.userModel.findOne({ _id: objectId });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const { password, otp, ...safeUser } = user.toObject();
        const profile = await this.profileService.getProfile(objectId);
        return profile ? { user: safeUser, profile } : { user: safeUser };
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Old password is incorrect');
        }
        const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();
        return { message: 'Password changed successfully' };
    }

    async requestPasswordReset(email: string) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const token = crypto.randomInt(100000, 999999).toString();
        const expiry = new Date(Date.now() + 15 * 60000);
        user.resetOtp = token;
        user.resetOtpExpire = expiry;
        await user.save();
        await this.mailService.sendMail(
            user.email,
            'Password Reset Request',
            `<p>Your password reset OTP code is: <b>${token}</b></p>
     <p>This OTP expires in 15 minutes.</p>`
        );
        return { message: 'Password reset OTP sent to email' };
    }

    async resetPassword(email: string, resetOtp: string, newPassword: string) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        if (!user.resetOtp || user.resetOtp !== resetOtp) {
            throw new UnauthorizedException('Invalid OTP');
        }
        if (!user.resetOtpExpire || user.resetOtpExpire < new Date()) {
            throw new UnauthorizedException('OTP has expired');
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        user.resetOtp = null;
        user.resetOtpExpire = null;
        await user.save();
        return { message: 'Password has been reset successfully' };
    }

    async getAllUsers(role?: string) {
        const matchStage = role ? { role } : {};
        const result = await this.userModel.aggregate([
            {
                $match: matchStage
            },
            {
                $lookup: {
                    from: 'userprofiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile'
                },
            },
            {
                $unwind: {
                    path: '$profile',
                    preserveNullAndEmptyArrays: true,
                }
            },
            {
                $project: {
                    password: 0,
                    resetOtp: 0,
                    resetOtpExpire: 0,
                    otp: 0,
                    otpExpire: 0
                }
            },
            {
                $facet: {
                    data: [{ $match: {} }],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ]);
        const users = result[0].data;
        const total = result[0].totalCount[0]?.count || 0;
        return { total, users };
    }

    async deleteUser(userId: string) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new UnauthorizedException('Invalid user id');
        }
        const objectId = new Types.ObjectId(userId);
        
        // Check if user exists
        const user = await this.userModel.findById(objectId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        try {
            // Delete all user-related data in parallel for better performance
            await Promise.all([
                // Delete user profile
                this.profileService.deleteProfile(objectId),
                
                // Delete fasting records
                this.fastingModel.deleteMany({ user: objectId }),
                
                // Delete habit logs
                this.habitLogModel.deleteMany({ user: objectId }),
                
                // Delete meditation records
                this.meditationModel.deleteMany({ user: objectId }),
                
                // Delete sleep records
                this.sleepModel.deleteMany({ user: objectId }),
                
                // Delete breathwork records
                this.breathworkModel.deleteMany({ user: objectId }),
                
                // Delete meal records
                this.mealModel.deleteMany({ user: objectId }),
                
                // Delete nutrition goals
                this.nutritionGoalModel.deleteMany({ user: objectId }),
                
                // Delete training sessions
                this.sessionModel.deleteMany({ user: objectId }),
                
                // Delete workout blocks
                this.workoutBlockModel.deleteMany({ user: objectId }),
                
                // Delete workout sets
                this.workoutSetModel.deleteMany({ user: objectId }),
                
                // Delete performance records
                this.performanceModel.deleteMany({ user: objectId }),
                
                // Delete reports where user is coach
                this.reportModel.deleteMany({ coach: objectId }),
                
                // Delete user integrations
                this.userIntegrationModel.deleteMany({ userId: objectId }),
                
                // Delete recommendations
                this.recommendationModel.deleteMany({ userId: objectId }),
            ]);

            // Also remove user from athletes array in reports
            await this.reportModel.updateMany(
                { athletes: objectId },
                { $pull: { athletes: objectId } }
            );

            // Finally, delete the user account
            await this.userModel.findByIdAndDelete(objectId);
            
            return { message: 'User account and all related data have been deleted successfully' };
        } catch (error) {
            console.error('Error deleting user and related data:', error);
            throw new UnauthorizedException('Failed to delete user account');
        }
    }

    async updateUserRole(userId: string, role: string) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new UnauthorizedException('Invalid user id');
        }
        const objectId = new Types.ObjectId(userId);
        const validRoles = ['user', 'admin', 'coach'];
        if (!validRoles.includes(role)) {
            throw new UnauthorizedException(`Invalid role. Valid roles are: ${validRoles.join(', ')}`);
        }
        const user = await this.userModel.findByIdAndUpdate(
            objectId,
            { role },
            { new: true }
        );
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const { password, otp, resetOtp, resetOtpExpire, otpExpire, ...safeUser } = user.toObject();
        return { message: 'User role updated successfully', user: safeUser };
    }
}