import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/registerUser.dto';
import { LoginDto } from './dto/login.dto';
import bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) {
        this.googleClient = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID || this.configService.get<string>('GOOGLE_CLIENT_ID')
        );
    }

    private googleClient: OAuth2Client;

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

        const token = await this.jwtService.signAsync({ id: user._id, role: user.role });

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
        if (!user.isVerified) {
            await this.userService.deleteUser(user._id.toString());
            throw new UnauthorizedException("Invalid credentials. User account has been deleted. Please signup again.");
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid credentials");
        }
        const payload = { id: user._id, role: user.role };
        const token = await this.jwtService.signAsync(payload);
        return token;
    }

    async googleLogin(idToken: string) {
        const ticket = await this.googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID || this.configService.get<string>('GOOGLE_CLIENT_ID'),
        });

        const payload = ticket.getPayload();
        if (!payload) {
            throw new UnauthorizedException('Invalid Google token');
        }

        const { sub, email, email_verified, name, picture, given_name, family_name } = payload as any;

        if (!email_verified) {
            throw new UnauthorizedException('Google email not verified');
        }

        let user = await this.userService.findByEmail(email);

        const firstName = given_name || (name ? String(name).split(' ')[0] : '');
        const lastName = family_name || (name ? String(name).split(' ').slice(1).join(' ') || '' : '');

        // First time Google login → create base user then link Google
        if (!user) {
            const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
            user = await this.userService.createUser({
                fName: firstName || 'Google',
                lName: lastName || 'User',
                email,
                password: randomPassword,
                otp: null,
                otpExpire: null,
            } as any);
            user.googleId = sub;
            user.authProvider = 'google';
            user.isVerified = true;
            await (user as any).save();
        }

        if (!user.googleId) {
            user.googleId = sub;
            user.authProvider = 'google';
            user.isVerified = true;
            await (user as any).save();
        }

        const token = await this.jwtService.signAsync({ id: (user as any)._id, role: (user as any).role });
        return { token, user };
    }

    async validateGoogleUser(params: {
        googleId: string;
        email: string;
        firstName: string;
        lastName: string;
        picture?: string;
    }) {
        const { googleId, email, firstName, lastName } = params;
        let user = await this.userService.findByEmail(email);

        if (!user) {
            const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
            user = await this.userService.createUser({
                fName: firstName || 'Google',
                lName: lastName || 'User',
                email,
                password: randomPassword,
                otp: null,
                otpExpire: null,
            } as any);
            user.googleId = googleId;
            user.authProvider = 'google';
            user.isVerified = true;
            await (user as any).save();
        }

        if (!user.googleId) {
            user.googleId = googleId;
            user.authProvider = 'google';
            user.isVerified = true;
            await (user as any).save();
        }

        return user;
    }

    async createJwtForUser(user: any) {
        return this.jwtService.signAsync({ id: (user as any)._id, role: (user as any).role });
    }

    async facebookLogin(accessToken: string) {
        const appId = process.env.FACEBOOK_APP_ID || this.configService.get<string>('FACEBOOK_APP_ID');
        const appSecret = process.env.FACEBOOK_APP_SECRET || this.configService.get<string>('FACEBOOK_APP_SECRET');

        try {
            const response = await fetch(
                `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`
            );
            const data = await response.json();

            if (!data.data || !data.data.is_valid) {
                throw new UnauthorizedException('Invalid Facebook access token');
            }
            const profileResponse = await fetch(
                `https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${accessToken}`
            );
            const profile = await profileResponse.json();

            if (!profile.email) {
                throw new UnauthorizedException('Facebook account must have an email address');
            }

            const { id, email, first_name, last_name, picture } = profile;
            const userEmail = email || `facebook_${id}@placeholder.local`;
            let user = await this.userService.findByEmail(userEmail);
            if (!user) {
                const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
                user = await this.userService.createUser({
                    fName: first_name || 'Facebook',
                    lName: last_name || 'User',
                    email: userEmail,
                    password: randomPassword,
                    otp: null,
                    otpExpire: null,
                } as any);
                (user as any).facebookId = id;
                (user as any).authProvider = 'facebook';
                user.isVerified = true;
                await (user as any).save();
            }
            if (!(user as any).facebookId) {
                (user as any).facebookId = id;
                (user as any).authProvider = 'facebook';
                user.isVerified = true;
                await (user as any).save();
            }

            const token = await this.jwtService.signAsync({ id: (user as any)._id, role: (user as any).role });
            return { token, user };
        } catch (error) {
            throw new UnauthorizedException('Failed to verify Facebook access token');
        }
    }

    async validateFacebookUser(params: {
        facebookId: string;
        email: string;
        firstName: string;
        lastName: string;
        picture?: string;
    }) {
        const { facebookId, email, firstName, lastName } = params;
        let user = await this.userService.findByEmail(email);

        if (!user) {
            const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
            user = await this.userService.createUser({
                fName: firstName || 'Facebook',
                lName: lastName || 'User',
                email,
                password: randomPassword,
                otp: null,
                otpExpire: null,
            } as any);
            (user as any).facebookId = facebookId;
            (user as any).authProvider = 'facebook';
            user.isVerified = true;
            await (user as any).save();
        }

        if (!(user as any).facebookId) {
            (user as any).facebookId = facebookId;
            (user as any).authProvider = 'facebook';
            user.isVerified = true;
            await (user as any).save();
        }

        return user;
    }

}
