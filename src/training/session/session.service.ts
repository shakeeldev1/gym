import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from './schemas/session.schema';
import { Model } from 'mongoose';

@Injectable()
export class SessionService {
    constructor(@InjectModel(Session.name) private sessionModel: Model<Session>) { }

    async createSession(dto: CreateSessionDto): Promise<Session> {
        const session = new this.sessionModel(dto);
        return session.save();
    }
}
