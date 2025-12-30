import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async create(coachId: string, createReportDto: CreateReportDto): Promise<Report> {
    const athleteCount = createReportDto.athletes?.length || 0;
    const size = `${(Math.random() * 3 + 1).toFixed(1)} MB`; // Placeholder size calculation

    const report = new this.reportModel({
      coach: coachId,
      ...createReportDto,
      athleteCount,
      size,
    });

    return report.save();
  }

  async findAll(coachId: string, type?: string): Promise<Report[]> {
    const query: any = { coach: coachId };
    if (type) {
      query.type = type;
    }
    return this.reportModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, coachId: string): Promise<Report | null> {
    return this.reportModel.findOne({ _id: id, coach: coachId }).exec();
  }

  async remove(id: string, coachId: string): Promise<Report | null> {
    return this.reportModel.findOneAndDelete({ _id: id, coach: coachId }).exec();
  }
}
