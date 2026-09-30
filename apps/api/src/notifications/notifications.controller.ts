import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /api/v1/notifications
   * Retorna las notificaciones del usuario autenticado y la cantidad de no leídas.
   */
  @Get()
  async getNotifications(@CurrentUser('id') userId: string) {
    return this.notificationsService.findAll(userId);
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Marca una notificación específica como leída.
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(userId, id);
  }

  /**
   * PATCH /api/v1/notifications/read-all
   * Marca todas las notificaciones del usuario como leídas.
   */
  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  /**
   * DELETE /api/v1/notifications/clear-all
   * Elimina todas las notificaciones del usuario.
   */
  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  async clearAll(@CurrentUser('id') userId: string) {
    return this.notificationsService.clearAll(userId);
  }

  /**
   * DELETE /api/v1/notifications/:id
   * Elimina una notificación específica.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.delete(userId, id);
  }
}
