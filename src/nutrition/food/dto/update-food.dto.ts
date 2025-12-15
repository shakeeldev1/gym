import { PartialType } from "@nestjs/mapped-types";
import { CreateFoodDto } from "./create-food.dto";

export class updateFoodDto extends PartialType(CreateFoodDto){}