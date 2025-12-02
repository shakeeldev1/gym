import { ConflictException, Injectable } from '@nestjs/common';
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
                password: registerUserDto.password
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
}