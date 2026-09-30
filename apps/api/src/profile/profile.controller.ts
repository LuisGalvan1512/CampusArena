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
   * GET /api/v1/profile/me/sanctions
   * Returns active sanctions on the current user and their appeals.
   */
  @Get('me/sanctions')
  async getMySanctions(@CurrentUser('id') userId: string) {
    return this.profileService.getMySanctions(userId);
  }

  /**
   * POST /api/v1/profile/me/appeals
   * Submits an appeal for an active sanction.
   */
  @Post('me/appeals')
  async submitAppeal(
    @CurrentUser('id') userId: string,
    @Body() dto: { sanction_id: string; appeal_text: string },
  ) {
    return this.profileService.submitAppeal(userId, dto);
  }

  /**
   * GET /api/v1/profile/:id
   * Returns public profile, game accounts, and dynamic medals for any competitor.
   */
  @Get(':id')
  async getProfileById(@Param('id') id: string) {
    return this.profileService.getProfileById(id);
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

  /**
   * GET /api/v1/profile/:id/signatures
   * Returns community signatures on a competitor's wall.
   */
  @Get(':id/signatures')
  async getSignatures(@Param('id') profileUserId: string) {
    return this.profileService.getSignatures(profileUserId);
  }

  /**
   * POST /api/v1/profile/:id/signatures
   * Signs a competitor's wall.
   */
  @Post(':id/signatures')
  @HttpCode(HttpStatus.CREATED)
  async createSignature(
    @Param('id') profileUserId: string,
    @CurrentUser('id') authorId: string,
    @Body() dto: { content: string; image_url?: string },
  ) {
    return this.profileService.createSignature(profileUserId, authorId, dto.content, dto.image_url);
  }

  /**
   * DELETE /api/v1/profile/signatures/:id
   * Removes a signature.
   */
  @Delete('signatures/:id')
  @HttpCode(HttpStatus.OK)
  async deleteSignature(
    @Param('id') signatureId: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.profileService.deleteSignature(signatureId, currentUserId);
  }
}
