import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerUser.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { AuthGuard as GoogleAuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleLoginDto } from 'src/user/dto/google-login.dto';
import { FacebookLoginDto } from 'src/user/dto/facebook-login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) { }

    @Post('register')
    async register(@Body() registerUserDto: RegisterDto) {
        const data = await this.authService.registerUser(registerUserDto);
        return data;
    }

    @Post('verify-email')
    async verifyEmail(@Body() VerifyOtpDto: VerifyOtpDto) {
        const isVerified = await this.authService.verifyEmail(VerifyOtpDto.email, VerifyOtpDto.otp);
        return { verified: isVerified };
    }

    @Post("login")
    async login(@Body() loginUserDto: LoginDto) {
        const token = await this.authService.loginUser(loginUserDto);
        return { access_token: token };
    }

    @Post('logout')
    async logout() {
        return { message: 'Logout successful' };
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        const userId = req.user.id;
        const result = await this.userService.findUserById(userId);
        return {
            user: result.user,
            profile: result.profile || null,
        };
    }

    @Post('google-login')
    async googleLogin(@Body() dto: GoogleLoginDto) {
        return this.authService.googleLogin(dto.idToken);
    }

    @Post('facebook-login')
    async facebookLogin(@Body() dto: FacebookLoginDto) {
        return this.authService.facebookLogin(dto.accessToken);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard('google'))
    async googleAuth() {
        return;
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard('google'))
    async googleCallback(@Request() req) {
        const token = await this.authService.createJwtForUser(req.user);
        return { access_token: token, user: req.user };
    }

    @Get('facebook')
    @UseGuards(GoogleAuthGuard('facebook'))
    async facebookAuth() {
        return;
    }

    @Get('facebook/callback')
    @UseGuards(GoogleAuthGuard('facebook'))
    async facebookCallback(@Request() req) {
        const token = await this.authService.createJwtForUser(req.user);
        return { access_token: token, user: req.user };
    }


}
