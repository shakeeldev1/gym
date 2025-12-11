import { PartialType } from "@nestjs/mapped-types";
import { CreateWorkoutBlockDto } from "./create-workout-block.dto";

export class UpdateWorkoutBlockDto extends PartialType(CreateWorkoutBlockDto) { }