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

    async assignAlternateExercises(id: string, alternateIds: string[]) {
        // Verify the main exercise exists
        const mainExercise = await this.exerciseModel.findById(id).exec();
        if (!mainExercise) {
            throw new NotFoundException('Exercise not found');
        }

        // Verify all alternate exercises exist
        if (alternateIds.length > 0) {
            const alternates = await this.exerciseModel.find({ _id: { $in: alternateIds } }).exec();
            if (alternates.length !== alternateIds.length) {
                throw new NotFoundException('One or more alternate exercises not found');
            }
        }

        // Filter out the main exercise from the alternate list (can't be alternate to itself)
        const filteredAlternateIds = alternateIds.filter(altId => altId !== id);

        // Update with unique alternates
        const uniqueAlternateIds = [...new Set(filteredAlternateIds)];

        const updated = await this.exerciseModel
            .findByIdAndUpdate(
                id,
                { $set: { alternateExerciseIds: uniqueAlternateIds || [] } },
                { new: true }
            )
            .populate('alternateExerciseIds', 'name equipment difficulty videoUrl posterUrl')
            .exec();

        return {
            message: 'Alternate exercises assigned successfully',
            exercise: updated,
        };
    }

    async removeAlternateExercise(id: string, alternateId: string) {
        const updated = await this.exerciseModel
            .findByIdAndUpdate(
                id,
                { $pull: { alternateExerciseIds: alternateId } },
                { new: true }
            )
            .populate('alternateExerciseIds', 'name equipment difficulty videoUrl posterUrl')
            .exec();

        if (!updated) {
            throw new NotFoundException('Exercise not found');
        }

        return {
            message: 'Alternate exercise removed successfully',
            exercise: updated,
        };
    }

    async getAlternateExercises(id: string) {
        const exercise = await this.exerciseModel
            .findById(id)
            .populate('alternateExerciseIds', 'name equipment difficulty videoUrl posterUrl')
            .exec();

        if (!exercise) {
            throw new NotFoundException('Exercise not found');
        }

        return {
            id: exercise._id,
            name: exercise.name,
            alternateExercises: exercise.alternateExerciseIds || [],
        };
    }
