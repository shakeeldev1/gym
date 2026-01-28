import { IsOptional } from "class-validator";
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EndFastingDto {
  @ApiPropertyOptional({
    description: 'Notes for ending the fast',
    example: 'Ended early due to workout',
  })
  @IsOptional()
  notes?: string;
}
