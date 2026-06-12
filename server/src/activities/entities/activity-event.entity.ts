import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { User } from '../../users/entities/user.entity';

export enum EventType {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_DELETED = 'task.deleted',
  COMMENT_CREATED = 'comment.created',
  MEMBER_JOINED = 'member.joined',
  MEMBER_LEFT = 'member.left',
  MEMBER_UPDATED = 'member.updated',
  WORKSPACE_CREATED = 'workspace.created',
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_ARCHIVED = 'project.archived',
}

@Entity('activity_events')
export class ActivityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column()
  actorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actorId' })
  actor: User;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  type: EventType;

  @Column({ nullable: true })
  entityType?: string; // "task", "comment"

  @Column({ nullable: true })
  entityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
