import { PartialType } from "@nestjs/swagger";
import { CreateNutritionGoalDto } from "./create-nutrition-goal.dto";

export class UpdateNutritionGoalDto extends PartialType(CreateNutritionGoalDto) {}