import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('User Profile')
@ApiBearerAuth('JWT-auth')
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly profileService: UserProfileService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Create user profile',
    description: 'Create a comprehensive profile for the user.',
  })
  @ApiResponse({ status: 201, description: 'Profile created successfully.' })
  createProfile(@Request() req, @Body() dto: CreateUserProfileDto) {
    const userId = req.user.id;
    return this.profileService.createProfile({ ...dto, userId });
  }

  @UseGuards(AuthGuard)
  @Patch('update')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update specific fields of the user profile.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      additionalProperties: true,
      description: 'Fields to update',
    },
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateProfile(@Request() req, @Body() body: any) {
    const userId = req.user.id;
    return this.profileService.updateUserAndProfile(userId, body);
  }
}
