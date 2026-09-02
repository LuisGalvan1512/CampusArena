import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CompetitionController } from './competition.controller.js';
import { CompetitionService } from './competition.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [CompetitionController],
  providers: [CompetitionService],
  exports: [CompetitionService],
})
export class CompetitionModule {}
