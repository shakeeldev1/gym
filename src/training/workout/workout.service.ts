import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkoutBlockDto } from './dto/create-workout-block.dto';
import { InjectModel } from '@nestjs/mongoose';
import { WorkoutBlock } from './schemas/workout-block.schema';
import { Model, Types } from 'mongoose';
import { UpdateWorkoutBlockDto } from './dto/update-workout-block.dto';
import { AddSetDto } from './dto/add-set.dto';
import { WorkoutSet } from './schemas/workout-set.schema';
import { UpdateSetDto } from './dto/update-set.dto';

@Injectable()
export class WorkoutService {

    constructor(@InjectModel(WorkoutBlock.name) private blockModel: Model<WorkoutBlock>,
        @InjectModel(WorkoutSet.name) private setModel: Model<WorkoutSet>) { }

    createWorkoutBlock(dto: CreateWorkoutBlockDto): Promise<WorkoutBlock> {
        const newBlock = new this.blockModel(dto);
        return newBlock.save();
    }

    async getOneBlock(id: string): Promise<WorkoutBlock> {
        const block = await this.blockModel.findById(id).populate('exercises sets').exec();
        if (!block) {
            throw new NotFoundException('Workout block not found');
        }
        return block;
    }

    async updateBlock(id: string, dto: UpdateWorkoutBlockDto): Promise<WorkoutBlock> {
        const updateBlock = await this.blockModel.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!updateBlock) {
            throw new NotFoundException('Workout block not found');
        }
        return updateBlock;
    }

    async deleteBlock(id: string): Promise<{ message: string }> {
        const deleteResult = await this.blockModel.findByIdAndDelete(id).exec();
        if (!deleteResult) {
            throw new NotFoundException('Workout block not found');
        }
        return { message: 'Workout block deleted successfully' };
    }

    async addSetToBlock(blockId: string, dto: AddSetDto): Promise<WorkoutSet> {
        const block = await this.blockModel.findById(blockId).exec();
        if (!block) {
            throw new NotFoundException('Workout block not found');
        }
        const newSet = await this.setModel.create(dto);
        block.sets.push(newSet._id);
        await block.save();
        return newSet;
    }

    async updateSetInBlock(blockId: string, exerciseId: string, setId: string, dto: UpdateSetDto): Promise<WorkoutSet> {
        const block = await this.blockModel.findById(blockId).exec();
        if (!block) {
            throw new NotFoundException('Workout block not found');
        }
        
        // Validate exercise belongs to the block
        const exerciseExists = block.exercises?.some(ex => ex.toString() === exerciseId);
        if (!exerciseExists) {
            throw new NotFoundException('Exercise not found in this workout block');
        }
        
        const updateSet = await this.setModel.findByIdAndUpdate(setId, dto, { new: true }).exec();
        if (!updateSet) {
            throw new NotFoundException('Workout set not found');
        }
        return updateSet;
    }

    async deleteSetInBlock(blockId: string, setId: string): Promise<{ message: string }> {
        const block = await this.blockModel.findById(blockId).exec();
        if (!block) {
            throw new NotFoundException('Workout block not found');
        }
        const deleteSet = await this.setModel.findByIdAndDelete(setId).exec();
        if (!deleteSet) {
            throw new NotFoundException('Workout set not found');
        }
        block.sets = block.sets.filter(sId => sId.toString() !== setId);
        await block.save();
        return { message: 'Workout set deleted successfully' };
    }

    async deleteExerciseFromBlock(blockId: string, exerciseId: string): Promise<{ message: string }> {
        const block = await this.blockModel.findById(blockId).exec();
        if (!block) {
            throw new NotFoundException('Workout block not found');
        }
        block.exercises = block.exercises.filter(exId => exId.toString() !== exerciseId);
        if (Array.isArray((block as any).completedExercises)) {
            (block as any).completedExercises = (block as any).completedExercises.filter(exId => exId.toString() !== exerciseId);
        }
        await block.save();
        return { message: 'Exercise deleted from block successfully' };
    }

    async getAllBlocks(): Promise<WorkoutBlock[]> {
        return this.blockModel.find().populate('exercises sets').exec();
    }

    async setExerciseCompletion(blockId: string, exerciseId: string, completed: boolean): Promise<WorkoutBlock> {
        const block = await this.blockModel.findById(blockId).exec();
        if (!block) {
            throw new NotFoundException('Workout block not found');
        }

        const exIdStr = exerciseId.toString();
        // Ensure field exists
        const current = (block as any).completedExercises as any[] || [];
        const exists = current.some((id: any) => id.toString() === exIdStr);

        if (completed && !exists) {
            current.push(new Types.ObjectId(exerciseId));
        } else if (!completed && exists) {
            const next = current.filter((id: any) => id.toString() !== exIdStr);
            (block as any).completedExercises = next as any;
        }
        if (!(block as any).completedExercises || (block as any).completedExercises.length !== current.length) {
            (block as any).completedExercises = current as any;
        }
        await block.save();
        return this.blockModel.findById(blockId).populate('exercises sets').exec() as unknown as WorkoutBlock;
    }
}
