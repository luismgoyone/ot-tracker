import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OtStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('ot_records')
export class OtRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ type: 'time', name: 'start_time' })
  startTime!: string;

  @Column({ type: 'time', name: 'end_time' })
  endTime!: string;

  /** Hours, computed server-side from start/end. Postgres returns decimals as strings, so convert. */
  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string | null) => (v === null ? null : Number(v)) },
  })
  duration!: number;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'varchar', length: 50, default: OtStatus.PENDING })
  status!: OtStatus;

  @Column({ type: 'int', nullable: true, name: 'approved_by' })
  approvedBy!: number | null;

  @Column({ type: 'text', nullable: true })
  comments!: string | null;

  @ManyToOne(() => User, (user) => user.otRecords)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
