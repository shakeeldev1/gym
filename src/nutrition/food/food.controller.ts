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
} from '@nestjs/swagger';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { updateFoodDto } from './dto/update-food.dto';

@ApiTags('Nutrition - Food')
@ApiBearerAuth('JWT-auth')
@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @UseGuards(AuthGuard)
  @Post('create-item')
  @ApiOperation({
    summary: 'Create food item',
    description: 'Create a new food item in the database.',
  })
  @ApiResponse({ status: 201, description: 'Food item created successfully.' })
  createFoodItem(@Body() dto: CreateFoodDto) {
    return this.foodService.createFoodItem(dto);
  }

  @UseGuards(AuthGuard)
  @Get('all-items')
  @ApiOperation({
    summary: 'Get all food items',
    description: 'Retrieve all food items.',
  })
  @ApiResponse({
    status: 200,
    description: 'Food items retrieved successfully.',
  })
  getAllFoodItems() {
    return this.foodService.getAllFoodItems();
  }

  @UseGuards(AuthGuard)
  @Get('get-by-id/:id')
  @ApiOperation({
    summary: 'Get food item',
    description: 'Retrieve a food item by ID.',
  })
  @ApiParam({ name: 'id', description: 'Food Item ID' })
  @ApiResponse({
    status: 200,
    description: 'Food item retrieved successfully.',
  })
  getFoodItemById(@Param('id') id: string) {
    return this.foodService.getFoodItemById(id);
  }

  @UseGuards(AuthGuard)
  @Get('find-by-barcode/:barcode')
  @ApiOperation({
    summary: 'Find by barcode',
    description: 'Find a food item by its barcode.',
  })
  @ApiParam({ name: 'barcode', description: 'Barcode string' })
  @ApiResponse({
    status: 200,
    description: 'Food item retrieved successfully.',
  })
  findFoodItemByBarcode(@Param('barcode') barcode: string) {
    return this.foodService.findFoodItemByBarcode(barcode);
  }

  @UseGuards(AuthGuard)
  @Patch('update-item/:id')
  @ApiOperation({
    summary: 'Update food item',
    description: 'Update a food item by ID.',
  })
  @ApiParam({ name: 'id', description: 'Food Item ID' })
  @ApiResponse({ status: 200, description: 'Food item updated successfully.' })
  updateFoodItem(@Param('id') id: string, @Body() dto: updateFoodDto) {
    return this.foodService.updateFoodItem(id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('delete-item/:id')
  @ApiOperation({
    summary: 'Delete food item',
    description: 'Delete a food item by ID.',
  })
  @ApiParam({ name: 'id', description: 'Food Item ID' })
  @ApiResponse({ status: 200, description: 'Food item deleted successfully.' })
  deleteFoodItem(@Param('id') id: string) {
    return this.foodService.deleteFoodItem(id);
  }
}
