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

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: Role.User })
    role: string;

    @Prop({ type: String, default: null })
    otp: string | null;

    @Prop({ type: Date, default: null })
    otpExpire: Date | null;

    @Prop({ type: String, default: null })
    resetOtp: string | null;

    @Prop({ type: Date, default: null })
    resetOtpExpire: Date | null;

    @Prop({ type: Boolean, default: false })
    isVerified: boolean;

    @Prop({ unique: true, sparse: true })
    googleId?: string;

    @Prop({ unique: true, sparse: true })
    facebookId?: string;

    @Prop({ default: 'local' })
    authProvider: 'local' | 'google' | 'facebook';
}

export const UserSchema = SchemaFactory.createForClass(User);
