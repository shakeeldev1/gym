import { Controller, Get, Query } from '@nestjs/common'

@Controller('sleep')
export class SleepController {
  @Get()
  findAll(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return {
      logs: [],
      total: 0,
      startDate: startDate || null,
      endDate: endDate || null,
      message: 'Sleep tracking API stub: no records yet.'
    }
  }
}
