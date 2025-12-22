import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Fasting } from './schemas/fasting.schema';
import { Model, Types } from 'mongoose';
import { CreateFastingDto } from './dto/create-fasting.dto';

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
}
