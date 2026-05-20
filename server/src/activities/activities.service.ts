import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEvent, EventType } from './entities/activity-event.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityEvent)
    private readonly activityRepository: Repository<ActivityEvent>,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async logEvent(data: {
    workspaceId: string;
    actorId: string;
    type: EventType;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
  }): Promise<ActivityEvent> {
    const event = this.activityRepository.create(data);
    const savedEvent = await this.activityRepository.save(event);
    const eventWithActor = await this.activityRepository.findOne({
      where: { id: savedEvent.id },
      relations: ['actor'],
    });

    const payload = eventWithActor || savedEvent;
    this.realtimeGateway.broadcastToWorkspace(
      data.workspaceId,
      'activity_logged',
      payload,
    );

    return payload;
  }

  async getTimeline(workspaceId: string) {
    return this.activityRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
      relations: ['actor'],
      take: 50,
    });
  }
}
