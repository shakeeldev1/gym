import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RegisterDto } from 'src/auth/dto/registerUser.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private userModel: Model<User>) { }
    async createUser(registerUserDto: RegisterDto) {
        try {
            return await this.userModel.create({
                fName: registerUserDto.fName,
                lName: registerUserDto.lName,
                email: registerUserDto.email,
                password: registerUserDto.password,
                otp: registerUserDto.otp,
                otpExpire: registerUserDto.otpExpire
            });
        } catch (error: unknown) {
            const e = error as { code?: number };
            const DUPELICATE_KEY_ERROR_CODE = 11000;
            if (e.code === DUPELICATE_KEY_ERROR_CODE) {
                throw new ConflictException('Email already exists');
            } else {
                throw error;
            }
        }
    }

    async findByEmail(email: string) {
        return this.userModel.findOne({ email });
    }

    async findUserById(id: string) {
        const user = await this.userModel.findOne({ _id: id });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }


}