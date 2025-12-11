import { IsEnum, IsOptional, IsArray, IsMongoId, IsNumber } from "class-validator";
import { BlockType } from "../enums/blocktype.enum";

export class CreateWorkoutBlockDto {
  @IsEnum(BlockType)
  @IsOptional()
  type?: BlockType;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  exercises?: string[];

  @IsNumber()
  @IsOptional()
  restBetweenExercises?: number;
}
