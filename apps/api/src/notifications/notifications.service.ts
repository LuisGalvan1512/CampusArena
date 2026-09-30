import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new notification for a specific user.
   */
  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        user_id: dto.user_id,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        link: dto.link,
        link_label: dto.link_label,
      },
    });
  }

  /**
   * Returns all notifications for a user, along with unread count.
   */
  async findAll(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 30,
      }),
      this.prisma.notification.count({
        where: { user_id: userId, is_read: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  /**
   * Marks a specific notification as read.
   */
  async markAsRead(userId: string, id: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, user_id: userId },
    });

    if (!notif) {
      throw new NotFoundException('Notificación no encontrada.');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }

  /**
   * Marks all unread notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
  }

  /**
   * Deletes a specific notification belonging to the user.
   */
  async delete(userId: string, id: string) {
    const notif = await this.prisma.notification.findFirst({
      where: { id, user_id: userId },
    });

    if (!notif) {
      throw new NotFoundException('Notificación no encontrada.');
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * Deletes all notifications for the user.
   */
  async clearAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { user_id: userId },
    });
  }
}
