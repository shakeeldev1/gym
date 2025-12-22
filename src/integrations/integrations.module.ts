import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserIntegration, UserIntegrationSchema } from './schemas/user-integration.schema';
import { Habit, HabitSchema } from './schemas/habit.schema';
import { TaskAutomation, TaskAutomationSchema } from './schemas/task-automation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name:UserIntegration.name,schema:UserIntegrationSchema},
      {name:Habit.name,schema:HabitSchema},
      {name:TaskAutomation.name,schema:TaskAutomationSchema}
    ])
  ],
  providers: [IntegrationsService],
  controllers: [IntegrationsController]
})
export class IntegrationsModule {}
