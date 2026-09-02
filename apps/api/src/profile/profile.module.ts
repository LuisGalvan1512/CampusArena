import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ProfileController } from './profile.controller.js';
import { ProfileService } from './profile.service.js';
import { SupercellAdapterService } from './services/supercell-adapter.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [ProfileController],
  providers: [ProfileService, SupercellAdapterService],
  exports: [ProfileService, SupercellAdapterService],
})
export class ProfileModule {}
