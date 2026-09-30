import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RegistrationController } from './registration.controller.js';
import { RegistrationService } from './registration.service.js';

import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    NotificationsModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
