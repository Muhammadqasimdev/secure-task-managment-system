import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Route[] = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent) },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./features/tasks/task-list/task-list.component').then((m) => m.TaskListComponent),
  },
  {
    path: 'audit-log',
    canActivate: [authGuard],
    loadComponent: () => import('./features/audit/audit-log/audit-log.component').then((m) => m.AuditLogComponent),
  },
  { path: '', redirectTo: 'tasks', pathMatch: 'full' },
  { path: '**', redirectTo: 'tasks' },
];
