import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PERMISSIONS_BY_ROLE } from '@secure-task/auth';
import type { LoginDto, LoginResponseDto, UserDto, RegisterDto } from '@secure-task/data';
import { API_BASE } from '../config/api.config';

const TOKEN_KEY = 'secure_task_token';
const USER_KEY = 'secure_task_user';
const PERMISSIONS_KEY = 'secure_task_permissions';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private userSignal = signal<UserDto | null>(this.getStoredUser());
  private permissionsSignal = signal<string[]>(this.getStoredPermissions());

  token = this.tokenSignal.asReadonly();
  user = this.userSignal.asReadonly();
  permissions = this.permissionsSignal.asReadonly();
  isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private getStoredToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }

  private getStoredUser(): UserDto | null {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
      return raw ? (JSON.parse(raw) as UserDto) : null;
    } catch {
      return null;
    }
  }

  private getStoredPermissions(): string[] {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(PERMISSIONS_KEY) : null;
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }

  private setAuth(res: LoginResponseDto) {
    const perms = res.permissions ?? PERMISSIONS_BY_ROLE[res.user.role] ?? [];
    this.tokenSignal.set(res.access_token);
    this.userSignal.set(res.user);
    this.permissionsSignal.set(perms);
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(perms));
  }

  private clearAuth() {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.permissionsSignal.set([]);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
  }

  loadMe() {
    const token = this.getStoredToken();
    if (!token) return;
    this.http.get<{ user: UserDto; permissions: string[] }>(`${API_BASE}/auth/me`).subscribe({
      next: (res) => {
        this.userSignal.set(res.user);
        this.permissionsSignal.set(res.permissions ?? []);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(res.permissions ?? []));
      },
      error: () => this.clearAuth(),
    });
  }

  login(
    email: string,
    password: string,
    callbacks?: { onError?: (message: string) => void; onSettled?: () => void }
  ) {
    return this.http
      .post<LoginResponseDto>(`${API_BASE}/auth/login`, { email, password } as LoginDto)
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: (res) => {
          this.setAuth(res);
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          const body = err?.error;
          const msg =
            typeof body === 'object' && body?.message
              ? Array.isArray(body.message)
                ? body.message.join(', ')
                : body.message
              : err?.status === 0
                ? 'Cannot reach server. Is the API running on port 3000?'
                : 'Invalid email or password';
          callbacks?.onError?.(msg);
        },
      });
  }

  register(
    dto: RegisterDto,
    callbacks?: { onError?: (message: string) => void; onSettled?: () => void }
  ) {
    this.http
      .post<LoginResponseDto>(`${API_BASE}/auth/register`, dto)
      .pipe(finalize(() => callbacks?.onSettled?.()))
      .subscribe({
        next: (res) => {
          this.setAuth(res);
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          const body = err?.error;
          const msg =
            typeof body === 'object' && body?.message
              ? Array.isArray(body.message)
                ? body.message.join(', ')
                : body.message
              : err?.status === 0
                ? 'Cannot reach server. Is the API running on port 3000?'
                : 'Registration failed';
          callbacks?.onError?.(msg);
        },
      });
  }

  logout() {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  hasPermission(permission: string): boolean {
    return this.permissionsSignal().includes(permission);
  }
}
