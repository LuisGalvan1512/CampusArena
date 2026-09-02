import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { TournamentModule } from './tournament/tournament.module.js';
import { RegistrationModule } from './registration/registration.module.js';
import { CompetitionModule } from './competition/competition.module.js';
import { RankingModule } from './ranking/ranking.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CommunityModule } from './community/community.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/api/.env'],
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    TournamentModule,
    RegistrationModule,
    CompetitionModule,
    RankingModule,
    CommunityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
