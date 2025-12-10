import { PartialType } from "@nestjs/mapped-types";
import { CreateProgramDto } from "./create-program.dto";

export class updateProgramDto extends PartialType(CreateProgramDto) {}