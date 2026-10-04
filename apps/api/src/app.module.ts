import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { AdminModule } from './admin/admin.module.js';
import { MailModule } from './mail/mail.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/api/.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 15, // max 15 req/sec
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50, // max 50 req/10sec
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 150, // max 150 req/min
      },
    ]),
    PrismaModule,
    MailModule,
    NotificationsModule,
    AuthModule,
    ProfileModule,
    TournamentModule,
    RegistrationModule,
    CompetitionModule,
    RankingModule,
    CommunityModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
