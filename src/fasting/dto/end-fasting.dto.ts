import { IsOptional } from "class-validator";

export class EndFastingDto {
  @IsOptional()
  notes?: string;
}
