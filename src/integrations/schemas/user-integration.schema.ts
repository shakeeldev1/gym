import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserIntegrationDocument = UserIntegration & Document;

@Schema({ timestamps: true })
export class UserIntegration {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    type: string; // e.g., 'fitbit', 'apple-watch', 'google-fit'

    @Prop()
    externalId: string; // device ID or external account ID

    @Prop()
    accessToken: string;

    @Prop()
    refreshToken: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const UserIntegrationSchema = SchemaFactory.createForClass(UserIntegration);
