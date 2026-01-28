import { IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DailyLogDto {
    @ApiProperty({
        description: 'Log date (ISO)',
        example: '2026-01-28',
        required: true,
    })
    @IsDateString()
    date: string
}