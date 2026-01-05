import { IsIn, IsMongoId, IsString } from 'class-validator'

export class UpdateWellnessStatusDto {
  @IsIn(['meal', 'meditation', 'breathwork', 'sleep', 'fasting'])
  type: 'meal' | 'meditation' | 'breathwork' | 'sleep' | 'fasting'

  @IsMongoId()
  id: string

  @IsString()
  @IsIn(['planned', 'done', 'missed', 'skipped'])
  status: 'planned' | 'done' | 'missed' | 'skipped'
}
