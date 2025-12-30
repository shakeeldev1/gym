import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  coach: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['monthly', 'quarterly', 'individual', 'team', 'annual'] })
  type: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  athletes: Types.ObjectId[];

  @Prop()
  athleteCount: number;

  @Prop({ type: Object })
  data: Record<string, any>;

  @Prop()
  size: string;

  @Prop({ default: 'generated' })
  status: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
