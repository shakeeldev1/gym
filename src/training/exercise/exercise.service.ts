import { Injectable, NotFoundException } from '@nestjs/common';
import { createExerciseDto } from './dto/create-exercise.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exercise, exerciseDocument } from './exercise.schema';
import { updateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExerciseService {
    constructor(@InjectModel(Exercise.name) private exerciseModel: Model<exerciseDocument>) { }

    createExercise(createExerciseDto: createExerciseDto) {
        const created = new this.exerciseModel(createExerciseDto);
        return created.save();
    }

    async getAllExercises() {
        const exercises = await this.exerciseModel.find().exec();
        const total = await this.exerciseModel.countDocuments().exec();
        return { total, exercises }
    }

    getExerciseById(id: string) {
        return this.exerciseModel.find({ _id: id }).exec();
    }

    async updateExercise(id: string, updateExerciseDto: updateExerciseDto) {
        const updated = await this.exerciseModel.findByIdAndUpdate(id, updateExerciseDto, { new: true }).exec();
        if (!updated) {
            throw new NotFoundException('Exercise not found');
        }
        return updated;
    }

    async deleteExercise(id: string) {
        const deleted = await this.exerciseModel.findByIdAndDelete(id).exec();
        if (!deleted) {
            throw new NotFoundException('Exercise not found');
        }
        return { message: 'Exercise deleted successfully', deleted };
    }

}
