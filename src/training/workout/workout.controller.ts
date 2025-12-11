import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutBlockDto } from './dto/create-workout-block.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateWorkoutBlockDto } from './dto/update-workout-block.dto';
import { AddSetDto } from './dto/add-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';

@Controller('training/workout')
export class WorkoutController {
    constructor(private readonly workoutService: WorkoutService) { }

    @UseGuards(AuthGuard)
    @Post("create-block")
    createWorkoutBlock(@Body() dto: CreateWorkoutBlockDto) {
        return this.workoutService.createWorkoutBlock(dto);
    }

    @UseGuards(AuthGuard)
    @Get("get-one-block/:id")
    getOneBlock(@Param('id') id: string) {
        return this.workoutService.getOneBlock(id);
    }

    @UseGuards(AuthGuard)
    @Patch("update-block/:id")
    updateBlock(@Param('id') id: string, @Body() dto: UpdateWorkoutBlockDto) {
        return this.workoutService.updateBlock(id, dto);
    }

    @UseGuards(AuthGuard)
    @Delete("delete-block/:id")
    deleteBlock(@Param('id') id: string) {
        return this.workoutService.deleteBlock(id);
    }

    @UseGuards(AuthGuard)
    @Post(":blockId/add-set")
    addSetToBlock(@Param('blockId') blockId: string, @Body() dto: AddSetDto) {
        return this.workoutService.addSetToBlock(blockId, dto);
    }

    @UseGuards(AuthGuard)
    @Patch(":blockId/update-set/:setId")
    updateSetInBlock(@Param('blockId') blockId: string, @Param('setId') setId: string, @Body() dto: UpdateSetDto) {
        return this.workoutService.updateSetInBlock(blockId, setId, dto);
    }

    @UseGuards(AuthGuard)
    @Delete(":blockId/delete-set/:setId")
    deleteSetInBlock(@Param('blockId') blockId: string, @Param('setId') setId: string) {
        return this.workoutService.deleteSetInBlock(blockId, setId);
    }

    @UseGuards(AuthGuard)
    @Get("all-blocks")
    getAllBlocks() {
        return this.workoutService.getAllBlocks();
    }
}
