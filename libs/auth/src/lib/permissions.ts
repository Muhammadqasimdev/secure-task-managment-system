
export const Permission = {
  TaskCreate: 'task:create',
  TaskRead: 'task:read',
  TaskUpdate: 'task:update',
  TaskDelete: 'task:delete',
  AuditRead: 'audit:read',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const PERMISSIONS_BY_ROLE: Record<string, Permission[]> = {
  Owner: [
    Permission.TaskCreate,
    Permission.TaskRead,
    Permission.TaskUpdate,
    Permission.TaskDelete,
    Permission.AuditRead,
  ],
  Admin: [
    Permission.TaskCreate,
    Permission.TaskRead,
    Permission.TaskUpdate,
    Permission.TaskDelete,
  ],
  Viewer: [Permission.TaskRead],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = PERMISSIONS_BY_ROLE[role];
  return permissions != null && permissions.includes(permission);
}

export function canAccessAuditLog(role: string): boolean {
  return hasPermission(role, Permission.AuditRead);
}
