import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActivityEvent,
  EventType,
} from '../activities/entities/activity-event.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ActivityEvent)
    private readonly activityRepository: Repository<ActivityEvent>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(WorkspaceMember)
    private readonly memberRepository: Repository<WorkspaceMember>,
  ) {}

  async getWorkspaceInsights(workspaceId: string) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Tasks completed this week & last week (Trend)
    const [tasksCompletedThisWeek, tasksCompletedLastWeek] = await Promise.all([
      this.getTaskCompletions(workspaceId, oneWeekAgo, now),
      this.getTaskCompletions(workspaceId, twoWeeksAgo, oneWeekAgo),
    ]);

    // 2. Comment activity trend
    const [commentsThisWeek, commentsLastWeek] = await Promise.all([
      this.getCommentCount(workspaceId, oneWeekAgo, now),
      this.getCommentCount(workspaceId, twoWeeksAgo, oneWeekAgo),
    ]);

    // 3. Most active project
    const mostActiveProject = await this.getMostActiveProject(
      workspaceId,
      oneWeekAgo,
    );

    // 4. Overdue tasks requiring attention
    const overdueTasksCount = await this.getOverdueTasksCount(workspaceId);

    // 5. Member Insights
    const mostActiveContributor = await this.getMostActiveContributor(
      workspaceId,
      oneWeekAgo,
    );
    const taskCompletionsPerMember =
      await this.getTaskCompletionsPerMember(workspaceId);
    const commentParticipation =
      await this.getCommentParticipation(workspaceId);
    const activityTrends = await this.getActivityTrends(
      workspaceId,
      oneWeekAgo,
    );

    return {
      workspaceInsights: {
        tasksCompleted: {
          count: tasksCompletedThisWeek,
          trend: this.calculateTrend(
            tasksCompletedThisWeek,
            tasksCompletedLastWeek,
          ),
        },
        comments: {
          count: commentsThisWeek,
          trend: this.calculateTrend(commentsThisWeek, commentsLastWeek),
        },
        mostActiveProject,
        overdueTasksCount,
      },
      memberInsights: {
        mostActiveContributor,
        taskCompletions: taskCompletionsPerMember,
        commentParticipation,
      },
      activityTrends,
    };
  }

  private async getTaskCompletions(
    workspaceId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<number> {
    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.workspaceId = :workspaceId', { workspaceId })
      .andWhere('activity.type = :type', { type: EventType.TASK_UPDATED })
      .andWhere("activity.metadata->'changes'->'status'->>'to' = :status", {
        status: TaskStatus.DONE,
      })
      .andWhere('activity.createdAt >= :fromDate', { fromDate })
      .andWhere('activity.createdAt < :toDate', { toDate });

    return query.getCount();
  }

  private async getCommentCount(
    workspaceId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<number> {
    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.workspaceId = :workspaceId', { workspaceId })
      .andWhere('activity.type = :type', { type: EventType.COMMENT_CREATED })
      .andWhere('activity.createdAt >= :fromDate', { fromDate })
      .andWhere('activity.createdAt < :toDate', { toDate });

    return query.getCount();
  }

  private async getMostActiveProject(workspaceId: string, sinceDate: Date) {
    const result = await this.activityRepository
      .createQueryBuilder('activity')
      .select('task.projectId', 'projectId')
      .addSelect('COUNT(*)', 'eventCount')
      .innerJoin(Task, 'task', 'task.id::varchar = activity.entityId')
      .where('activity.workspaceId = :workspaceId', { workspaceId })
      .andWhere('activity.entityType = :entityType', { entityType: 'task' })
      .andWhere('activity.createdAt >= :sinceDate', { sinceDate })
      .groupBy('task.projectId')
      .orderBy('"eventCount"', 'DESC')
      .limit(1)
      .getRawOne<{ projectId: string; eventCount: string | number }>();

    if (!result || !result.projectId) return null;

    const project = await this.projectRepository.findOne({
      where: { id: result.projectId },
    });
    return project
      ? {
          id: project.id,
          name: project.name,
          eventCount: Number(result.eventCount),
        }
      : null;
  }

  private async getOverdueTasksCount(workspaceId: string): Promise<number> {
    return this.taskRepository
      .createQueryBuilder('task')
      .where('task.workspaceId = :workspaceId', { workspaceId })
      .andWhere('task.status != :doneStatus', { doneStatus: TaskStatus.DONE })
      .andWhere('task.dueDate < :now', { now: new Date() })
      .getCount();
  }

  private async getMostActiveContributor(workspaceId: string, sinceDate: Date) {
    const result = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.actorId', 'actorId')
      .addSelect('COUNT(*)', 'eventCount')
      .where('activity.workspaceId = :workspaceId', { workspaceId })
      .andWhere('activity.createdAt >= :sinceDate', { sinceDate })
      .groupBy('activity.actorId')
      .orderBy('"eventCount"', 'DESC')
      .limit(1)
      .getRawOne<{ actorId: string; eventCount: string | number }>();

    if (!result || !result.actorId) return null;

    const member = await this.memberRepository.findOne({
      where: { workspaceId, userId: result.actorId },
      relations: ['user'],
    });

    return member
      ? {
          userId: member.userId,
          name: member.user?.name,
          email: member.user?.email,
          eventCount: Number(result.eventCount),
        }
      : null;
  }

  private async getTaskCompletionsPerMember(workspaceId: string) {
    const results = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.actorId', 'actorId')
      .addSelect('COUNT(*)', 'count')
      .where('activity.workspaceId = :workspaceId', { workspaceId })
      .andWhere('activity.type = :type', { type: EventType.TASK_UPDATED })
      .andWhere("activity.metadata->'changes'->'status'->>'to' = :status", {
        status: TaskStatus.DONE,
      })
      .groupBy('activity.actorId')
      .orderBy('count', 'DESC')
      .getRawMany<{ actorId: string; count: string | number }>();

    return this.mapMemberResults(workspaceId, results);
  }

  private async getCommentParticipation(workspaceId: string) {
    const results = await this.activityRepository
      .createQueryBuilder('activity')
      .select('activity.actorId', 'actorId')
      .addSelect('COUNT(*)', 'count')
      .where('activity.workspaceId = :workspaceId', { workspaceId })
      .andWhere('activity.type = :type', { type: EventType.COMMENT_CREATED })
      .groupBy('activity.actorId')
      .orderBy('count', 'DESC')
      .getRawMany<{ actorId: string; count: string | number }>();

    return this.mapMemberResults(workspaceId, results);
  }

  private async mapMemberResults(
    workspaceId: string,
    results: { actorId: string; count: string | number }[],
  ) {
    const members = await this.memberRepository.find({
      where: { workspaceId },
      relations: ['user'],
    });

    return results.map((row) => {
      const member = members.find((m) => m.userId === row.actorId);
      return {
        userId: row.actorId,
        name: member?.user?.name,
        email: member?.user?.email,
        count: Number(row.count),
      };
    });
  }

  private async getActivityTrends(workspaceId: string, sinceDate: Date) {
    // Note: DATE() function varies by DB. In Postgres, DATE() is often cast to date or using DATE_TRUNC
    const results = await this.activityRepository
      .createQueryBuilder('activity')
      .select('DATE(activity.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('activity.workspaceId = :workspaceId', { workspaceId })
      .andWhere('activity.createdAt >= :sinceDate', { sinceDate })
      .groupBy('DATE(activity.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string | number }>();

    return results.map((row) => ({
      date: row.date,
      count: Number(row.count),
    }));
  }

  private calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}
