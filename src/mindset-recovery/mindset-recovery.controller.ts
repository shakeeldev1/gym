import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MindsetRecoveryService } from './mindset-recovery.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateMeditationDto } from './dto/create-meditation.dto';
import { CreateBreathworkDto } from './dto/create-breathwork.dto';
import { CreateSleepDto } from './dto/create-sleep.dto';
import { UpdateBreathworkDto } from './dto/update-breathwork.dto';
import { UpdateMeditationDto } from './dto/update-meditation.dto';
import { UpdateSleepDto } from './dto/update-sleep.dto';
import { GetMindsetProgressDto } from './dto/get-progress.dto';
import { RecoveryPlan } from './schemas/recovery-plan.schema';

@ApiTags('Mindset Recovery')
@ApiBearerAuth('JWT-auth')
@Controller('mindset-recovery')
export class MindsetRecoveryController {
  constructor(
    private readonly mindsetRecoveryService: MindsetRecoveryService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('meditation')
  @ApiOperation({
    summary: 'Add meditation',
    description: 'Log a new meditation session.',
  })
  @ApiResponse({
    status: 201,
    description: 'Meditation session added successfully.',
  })
  async addMeditation(@Request() req, @Body() dto: CreateMeditationDto) {
    return this.mindsetRecoveryService.addMeditation(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('meditations')
  @ApiOperation({
    summary: 'Get meditations',
    description: 'Get meditation history with optional date filter.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Meditations retrieved successfully.',
  })
  async getMeditations(@Request() req, @Query('date') date?: string) {
    return this.mindsetRecoveryService.getMeditations(req.user.id, date);
  }

  @UseGuards(AuthGuard)
  @Get('meditation/all')
  @ApiOperation({
    summary: 'Get all meditations',
    description: 'Get all existing meditation sessions (Admin/Global).',
  })
  @ApiResponse({
    status: 200,
    description: 'All meditations retrieved successfully.',
  })
  async getAllMeditations() {
    return this.mindsetRecoveryService.getAllMeditations();
  }

  @UseGuards(AuthGuard)
  @Post('breathwork')
  @ApiOperation({
    summary: 'Add breathwork',
    description: 'Log a new breathwork session.',
  })
  @ApiResponse({
    status: 201,
    description: 'Breathwork session added successfully.',
  })
  async addBreathwork(@Request() req, @Body() dto: CreateBreathworkDto) {
    return this.mindsetRecoveryService.addBreathwork(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('breathworks')
  @ApiOperation({
    summary: 'Get breathworks',
    description: 'Get breathwork history with optional date filter.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Breathworks retrieved successfully.',
  })
  async getBreathworks(@Request() req, @Query('date') date?: string) {
    return this.mindsetRecoveryService.getBreathworks(req.user.id, date);
  }

  @UseGuards(AuthGuard)
  @Post('sleep')
  @ApiOperation({
    summary: 'Add sleep log',
    description: 'Log a new sleep session.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sleep session logged successfully.',
  })
  async addSleep(@Request() req, @Body() dto: CreateSleepDto) {
    return this.mindsetRecoveryService.addSleep(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Get('sleeps')
  @ApiOperation({
    summary: 'Get sleep logs',
    description: 'Get sleep history with optional date filter.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiResponse({
    status: 200,
    description: 'Sleep logs retrieved successfully.',
  })
  async getSleeps(@Request() req, @Query('date') date?: string) {
    return this.mindsetRecoveryService.getSleeps(req.user.id, date);
  }

  @UseGuards(AuthGuard)
  @Get('meditation/today')
  @ApiOperation({
    summary: "Get today's meditations",
    description: 'Get meditation sessions for the current day.',
  })
  @ApiResponse({
    status: 200,
    description: "Today's meditations retrieved successfully.",
  })
  async getTodayMeditations(@Request() req) {
    const today = new Date().toISOString().split('T')[0];
    return this.mindsetRecoveryService.getMeditations(req.user.id, today);
  }

  @UseGuards(AuthGuard)
  @Get('breathwork/today')
  @ApiOperation({
    summary: "Get today's breathworks",
    description: 'Get breathwork sessions for the current day.',
  })
  @ApiResponse({
    status: 200,
    description: "Today's breathworks retrieved successfully.",
  })
  async getTodayBreathworks(@Request() req) {
    const today = new Date().toISOString().split('T')[0];
    return this.mindsetRecoveryService.getBreathworks(req.user.id, today);
  }

  @UseGuards(AuthGuard)
  @Get('recovery-plan/active')
  @ApiOperation({
    summary: 'Get active recovery plan',
    description: 'Get the currently active recovery plan.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active recovery plan retrieved successfully.',
  })
  async getActiveRecoveryPlan(@Request() req) {
    return this.mindsetRecoveryService.getActiveRecoveryPlan(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('progress')
  @ApiOperation({
    summary: 'Get progress',
    description: 'Get mindset and recovery progress statistics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Progress statistics retrieved successfully.',
  })
  async getProgress(@Request() req, @Query() query: GetMindsetProgressDto) {
    return this.mindsetRecoveryService.getProgress(
      req.user.id,
      query.period,
      query.date,
    );
  }

  @UseGuards(AuthGuard)
  @Get('my-recovery-plan')
  @ApiOperation({
    summary: 'Get AI recovery plan',
    description: 'Get personalized AI-generated recovery plan.',
  })
  @ApiResponse({
    status: 200,
    description: 'AI recovery plan retrieved successfully.',
  })
  async getMyRecoveryPlan(@Request() req) {
    return this.mindsetRecoveryService.getAIRecoveryPlan(req.user.id);
  }

  // ==================== UPDATE ENDPOINTS ====================

  @UseGuards(AuthGuard)
  @Patch('breathwork/update/:id')
  @ApiOperation({
    summary: 'Update breathwork',
    description: 'Update a breathwork session by ID.',
  })
  @ApiParam({ name: 'id', description: 'Breathwork ID' })
  @ApiResponse({
    status: 200,
    description: 'Breathwork session updated successfully.',
  })
  async updateBreathwork(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateBreathworkDto,
  ) {
    return this.mindsetRecoveryService.updateBreathwork(req.user.id, id, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('meditation/update/:id')
  @ApiOperation({
    summary: 'Update meditation',
    description: 'Update a meditation session by ID.',
  })
  @ApiParam({ name: 'id', description: 'Meditation ID' })
  @ApiResponse({
    status: 200,
    description: 'Meditation session updated successfully.',
  })
  async updateMeditation(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMeditationDto,
  ) {
    return this.mindsetRecoveryService.updateMeditation(req.user.id, id, dto);
  }

  @UseGuards(AuthGuard)
  @Patch('sleep/update/:id')
  @ApiOperation({
    summary: 'Update sleep',
    description: 'Update a sleep record by ID.',
  })
  @ApiParam({ name: 'id', description: 'Sleep ID' })
  @ApiResponse({
    status: 200,
    description: 'Sleep record updated successfully.',
  })
  async updateSleep(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSleepDto,
  ) {
    return this.mindsetRecoveryService.updateSleep(req.user.id, id, dto);
  }

  // ==================== AI SUGGESTIONS ENDPOINTS ====================

  @UseGuards(AuthGuard)
  @Get('suggestions/sleep/:userId')
  @ApiOperation({
    summary: 'Get sleep suggestions',
    description: 'Get AI sleep suggestions for a user.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Sleep suggestions retrieved successfully.',
  })
  async getSleepSuggestions(@Request() req, @Param('userId') userId: string) {
    // TODO: Add admin role check
    return this.mindsetRecoveryService.getSleepSuggestions(userId);
  }

  @UseGuards(AuthGuard)
  @Post('suggestions/sleep/:id/approve')
  @ApiOperation({
    summary: 'Approve sleep suggestion',
    description: 'Approve a sleep suggestion.',
  })
  @ApiParam({ name: 'id', description: 'Suggestion ID' })
  @ApiResponse({
    status: 200,
    description: 'Sleep suggestion approved successfully.',
  })
  async approveSleepSuggestion(
    @Request() req,
    @Param('id') suggestionId: string,
  ) {
    // TODO: Add admin role check
    return this.mindsetRecoveryService.approveSleepSuggestion(
      suggestionId,
      req.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Post('suggestions/sleep/approve-all/:userId')
  @ApiOperation({
    summary: 'Approve all sleep suggestions',
    description: 'Approve all sleep suggestions for a user.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'All sleep suggestions approved successfully.',
  })
  async approveAllSleepSuggestions(
    @Request() req,
    @Param('userId') userId: string,
  ) {
    // TODO: Add admin role check
    return this.mindsetRecoveryService.approveAllSleepSuggestions(
      userId,
      req.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Get('suggestions/meditation/:userId')
  @ApiOperation({
    summary: 'Get meditation suggestions',
    description: 'Get AI meditation suggestions for a user.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Meditation suggestions retrieved successfully.',
  })
  async getMeditationSuggestions(
    @Request() req,
    @Param('userId') userId: string,
  ) {
    // TODO: Add admin role check
    return this.mindsetRecoveryService.getMeditationSuggestions(userId);
  }

  @UseGuards(AuthGuard)
  @Post('suggestions/meditation/:id/approve')
  @ApiOperation({
    summary: 'Approve meditation suggestion',
    description: 'Approve a meditation suggestion.',
  })
  @ApiParam({ name: 'id', description: 'Suggestion ID' })
  @ApiResponse({
    status: 200,
    description: 'Meditation suggestion approved successfully.',
  })
  async approveMeditationSuggestion(
    @Request() req,
    @Param('id') suggestionId: string,
  ) {
    // TODO: Add admin role check
    return this.mindsetRecoveryService.approveMeditationSuggestion(
      suggestionId,
      req.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Post('suggestions/meditation/approve-all/:userId')
  @ApiOperation({
    summary: 'Approve all meditation suggestions',
    description: 'Approve all meditation suggestions for a user.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'All meditation suggestions approved successfully.',
  })
  async approveAllMeditationSuggestions(
    @Request() req,
    @Param('userId') userId: string,
  ) {
    // TODO: Add admin role check
    return this.mindsetRecoveryService.approveAllMeditationSuggestions(
      userId,
      req.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Get('suggestions/breathwork/:userId')
  @ApiOperation({
    summary: 'Get breathwork suggestions',
    description: 'Get AI breathwork suggestions for a user.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Breathwork suggestions retrieved successfully.',
  })
  async getBreathworkSuggestions(
    @Request() req,
    @Param('userId') userId: string,
  ) {
    // TODO: Add admin role check
    return this.mindsetRecoveryService.getBreathworkSuggestions(userId);
  }

  @UseGuards(AuthGuard)
  @Post('suggestions/breathwork/:id/approve')
  @ApiOperation({
    summary: 'Approve breathwork suggestion',
    description: 'Approve a breathwork suggestion.',
  })
  @ApiParam({ name: 'id', description: 'Suggestion ID' })
  @ApiResponse({
    status: 200,
    description: 'Breathwork suggestion approved successfully.',
  })
  async approveBreathworkSuggestion(
    @Request() req,
    @Param('id') suggestionId: string,
  ) {
    // TODO: Add admin role check
    return this.mindsetRecoveryService.approveBreathworkSuggestion(
      suggestionId,
      req.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Post('suggestions/breathwork/approve-all/:userId')
  @ApiOperation({
    summary: 'Approve all breathwork suggestions',
    description: 'Approve all breathwork suggestions for a user.',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'All breathwork suggestions approved successfully.',
  })
  async approveAllBreathworkSuggestions(
    @Request() req,
    @Param('userId') userId: string,
  ) {
    // TODO: Add admin role check
    return this.mindsetRecoveryService.approveAllBreathworkSuggestions(
      userId,
      req.user.id,
    );
  }
}
