import { Body, Controller, Delete, Get, Patch, Request, UseGuards, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { AuthGuard } from "src/auth/auth.guard";
import { ChangePasswordDto } from "./dto/changePassword";
import { RequestResetDto } from "./dto/resetRequest.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";

@ApiTags('Users')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(AuthGuard)
    @Patch('change-password')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Change user password',
        description: 'Change password for authenticated user. Requires current password and new password.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Password changed successfully',
        schema: { example: { message: 'Password changed successfully' } }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized or incorrect old password' })
    async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
        const userId = req.user.id;
        const response = await this.userService.changePassword(userId, changePasswordDto);
        return response;
    }

    @Patch('fortgot-password')
    @ApiOperation({ 
        summary: 'Request password reset',
        description: 'Request a password reset. An OTP will be sent to the provided email address.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Reset OTP sent to email',
        schema: { example: { message: 'Reset code sent to your email' } }
    })
    @ApiResponse({ status: 404, description: 'Email not found' })
    async forgotPassword(@Body() body: RequestResetDto) {
        return this.userService.requestPasswordReset(body.email);
    }

    @Patch('reset-password')
    @ApiOperation({ 
        summary: 'Reset password with OTP',
        description: 'Reset password using the OTP code sent to email'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Password reset successfully',
        schema: { example: { message: 'Password reset successful' } }
    })
    @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
    async resetPassword(@Body() body: ResetPasswordDto) {
        return this.userService.resetPassword(body.email, body.resetOtp, body.newPassword);
    }

    @Get('all')
    @ApiOperation({ 
        summary: 'Get all users',
        description: 'Retrieve list of all users. Optionally filter by role.'
    })
    @ApiQuery({ 
        name: 'role', 
        required: false, 
        description: 'Filter users by role (user, coach, admin)',
        example: 'user'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Users retrieved successfully',
        schema: {
            example: [{
                id: '507f1f77bcf86cd799439011',
                email: 'john.doe@example.com',
                fName: 'John',
                lName: 'Doe',
                role: 'user'
            }]
        }
    })
    async getAllUsers(@Request() req) {
        const role = req.query?.role;
        return this.userService.getAllUsers(role);
    }

    @Get('admins-coaches')
    @ApiOperation({ 
        summary: 'Get admins and coaches',
        description: 'Retrieve list of all users with admin or coach roles'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Admins and coaches retrieved successfully',
        schema: {
            example: [{
                id: '507f1f77bcf86cd799439011',
                email: 'coach@example.com',
                fName: 'Jane',
                lName: 'Smith',
                role: 'coach'
            }]
        }
    })
    async getAdminsAndCoaches() {
        return this.userService.getAdminsAndCoaches();
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Delete user',
        description: 'Delete a user account. Requires authentication and proper permissions.'
    })
    @ApiParam({ name: 'id', description: 'User ID to delete', example: '507f1f77bcf86cd799439011' })
    @ApiResponse({ 
        status: 200, 
        description: 'User deleted successfully',
        schema: { example: { message: 'User deleted successfully' } }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async deleteUser(@Param('id') userId: string) {
        return this.userService.deleteUser(userId);
    }

    @UseGuards(AuthGuard)
    @Patch(':id/role')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Update user role',
        description: 'Update user role (user, coach, admin). Admin access required.'
    })
    @ApiParam({ name: 'id', description: 'User ID to update', example: '507f1f77bcf86cd799439011' })
    @ApiResponse({ 
        status: 200, 
        description: 'Role updated successfully',
        schema: { example: { message: 'User role updated', role: 'coach' } }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async updateUserRole(
        @Param('id') userId: string,
        @Body() body: { role: string }
    ) {
        return this.userService.updateUserRole(userId, body.role);
    }

}