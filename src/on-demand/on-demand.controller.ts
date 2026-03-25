import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiAdminOnly } from 'src/common/decorators/api-admin.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { OnDemandService } from './on-demand.service';

@ApiTags('On Demand')
@ApiBearerAuth('JWT-auth')
@Controller('on-demand')
export class OnDemandController {
  constructor(private readonly onDemandService: OnDemandService) {}

  @UseGuards(AuthGuard)
  @Get('videos')
  @ApiOperation({ summary: 'Get on-demand videos' })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'Videos retrieved.' })
  async getVideos(@Query('category') category?: string) {
    const videos = await this.onDemandService.getVideos(category);
    return { data: videos };
  }

  @UseGuards(AuthGuard)
  @Get('videos/:id')
  @ApiOperation({ summary: 'Get video by ID' })
  @ApiResponse({ status: 200, description: 'Video retrieved.' })
  async getVideo(@Param('id') id: string) {
    return this.onDemandService.getById(id);
  }

  @UseGuards(AuthGuard)
  @Post('videos/:id/log')
  @ApiOperation({ summary: 'Log video workout completion' })
  @ApiResponse({ status: 201, description: 'Workout logged.' })
  async logWorkout(@Param('id') id: string, @Body() body?: any) {
    return this.onDemandService.logWorkout(id, body);
  }

  @UseGuards(AuthGuard)
  @Post('seed')
  @ApiOperation({ summary: 'Seed default videos' })
  @ApiAdminOnly()
  @ApiResponse({ status: 201, description: 'Videos seeded.' })
  async seed() {
    return this.onDemandService.seed();
  }
}
