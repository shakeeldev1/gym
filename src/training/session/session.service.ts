import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './schemas/session.schema';
import { Model, Types } from 'mongoose';
import { UpdateSessionDto } from './dto/update-session.dto';
import { AddBlockDto } from './dto/add-block.dto';
import { DailyResetService } from 'src/common/services/daily-reset.service';

@Injectable()
export class SessionService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<Session>,
        private dailyResetService: DailyResetService
    ) { }

    // Helper to add completed status to each exercise and organize sets per exercise
    private enrichExercisesWithStatus(session: any): any {
        if (!session) return session;
        
        const sessionObj = session.toObject ? session.toObject() : session;
        
        if (sessionObj.blocks && Array.isArray(sessionObj.blocks)) {
            sessionObj.blocks = sessionObj.blocks.map((block: any) => {
                const completedIds = (block.completedExercises || []).map((id: any) => id.toString());
                const allSets = block.sets || [];
                
                // Create a map of sets by exerciseId for quick lookup
                const setsByExerciseId = new Map<string, any[]>();
                allSets.forEach((set: any) => {
                    const exId = set.exerciseId?.toString?.() || set.exerciseId;
                    if (exId) {
                        if (!setsByExerciseId.has(exId)) {
                            setsByExerciseId.set(exId, []);
                        }
                        setsByExerciseId.get(exId)!.push(set);
                    }
                });
                
                if (block.exercises && Array.isArray(block.exercises)) {
                    block.exercises = block.exercises.map((ex: any, exIndex: number) => {
                        const exId = (ex._id || ex).toString();
                        
                        // Get sets associated with this exercise
                        const exerciseSets = setsByExerciseId.get(exId) || [];
                        
                        return {
                            ...ex,
                            id: exId,
                            exerciseId: exId,
                            blockId: block._id?.toString?.() || block._id,
                            completed: completedIds.includes(exId),
                            sets: exerciseSets.map((set: any) => ({
                                ...set,
                                id: set._id?.toString?.() || set._id,
                                setId: set._id?.toString?.() || set._id,
                                exerciseId: exId,
                                blockId: block._id?.toString?.() || block._id,
                                completed: !!set.completed,
                            })),
                        };
                    });
                }
                
                // Add clear IDs to block level
                block.id = block._id?.toString?.() || block._id;
                block.blockId = block._id?.toString?.() || block._id;
                block.sessionId = sessionObj._id?.toString?.() || sessionObj._id;
                
                // Remove block-level sets - they should only exist in exercises
                block.sets = undefined;
                
                return block;
            });
        }
        
        // Add session IDs
        sessionObj.id = sessionObj._id?.toString?.() || sessionObj._id;
        sessionObj.sessionId = sessionObj._id?.toString?.() || sessionObj._id;
        
        return sessionObj;
    }

    async createSession(dto: CreateSessionDto): Promise<Session> {
        const session = new this.sessionModel(dto);
        return session.save();
    }

    async getSession(id: string): Promise<Session | null> {
        const session = await this.sessionModel
            .findById(id)
            .populate({
                path: 'blocks',
                select: 'type exercises sets restBetweenExercises completedExercises createdAt updatedAt',
                populate: [
                    { path: 'sets', model: 'WorkoutSet' },
                    { path: 'exercises', model: 'Exercise', select: 'name equipment difficulty movementPattern videoUrl posterUrl' },
                ],
            })
            .populate({ path: 'user', select: 'fName lName email role' })
            .exec();
        if (!session) {
            throw new NotFoundException('Session not found');
        }
        return this.enrichExercisesWithStatus(session);
    }

    async updateSession(id: string, dto: UpdateSessionDto): Promise<Session | null> {
        const session = await this.sessionModel.findByIdAndUpdate(id, dto, { new: true }).exec();
        if (!session) {
            throw new NotFoundException('Session not found');
        }
        return session;
    }

    async deleteSession(id: string): Promise<{ message: string }> {
        const result = await this.sessionModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException('Session not found');
        }
        return { message: 'Session deleted successfully' };
    }

    async addBlockToSession(id: string, dto: AddBlockDto) {
        const session = await this.sessionModel.findById(id).exec();
        if (!session) throw new NotFoundException('Session not found');

        const blockObjectId = new Types.ObjectId(dto.blockId);
        const alreadyLinked = session.blocks.some(b => b.toString() === blockObjectId.toString());

        if (!alreadyLinked) {
            session.blocks.push(blockObjectId);
            await session.save();
        }
        return session;
    }

    async getAllSessions(status?: string): Promise<{ sessions: Session[]; total: number }> {
        const filter: Record<string, any> = {};
        if (status === 'completed') filter.completed = true;
        if (status === 'upcoming') filter.completed = false;

        const sessions = await this.sessionModel
            .find(filter)
            .populate({
                path: 'blocks',
                select: 'type exercises sets restBetweenExercises completedExercises createdAt updatedAt',
                populate: [
                    { path: 'sets', model: 'WorkoutSet' },
                    { path: 'exercises', model: 'Exercise', select: 'name equipment difficulty movementPattern videoUrl posterUrl' },
                ],
            })
            .populate({ path: 'user', select: 'fName lName email role' })
            .exec();
        
        const enrichedSessions = sessions.map(s => this.enrichExercisesWithStatus(s));
        return { sessions: enrichedSessions, total: sessions.length };
    }

    async getSessionsByUser(userId: string): Promise<{ sessions: Session[]; total: number }> {
        const userObjectId = new Types.ObjectId(userId);
        const sessions = await this.sessionModel
            .find({
                $or: [
                    { user: userObjectId },               // correct ObjectId storage
                    { user: userId },                      // legacy string storage
                    { 'user._id': userObjectId },          // improperly embedded user doc
                    { 'user._id': userId },                // improperly embedded user doc (string)
                ],
            })
            .populate({
                path: 'blocks',
                select: 'type exercises sets restBetweenExercises completedExercises createdAt updatedAt',
                populate: [
                    { path: 'sets', model: 'WorkoutSet' },
                    { path: 'exercises', model: 'Exercise', select: 'name equipment difficulty movementPattern videoUrl posterUrl' },
                ],
            })
            .populate({ path: 'user', select: 'fName lName email role' })
            .exec();
        
        const enrichedSessions = sessions.map(s => this.enrichExercisesWithStatus(s));
        return { sessions: enrichedSessions, total: sessions.length };
    }

    /**
     * Get today's sessions for a user
     * This resets completed status for new days to show all exercises as incomplete
     */
    async getTodaySessionsByUser(userId: string): Promise<{ sessions: Session[]; total: number; date: string }> {
        const userObjectId = new Types.ObjectId(userId);
        const { start, end } = this.dailyResetService.getTodayDateRange();
        
        let sessions = await this.sessionModel
            .find({
                $or: [
                    { user: userObjectId },
                    { user: userId },
                    { 'user._id': userObjectId },
                    { 'user._id': userId },
                ],
                sessionDate: { $gte: start, $lt: end }
            })
            .populate({
                path: 'blocks',
                select: 'type exercises sets restBetweenExercises completedExercises createdAt updatedAt',
                populate: [
                    { path: 'sets', model: 'WorkoutSet' },
                    { path: 'exercises', model: 'Exercise', select: 'name equipment difficulty movementPattern videoUrl posterUrl' },
                ],
            })
            .populate({ path: 'user', select: 'fName lName email role' })
            .exec();
        
        // If no sessions for today, copy yesterday's sessions but reset completed status
        if (sessions.length === 0) {
            const yesterday = new Date(start);
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            const tomorrowYesterday = new Date(yesterday);
            tomorrowYesterday.setUTCDate(tomorrowYesterday.getUTCDate() + 1);

            const yesterdaySessions = await this.sessionModel
                .find({
                    $or: [
                        { user: userObjectId },
                        { user: userId },
                        { 'user._id': userObjectId },
                        { 'user._id': userId },
                    ],
                    sessionDate: { $gte: yesterday, $lt: tomorrowYesterday }
                })
                .populate({
                    path: 'blocks',
                    select: 'type exercises sets restBetweenExercises completedExercises createdAt updatedAt',
                    populate: [
                        { path: 'sets', model: 'WorkoutSet' },
                        { path: 'exercises', model: 'Exercise', select: 'name equipment difficulty movementPattern videoUrl posterUrl' },
                    ],
                })
                .populate({ path: 'user', select: 'fName lName email role' })
                .exec();

            // Create new sessions for today with reset exercises
            sessions = await Promise.all(yesterdaySessions.map(async (oldSession) => {
                const newSession = new this.sessionModel({
                    user: oldSession.user,
                    blocks: oldSession.blocks,
                    completed: false,
                    sessionDate: new Date(),
                    notes: oldSession.notes
                });
                return newSession.save();
            }));

            // Populate the new sessions
            sessions = await this.sessionModel
                .find({
                    _id: { $in: sessions.map(s => s._id) }
                })
                .populate({
                    path: 'blocks',
                    select: 'type exercises sets restBetweenExercises completedExercises createdAt updatedAt',
                    populate: [
                        { path: 'sets', model: 'WorkoutSet' },
                        { path: 'exercises', model: 'Exercise', select: 'name equipment difficulty movementPattern videoUrl posterUrl' },
                    ],
                })
                .populate({ path: 'user', select: 'fName lName email role' })
                .exec();
        }
        
        const enrichedSessions = sessions.map(s => this.enrichExercisesWithStatus(s));
        const todayString = this.dailyResetService.formatDateToString(new Date());
        
        return { sessions: enrichedSessions, total: sessions.length, date: todayString };
    }

}
