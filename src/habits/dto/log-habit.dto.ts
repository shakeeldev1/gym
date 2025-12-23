import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class LogHabitDto {
  @IsString()
  habitId: string;

  @IsString()
  date: string;

  value: boolean | number;
}
