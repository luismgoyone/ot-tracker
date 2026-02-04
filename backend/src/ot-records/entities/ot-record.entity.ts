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

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  duration!: number; // in hours

  @Column({ type: 'text' })
  reason!: string;

  @Column({
    type: 'enum',
    enum: OtStatus,
    default: OtStatus.PENDING,
  })
  status!: OtStatus;

  @Column({ nullable: true, name: 'approved_by' })
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
