
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../user.types';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: true })
    fName: string;

    @Prop({ required: true })
    lName: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: Role.User })
    role: string;

    @Prop()
    otp: string;

    @Prop()
    otpExpire: Date;

    @Prop({ default: false })
    isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
