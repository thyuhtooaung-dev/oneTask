import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEvent, EventType } from './entities/activity-event.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityEvent)
    private readonly activityRepository: Repository<ActivityEvent>,
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
    return this.activityRepository.save(event);
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
