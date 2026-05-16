import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  IndexOptions,
} from 'typeorm';

@Entity('raw_events')
@Index('IDX_RAW_EVENTS_NAME_TIME', ['eventName', 'createdAt'])
@Index('IDX_RAW_EVENTS_USER_TIME', ['userId', 'createdAt'])
@Index('IDX_RAW_EVENTS_METADATA', ['metadata'], { type: 'gin' } as IndexOptions)
export class RawEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  eventName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userId: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  @Index('IDX_RAW_EVENTS_CREATED_AT')
  createdAt: Date;
}
