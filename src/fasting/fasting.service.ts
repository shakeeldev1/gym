import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Fasting } from './schemas/fasting.schema';
import { Model, Types } from 'mongoose';
import { CreateFastingDto } from './dto/create-fasting.dto';
import { EndFastingDto } from './dto/end-fasting.dto';

@Injectable()
export class FastingService {
    constructor(@InjectModel(Fasting.name) private readonly fastingModel: Model<Fasting>) { }

    async startFasting(userId: string, dto: CreateFastingDto): Promise<Fasting> {
        await this.fastingModel.updateMany(
            { user: userId, isActive: true },
            { isActive: false }
        );
        const fasting = await this.fastingModel.create({
            user: new Types.ObjectId(userId),
            startTime: new Date(),
            goalDurationHours: dto.goalDurationHours,
            notes: dto.notes,
            isActive: true
        });
        return fasting;
    }

    async endFasting(userId: string, dto?: EndFastingDto): Promise<Fasting | null> {
        console.log('Ending fasting for user:', userId, 'with dto:', dto);
        const fasting = await this.fastingModel.findOne({ user: new Types.ObjectId(userId), isActive: true });
        console.log('Found fasting session:', fasting);
        if (!fasting) {
            throw new NotFoundException('No active fasting session found');
        }
        fasting.endTime = new Date();
        fasting.isActive = false;
        if (dto?.notes) {
            fasting.notes = dto.notes;
        }
        await fasting.save();
        return fasting;
    }

    async getFastingHistory(userId: string): Promise<Fasting[]> {
        return this.fastingModel.find({ user: new Types.ObjectId(userId) }).sort({ startTime: -1 }).exec();
    }
}
