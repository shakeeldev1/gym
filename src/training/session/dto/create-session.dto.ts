import { IsMongoId, IsOptional, IsArray, IsString } from "class-validator";

export class CreateSessionDto {
  @IsMongoId()
  user: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  blocks?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}
