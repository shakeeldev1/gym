import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { UpdatePerformanceDto } from './dto/update-performance.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('training/performance')
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) { }

    @UseGuards(AuthGuard)
    @Post("create")
    createPerformanceRecord(@Body() createPerformanceDto: CreatePerformanceDto) {
        return this.performanceService.createPerformanceRecord(createPerformanceDto);
    }

    @UseGuards(AuthGuard)
    @Patch("update/:id")
    updatePerformanceRecord(@Param("id") id: string, @Body() updatePerformanceDto: UpdatePerformanceDto) {
        return this.performanceService.updatePerformanceRecord(id, updatePerformanceDto);
    }

    @UseGuards(AuthGuard)
    @Get("get-by-user/:userId")
    getPerformanceRecordsByUser(@Param("userId") userId: string) {
        return this.performanceService.getPerformanceRecordsByUser(userId);
    }

    @UseGuards(AuthGuard)
    @Get("all")
    getAllPerformanceRecords() {
        return this.performanceService.getAllPerformanceRecords();
    }

    @UseGuards(AuthGuard)
    @Get("my-records")
    getMyPerformanceRecords(@Request() req) {
        const userId = req.user.id;
        return this.performanceService.getPerformanceRecordsByUser(userId);
    }

}
