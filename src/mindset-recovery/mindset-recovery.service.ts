import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meditation, MeditationDocument } from './schemas/meditation.schema';
import { Model } from 'mongoose';
import { Breathwork, BreathworkDocument } from './schemas/breathwork.schema';
import { Sleep, SleepDocument } from './schemas/sleep.schema';
import { CreateMeditationDto } from './dto/create-meditation.dto';
import { CreateBreathworkDto } from './dto/create-breathwork.dto';
import { CreateSleepDto } from './dto/create-sleep.dto';
import moment from 'moment';

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

    async getMeditations(userId: string, date?: string) {
        const query: any = { user: userId };
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: start, $lte: end };
        }
        return this.meditationModel.find(query).exec();
    }

    async getAllMeditations() {
        return this.meditationModel.find().sort({ date: -1 }).limit(100).exec();
    }

    async addBreathwork(userId: string, dto: CreateBreathworkDto) {
        const newBreathwork = new this.breathworkModel({
            user: userId,
            ...dto
        });
        return newBreathwork.save();
    }

    async getBreathworks(userId: string, date?: string) {
        const query: any = { user: userId };
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: start, $lte: end };
        }
        return this.breathworkModel.find(query).exec();
    }

    async addSleep(userId: string, dto: CreateSleepDto) {
        const newSleep = new this.sleepModel({
            user: userId,
            ...dto
        });
        return newSleep.save();
    }

    async getSleeps(userId: string, date?: string) {
        const query: any = { user: userId };
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: start, $lte: end };
        }
        return this.sleepModel.find(query).exec();
    }

    async getProgress(userId: string, period: 'daily' | 'weekly' | 'monthly', date?: string) {
        const userObjectId = userId;
        const refDate = date ? moment(date) : moment();

        let start: Date;
        let end: Date;

        switch (period) {
            case 'daily':
                start = refDate.startOf('day').toDate();
                end = refDate.endOf('day').toDate();
                break;
            case 'weekly':
                start = refDate.startOf('isoWeek').toDate();
                end = refDate.endOf('isoWeek').toDate();
                break;
            case 'monthly':
                start = refDate.startOf('month').toDate();
                end = refDate.endOf('month').toDate();
                break;
        }

        const [meditations, breathworks, sleeps] = await Promise.all([
            this.meditationModel.find({ user: userObjectId, date: { $gte: start, $lte: end } }).lean(),
            this.breathworkModel.find({ user: userObjectId, date: { $gte: start, $lte: end } }).lean(),
            this.sleepModel.find({ user: userObjectId, date: { $gte: start, $lte: end } }).lean(),
        ]);

        const meditationTotal = meditations.reduce((sum, m) => sum + m.durationMinutes, 0);
        const meditationAvg = meditations.length ? Math.round(meditationTotal / meditations.length) : 0;

        const breathworkTotal = breathworks.reduce((sum, b) => sum + b.durationMinutes, 0);
        const breathworkAvg = breathworks.length ? Math.round(breathworkTotal / breathworks.length) : 0;

        const sleepTotal = sleeps.reduce((sum, s) => sum + s.durationHours, 0);
        const sleepAvgQuality = sleeps.length ? Math.round(sleeps.reduce((sum, s) => sum + (s.quality ?? 0), 0) / sleeps.length) : 0;

        return {
            period,
            startDate: start,
            endDate: end,
            progress: {
                meditation: {
                    sessions: meditations.length,
                    totalMinutes: meditationTotal,
                    averageMinutes: meditationAvg,
                },
                breathwork: {
                    sessions: breathworks.length,
                    totalMinutes: breathworkTotal,
                    averageMinutes: breathworkAvg,
                },
                sleep: {
                    sessions: sleeps.length,
                    totalHours: sleepTotal,
                    averageQuality: sleepAvgQuality,
                },
            },
        };
    }
}