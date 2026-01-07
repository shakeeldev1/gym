import { Body, Controller, Delete, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { createExerciseDto } from './dto/create-exercise.dto';
import { ExerciseService } from './exercise.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { updateExerciseDto } from './dto/update-exercise.dto';
import { v2 as cloudinary } from 'cloudinary';

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

    @UseGuards(AuthGuard)
    @Post('sign-upload')
    signUpload(@Body() body: { folder?: string; public_id?: string }) {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = body?.folder || 'exercises';
        const public_id = body?.public_id;
        const params: Record<string, any> = { timestamp, folder };
        if (public_id) params.public_id = public_id;

        const apiSecret = process.env.CLOUDINARY_API_SECRET as string;
        const apiKey = process.env.CLOUDINARY_API_KEY as string;
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME as string;

        const signature = cloudinary.utils.api_sign_request(params, apiSecret);

        return {
            timestamp,
            signature,
            apiKey,
            cloudName,
            folder,
        };
    }
}
