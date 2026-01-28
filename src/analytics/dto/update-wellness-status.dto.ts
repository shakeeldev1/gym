import { IsIn, IsMongoId, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateWellnessStatusDto {
  @ApiProperty({
    description: 'Wellness item type',
    enum: ['meal', 'meditation', 'breathwork', 'sleep', 'fasting'],
    example: 'sleep',
    required: true,
  })
  @IsIn(['meal', 'meditation', 'breathwork', 'sleep', 'fasting'])
  type: 'meal' | 'meditation' | 'breathwork' | 'sleep' | 'fasting'

  @ApiProperty({
    description: 'Item ID to update',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsMongoId()
  id: string

  @ApiProperty({
    description: 'New status value',
    enum: ['planned', 'done', 'missed', 'skipped'],
    example: 'done',
    required: true,
  })
  @IsString()
  @IsIn(['planned', 'done', 'missed', 'skipped'])
  status: 'planned' | 'done' | 'missed' | 'skipped'
}
