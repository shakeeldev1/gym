import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type HabitDocument = Habit & Document;

@Schema({timestamps:true})
export class Habit {
    @Prop({required:true})
    name:string;

    @Prop({enum:['BOOLEAN','NUMERIC'],default:'BOOLEAN'})
    type:'BOOLEAN' | 'NUMERIC';

    @Prop()
    targetValue?: number;

    @Prop()
    unit?: string;

    @Prop({default:false})
    active: boolean;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);