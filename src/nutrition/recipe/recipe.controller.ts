import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
} from '@nestjs/swagger';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@ApiTags('Nutrition - Recipe')
@ApiBearerAuth('JWT-auth')
@Controller('nutrition/recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @UseGuards(AuthGuard)
  @Post('generate')
  @ApiOperation({
    summary: 'Generate/Create recipe',
    description: 'Create a new recipe.',
  })
  @ApiResponse({ status: 201, description: 'Recipe created successfully.' })
  async generateRecipe(@Body() dto: CreateRecipeDto, @Request() req) {
    const userId = req.user.id;
    dto.createdBy = userId;
    return this.recipeService.generateRecipe(dto);
  }

  @UseGuards(AuthGuard)
  @Get('all')
  @ApiOperation({
    summary: 'Get all recipes',
    description: 'Retrieve all recipes.',
  })
  @ApiResponse({ status: 200, description: 'Recipes retrieved successfully.' })
  async getAllRecipes() {
    return this.recipeService.getAllRecipes();
  }

  @UseGuards(AuthGuard)
  @Get('my')
  @ApiOperation({
    summary: 'Get my recipes',
    description: 'Retrieve recipes created by the user.',
  })
  @ApiResponse({
    status: 200,
    description: 'My recipes retrieved successfully.',
  })
  async myRecipe(@Request() req) {
    const userId = req.user.id;
    return this.recipeService.getRecipesByUser(userId);
  }

  @UseGuards(AuthGuard)
  @Get('get-by-id/:id')
  @ApiOperation({
    summary: 'Get recipe by ID',
    description: 'Retrieve a recipe by its ID.',
  })
  @ApiParam({ name: 'id', description: 'Recipe ID' })
  @ApiResponse({ status: 200, description: 'Recipe retrieved successfully.' })
  async getRecipeById(@Param('id') id: string) {
    return this.recipeService.getRecipeById(id);
  }

  @UseGuards(AuthGuard)
  @Patch('update/:id')
  @ApiOperation({
    summary: 'Update recipe',
    description: 'Update a recipe by ID.',
  })
  @ApiParam({ name: 'id', description: 'Recipe ID' })
  @ApiResponse({ status: 200, description: 'Recipe updated successfully.' })
  async updateRecipe(@Param('id') id: string, @Body() dto: UpdateRecipeDto) {
    return this.recipeService.updateRecipe(id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('delete/:id')
  @ApiOperation({
    summary: 'Delete recipe',
    description: 'Delete a recipe by ID.',
  })
  @ApiParam({ name: 'id', description: 'Recipe ID' })
  @ApiResponse({ status: 200, description: 'Recipe deleted successfully.' })
  async deleteRecipe(@Param('id') id: string) {
    return this.recipeService.deleteRecipe(id);
  }
}
