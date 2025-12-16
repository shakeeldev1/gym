import { IsDateString } from "class-validator";

export class DailyLogDto {
    @IsDateString()
    date: string
}