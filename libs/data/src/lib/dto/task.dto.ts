import type { TaskStatus } from '../enums/task-status';
import type { TaskCategory } from '../enums/task-category';

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  category: TaskCategory;
  orderIndex: number;
  organizationId: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}
