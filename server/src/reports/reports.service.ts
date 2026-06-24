import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyReport } from './entities/daily-report.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(DailyReport)
    private readonly reportRepository: Repository<DailyReport>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(WorkspaceMember)
    private readonly memberRepository: Repository<WorkspaceMember>,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  /**
   * Submit or update a daily report (upsert per workspace/author/date).
   */
  async submitReport(data: {
    workspaceId: string;
    authorId: string;
    reportDate: string;
    completedWork: string;
    nextPlans: string;
    blockers?: string | null;
  }): Promise<DailyReport> {
    const existing = await this.reportRepository.findOne({
      where: {
        workspaceId: data.workspaceId,
        authorId: data.authorId,
        reportDate: data.reportDate,
      },
    });

    if (existing) {
      existing.completedWork = data.completedWork;
      existing.nextPlans = data.nextPlans;
      existing.blockers = data.blockers ?? null;
      const saved = await this.reportRepository.save(existing);
      const withAuthor = await this.reportRepository.findOne({
        where: { id: saved.id },
        relations: ['author'],
      });

      this.realtimeGateway.broadcastToWorkspace(
        data.workspaceId,
        'report_submitted',
        withAuthor || saved,
      );
      return withAuthor || saved;
    }

    const report = this.reportRepository.create(data);
    const saved = await this.reportRepository.save(report);
    const withAuthor = await this.reportRepository.findOne({
      where: { id: saved.id },
      relations: ['author'],
    });

    this.realtimeGateway.broadcastToWorkspace(
      data.workspaceId,
      'report_submitted',
      withAuthor || saved,
    );
    return withAuthor || saved;
  }

  /**
   * List reports with optional filters: date, authorId, date range.
   */
  async getReports(
    workspaceId: string,
    filters?: { date?: string; authorId?: string; limit?: number },
  ): Promise<DailyReport[]> {
    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.author', 'author')
      .where('report.workspaceId = :workspaceId', { workspaceId });

    if (filters?.date) {
      query.andWhere('report.reportDate = :date', { date: filters.date });
    }

    if (filters?.authorId) {
      query.andWhere('report.authorId = :authorId', {
        authorId: filters.authorId,
      });
    }

    return query
      .orderBy('report.reportDate', 'DESC')
      .addOrderBy('report.updatedAt', 'DESC')
      .take(filters?.limit || 50)
      .getMany();
  }

  /**
   * PM dashboard summary: who submitted today, who hasn't, task workload per member, bottleneck tasks.
   */
  async getReportSummary(workspaceId: string, requestedDate?: string) {
    const targetDate = requestedDate || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get all workspace members
    const members = await this.memberRepository.find({
      where: { workspaceId },
      relations: ['user'],
    });

    // Get today's reports
    const todaysReports = await this.reportRepository.find({
      where: { workspaceId, reportDate: targetDate },
      relations: ['author'],
    });

    const submittedUserIds = new Set(todaysReports.map((r) => r.authorId));

    const submitted = todaysReports.map((report) => ({
      userId: report.authorId,
      name: report.author?.name || report.author?.email || 'Unknown',
      email: report.author?.email,
      report,
    }));

    const notSubmitted = members
      .filter((m) => !submittedUserIds.has(m.userId))
      .map((m) => ({
        userId: m.userId,
        name: m.user?.name || m.user?.email || 'Unknown',
        email: m.user?.email,
        role: m.role,
      }));

    // Task workload per member (aggregated via DB)
    const rawWorkload = await this.taskRepository
      .createQueryBuilder('task')
      .select('task.assigneeId', 'assigneeId')
      .addSelect(
        `SUM(CASE WHEN task.status = 'todo' THEN 1 ELSE 0 END)`,
        'todo',
      )
      .addSelect(
        `SUM(CASE WHEN task.status = 'in_progress' THEN 1 ELSE 0 END)`,
        'inProgress',
      )
      .addSelect(
        `SUM(CASE WHEN task.status = 'done' THEN 1 ELSE 0 END)`,
        'done',
      )
      .addSelect(
        `SUM(CASE WHEN task.dueDate < NOW() AND task.status NOT IN ('done', 'canceled') THEN 1 ELSE 0 END)`,
        'overdue',
      )
      .where('task.workspaceId = :workspaceId', { workspaceId })
      .andWhere('task.assigneeId IS NOT NULL')
      .andWhere('task.archivedAt IS NULL')
      .groupBy('task.assigneeId')
      .getRawMany();

    const typedRawWorkload = rawWorkload as Array<{
      assigneeId: string;
      todo: string;
      inProgress: string;
      done: string;
      overdue: string;
    }>;

    const memberMap = new Map(members.map((m) => [m.userId, m.user]));
    const memberWorkload = typedRawWorkload.map((row) => {
      const user = memberMap.get(row.assigneeId);
      return {
        userId: row.assigneeId,
        name: user?.name || user?.email || 'Unknown',
        email: user?.email,
        todo: parseInt(row.todo, 10) || 0,
        inProgress: parseInt(row.inProgress, 10) || 0,
        done: parseInt(row.done, 10) || 0,
        overdue: parseInt(row.overdue, 10) || 0,
      };
    });

    // Bottleneck tasks: in_progress longest (by updatedAt ascending)
    const rawBottlenecks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where('task.workspaceId = :workspaceId', { workspaceId })
      .andWhere('task.status = :status', { status: TaskStatus.IN_PROGRESS })
      .andWhere('task.archivedAt IS NULL')
      .orderBy('task.updatedAt', 'ASC')
      .take(5)
      .getMany();

    const bottleneckTasks = rawBottlenecks.map((t) => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee
        ? { name: t.assignee.name, email: t.assignee.email }
        : null,
      dueDate: t.dueDate,
      updatedAt: t.updatedAt,
      daysSinceUpdate: Math.floor(
        (Date.now() - new Date(t.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));

    return {
      date: targetDate,
      submitted,
      notSubmitted,
      memberWorkload,
      bottleneckTasks,
    };
  }
}
