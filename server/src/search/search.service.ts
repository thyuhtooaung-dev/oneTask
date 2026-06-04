import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEvent } from '../activities/entities/activity-event.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import {
  SearchResultGroup,
  SearchResultItem,
  WorkspaceSearchResponse,
} from './search.types';

const DEFAULT_LIMIT_PER_TYPE = 5;
const MAX_LIMIT_PER_TYPE = 10;

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(WorkspaceMember)
    private readonly memberRepository: Repository<WorkspaceMember>,
    @InjectRepository(ActivityEvent)
    private readonly activityRepository: Repository<ActivityEvent>,
  ) {}

  async searchWorkspace(
    workspaceId: string,
    rawQuery?: string,
    rawLimit?: number,
  ): Promise<WorkspaceSearchResponse> {
    const query = (rawQuery || '').trim();
    const limit = this.normalizeLimit(rawLimit);

    if (!query) {
      return {
        query,
        total: 0,
        groups: this.toGroups({
          tasks: [],
          projects: [],
          comments: [],
          members: [],
          activities: [],
        }),
      };
    }

    const term = `%${query}%`;
    const [tasks, projects, comments, members, activities] = await Promise.all([
      this.searchTasks(workspaceId, term, limit),
      this.searchProjects(workspaceId, term, limit),
      this.searchComments(workspaceId, term, limit),
      this.searchMembers(workspaceId, term, limit),
      this.searchActivities(workspaceId, term, limit),
    ]);

    const groups = this.toGroups({
      tasks,
      projects,
      comments,
      members,
      activities,
    });

    return {
      query,
      groups,
      total: groups.reduce((count, group) => count + group.items.length, 0),
    };
  }

  private async searchTasks(
    workspaceId: string,
    term: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where('task.workspaceId = :workspaceId', { workspaceId })
      .andWhere('(task.title ILIKE :term OR task.description ILIKE :term)', {
        term,
      })
      .orderBy('task.updatedAt', 'DESC')
      .take(limit)
      .getMany();

    return tasks.map((task) => ({
      id: task.id,
      type: 'task',
      title: task.title,
      subtitle: task.project?.name || 'Task',
      description: task.description || undefined,
      parentId: task.projectId,
      metadata: {
        status: task.status,
        assignee:
          task.assignee?.name ||
          task.assignee?.email ||
          task.assigneeId ||
          null,
      },
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
  }

  private async searchProjects(
    workspaceId: string,
    term: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .where('project.workspaceId = :workspaceId', { workspaceId })
      .andWhere(
        '(project.name ILIKE :term OR project.description ILIKE :term)',
        { term },
      )
      .orderBy('project.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return projects.map((project) => ({
      id: project.id,
      type: 'project',
      title: project.name,
      subtitle: 'Project',
      description: project.description || undefined,
      createdAt: project.createdAt,
    }));
  }

  private async searchComments(
    workspaceId: string,
    term: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.task', 'task')
      .leftJoinAndSelect('comment.author', 'author')
      .where('task.workspaceId = :workspaceId', { workspaceId })
      .andWhere('comment.content ILIKE :term', { term })
      .orderBy('comment.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return comments.map((comment) => ({
      id: comment.id,
      type: 'comment',
      title: this.preview(comment.content) || 'Image comment',
      subtitle: comment.task?.title || 'Comment',
      description: comment.author?.name || comment.author?.email || undefined,
      parentId: comment.taskId,
      metadata: {
        taskId: comment.taskId,
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  }

  private async searchMembers(
    workspaceId: string,
    term: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const members = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .where('member.workspaceId = :workspaceId', { workspaceId })
      .andWhere('(user.name ILIKE :term OR user.email ILIKE :term)', { term })
      .orderBy('member.joinedAt', 'DESC')
      .take(limit)
      .getMany();

    return members.map((member) => ({
      id: member.userId,
      type: 'member',
      title: member.user?.name || member.user?.email || 'Workspace member',
      subtitle: member.role,
      description: member.user?.email || undefined,
      metadata: {
        memberId: member.id,
        role: member.role,
      },
      createdAt: member.joinedAt,
    }));
  }

  private async searchActivities(
    workspaceId: string,
    term: string,
    limit: number,
  ): Promise<SearchResultItem[]> {
    const activities = await this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.actor', 'actor')
      .where('activity.workspaceId = :workspaceId', { workspaceId })
      .andWhere(
        `(
          activity.type::text ILIKE :term
          OR activity.entityType ILIKE :term
          OR activity.entityId ILIKE :term
          OR activity.metadata::text ILIKE :term
        )`,
        { term },
      )
      .orderBy('activity.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return activities.map((activity) => ({
      id: activity.id,
      type: 'activity',
      title: activity.type,
      subtitle: activity.actor?.name || activity.actor?.email || 'Activity',
      description: activity.entityType || undefined,
      parentId: activity.entityId || undefined,
      metadata: activity.metadata,
      createdAt: activity.createdAt,
    }));
  }

  private toGroups(results: {
    tasks: SearchResultItem[];
    projects: SearchResultItem[];
    comments: SearchResultItem[];
    members: SearchResultItem[];
    activities: SearchResultItem[];
  }): SearchResultGroup[] {
    return [
      { type: 'task', label: 'Tasks', items: results.tasks },
      { type: 'project', label: 'Projects', items: results.projects },
      { type: 'comment', label: 'Comments', items: results.comments },
      { type: 'member', label: 'Members', items: results.members },
      { type: 'activity', label: 'Events', items: results.activities },
    ];
  }

  private normalizeLimit(rawLimit?: number): number {
    const limit = Number(rawLimit || DEFAULT_LIMIT_PER_TYPE);
    if (!Number.isFinite(limit)) return DEFAULT_LIMIT_PER_TYPE;
    return Math.min(Math.max(Math.floor(limit), 1), MAX_LIMIT_PER_TYPE);
  }

  private preview(content?: string): string {
    if (!content) return '';
    return content.length > 120 ? `${content.slice(0, 117)}...` : content;
  }
}
