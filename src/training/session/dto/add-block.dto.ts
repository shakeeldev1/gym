import { IsMongoId } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddBlockDto {
  @ApiProperty({
    description: 'Workout block ID to add',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsMongoId()
  blockId: string;
}
