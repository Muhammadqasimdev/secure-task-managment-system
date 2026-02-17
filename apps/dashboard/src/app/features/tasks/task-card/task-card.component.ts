import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { TaskDto } from '@secure-task/data';
import { TaskStatus } from '@secure-task/data';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm flex flex-wrap items-center justify-between gap-2"
    >
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-gray-900 dark:text-gray-100">{{ task().title }}</h3>
        @if (task().description) {
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ task().description }}</p>
        }
        <div class="flex gap-2 mt-2">
          <span class="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-300">{{ task().category }}</span>
          <span class="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300">{{ task().status }}</span>
        </div>
      </div>
      <div class="flex gap-2">
        <select
          [value]="task().status"
          (change)="canEdit() && onStatusSelect($event)"
          [disabled]="!canEdit()"
          class="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="Todo">Todo</option>
          <option value="InProgress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <button
          (click)="canEdit() && edit.emit()"
          [disabled]="!canEdit()"
          class="px-2 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed text-blue-600 dark:text-blue-400 hover:underline disabled:hover:no-underline"
        >
          Edit
        </button>
        <button
          (click)="canDelete() && delete.emit()"
          [disabled]="!canDelete()"
          class="px-2 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 hover:underline disabled:hover:no-underline"
        >
          Delete
        </button>
      </div>
    </div>
  `,
})
export class TaskCardComponent {
  task = input.required<TaskDto>();
  canEdit = input<boolean>(false);
  canDelete = input<boolean>(false);
  edit = output<void>();
  delete = output<void>();
  statusChange = output<TaskStatus>();

  onStatusSelect(e: Event) {
    const v = (e.target as HTMLSelectElement).value as TaskStatus;
    this.statusChange.emit(v);
  }
}
