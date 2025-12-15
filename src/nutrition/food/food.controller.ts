import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { updateFoodDto } from './dto/update-food.dto';

@Controller('food')
export class FoodController {

    constructor(private readonly foodService: FoodService){}

    @UseGuards(AuthGuard)
    @Post('create-item')
    createFoodItem(@Body() dto:CreateFoodDto){
        return this.foodService.createFoodItem(dto);
    }

    @UseGuards(AuthGuard)
    @Get('all-items')
    getAllFoodItems(){
        return this.foodService.getAllFoodItems();
    }

    @UseGuards(AuthGuard)
    @Get('get-by-id/:id')
    getFoodItemById(@Param("id") id:string){
        return this.foodService.getFoodItemById(id);
    }

    @UseGuards(AuthGuard)
    @Get('find-by-barcode/:barcode')
    findFoodItemByBarcode(@Param("barcode") barcode:string){
        return this.foodService.findFoodItemByBarcode(barcode);
    }

    @UseGuards(AuthGuard)
    @Patch('update-item/:id')
    updateFoodItem(@Param("id") id:string,@Body() dto:updateFoodDto){
        return this.foodService.updateFoodItem(id,dto);
    }

    @UseGuards(AuthGuard)
    @Delete('delete-item/:id')
    deleteFoodItem(@Param("id") id:string){
        return this.foodService.deleteFoodItem(id);
    }
}
