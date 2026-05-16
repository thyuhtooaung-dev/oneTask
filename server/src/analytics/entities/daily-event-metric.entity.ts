import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('daily_event_metrics')
@Unique('UQ_DAILY_METRICS_DATE_EVENT', ['date', 'eventName'])
export class DailyEventMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  @Index('IDX_DAILY_METRICS_DATE')
  date: string;

  @Column({ type: 'varchar', length: 255 })
  @Index('IDX_DAILY_METRICS_EVENT_NAME')
  eventName: string;

  @Column({ type: 'int', default: 0 })
  totalCount: number;

  @Column({ type: 'int', default: 0 })
  uniqueUsersCount: number;

  @Column({ type: 'jsonb', default: {} })
  aggregatedMetadata: Record<string, any>;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
