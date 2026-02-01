import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { WorkoutService } from './workout.service';
import { CreateWorkoutBlockDto } from './dto/create-workout-block.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateWorkoutBlockDto } from './dto/update-workout-block.dto';
import { AddSetDto } from './dto/add-set.dto';
import { UpdateSetDto } from './dto/update-set.dto';

@ApiTags('Training - Workout')
@ApiBearerAuth('JWT-auth')
@Controller('training/workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @UseGuards(AuthGuard)
  @Post('create-block')
  @ApiOperation({
    summary: 'Create workout block',
    description: 'Create a new workout block.',
  })
  @ApiResponse({
    status: 201,
    description: 'Workout block created successfully.',
  })
  createWorkoutBlock(@Body() dto: CreateWorkoutBlockDto) {
    return this.workoutService.createWorkoutBlock(dto);
  }

  @UseGuards(AuthGuard)
  @Get('get-one-block/:id')
  @ApiOperation({
    summary: 'Get workout block by ID',
    description: 'Retrieve a specific workout block by ID.',
  })
  @ApiParam({ name: 'id', description: 'Workout Block ID' })
  @ApiResponse({
    status: 200,
    description: 'Workout block retrieved successfully.',
  })
  getOneBlock(@Param('id') id: string) {
    return this.workoutService.getOneBlock(id);
  }

  @UseGuards(AuthGuard)
  @Patch('update-block/:id')
  @ApiOperation({
    summary: 'Update workout block',
    description: 'Update a workout block by ID.',
  })
  @ApiParam({ name: 'id', description: 'Workout Block ID' })
  @ApiResponse({
    status: 200,
    description: 'Workout block updated successfully.',
  })
  updateBlock(@Param('id') id: string, @Body() dto: UpdateWorkoutBlockDto) {
    return this.workoutService.updateBlock(id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('delete-block/:id')
  @ApiOperation({
    summary: 'Delete workout block',
    description: 'Delete a workout block by ID.',
  })
  @ApiParam({ name: 'id', description: 'Workout Block ID' })
  @ApiResponse({
    status: 200,
    description: 'Workout block deleted successfully.',
  })
  deleteBlock(@Param('id') id: string) {
    return this.workoutService.deleteBlock(id);
  }

  @UseGuards(AuthGuard)
  @Get('all-blocks')
  @ApiOperation({
    summary: 'Get all workout blocks',
    description: 'Retrieve all workout blocks.',
  })
  @ApiResponse({
    status: 200,
    description: 'Workout blocks retrieved successfully.',
  })
  getAllBlocks() {
    return this.workoutService.getAllBlocks();
  }

  @UseGuards(AuthGuard)
  @Post(':blockId/add-set')
  @ApiOperation({
    summary: 'Add set to block',
    description: 'Add a new set to a workout block.',
  })
  @ApiParam({ name: 'blockId', description: 'Workout Block ID' })
  @ApiResponse({ status: 201, description: 'Set added successfully.' })
  addSetToBlock(@Param('blockId') blockId: string, @Body() dto: AddSetDto) {
    return this.workoutService.addSetToBlock(blockId, dto);
  }

  @UseGuards(AuthGuard)
  @Patch(':blockId/exercise/:exerciseId/update-set/:setId')
  @ApiOperation({
    summary: 'Update set',
    description: 'Update a set within a workout block.',
  })
  @ApiParam({ name: 'blockId', description: 'Workout Block ID' })
  @ApiParam({ name: 'exerciseId', description: 'Exercise ID' })
  @ApiParam({ name: 'setId', description: 'Set ID' })
  @ApiResponse({ status: 200, description: 'Set updated successfully.' })
  updateSetInBlock(
    @Param('blockId') blockId: string,
    @Param('exerciseId') exerciseId: string,
    @Param('setId') setId: string,
    @Body() dto: UpdateSetDto,
  ) {
    return this.workoutService.updateSetInBlock(
      blockId,
      exerciseId,
      setId,
      dto,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':blockId/delete-set/:setId')
  @ApiOperation({
    summary: 'Delete set',
    description: 'Delete a set from a workout block.',
  })
  @ApiParam({ name: 'blockId', description: 'Workout Block ID' })
  @ApiParam({ name: 'setId', description: 'Set ID' })
  @ApiResponse({ status: 200, description: 'Set deleted successfully.' })
  deleteSetInBlock(
    @Param('blockId') blockId: string,
    @Param('setId') setId: string,
  ) {
    return this.workoutService.deleteSetInBlock(blockId, setId);
  }

  @UseGuards(AuthGuard)
  @Delete(':blockId/delete-exercise/:exerciseId')
  @ApiOperation({
    summary: 'Delete exercise',
    description: 'Delete an exercise from a workout block.',
  })
  @ApiParam({ name: 'blockId', description: 'Workout Block ID' })
  @ApiParam({ name: 'exerciseId', description: 'Exercise ID' })
  @ApiResponse({ status: 200, description: 'Exercise deleted successfully.' })
  deleteExerciseFromBlock(
    @Param('blockId') blockId: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.workoutService.deleteExerciseFromBlock(blockId, exerciseId);
  }

  @UseGuards(AuthGuard)
  @Patch(':blockId/exercise/:exerciseId/status')
  @ApiOperation({
    summary: 'Set exercise status',
    description: 'Update the completion status of an exercise in a block.',
  })
  @ApiParam({ name: 'blockId', description: 'Workout Block ID' })
  @ApiParam({ name: 'exerciseId', description: 'Exercise ID' })
  @ApiBody({
    schema: { type: 'object', properties: { completed: { type: 'boolean' } } },
  })
  @ApiResponse({
    status: 200,
    description: 'Exercise status updated successfully.',
  })
  setExerciseStatus(
    @Param('blockId') blockId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() body: { completed: boolean },
  ) {
    return this.workoutService.setExerciseCompletion(
      blockId,
      exerciseId,
      !!body?.completed,
    );
  }
}
