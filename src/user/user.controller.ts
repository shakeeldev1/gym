import { Body, Controller, Get, Patch, Request, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ChangePasswordDto } from "./dto/changePassword";
import { RequestResetDto } from "./dto/resetRequest.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(AuthGuard)
    @Patch('change-password')
    async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
        const userId = req.user.id;
        const response = await this.userService.changePassword(userId, changePasswordDto);
        return response;
    }

    @Patch('fortgot-password')
    async forgotPassword(@Body() body: RequestResetDto) {
        return this.userService.requestPasswordReset(body.email);
    }

    @Patch('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
        return this.userService.resetPassword(body.email, body.resetOtp, body.newPassword);
    }

    @Get('all')
    async getAllUsers(){
        return this.userService.getAllUsers();
    }

}