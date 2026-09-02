import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { LinkGameDto, VerifyGameTagDto } from './dto/link-game.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * GET /api/v1/profile/me
   * Returns the authenticated user's profile with linked game accounts.
   */
  @Get('me')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.profileService.getMyProfile(userId);
  }

  /**
   * PATCH /api/v1/profile/me
   * Updates the authenticated user's editable profile fields.
   */
  @Patch('me')
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateMyProfile(userId, dto);
  }

  /**
   * POST /api/v1/profile/games/verify
   * Validates a Player Tag with Supercell and returns player details.
   */
  @Post('games/verify')
  @HttpCode(HttpStatus.OK)
  async verifyGameTag(@Body() dto: VerifyGameTagDto) {
    return this.profileService.verifyGameTag(dto);
  }

  /**
   * POST /api/v1/profile/games
   * Links a verified Supercell Player Tag to the competitor's profile.
   */
  @Post('games')
  async linkGame(
    @CurrentUser('id') userId: string,
    @Body() dto: LinkGameDto,
  ) {
    return this.profileService.linkGame(userId, dto);
  }

  /**
   * DELETE /api/v1/profile/games/:id
   * Unlinks a game account from the competitor's profile.
   */
  @Delete('games/:id')
  @HttpCode(HttpStatus.OK)
  async unlinkGame(
    @CurrentUser('id') userId: string,
    @Param('id') gameProfileId: string,
  ) {
    return this.profileService.unlinkGame(userId, gameProfileId);
  }
}
