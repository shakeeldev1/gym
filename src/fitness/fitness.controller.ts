import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { FitnessService } from './fitness.service';
import {
  CreateFitnessWorkoutDto,
  UpdateFitnessWorkoutDto,
} from './dto/fitness-workout.dto';

@ApiTags('Fitness')
@ApiBearerAuth('JWT-auth')
@Controller('fitness')
export class FitnessController {
  constructor(private readonly fitnessService: FitnessService) {}

  @UseGuards(AuthGuard)
  @Post('workouts')
  @ApiOperation({ summary: 'Create a fitness workout' })
  @ApiResponse({ status: 201, description: 'Workout created successfully.' })
  async create(@Request() req, @Body() dto: CreateFitnessWorkoutDto) {
    return this.fitnessService.create(dto, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('workouts')
  @ApiOperation({ summary: 'Get all fitness workouts with optional filters' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiQuery({ name: 'subcategory', required: false })
  @ApiQuery({ name: 'intensity', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Workouts retrieved successfully.' })
  async findAll(
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
    @Query('subcategory') subcategory?: string,
    @Query('intensity') intensity?: string,
    @Query('search') search?: string,
  ) {
    const workouts = await this.fitnessService.findAll({
      category,
      difficulty,
      subcategory,
      intensity,
      search,
    });
    return { data: workouts };
  }

  @UseGuards(AuthGuard)
  @Get('yoga/exercises')
  @ApiOperation({ summary: 'Get all yoga workouts' })
  @ApiResponse({ status: 200, description: 'Yoga workouts retrieved.' })
  async getYogaExercises() {
    const workouts = await this.fitnessService.findByCategory('yoga');
    return { data: workouts };
  }

  @UseGuards(AuthGuard)
  @Get('cardio/workouts')
  @ApiOperation({ summary: 'Get all cardio workouts' })
  @ApiQuery({ name: 'intensity', required: false })
  @ApiResponse({ status: 200, description: 'Cardio workouts retrieved.' })
  async getCardioWorkouts(@Query('intensity') intensity?: string) {
    if (intensity) {
      const workouts = await this.fitnessService.findAll({
        category: 'cardio',
        intensity: intensity.toLowerCase(),
      });
      return { data: workouts };
    }
    const workouts = await this.fitnessService.findByCategory('cardio');
    return { data: workouts };
  }

  @UseGuards(AuthGuard)
  @Get('hiit/workouts')
  @ApiOperation({ summary: 'Get all HIIT workouts' })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiResponse({ status: 200, description: 'HIIT workouts retrieved.' })
  async getHiitWorkouts(@Query('difficulty') difficulty?: string) {
    if (difficulty) {
      const workouts = await this.fitnessService.findAll({
        category: 'hiit',
        difficulty: difficulty.toLowerCase(),
      });
      return { data: workouts };
    }
    const workouts = await this.fitnessService.findByCategory('hiit');
    return { data: workouts };
  }

  @UseGuards(AuthGuard)
  @Get('stretching/exercises')
  @ApiOperation({ summary: 'Get all stretching workouts' })
  @ApiQuery({ name: 'subcategory', required: false })
  @ApiResponse({ status: 200, description: 'Stretching workouts retrieved.' })
  async getStretchingExercises(@Query('subcategory') subcategory?: string) {
    if (subcategory) {
      const workouts = await this.fitnessService.findAll({
        category: 'stretching',
        subcategory,
      });
      return { data: workouts };
    }
    const workouts = await this.fitnessService.findByCategory('stretching');
    return { data: workouts };
  }

  @UseGuards(AuthGuard)
  @Get('fat-loss/programs')
  @ApiOperation({ summary: 'Get all fat loss programs' })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiResponse({ status: 200, description: 'Fat loss programs retrieved.' })
  async getFatLossPrograms(@Query('difficulty') difficulty?: string) {
    if (difficulty) {
      const workouts = await this.fitnessService.findAll({
        category: 'fat_loss',
        difficulty: difficulty.toLowerCase(),
      });
      return { data: workouts };
    }
    const workouts = await this.fitnessService.findByCategory('fat_loss');
    return { data: workouts };
  }

  @UseGuards(AuthGuard)
  @Get('workouts/:id')
  @ApiOperation({ summary: 'Get a workout by ID' })
  @ApiResponse({ status: 200, description: 'Workout retrieved.' })
  async findOne(@Param('id') id: string) {
    return this.fitnessService.findById(id);
  }

  @UseGuards(AuthGuard)
  @Patch('workouts/:id')
  @ApiOperation({ summary: 'Update a workout' })
  @ApiResponse({ status: 200, description: 'Workout updated.' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFitnessWorkoutDto,
  ) {
    return this.fitnessService.update(id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('workouts/:id')
  @ApiOperation({ summary: 'Delete a workout' })
  @ApiResponse({ status: 200, description: 'Workout deleted.' })
  async delete(@Param('id') id: string) {
    return this.fitnessService.delete(id);
  }

  @UseGuards(AuthGuard)
  @Post('seed')
  @ApiOperation({ summary: 'Seed default workouts' })
  @ApiResponse({ status: 201, description: 'Workouts seeded.' })
  async seed() {
    return this.fitnessService.seedDefaultWorkouts();
  }
}
