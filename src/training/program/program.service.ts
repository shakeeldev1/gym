import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgramDto } from './dtos/create-program.dto';
import { Program, programDocument } from './program.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { updateProgramDto } from './dtos/update-program.dto';

@Injectable()
export class ProgramService {
    constructor(@InjectModel(Program.name) private programModel: Model<programDocument>) { }

    async createProgram(createProgramDto: CreateProgramDto): Promise<Program> {
        const created = new this.programModel(createProgramDto);
        return created.save();
    }

    async getAllPrograms(): Promise<{ total: number; programs: Program[] }> {
        const programs = await this.programModel.find().exec();
        const total = await this.programModel.countDocuments().exec();
        return { total, programs };
    }

    async findOne(id: string): Promise<Program> {
        const program = await this.programModel.findById(id).exec();
        if (!program) {
            throw new NotFoundException('Program not found');
        }
        return program;
    }

    async updateProgram(id: string, updateProgramDto: updateProgramDto): Promise<Program> {
        const updated = await this.programModel.findByIdAndUpdate(id, updateProgramDto, { new: true }).exec();
        if (!updated) {
            throw new NotFoundException('Program not found');
        }
        return updated;
    }

    async deleteProgram(id: string): Promise<{ message: string; deleted: Program }> {
        const deleted = await this.programModel.findByIdAndDelete(id).exec();
        if (!deleted) {
            throw new NotFoundException('Program not found');
        }
        return { message: 'Program deleted successfully', deleted };
    }

    async assignToUser(programId: string, updateData: { assignedTo: string }): Promise<Program> {
        const updated = await this.programModel.findByIdAndUpdate(programId, updateData, { new: true }).exec();
        if (!updated) {
            throw new NotFoundException('Program not found');
        }
        return updated;
    }
}
