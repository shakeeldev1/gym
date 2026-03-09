import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/favorite.dto';

@ApiTags('Favorites')
@ApiBearerAuth('JWT-auth')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all favorites grouped by type' })
  @ApiResponse({ status: 200, description: 'Favorites retrieved.' })
  async getFavorites(@Request() req) {
    return this.favoritesService.getFavorites(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Add item to favorites' })
  @ApiResponse({ status: 201, description: 'Added to favorites.' })
  async addFavorite(@Request() req, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.addFavorite(req.user.id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove item from favorites' })
  @ApiResponse({ status: 200, description: 'Removed from favorites.' })
  async removeFavorite(@Request() req, @Param('itemId') itemId: string) {
    return this.favoritesService.removeFavorite(req.user.id, itemId);
  }
}
