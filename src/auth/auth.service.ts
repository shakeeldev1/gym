import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { RegisterDto } from './dto/registerUser.dto';
import bcrypt from "bcrypt";

@Injectable()
export class AuthService {

    constructor(private readonly userService: UserService) { }

    async registerUser(registerUserDto: RegisterDto) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(registerUserDto.password, saltRounds);

        const user = await this.userService.createUser({ ...registerUserDto, password: hashedPassword });

        return user;
    }

}
