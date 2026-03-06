import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meditation, MeditationDocument } from './schemas/meditation.schema';
import { Breathwork, BreathworkDocument } from './schemas/breathwork.schema';
import { Sleep, SleepDocument } from './schemas/sleep.schema';
import { RecoveryPlan, RecoveryPlanDocument } from './schemas/recovery-plan.schema';
import { SleepSuggestion } from './schemas/sleep-suggestion.schema';
import { MeditationSuggestion } from './schemas/meditation-suggestion.schema';
import { BreathworkSuggestion } from './schemas/breathwork-suggestion.schema';
import { CreateMeditationDto } from './dto/create-meditation.dto';
import { CreateBreathworkDto } from './dto/create-breathwork.dto';
import { CreateSleepDto } from './dto/create-sleep.dto';
import { DailyResetService } from 'src/common/services/daily-reset.service';
import moment from 'moment';

export type Period = 'daily' | 'weekly' | 'monthly';

export interface ProgressSection {
    sessions: number;
    totalMinutes?: number;
    averageMinutes?: number;
    totalHours?: number;
    averageQuality?: number;
}

export interface ProgressResult {
    period: Period;
    startDate: Date;
    endDate: Date;
    progress: {
        meditation: ProgressSection;
        breathwork: ProgressSection;
        sleep: ProgressSection;
    };
}

export interface RecoveryPlanSuggestion {
    userId: string;
    status: 'suggested';
    type: 'recovery-plan';
    recommendation: string;
    restDaysPerWeek: number;
    mobilityMinutesPerDay: number;
    targetSleepHours: string;
    optimalSleepWindow: string;
    preSleepRoutine: string[];
    wakeRoutine: string[];
    dailyMobilityPlan: {
        morning: { duration: number; activities: string[] };
        midday: { duration: number; activities: string[] };
        evening: { duration: number; activities: string[] };
    };
    weeklyRecoveryActivities: {
        meditation: { target_sessions: number; duration_minutes: number; best_time: string; focus: string };
        breathwork: { target_sessions: number; duration_minutes: number; technique: string; focus: string };
        deep_sleep: { target_nights: number; minimum_hours: number; focus: string };
        light_activity: { target_sessions: number; examples: string[]; intensity: string };
    };
    stressManagement: string[];
    hydration: string;
    avoidances: string[];
    supplements: string[];
    currentMetrics: {
        averageSleepQuality: number;
        averageSleepHours: number | string;
        recentMeditationSessions: number;
        recentBreathworkSessions: number;
    };
    notes: string;
    createdAt: Date;
}

@Injectable()
export class MindsetRecoveryService {
    constructor(
        @InjectModel(Meditation.name) private readonly meditationModel: Model<MeditationDocument>,
        @InjectModel(Breathwork.name) private readonly breathworkModel: Model<BreathworkDocument>,
        @InjectModel(Sleep.name) private readonly sleepModel: Model<SleepDocument>,
        @InjectModel(RecoveryPlan.name) private readonly recoveryPlanModel: Model<RecoveryPlanDocument>,
        @InjectModel(SleepSuggestion.name) private readonly sleepSuggestionModel: Model<SleepSuggestion>,
        @InjectModel(MeditationSuggestion.name) private readonly meditationSuggestionModel: Model<MeditationSuggestion>,
        @InjectModel(BreathworkSuggestion.name) private readonly breathworkSuggestionModel: Model<BreathworkSuggestion>,
        private readonly dailyResetService: DailyResetService,
    ) {}

    async addMeditation(userId: string, dto: CreateMeditationDto) {
        const newMeditation = new this.meditationModel({ user: userId, ...dto });
        return newMeditation.save();
    }

    async getMeditations(userId: string, date?: string) {
        const userObjectId = new Types.ObjectId(userId);
        const query: Record<string, unknown> = { 
            $or: [{ user: userObjectId }, { user: userId }],
            // Filter out AI-pending data - only show user-created or ai-approved
            source: { $in: ['user-created', 'ai-approved'] }
        };
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }
        return this.meditationModel.find(query).exec();
    }

    async getAllMeditations() {
        return this.meditationModel.find().sort({ date: -1 }).limit(100).exec();
    }

    async addBreathwork(userId: string, dto: CreateBreathworkDto) {
        const newBreathwork = new this.breathworkModel({ user: userId, ...dto });
        return newBreathwork.save();
    }

    async getBreathworks(userId: string, date?: string) {
        const userObjectId = new Types.ObjectId(userId);
        const query: Record<string, unknown> = { 
            $or: [{ user: userObjectId }, { user: userId }],
            // Filter out AI-pending data
            source: { $in: ['user-created', 'ai-approved'] }
        };
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }
        return this.breathworkModel.find(query).exec();
    }

    async addSleep(userId: string, dto: CreateSleepDto) {
        const newSleep = new this.sleepModel({ user: userId, ...dto });
        return newSleep.save();
    }

    async upsertRecoveryPlan(userId: string, plan: Partial<RecoveryPlan>) {
        await this.recoveryPlanModel.updateMany({ user: userId, isActive: true }, { isActive: false, endDate: new Date() });
        const doc = new this.recoveryPlanModel({ user: userId, isActive: true, ...plan });
        return doc.save();
    }

    async getActiveRecoveryPlan(userId: string) {
        return this.recoveryPlanModel.findOne({ user: userId, isActive: true }).sort({ createdAt: -1 }).lean();
    }

    async getSleeps(userId: string, date?: string) {
        const userObjectId = new Types.ObjectId(userId);
        const query: Record<string, unknown> = { 
            $or: [{ user: userObjectId }, { user: userId }],
            // Filter out AI-pending data
            source: { $in: ['user-created', 'ai-approved'] }
        };
        
        // If querying for today, apply daily reset logic
        if (date) {
            const queryDate = new Date(date);
            const isToday = this.dailyResetService.isToday(queryDate);
            
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };

            const sleeps = await this.sleepModel.find(query).exec();
            
            // Transform all results to include completed boolean for clarity
            return sleeps.map((sleep: any) => {
                const sleepObj = sleep.toObject();
                let status = sleepObj.status;
                let completed = false;

                // For today, reset status to 'planned' to allow re-logging
                if (isToday) {
                    status = 'planned';
                }

                // Determine if truly completed
                if (status === 'done') {
                    completed = true;
                }

                return {
                    ...sleepObj,
                    status,
                    completed // Add boolean flag for easier frontend handling
                };
            });
        }
        
        // For queries without date, also add completed flag
        const sleeps = await this.sleepModel.find(query).exec();
        return sleeps.map((sleep: any) => ({
            ...sleep.toObject(),
            completed: sleep.status === 'done'
        }));
    }

    async getProgress(userId: string, period: Period, date?: string): Promise<ProgressResult> {
        const userObjectId = new Types.ObjectId(userId);
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
            default:
                start = refDate.startOf('day').toDate();
                end = refDate.endOf('day').toDate();
        }

        const [meditations, breathworks, sleeps] = await Promise.all([
            this.meditationModel.find({ user: userObjectId, date: { $gte: start, $lte: end } }).lean(),
            this.breathworkModel.find({ user: userObjectId, date: { $gte: start, $lte: end } }).lean(),
            this.sleepModel.find({ user: userObjectId, date: { $gte: start, $lte: end } }).lean(),
        ]);

        const meditationTotal = meditations.reduce((sum, m) => sum + (m.durationMinutes ?? 0), 0);
        const meditationAvg = meditations.length ? Math.round(meditationTotal / meditations.length) : 0;

        const breathworkTotal = breathworks.reduce((sum, b) => sum + (b.durationMinutes ?? 0), 0);
        const breathworkAvg = breathworks.length ? Math.round(breathworkTotal / breathworks.length) : 0;

        const sleepTotal = sleeps.reduce((sum, s) => sum + (s.durationHours ?? 0), 0);
        const sleepAvgQuality = sleeps.length
            ? Math.round(sleeps.reduce((sum, s) => sum + (s.quality ?? 0), 0) / sleeps.length)
            : 0;

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

    async getAIRecoveryPlan(userId: string): Promise<RecoveryPlanSuggestion> {
        const userObjectId = new Types.ObjectId(userId);

        const [sleeps, meditations, breathworks] = await Promise.all([
            this.sleepModel.find({ user: userObjectId }).sort({ date: -1 }).limit(30).lean(),
            this.meditationModel.find({ user: userObjectId }).sort({ date: -1 }).limit(30).lean(),
            this.breathworkModel.find({ user: userObjectId }).sort({ date: -1 }).limit(30).lean(),
        ]);

        const avgSleepQuality = sleeps.length
            ? Math.round(sleeps.reduce((sum, s) => sum + (s.quality ?? 0), 0) / sleeps.length)
            : 0;

        const avgSleepHours = sleeps.length
            ? (sleeps.reduce((sum, s) => sum + (s.durationHours ?? 0), 0) / sleeps.length).toFixed(1)
            : '0';

        let restDaysPerWeek = 1;
        let mobilityMinutesPerDay = 10;
        let recommendation = 'Moderate recovery - maintain consistency';

        if (avgSleepQuality < 5 || Number(avgSleepHours) < 7) {
            restDaysPerWeek = 2;
            mobilityMinutesPerDay = 15;
            recommendation = 'High recovery needed - prioritize sleep and active recovery';
        } else if (avgSleepQuality >= 7 && Number(avgSleepHours) >= 8) {
            restDaysPerWeek = 1;
            mobilityMinutesPerDay = 10;
            recommendation = 'Optimal recovery - maintain current routine';
        }

        return {
            userId,
            status: 'suggested',
            type: 'recovery-plan',
            recommendation,
            restDaysPerWeek,
            mobilityMinutesPerDay,
            targetSleepHours: '7-9',
            optimalSleepWindow: '22:30 - 06:30',
            preSleepRoutine: [
                'Stop screens 60 minutes before bed',
                'Dim lights or use blue light filters',
                'Light stretching or gentle yoga (5-10 min)',
                'Box breathing exercise (5 min): 4-4-4-4 pattern',
                'Optional: warm bath/shower',
                'Magnesium glycinate supplement (optional)',
            ],
            wakeRoutine: [
                'Wake at consistent time (even weekends)',
                'Expose to natural light within 30 minutes of waking',
                'Hydrate immediately upon waking',
                'Light movement or stretching',
                'Protein-rich breakfast',
            ],
            dailyMobilityPlan: {
                morning: {
                    duration: 5,
                    activities: ['Cat-cow stretches', 'Arm circles', 'Hip circles', 'Spinal twists'],
                },
                midday: {
                    duration: 5,
                    activities: ['Shoulder rolls', 'Neck mobility', 'Desk stretches', 'Deep breathing'],
                },
                evening: {
                    duration: Math.max(0, mobilityMinutesPerDay - 10),
                    activities: ['Foam rolling (2 min)', 'Static stretching', 'Yoga poses', 'Meditation'],
                },
            },
            weeklyRecoveryActivities: {
                meditation: {
                    target_sessions: 3,
                    duration_minutes: 10,
                    best_time: 'Morning or evening',
                    focus: 'Stress reduction, mindfulness',
                },
                breathwork: {
                    target_sessions: 2,
                    duration_minutes: 5,
                    technique: 'Box breathing or 4-7-8 breathing',
                    focus: 'Parasympathetic activation',
                },
                deep_sleep: {
                    target_nights: 5,
                    minimum_hours: 7,
                    focus: 'REM and deep sleep stages',
                },
                light_activity: {
                    target_sessions: 2,
                    examples: ['Walking', 'Swimming', 'Yoga', 'Tai Chi'],
                    intensity: 'Low to moderate',
                },
            },
            stressManagement: [
                'Daily meditation: 10-15 minutes',
                'Journaling: 5-10 minutes, evening',
                'Breathing exercises: 5 min when stressed',
                'Social connection: Regular interaction with friends/family',
                'Nature time: 20-30 min in nature weekly',
            ],
            hydration: 'Drink 3-4 liters daily; reduce caffeine after 2 PM',
            avoidances: [
                'High caffeine after 2 PM',
                'Large meals 3 hours before sleep',
                'Alcohol near bedtime (disrupts sleep quality)',
                'Intense exercise within 3 hours of sleep',
                'Blue light devices 60+ min before bed',
            ],
            supplements: [
                'Magnesium glycinate: 150-300 mg before bed',
                'L-theanine: 100-200 mg for relaxation',
                'Melatonin: 0.5-3 mg if needed for sleep onset (short-term)',
                'Omega-3: 2-3g daily for mood & recovery',
            ],
            currentMetrics: {
                averageSleepQuality: avgSleepQuality,
                averageSleepHours: avgSleepHours,
                recentMeditationSessions: meditations.length,
                recentBreathworkSessions: breathworks.length,
            },
            notes: 'Recovery is personalized based on your data. Adjust based on how you feel. Consistency matters more than intensity.',
            createdAt: new Date(),
        };
    }

    // ==================== AI SUGGESTIONS ADMIN APPROVAL ====================

    /**
     * Get all pending sleep suggestions for a user
     */
    async getSleepSuggestions(userId: string) {
        const userObjectId = new Types.ObjectId(userId);
        return this.sleepSuggestionModel.find({ 
            userId: userObjectId, 
            status: 'pending' 
        }).sort({ date: 1 });
    }

    /**
     * Admin approves sleep suggestion and creates actual sleep record
     */
    async approveSleepSuggestion(suggestionId: string, adminId: string) {
        const suggestion = await this.sleepSuggestionModel.findById(suggestionId);
        if (!suggestion) {
            throw new Error('Suggestion not found');
        }

        // Create actual sleep record from suggestion
        const sleepRecord = await this.sleepModel.create({
            user: suggestion.userId,
            durationHours: suggestion.durationHours,
            quality: suggestion.quality,
            notes: suggestion.notes,
            date: suggestion.date,
            status: 'planned',
            isAiGenerated: true,
            source: 'ai-approved',
        });

        // Update suggestion status
        suggestion.status = 'approved';
        suggestion.approvedBy = new Types.ObjectId(adminId);
        suggestion.approvedAt = new Date();
        await suggestion.save();

        return { sleepRecord, suggestion };
    }

    /**
     * Admin approves all sleep suggestions for a user (bulk approve)
     */
    async approveAllSleepSuggestions(userId: string, adminId: string) {
        const suggestions = await this.getSleepSuggestions(userId);
        const results: any[] = [];

        for (const suggestion of suggestions) {
            const result = await this.approveSleepSuggestion(suggestion._id.toString(), adminId);
            results.push(result);
        }

        return { approved: results.length, records: results };
    }

    /**
     * Get all pending meditation suggestions for a user
     */
    async getMeditationSuggestions(userId: string) {
        const userObjectId = new Types.ObjectId(userId);
        return this.meditationSuggestionModel.find({ 
            userId: userObjectId, 
            status: 'pending' 
        }).sort({ date: 1 });
    }

    /**
     * Admin approves meditation suggestion
     */
    async approveMeditationSuggestion(suggestionId: string, adminId: string) {
        const suggestion = await this.meditationSuggestionModel.findById(suggestionId);
        if (!suggestion) {
            throw new Error('Suggestion not found');
        }

        const meditationRecord = await this.meditationModel.create({
            user: suggestion.userId,
            durationMinutes: suggestion.durationMinutes,
            type: suggestion.type,
            notes: suggestion.notes,
            date: suggestion.date,
            status: 'planned',
            isAiGenerated: true,
            source: 'ai-approved',
        });

        suggestion.status = 'approved';
        suggestion.approvedBy = new Types.ObjectId(adminId);
        suggestion.approvedAt = new Date();
        await suggestion.save();

        return { meditationRecord, suggestion };
    }

    /**
     * Admin approves all meditation suggestions for a user
     */
    async approveAllMeditationSuggestions(userId: string, adminId: string) {
        const suggestions = await this.getMeditationSuggestions(userId);
        const results: any[] = [];

        for (const suggestion of suggestions) {
            const result = await this.approveMeditationSuggestion(suggestion._id.toString(), adminId);
            results.push(result);
        }

        return { approved: results.length, records: results };
    }

    /**
     * Get all pending breathwork suggestions for a user
     */
    async getBreathworkSuggestions(userId: string) {
        const userObjectId = new Types.ObjectId(userId);
        return this.breathworkSuggestionModel.find({ 
            userId: userObjectId, 
            status: 'pending' 
        }).sort({ date: 1 });
    }

    /**
     * Admin approves breathwork suggestion
     */
    async approveBreathworkSuggestion(suggestionId: string, adminId: string) {
        const suggestion = await this.breathworkSuggestionModel.findById(suggestionId);
        if (!suggestion) {
            throw new Error('Suggestion not found');
        }

        const breathworkRecord = await this.breathworkModel.create({
            user: suggestion.userId,
            durationMinutes: suggestion.durationMinutes,
            technique: suggestion.technique,
            notes: suggestion.notes,
            date: suggestion.date,
            status: 'planned',
            isAiGenerated: true,
            source: 'ai-approved',
        });

        suggestion.status = 'approved';
        suggestion.approvedBy = new Types.ObjectId(adminId);
        suggestion.approvedAt = new Date();
        await suggestion.save();

        return { breathworkRecord, suggestion };
    }

    /**
     * Admin approves all breathwork suggestions for a user
     */
    async approveAllBreathworkSuggestions(userId: string, adminId: string) {
        const suggestions = await this.getBreathworkSuggestions(userId);
        const results: any[] = [];

        for (const suggestion of suggestions) {
            const result = await this.approveBreathworkSuggestion(suggestion._id.toString(), adminId);
            results.push(result);
        }

        return { approved: results.length, records: results };
    }

    /**
     * Admin rejects a suggestion
     */
    async rejectSuggestion(model: any, suggestionId: string, adminId: string, reason?: string) {
        const suggestion = await model.findById(suggestionId);
        if (!suggestion) {
            throw new Error('Suggestion not found');
        }

        suggestion.status = 'rejected';
        suggestion.approvedBy = new Types.ObjectId(adminId);
        suggestion.rejectedAt = new Date();
        suggestion.rejectionReason = reason || 'Rejected by admin';
        await suggestion.save();

        return suggestion;
    }

    // ==================== UPDATE ENDPOINTS ====================

    /**
     * Update a breathwork record by ID (only if owned by the user)
     */
    async updateBreathwork(userId: string, id: string, dto: Record<string, any>) {
        const userObjectId = new Types.ObjectId(userId);
        const record = await this.breathworkModel.findOneAndUpdate(
            { _id: id, $or: [{ user: userObjectId }, { user: userId }] },
            { $set: dto },
            { new: true },
        );
        if (!record) {
            throw new Error('Breathwork record not found or not owned by user');
        }
        return record;
    }

    /**
     * Update a meditation record by ID (only if owned by the user)
     */
    async updateMeditation(userId: string, id: string, dto: Record<string, any>) {
        const userObjectId = new Types.ObjectId(userId);
        const record = await this.meditationModel.findOneAndUpdate(
            { _id: id, $or: [{ user: userObjectId }, { user: userId }] },
            { $set: dto },
            { new: true },
        );
        if (!record) {
            throw new Error('Meditation record not found or not owned by user');
        }
        return record;
    }

    /**
     * Update a sleep record by ID (only if owned by the user)
     */
    async updateSleep(userId: string, id: string, dto: Record<string, any>) {
        const userObjectId = new Types.ObjectId(userId);
        const record = await this.sleepModel.findOneAndUpdate(
            { _id: id, $or: [{ user: userObjectId }, { user: userId }] },
            { $set: dto },
            { new: true },
        );
        if (!record) {
            throw new Error('Sleep record not found or not owned by user');
        }
        return record;
    }
}

