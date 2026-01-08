import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './schemas/session.schema';
import { Model, Types } from 'mongoose';
import { UpdateSessionDto } from './dto/update-session.dto';
import { AddBlockDto } from './dto/add-block.dto';

@Injectable()
export class SessionService {
    constructor(@InjectModel(Session.name) private sessionModel: Model<Session>) { }

    // Helper to add completed status to each exercise based on completedExercises array
    private enrichExercisesWithStatus(session: any): any {
        if (!session) return session;
        
        const sessionObj = session.toObject ? session.toObject() : session;
        
        if (sessionObj.blocks && Array.isArray(sessionObj.blocks)) {
            sessionObj.blocks = sessionObj.blocks.map((block: any) => {
                const completedIds = (block.completedExercises || []).map((id: any) => id.toString());
                
                if (block.exercises && Array.isArray(block.exercises)) {
                    block.exercises = block.exercises.map((ex: any) => {
                        const exId = (ex._id || ex).toString();
                        return {
                            ...ex,
                            completed: completedIds.includes(exId)
                        };
                    });
                }
                
                return block;
            });
        }
        
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
                    { path: 'exercises', model: 'Exercise', select: 'name equipment difficulty movementPattern videoUrl' },
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
                    { path: 'exercises', model: 'Exercise', select: 'name equipment difficulty movementPattern videoUrl' },
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
                    { path: 'exercises', model: 'Exercise', select: 'name equipment difficulty movementPattern videoUrl' },
                ],
            })
            .populate({ path: 'user', select: 'fName lName email role' })
            .exec();
        
        const enrichedSessions = sessions.map(s => this.enrichExercisesWithStatus(s));
        return { sessions: enrichedSessions, total: sessions.length };
    }

}
