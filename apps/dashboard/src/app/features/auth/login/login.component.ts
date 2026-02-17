import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h1 class="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Sign in</h1>
        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="space-y-4"
        >
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">Valid email is required</p>
            }
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">Password is required</p>
            }
          </div>
          @if (errorMessage()) {
            <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage() }}</p>
          }
          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>
        <p class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Default: admin@example.com / admin123
        </p>
        <p class="mt-2 text-center text-sm">
          <a routerLink="/register" class="text-blue-600 dark:text-blue-400 hover:underline">Create account (demo RBAC)</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  errorMessage = signal('');
  loading = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set('');
    this.auth.login(email, password, {
      onError: (msg) => this.errorMessage.set(msg),
      onSettled: () => this.loading.set(false),
    });
  }
}
