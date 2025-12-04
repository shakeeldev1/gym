import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto, RegisterDto } from './dto/registerUser.dto';
import bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService
    ) { }

    async registerUser(registerUserDto: RegisterDto) {

        const existingUser = await this.userService.findByEmail(registerUserDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

        const otp = crypto.randomInt(100000, 999999).toString();
        const expiryMinutes = this.configService.get<number>('OTP_EXPIRATION') || 5;
        const otpExpire = new Date(Date.now() + expiryMinutes * 60000);

        const user = await this.userService.createUser({
            ...registerUserDto,
            password: hashedPassword,
            otp,
            otpExpire,
            isVerified: false
        });

        await this.mailService.sendMail(
            user.email,
            'Verify your email',
            `<p>Your OTP code is: <b>${otp}</b></p>
     <p>This OTP expires in ${expiryMinutes} minutes.</p>`
        );

        return {
            message: 'Signup successful. OTP sent to email.',
            email: user.email
        };
    }

    async verifyEmail(email: string, otp: string) {
        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (user.isVerified) {
            return { success: true, message: "Already verified" };
        }

        if (!user.otp || user.otp !== otp) {
            throw new UnauthorizedException("Invalid OTP");
        }

        if (!user.otpExpire || user.otpExpire < new Date()) {
            throw new UnauthorizedException("OTP has expired");
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpire = null;
        await user.save();

        const token = await this.jwtService.signAsync({ id: user._id });

        return {
            success: true,
            message: "Email verified successfully",
            token,
        };
    }

    async loginUser(loginDto: LoginDto) {
        const user = await this.userService.findByEmail(loginDto.email);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const payload = { id: user._id };
        const token = await this.jwtService.signAsync(payload);
        return token;
    }

}
