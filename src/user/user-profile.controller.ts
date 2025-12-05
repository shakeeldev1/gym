import { Body, Controller, Post, UseGuards, Request, Patch } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user-profile')
export class UserProfileController {
    constructor(private readonly profileService: UserProfileService) { }

    @UseGuards(AuthGuard)
    @Post()
    createProfile(@Request() req, @Body() dto: CreateUserProfileDto) {
        const userId = req.user.id;
        return this.profileService.createProfile({ ...dto, userId });
    }

    @UseGuards(AuthGuard)
    @Patch("update")
    async updateProfile(@Request() req, @Body() body: any) {
        const userId = req.user.id;
        return this.profileService.updateUserAndProfile(userId, body);
    }
}
