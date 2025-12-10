import { Body, Controller, Delete, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { createExerciseDto } from './dto/create-exercise.dto';
import { ExerciseService } from './exercise.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { updateExerciseDto } from './dto/update-exercise.dto';

@Controller('training/exercise')
export class ExerciseController {

    constructor(private readonly exerciseService: ExerciseService) { }

    @UseGuards(AuthGuard)
    @Post('create')
    createExercise(@Body() createExerciseDto: createExerciseDto) {
        return this.exerciseService.createExercise(createExerciseDto);
    }

    @UseGuards(AuthGuard)
    @Get("get-all")
    getAllExercises() {
        return this.exerciseService.getAllExercises();
    }

    @UseGuards(AuthGuard)
    @Get("get-one/:id")
    getExerciseById(@Request() req) {
        const id = req.params.id;
        return this.exerciseService.getExerciseById(id);
    }

    @UseGuards(AuthGuard)
    @Patch('update/:id')
    updaateExercise(@Request() req, @Body() updateExerciseDto: updateExerciseDto) {
        const id = req.params.id;
        return this.exerciseService.updateExercise(id, updateExerciseDto);
    }

    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    deleteExercise(@Request() req) {
        const id = req.params.id;
        return this.exerciseService.deleteExercise(id);
    }
}
