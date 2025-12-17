import { PartialType } from "@nestjs/mapped-types";
import { CreateNutritionGoalDto } from "./create-nutrition-goal.dto";

export class UpdateNutritionGoalDto extends PartialType(CreateNutritionGoalDto) {}