import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksStore } from '../store/tasks.store';
import { TaskStatus } from '@secure-task/data';

interface StatusBar {
  label: string;
  count: number;
  percent: number;
  status: TaskStatus;
}

@Component({
  selector: 'app-task-completion-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Task completion</h3>
      <div class="space-y-2">
        @for (bar of chartData(); track bar.status) {
          <div class="flex items-center gap-2">
            <span class="w-20 text-xs text-gray-600 dark:text-gray-400 shrink-0">{{ bar.label }}</span>
            <div class="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <div
                class="h-full transition-all duration-300 rounded"
                [style.width.%]="bar.percent"
                [class]="bar.status === TaskStatus.Done ? 'bg-green-500' : bar.status === TaskStatus.InProgress ? 'bg-amber-500' : 'bg-gray-400 dark:bg-gray-500'"
              ></div>
            </div>
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400 w-8">{{ bar.count }}</span>
          </div>
        }
      </div>
      @if (total() > 0) {
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {{ doneCount() }} of {{ total() }} completed
          ({{ (doneCount() / total() * 100).toFixed(0) }}%)
        </p>
      }
    </div>
  `,
})
export class TaskCompletionChartComponent {
  store = inject(TasksStore);
  TaskStatus = TaskStatus;

  chartData = computed<StatusBar[]>(() => {
    const tasks = this.store.tasks();
    const total = tasks.length;
    const byStatus = { [TaskStatus.Todo]: 0, [TaskStatus.InProgress]: 0, [TaskStatus.Done]: 0 };
    tasks.forEach((t) => (byStatus[t.status as TaskStatus] = (byStatus[t.status as TaskStatus] ?? 0) + 1));
    const max = Math.max(byStatus.Todo, byStatus.InProgress, byStatus.Done, 1);
    return [
      { label: 'Todo', count: byStatus.Todo, percent: total ? (byStatus.Todo / max) * 100 : 0, status: TaskStatus.Todo },
      { label: 'In progress', count: byStatus.InProgress, percent: total ? (byStatus.InProgress / max) * 100 : 0, status: TaskStatus.InProgress },
      { label: 'Done', count: byStatus.Done, percent: total ? (byStatus.Done / max) * 100 : 0, status: TaskStatus.Done },
    ];
  });

  total = computed(() => this.store.tasks().length);
  doneCount = computed(() => this.store.tasks().filter((t) => t.status === TaskStatus.Done).length);
}
