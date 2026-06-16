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
  async getReportSummary(workspaceId: string) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Get all workspace members
    const members = await this.memberRepository.find({
      where: { workspaceId },
      relations: ['user'],
    });

    // Get today's reports
    const todaysReports = await this.reportRepository.find({
      where: { workspaceId, reportDate: today },
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

    // Task workload per member (from tasks table)
    const tasks = await this.taskRepository.find({
      where: { workspaceId },
      relations: ['assignee'],
    });

    const memberWorkload: Record<
      string,
      {
        userId: string;
        name: string;
        email?: string;
        inProgress: number;
        done: number;
        overdue: number;
        todo: number;
      }
    > = {};

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (const task of tasks) {
      if (!task.assigneeId) continue;
      if (!memberWorkload[task.assigneeId]) {
        memberWorkload[task.assigneeId] = {
          userId: task.assigneeId,
          name: task.assignee?.name || task.assignee?.email || 'Unknown',
          email: task.assignee?.email,
          inProgress: 0,
          done: 0,
          overdue: 0,
          todo: 0,
        };
      }
      const entry = memberWorkload[task.assigneeId];
      if (task.status === TaskStatus.IN_PROGRESS) entry.inProgress++;
      else if (task.status === TaskStatus.DONE) entry.done++;
      else if (task.status === TaskStatus.TODO) entry.todo++;

      if (
        task.dueDate &&
        task.status !== TaskStatus.DONE &&
        task.status !== TaskStatus.CANCELED
      ) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate.getTime() < now.getTime()) {
          entry.overdue++;
        }
      }
    }

    // Bottleneck tasks: in_progress longest (by updatedAt ascending, i.e. not touched for longest)
    const bottleneckTasks = tasks
      .filter((t) => t.status === TaskStatus.IN_PROGRESS)
      .sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      )
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.title,
        assignee: t.assignee
          ? { name: t.assignee.name, email: t.assignee.email }
          : null,
        dueDate: t.dueDate,
        updatedAt: t.updatedAt,
        daysSinceUpdate: Math.floor(
          (Date.now() - new Date(t.updatedAt).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      }));

    return {
      date: today,
      submitted,
      notSubmitted,
      memberWorkload: Object.values(memberWorkload),
      bottleneckTasks,
    };
  }
}
