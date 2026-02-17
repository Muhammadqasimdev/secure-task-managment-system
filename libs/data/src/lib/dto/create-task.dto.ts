import type { TaskStatus } from '../enums/task-status';
import type { TaskCategory } from '../enums/task-category';

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  category?: TaskCategory;
  orderIndex?: number;
}
