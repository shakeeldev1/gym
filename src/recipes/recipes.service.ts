import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WellnessRecipeDocument } from './schemas/recipe.schema';
import { CreateRecipeDto, UpdateRecipeDto } from './dto/recipe.dto';

@Injectable()
export class WellnessRecipesService {
  constructor(
    @InjectModel('WellnessRecipe') private recipeModel: Model<WellnessRecipeDocument>,
  ) {}

  /**
   * Get all active recipes (for users to view)
   */
  async getAllRecipes(limit: number = 50, skip: number = 0) {
    const recipes = await this.recipeModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    const total = await this.recipeModel.countDocuments({ isActive: true });

    return {
      recipes: recipes.map((r: any) => ({
        _id: r._id,
        title: r.title ?? r.name ?? '',
        description: r.description ?? r.metadata?.description ?? '',
        imageUrl: r.imageUrl ?? r.metadata?.imageUrl ?? '',
        calories: r.calories ?? null,
        serving: r.serving ?? 1,
        protein: r.protein ?? null,
        carbs: r.carbs ?? null,
        fats: r.fats ?? null,
        fibre: r.fibre ?? null,
        tags: r.tags ?? [],
        ingredients: r.ingredients ?? [],
        isPublic: r.isPublic ?? r.isActive ?? true,
        isActive: r.isActive ?? true,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single recipe by ID
   */
  async getRecipeById(recipeId: string) {
    const recipe = await this.recipeModel
      .findById(recipeId)
      .lean();

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    return {
      _id: recipe._id,
      title: recipe.title ?? (recipe as any).name ?? '',
      description: recipe.description ?? (recipe as any).metadata?.description ?? '',
      imageUrl: recipe.imageUrl ?? (recipe as any).metadata?.imageUrl ?? '',
      calories: recipe.calories ?? null,
      serving: recipe.serving ?? 1,
      protein: recipe.protein ?? null,
      carbs: recipe.carbs ?? null,
      fats: recipe.fats ?? null,
      fibre: recipe.fibre ?? null,
      tags: (recipe as any).tags ?? [],
      ingredients: (recipe as any).ingredients ?? [],
      isPublic: (recipe as any).isPublic ?? recipe.isActive ?? true,
      isActive: recipe.isActive ?? true,
    };
  }

  /**
   * Search recipes by title or description
   */
  async searchRecipes(query: string, limit: number = 50, skip: number = 0) {
    const recipes = await this.recipeModel
      .find({
        isActive: true,
        $text: { $search: query },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    const total = await this.recipeModel.countDocuments({
      isActive: true,
      $text: { $search: query },
    });

    return {
      recipes: recipes.map((r: any) => ({
        _id: r._id,
        title: r.title ?? r.name ?? '',
        description: r.description ?? r.metadata?.description ?? '',
        imageUrl: r.imageUrl ?? r.metadata?.imageUrl ?? '',
        calories: r.calories ?? null,
        serving: r.serving ?? 1,
        protein: r.protein ?? null,
        carbs: r.carbs ?? null,
        fats: r.fats ?? null,
        fibre: r.fibre ?? null,
        tags: r.tags ?? [],
        ingredients: r.ingredients ?? [],
        isPublic: r.isPublic ?? r.isActive ?? true,
        isActive: r.isActive ?? true,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new recipe (admin/coach only)
   */
  async createRecipe(userId: string, dto: CreateRecipeDto) {
    // Validate nutrition values
    if (dto.calories < 0 || dto.protein < 0 || dto.carbs < 0 || dto.fats < 0 || dto.fibre < 0) {
      throw new BadRequestException('Nutrition values must be non-negative');
    }

    const recipe = new this.recipeModel({
      ...dto,
      // Ensure both title and name are set for compatibility
      title: dto.title ?? dto.name,
      name: dto.name ?? dto.title,
      createdBy: new Types.ObjectId(userId),
      serving: dto.serving || 1,
    });

    try {
      await recipe.save();
    } catch (err: any) {
      // Surface validation messages clearly
      if (err?.name === 'ValidationError') {
        throw new BadRequestException(err.message);
      }
      throw err;
    }

    return recipe.populate('createdBy', '_id fName lName email role');
  }

  /**
   * Update a recipe (admin/coach only - creator or other admin can edit)
   */
  async updateRecipe(userId: string, recipeId: string, dto: UpdateRecipeDto) {
    const recipe = await this.recipeModel.findById(recipeId);

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    // Validate nutrition values if provided
    if (dto.calories !== undefined && dto.calories < 0) {
      throw new BadRequestException('Calories must be non-negative');
    }
    if (dto.protein !== undefined && dto.protein < 0) {
      throw new BadRequestException('Protein must be non-negative');
    }
    if (dto.carbs !== undefined && dto.carbs < 0) {
      throw new BadRequestException('Carbs must be non-negative');
    }
    if (dto.fats !== undefined && dto.fats < 0) {
      throw new BadRequestException('Fats must be non-negative');
    }
    if (dto.fibre !== undefined && dto.fibre < 0) {
      throw new BadRequestException('Fibre must be non-negative');
    }

    // Update the recipe
    Object.assign(recipe, dto);
    // Keep title/name in sync if one is provided
    if (dto.title !== undefined) {
      recipe.title = dto.title;
      (recipe as any).name = dto.title;
    }
    if (dto.name !== undefined) {
      recipe.title = dto.name;
      (recipe as any).name = dto.name;
    }
    recipe.updatedBy = new Types.ObjectId(userId);

    await recipe.save();

    return recipe.populate(['createdBy', 'updatedBy']);
  }

  /**
   * Delete a recipe (permanent hard delete)
   */
  async deleteRecipe(userId: string, recipeId: string) {
    const result = await this.recipeModel.findByIdAndDelete(recipeId);

    if (!result) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    return { message: 'Recipe deleted successfully' };
  }

  /**
   * Permanently delete a recipe
   */
  async permanentlyDeleteRecipe(recipeId: string) {
    const result = await this.recipeModel.findByIdAndDelete(recipeId);

    if (!result) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    return { message: 'Recipe permanently deleted' };
  }

  /**
   * Get all recipes (including inactive) for admin
   */
  async getAllRecipesForAdmin(limit: number = 50, skip: number = 0) {
    const recipes = await this.recipeModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();

    const total = await this.recipeModel.countDocuments();

    return {
      recipes: recipes.map((r: any) => ({
        _id: r._id,
        title: r.title ?? r.name ?? '',
        description: r.description ?? r.metadata?.description ?? '',
        imageUrl: r.imageUrl ?? r.metadata?.imageUrl ?? '',
        calories: r.calories ?? null,
        serving: r.serving ?? 1,
        protein: r.protein ?? null,
        carbs: r.carbs ?? null,
        fats: r.fats ?? null,
        fibre: r.fibre ?? null,
        tags: r.tags ?? [],
        ingredients: r.ingredients ?? [],
        isPublic: r.isPublic ?? r.isActive ?? true,
        isActive: r.isActive ?? true,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit),
    };
  }
}
