import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { WellnessRecipesService } from './recipes.service';
import { CreateRecipeDto, UpdateRecipeDto } from './dto/recipe.dto';

// Route namespace separated from nutrition recipe module
@Controller('app-recipes')
export class WellnessRecipesController {
  constructor(private readonly recipesService: WellnessRecipesService) {}

  /**
   * Get all active recipes (public)
   */
  @Get()
  async getAllRecipes(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.recipesService.getAllRecipes(
      limit ? parseInt(limit) : 50,
      skip ? parseInt(skip) : 0,
    );
  }

  /**
   * Search recipes by query
   */
  @Get('search')
  async searchRecipes(
    @Query('q') query: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    if (!query) {
      throw new ForbiddenException('Search query is required');
    }

    return this.recipesService.searchRecipes(
      query,
      limit ? parseInt(limit) : 50,
      skip ? parseInt(skip) : 0,
    );
  }

  /**
   * Get all recipes including inactive (admin only)
   */
  @UseGuards(AuthGuard)
  @Get('all')
  async getAllRecipesForAdmin(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {

    return this.recipesService.getAllRecipesForAdmin(
      limit ? parseInt(limit) : 50,
      skip ? parseInt(skip) : 0,
    );
  }

  /**
   * Get a single recipe by ID
   */
  @Get(':id')
  async getRecipeById(@Param('id') id: string) {
    return this.recipesService.getRecipeById(id);
  }

  /**
   * Create a new recipe (admin/coach only)
   */
  @UseGuards(AuthGuard)
  @Post()
  async createRecipe(@Request() req, @Body() dto: CreateRecipeDto) {
    const user = req.user;
    if (user.role !== 'admin' && user.role !== 'coach') {
      throw new ForbiddenException('Only admins and coaches can create recipes');
    }

    // Fallback to _id if present, ensure string
    const creatorId: string = String(user.id || user._id);

    try {
      return await this.recipesService.createRecipe(creatorId, dto);
    } catch (err: any) {
      // Map common persistence/validation errors to 400 instead of 500
      const msg = err?.message || 'Failed to create recipe';
      if (err?.name === 'ValidationError' || msg.includes('validation')) {
        throw new BadRequestException(msg);
      }
      throw err;
    }
  }

  /**
   * Update a recipe (admin/coach only)
   */
  @UseGuards(AuthGuard)
  @Put(':id')
  async updateRecipe(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateRecipeDto,
  ) {
    const user = req.user;
    if (user.role !== 'admin' && user.role !== 'coach') {
      throw new ForbiddenException('Only admins and coaches can update recipes');
    }

    const updaterId: string = String(user.id || user._id);
    try {
      return await this.recipesService.updateRecipe(updaterId, id, dto);
    } catch (err: any) {
      const msg = err?.message || 'Failed to update recipe';
      if (err?.name === 'ValidationError' || msg.includes('validation')) {
        throw new BadRequestException(msg);
      }
      throw err;
    }
  }

  /**
   * Delete a recipe (soft delete - admin/coach only)
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteRecipe(@Request() req, @Param('id') id: string) {
    const user = req.user;
    if (user.role !== 'admin' && user.role !== 'coach') {
      throw new ForbiddenException('Only admins and coaches can delete recipes');
    }

    const deleterId: string = String(user.id || user._id);
    try {
      return await this.recipesService.deleteRecipe(deleterId, id);
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete recipe';
      if (err?.name === 'ValidationError' || msg.includes('validation')) {
        throw new BadRequestException(msg);
      }
      throw err;
    }
  }
}
