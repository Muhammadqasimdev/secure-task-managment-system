import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { TaskStatus, TaskCategory } from '@secure-task/data';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20 })
  status: TaskStatus;

  @Column({ type: 'varchar', length: 20 })
  category: TaskCategory;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: unknown;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
