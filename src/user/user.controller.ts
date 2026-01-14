import { Body, Controller, Delete, Get, Patch, Request, UseGuards, Param } from "@nestjs/common";
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
    async getAllUsers(@Request() req) {
        const role = req.query?.role;
        return this.userService.getAllUsers(role);
    }

    @Get('admins-coaches')
    async getAdminsAndCoaches() {
        return this.userService.getAdminsAndCoaches();
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async deleteUser(@Param('id') userId: string) {
        return this.userService.deleteUser(userId);
    }

    @UseGuards(AuthGuard)
    @Patch(':id/role')
    async updateUserRole(
        @Param('id') userId: string,
        @Body() body: { role: string }
    ) {
        return this.userService.updateUserRole(userId, body.role);
    }

}