import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterDto } from 'src/auth/dto/registerUser.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { ChangePasswordDto } from './dto/changePassword';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from 'src/auth/mail.service';
import { UserProfileService } from './user-profile.service';

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
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
        const user = await this.userModel.findOne({ _id: id });
        const profile = await this.profileService.getProfile(id);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return {
            user,
            profile
        };
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


}