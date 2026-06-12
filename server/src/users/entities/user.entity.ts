import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { WorkspaceMember } from '../../workspaces/entities/workspace-member.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index('IDX_USERS_EMAIL')
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column('text', { nullable: true })
  avatarUrl: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => WorkspaceMember, (wm) => wm.user)
  memberships: WorkspaceMember[];
}
