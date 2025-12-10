import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { BlockType } from "../enums/blocktype.enum";

export type workoutBlockDocument = WorkoutBlock & Document;

@Schema({timestamps:true})
export class WorkoutBlock {
    @Prop({enum:BlockType,default:BlockType.NORMAL})
    type: BlockType;

    @Prop({type:[{type:Types.ObjectId,ref:"Exercise"}],default:[]})
    exercises:Types.ObjectId[];

    @Prop({type:[{type:Types.ObjectId,ref:"WorkoutSet"}],default:[]})
    sets:Types.ObjectId[];

    @Prop()
    restBetweenExercises?:number;

}

export const WorkoutBlockSchema = SchemaFactory.createForClass(WorkoutBlock);