import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meditation, MeditationDocument } from './schemas/meditation.schema';
import { Model } from 'mongoose';
import { Breathwork, BreathworkDocument } from './schemas/breathwork.schema';
import { Sleep, SleepDocument } from './schemas/sleep.schema';
import { CreateMeditationDto } from './dto/create-meditation.dto';

@Injectable()
export class MindsetRecoveryService {
    constructor(@InjectModel(Meditation.name) private meditationModel: Model<MeditationDocument>,
        @InjectModel(Breathwork.name) private breathworkModel: Model<BreathworkDocument>,
        @InjectModel(Sleep.name) private sleepModel: Model<SleepDocument>
    ) { }

    async addMeditation(userId: string, dto: CreateMeditationDto) {
        const newMeditation = new this.meditationModel({
            user: userId,
            ...dto
        });
        return newMeditation.save();
    }
}
