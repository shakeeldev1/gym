import { Injectable } from '@nestjs/common';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Performance } from './schemas/performance.schema';
import { Model } from 'mongoose';
import { UpdatePerformanceDto } from './dto/update-performance.dto';

@Injectable()
export class PerformanceService {
    constructor(@InjectModel(Performance.name) private performanceModel: Model<Performance>) { }

    async createPerformanceRecord(createPerformanceDto: CreatePerformanceDto): Promise<{ message: string; data: Performance }> {
        const createdRecord = await this.performanceModel.create(createPerformanceDto);
        return { message: 'Performance record created successfully', data: createdRecord };
    }

    async updatePerformanceRecord(id: string, updatePerformanceDto: UpdatePerformanceDto): Promise<{ message: string; data: Performance | null }> {
        const updatedRecord = await this.performanceModel.findByIdAndUpdate(id, updatePerformanceDto, { new: true });
        if (!updatedRecord) {
            return { message: 'Performance record not found', data: null };
        }
        return { message: 'Performance record updated successfully', data: updatedRecord };
    }

    async getPerformanceRecordsByUser(userId: string): Promise<{ message: string; data: Performance[] }> {
        const records = await this.performanceModel
            .find({ user: userId })
            .populate('session').exec();
        
        if (records.length === 0) {
            return { message: 'No performance records found for this user', data: [] };
        }

        return { message: 'Performance records retrieved successfully', data: records };
    }


    async getAllPerformanceRecords(): Promise<{ message: string; totalRecords: number; data: Performance[] }> {
        const records = await this.performanceModel.find().populate('session').exec();
        const totalRecords = await this.performanceModel.countDocuments().exec();
        if (records.length === 0) {
            return { message: 'No performance records found', totalRecords: 0, data: [] };
        }
        return { message: 'All performance records retrieved successfully', totalRecords, data: records };
    }
}
