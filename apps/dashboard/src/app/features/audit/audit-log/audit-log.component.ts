import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuditApiService } from '../../../core/services/audit-api.service';
import type { AuditLogEntryDto } from '@secure-task/data';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4 max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Audit Log</h1>
        <a
          routerLink="/tasks"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Back to Tasks
        </a>
      </div>

      @if (loading()) {
        <p class="text-gray-500 dark:text-gray-400">Loading...</p>
      } @else if (error()) {
        <p class="text-red-600 dark:text-red-400">{{ error() }}</p>
      } @else if (entries().length === 0) {
        <p class="text-gray-500 dark:text-gray-400">No audit entries yet.</p>
      } @else {
        <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Time</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Resource</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Result</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              @for (entry of entries(); track entry.timestamp + entry.userId + entry.action) {
                <tr class="text-sm text-gray-900 dark:text-gray-100">
                  <td class="px-4 py-2 whitespace-nowrap">{{ formatTime(entry.timestamp) }}</td>
                  <td class="px-4 py-2">{{ entry.userId }}</td>
                  <td class="px-4 py-2">{{ entry.action }}</td>
                  <td class="px-4 py-2">{{ entry.resource }}</td>
                  <td class="px-4 py-2">{{ entry.result }}</td>
                  <td class="px-4 py-2">{{ entry.details ?? '-' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Showing {{ entries().length }} of {{ total() }} entries
        </p>
      }
    </div>
  `,
})
export class AuditLogComponent implements OnInit {
  private auditApi = inject(AuditApiService);

  loading = signal(true);
  error = signal<string | null>(null);
  entries = signal<AuditLogEntryDto[]>([]);
  total = signal(0);

  ngOnInit() {
    this.auditApi.getAuditLog(1, 50).subscribe({
      next: (res) => {
        this.entries.set(res.entries);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.status === 403 ? 'You do not have permission to view the audit log.' : 'Failed to load audit log.');
        this.loading.set(false);
      },
    });
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString();
  }
}
