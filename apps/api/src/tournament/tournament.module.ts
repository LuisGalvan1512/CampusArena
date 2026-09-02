import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TournamentController } from './tournament.controller.js';
import { TournamentService } from './tournament.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [TournamentController],
  providers: [TournamentService],
  exports: [TournamentService],
})
export class TournamentModule {}
