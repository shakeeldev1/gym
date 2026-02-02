import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { createExerciseDto } from './dto/create-exercise.dto';
import { ExerciseService } from './exercise.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { updateExerciseDto } from './dto/update-exercise.dto';
import { v2 as cloudinary } from 'cloudinary';

@ApiTags('Training - Exercise')
@ApiBearerAuth('JWT-auth')
@Controller('training/exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create exercise',
    description: 'Create a new exercise.',
  })
  @ApiResponse({ status: 201, description: 'Exercise created successfully.' })
  createExercise(@Body() createExerciseDto: createExerciseDto) {
    return this.exerciseService.createExercise(createExerciseDto);
  }

  @UseGuards(AuthGuard)
  @Get('get-all')
  @ApiOperation({
    summary: 'Get all exercises',
    description: 'Retrieve all exercises.',
  })
  @ApiResponse({
    status: 200,
    description: 'Exercises retrieved successfully.',
  })
  getAllExercises() {
    return this.exerciseService.getAllExercises();
  }

  @UseGuards(AuthGuard)
  @Get('get-one/:id')
  @ApiOperation({
    summary: 'Get exercise by ID',
    description: 'Retrieve a specific exercise by ID.',
  })
  @ApiParam({ name: 'id', description: 'Exercise ID' })
  @ApiResponse({ status: 200, description: 'Exercise retrieved successfully.' })
  getExerciseById(@Request() req) {
    const id = req.params.id;
    return this.exerciseService.getExerciseById(id);
  }

  @UseGuards(AuthGuard)
  @Patch('update/:id')
  @ApiOperation({
    summary: 'Update exercise',
    description: 'Update an exercise by ID.',
  })
  @ApiParam({ name: 'id', description: 'Exercise ID' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully.' })
  updaateExercise(
    @Request() req,
    @Body() updateExerciseDto: updateExerciseDto,
  ) {
    const id = req.params.id;
    return this.exerciseService.updateExercise(id, updateExerciseDto);
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Delete exercise',
    description: 'Delete an exercise by ID.',
  })
  @ApiParam({ name: 'id', description: 'Exercise ID' })
  @ApiResponse({ status: 200, description: 'Exercise deleted successfully.' })
  deleteExercise(@Request() req) {
    const id = req.params.id;
    return this.exerciseService.deleteExercise(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/assign-alternates')
  @ApiOperation({
    summary: 'Assign alternates',
    description: 'Assign alternate exercises to an exercise.',
  })
  @ApiParam({ name: 'id', description: 'Exercise ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        alternateExerciseIds: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Alternates assigned successfully.',
  })
  assignAlternateExercises(
    @Request() req,
    @Body() body: { alternateExerciseIds: string[] },
  ) {
    const id = req.params.id;
    return this.exerciseService.assignAlternateExercises(
      id,
      body.alternateExerciseIds,
    );
  }

  @UseGuards(AuthGuard)
  @Patch(':id/remove-alternate/:alternateId')
  @ApiOperation({
    summary: 'Remove alternate',
    description: 'Remove an alternate exercise assignment.',
  })
  @ApiParam({ name: 'id', description: 'Exercise ID' })
  @ApiParam({ name: 'alternateId', description: 'Alternate Exercise ID' })
  @ApiResponse({ status: 200, description: 'Alternate removed successfully.' })
  removeAlternateExercise(@Request() req) {
    const { id, alternateId } = req.params;
    return this.exerciseService.removeAlternateExercise(id, alternateId);
  }

  @UseGuards(AuthGuard)
  @Get(':id/get-alternates')
  @ApiOperation({
    summary: 'Get alternates',
    description: 'Retrieve alternate exercises for an exercise.',
  })
  @ApiParam({ name: 'id', description: 'Exercise ID' })
  @ApiResponse({
    status: 200,
    description: 'Alternates retrieved successfully.',
  })
  getAlternateExercises(@Request() req) {
    const id = req.params.id;
    return this.exerciseService.getAlternateExercises(id);
  }

  @UseGuards(AuthGuard)
  @Post('sign-upload')
  @ApiOperation({
    summary: 'Sign upload',
    description: 'Generate signature for Cloudinary upload.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { folder: { type: 'string' }, public_id: { type: 'string' } },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Signature generated successfully.',
  })
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
