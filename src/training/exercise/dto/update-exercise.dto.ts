import { PartialType } from "@nestjs/mapped-types";
import { createExerciseDto } from "./create-exercise.dto";

export class updateExerciseDto extends PartialType(createExerciseDto){}