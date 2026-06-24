import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { User } from '../../users/entities/user.entity';

@Entity('daily_reports')
@Unique('UQ_DAILY_REPORT_PER_MEMBER', ['workspaceId', 'authorId', 'reportDate'])
export class DailyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Index()
  @Column({ type: 'date' })
  reportDate: string;

  @Column({ type: 'text' })
  completedWork: string;

  @Column({ type: 'text', default: '' })
  nextPlans: string;

  @Column({ type: 'text', nullable: true })
  blockers?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
