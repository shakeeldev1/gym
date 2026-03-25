import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
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
  ApiBody,
} from '@nestjs/swagger';
import { ApiAdminOnly } from 'src/common/decorators/api-admin.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { OnDemandService } from './on-demand.service';
import { CreateOnDemandDto } from './dto/create-on-demand.dto';
import { UpdateOnDemandDto } from './dto/update-on-demand.dto';

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
  @Get('videos/all')
  @ApiOperation({ summary: 'Get all videos (admin)' })
  @ApiAdminOnly()
  @ApiResponse({ status: 200, description: 'All videos retrieved.' })
  async getAllForAdmin(@Query('limit') limit?: number, @Query('skip') skip?: number) {
    try {
      const videos = await this.onDemandService.getAllForAdmin();
      return { data: videos };
    } catch (err) {
      // Log server-side error for diagnosis
      // eslint-disable-next-line no-console
      console.error('Failed to get all on-demand videos (admin):', err?.message || err);
      throw err; // rethrow so Nest's exception filter returns appropriate response
    }
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
  @Post('videos')
  @ApiOperation({ summary: 'Create a new on-demand video (admin)' })
  @ApiAdminOnly()
  @ApiBody({ type: CreateOnDemandDto })
  @ApiResponse({ status: 201, description: 'Video created.' })
  async create(@Body() body: CreateOnDemandDto) {
    const created = await this.onDemandService.create(body);
    return { data: created };
  }

  @UseGuards(AuthGuard)
  @Put('videos/:id')
  @ApiOperation({ summary: 'Update on-demand video (admin)' })
  @ApiAdminOnly()
  @ApiBody({ type: UpdateOnDemandDto })
  @ApiResponse({ status: 200, description: 'Video updated.' })
  async update(@Param('id') id: string, @Body() body: UpdateOnDemandDto) {
    const updated = await this.onDemandService.update(id, body);
    return { data: updated };
  }

  @UseGuards(AuthGuard)
  @Delete('videos/:id')
  @ApiOperation({ summary: 'Delete on-demand video (admin)' })
  @ApiAdminOnly()
  @ApiResponse({ status: 200, description: 'Video deleted.' })
  async remove(@Param('id') id: string) {
    return this.onDemandService.remove(id);
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
