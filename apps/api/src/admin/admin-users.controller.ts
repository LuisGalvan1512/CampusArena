import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { CreateSanctionDto, RevokeSanctionDto } from './dto/create-sanction.dto.js';
import { ReviewAppealDto } from './dto/review-appeal.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '@prisma/client';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  /**
   * GET /api/v1/admin/users
   */
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminUsersService.findAll(
      search,
      role,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  /**
   * GET /api/v1/admin/users/moderation/appeals
   * Note: placed before :id to prevent route shadowing
   */
  @Get('moderation/appeals')
  async getAppeals(@Query('status') status?: string) {
    return this.adminUsersService.findAllAppeals(status);
  }

  /**
   * PATCH /api/v1/admin/users/moderation/appeals/:id
   */
  @Patch('moderation/appeals/:id')
  async reviewAppeal(
    @Param('id') appealId: string,
    @Body() dto: ReviewAppealDto,
    @Req() req: any,
  ) {
    return this.adminUsersService.reviewAppeal(appealId, dto, req.user?.id);
  }

  /**
   * POST /api/v1/admin/users/sanctions/:sanctionId/revoke
   */
  @Post('sanctions/:sanctionId/revoke')
  async revokeSanction(
    @Param('sanctionId') sanctionId: string,
    @Body() dto: RevokeSanctionDto,
    @Req() req: any,
  ) {
    return this.adminUsersService.revokeSanction(sanctionId, dto, req.user?.id);
  }

  /**
   * PATCH /api/v1/admin/users/:id/role
   */
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: any,
  ) {
    return this.adminUsersService.updateUserRole(id, dto.role, req.user?.id);
  }

  /**
   * POST /api/v1/admin/users/:id/sanctions
   */
  @Post(':id/sanctions')
  async createSanction(
    @Param('id') id: string,
    @Body() dto: CreateSanctionDto,
    @Req() req: any,
  ) {
    return this.adminUsersService.createSanction(id, dto, req.user?.id);
  }

  /**
   * POST /api/v1/admin/users/:id/restore
   */
  @Post(':id/restore')
  async restoreUser(@Param('id') id: string) {
    return this.adminUsersService.restoreUser(id);
  }

  /**
   * DELETE /api/v1/admin/users/:id
   */
  @Delete(':id')
  async softDeleteUser(@Param('id') id: string, @Req() req: any) {
    return this.adminUsersService.softDeleteUser(id, req.user?.id);
  }
}

