import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskAutomationDocument = TaskAutomation & Document;

@Schema({ timestamps: true })
export class TaskAutomation {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ default: false })
    completed: boolean;

    @Prop()
    dueDate: Date;

    @Prop({ default: 'reminder' }) // can be 'reminder', 'smart-nudge'
    type: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const TaskAutomationSchema = SchemaFactory.createForClass(TaskAutomation);
