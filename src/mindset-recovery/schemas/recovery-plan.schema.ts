import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type RecoveryPlanDocument = HydratedDocument<RecoveryPlan>;

@Schema({ timestamps: true })
export class RecoveryPlan {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  user: Types.ObjectId;

  @Prop({ type: Number, default: 1 })
  restDaysPerWeek: number;

  @Prop({ type: Number, default: 10 })
  mobilityMinutesPerDay: number;

  @Prop({ type: String, default: '2-5 min breathing/box breathing daily.' })
  stressManagement: string;

  @Prop({ type: String, default: '35-45 ml/kg/day; more if sweating.' })
  hydration: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date, default: () => new Date() })
  startDate: Date;

  @Prop({ type: Date })
  endDate?: Date;
}

export const RecoveryPlanSchema = SchemaFactory.createForClass(RecoveryPlan);
RecoveryPlanSchema.index({ user: 1, isActive: 1 });