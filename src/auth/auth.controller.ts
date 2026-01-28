import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/registerUser.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { AuthGuard as GoogleAuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleLoginDto } from 'src/user/dto/google-login.dto';
import { FacebookLoginDto } from 'src/user/dto/facebook-login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) { }

    @Post('register')
    @ApiOperation({ 
        summary: 'Register new user',
        description: 'Create a new user account. After registration, an OTP will be sent to the provided email for verification.'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'User successfully registered. Check email for OTP verification.',
        schema: {
            example: {
                message: 'User registered successfully. Please verify your email.',
                userId: '507f1f77bcf86cd799439011'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid input or email already exists' })
    async register(@Body() registerUserDto: RegisterDto) {
        const data = await this.authService.registerUser(registerUserDto);
        return data;
    }

    @Post('verify-email')
    @ApiOperation({ 
        summary: 'Verify email with OTP',
        description: 'Verify user email address using the 6-digit OTP code sent during registration.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Email verified successfully',
        schema: {
            example: { verified: true }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
    async verifyEmail(@Body() VerifyOtpDto: VerifyOtpDto) {
        const isVerified = await this.authService.verifyEmail(VerifyOtpDto.email, VerifyOtpDto.otp);
        return { verified: isVerified };
    }

    @Post("login")
    @ApiOperation({ 
        summary: 'User login',
        description: 'Authenticate user with email and password. Returns JWT access token.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Login successful',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginUserDto: LoginDto) {
        const token = await this.authService.loginUser(loginUserDto);
        return { access_token: token };
    }

    @Post('logout')
    @ApiOperation({ 
        summary: 'User logout',
        description: 'Logout current user session'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Logout successful',
        schema: {
            example: { message: 'Logout successful' }
        }
    })
    async logout() {
        return { message: 'Logout successful' };
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get user profile',
        description: 'Retrieve authenticated user profile information. Requires valid JWT token.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Profile retrieved successfully',
        schema: {
            example: {
                user: {
                    id: '507f1f77bcf86cd799439011',
                    email: 'john.doe@example.com',
                    fName: 'John',
                    lName: 'Doe',
                    role: 'user'
                },
                profile: {
                    age: 30,
                    height: 180,
                    weight: 75,
                    goal: 'muscle_gain'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    async getProfile(@Request() req) {
        const userId = req.user.id;
        const result = await this.userService.findUserById(userId);
        return {
            user: result.user,
            profile: result.profile || null,
        };
    }

    @Post('google-login')
    @ApiOperation({ 
        summary: 'Login with Google',
        description: 'Authenticate user using Google OAuth ID token'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Google login successful',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    email: 'john.doe@gmail.com',
                    fName: 'John',
                    lName: 'Doe'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid Google token' })
    async googleLogin(@Body() dto: GoogleLoginDto) {
        return this.authService.googleLogin(dto.idToken);
    }

    @Post('facebook-login')
    @ApiOperation({ 
        summary: 'Login with Facebook',
        description: 'Authenticate user using Facebook OAuth access token'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Facebook login successful',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    email: 'john.doe@facebook.com',
                    fName: 'John',
                    lName: 'Doe'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid Facebook token' })
    async facebookLogin(@Body() dto: FacebookLoginDto) {
        return this.authService.facebookLogin(dto.accessToken);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard('google'))
    @ApiOperation({ 
        summary: 'Google OAuth redirect',
        description: 'Initiates Google OAuth flow. Redirects to Google login page.'
    })
    @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
    async googleAuth() {
        return;
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard('google'))
    @ApiOperation({ 
        summary: 'Google OAuth callback',
        description: 'Google OAuth callback endpoint. Handles the response from Google after authentication.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Google authentication successful',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: { email: 'user@gmail.com', fName: 'John', lName: 'Doe' }
            }
        }
    })
    async googleCallback(@Request() req) {
        const token = await this.authService.createJwtForUser(req.user);
        return { access_token: token, user: req.user };
    }

    @Get('facebook')
    @UseGuards(GoogleAuthGuard('facebook'))
    @ApiOperation({ 
        summary: 'Facebook OAuth redirect',
        description: 'Initiates Facebook OAuth flow. Redirects to Facebook login page.'
    })
    @ApiResponse({ status: 302, description: 'Redirects to Facebook OAuth' })
    async facebookAuth() {
        return;
    }

    @Get('facebook/callback')
    @UseGuards(GoogleAuthGuard('facebook'))
    @ApiOperation({ 
        summary: 'Facebook OAuth callback',
        description: 'Facebook OAuth callback endpoint. Handles the response from Facebook after authentication.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Facebook authentication successful',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: { email: 'user@facebook.com', fName: 'John', lName: 'Doe' }
            }
        }
    })
    async facebookCallback(@Request() req) {
        const token = await this.authService.createJwtForUser(req.user);
        return { access_token: token, user: req.user };
    }


}
