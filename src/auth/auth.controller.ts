import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerUser.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { UserService } from 'src/user/user.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) { }

    @Post('register')
    async register(@Body() registerUserDto: RegisterDto) {
        const data = await this.authService.registerUser(registerUserDto);
        return data;
    }

    @Post('verify-email')
    async verifyEmail(@Body() VerifyOtpDto:VerifyOtpDto) {
        const isVerified = await this.authService.verifyEmail(VerifyOtpDto.email, VerifyOtpDto.otp);
        return { verified: isVerified };
    }

    @Post("login")
    async login(@Body() loginUserDto: LoginDto) {
        const token = await this.authService.loginUser(loginUserDto);
        return { access_token: token };
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        const userId = req.user.id;
        const user = await this.userService.findUserById(userId);
        return {
            id: user._id,
            fName: user.fName,
            lName: user.lName,
            email: user.email,
            role: user.role
        }
    }

    

}
