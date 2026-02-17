// Inlined exports to avoid esbuild resolution issues with ./lib/* subpaths

export enum Role {
  Owner = 'Owner',
  Admin = 'Admin',
  Viewer = 'Viewer',
}

export enum TaskStatus {
  Todo = 'Todo',
  InProgress = 'InProgress',
  Done = 'Done',
}

export enum TaskCategory {
  Work = 'Work',
  Personal = 'Personal',
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  role: 'Owner' | 'Admin' | 'Viewer';
}

export interface UserDto {
  id: string;
  email: string;
  role: string;
  organizationId: string;
}

export interface LoginResponseDto {
  access_token: string;
  user: UserDto;
  permissions: string[];
}

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

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  category?: TaskCategory;
  orderIndex?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  category?: TaskCategory;
  orderIndex?: number;
}

export interface OrganizationDto {
  id: string;
  name: string;
  parentId: string | null;
}

export interface AuditLogEntryDto {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  result: string;
  details?: string;
}

export interface AuditLogListDto {
  entries: AuditLogEntryDto[];
  total: number;
  page: number;
  limit: number;
}
