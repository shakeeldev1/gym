import { PartialType } from "@nestjs/mapped-types";
import { AddSetDto } from "./add-set.dto";

export class UpdateSetDto extends PartialType(AddSetDto) { }