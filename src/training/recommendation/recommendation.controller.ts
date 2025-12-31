import { Controller, Post, Get, Patch, UseGuards, Req, Param, Body, Query, Res, HttpCode } from '@nestjs/common';
import { RecommendationService, SessionRecommendation } from './recommendation.service';
import { AIRecommendationService } from './ai-recommendation.service';
import { AuthGuard } from '../../auth/auth.guard';
import type { Response } from 'express';

@Controller('training/recommendations')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly aiRecommendationService: AIRecommendationService,
  ) {}

  // User endpoint: Generate recommendations on demand
  @UseGuards(AuthGuard)
  @Post('generate')
  async generateRecommendations(@Req() req: any): Promise<SessionRecommendation> {
    const userId = req.user.id;
    return this.recommendationService.getRecommendations({ userId });
  }

  // User endpoint: Get user's recommendations
  @UseGuards(AuthGuard)
  @Get('my-recommendations')
  async getMyRecommendations(
    @Req() req: any,
    @Query('status') status?: string
  ) {
    const userId = req.user.id;
    return this.recommendationService.getRecommendationsForUser(userId, status);
  }

  // User endpoint: Get single recommendation
  @UseGuards(AuthGuard)
  @Get(':id')
  async getRecommendation(@Param('id') id: string) {
    return this.recommendationService.getRecommendation(id);
  }

  // Coach endpoint: Get all pending recommendations
  @UseGuards(AuthGuard)
  @Get('coach/pending')
  async getPendingRecommendations(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.recommendationService.getPendingRecommendations(limitNum);
  }

  // Coach endpoint: Approve recommendation
  @UseGuards(AuthGuard)
  @Patch(':id/approve')
  async approveRecommendation(@Req() req: any, @Param('id') id: string) {
    const coachId = req.user.id;
    return this.recommendationService.approveRecommendation(id, coachId);
  }

  // Coach endpoint: Reject recommendation
  @UseGuards(AuthGuard)
  @Patch(':id/reject')
  async rejectRecommendation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { reason: string }
  ) {
    const coachId = req.user.id;
    return this.recommendationService.rejectRecommendation(id, body.reason, coachId);
  }

  // Coach endpoint: Update recommendation
  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateRecommendation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updates: { exercises?: any[]; coachNotes?: string; name?: string }
  ) {
    const coachId = req.user.id;
    return this.recommendationService.updateRecommendation(id, updates, coachId);
  }

  // AI-powered endpoint: Generate recommendation with natural language
  @UseGuards(AuthGuard)
  @Post('ai-generate')
  @HttpCode(200)
  async generateAIRecommendation(
    @Req() req: any,
    @Body() body: { userDescription: string; programDuration?: number; specificGoals?: string[] }
  ) {
    const userId = req.user.id;
    return this.aiRecommendationService.generateAIRecommendation({
      userId,
      userDescription: body.userDescription,
      programDuration: body.programDuration,
      specificGoals: body.specificGoals,
    });
  }

  // AI-powered endpoint with streaming response
  @UseGuards(AuthGuard)
  @Post('ai-generate-stream')
  async streamAIRecommendation(
    @Req() req: any,
    @Body() body: { userDescription: string; programDuration?: number; specificGoals?: string[] },
    @Res() res: Response
  ) {
    const userId = req.user.id;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const generator = this.aiRecommendationService.streamAIRecommendation({
        userId,
        userDescription: body.userDescription,
        programDuration: body.programDuration,
        specificGoals: body.specificGoals,
      });

      for await (const chunk of generator) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }

      res.write('data: {"done": true}\n\n');
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}

