import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async create(data: {
    userId: string;
    workspaceId: string;
    type: string;
    payload?: Record<string, any>;
  }) {
    const notification = this.notificationRepository.create(data);
    const saved = await this.notificationRepository.save(notification);

    this.realtimeGateway.broadcastToWorkspace(
      data.workspaceId,
      'notification_created',
      saved,
    );

    return saved;
  }

  async findAllForUser(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.read = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, read: false },
      { read: true },
    );
    return { ok: true };
  }
}
