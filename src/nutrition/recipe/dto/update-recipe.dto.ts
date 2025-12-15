import { PartialType } from "@nestjs/mapped-types";
import { CreateRecipeDto } from "./create-recipe.dto";

export class udpateRecipeDto extends PartialType(CreateRecipeDto){}