import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TasksStore } from '../store/tasks.store';
import type { TaskDto, CreateTaskDto, UpdateTaskDto } from '@secure-task/data';
import { TaskStatus, TaskCategory } from '@secure-task/data';
import { Permission } from '@secure-task/auth';
import { AuthService } from '../../../core/services/auth.service';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskCompletionChartComponent } from '../task-completion-chart/task-completion-chart.component';
import { KeyboardShortcutsDirective } from '../../../core/directives/keyboard-shortcuts.directive';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TaskCardComponent,
    TaskFormComponent,
    TaskCompletionChartComponent,
    KeyboardShortcutsDirective,
  ],
  template: `
    <div class="p-4 max-w-4xl mx-auto" appKeyboardShortcuts [canCreate]="auth.hasPermission(Permission.TaskCreate)" (onNewTask)="showCreateForm.set(true)" (onCancel)="onCancelShortcut()">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Tasks</h1>
        <button
          (click)="showCreateForm.set(true)"
          [disabled]="!auth.hasPermission(Permission.TaskCreate)"
          class="px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          New task <span class="text-xs opacity-80">(N)</span>
        </button>
      </div>

      @if (!auth.hasPermission(Permission.TaskCreate)) {
        <div class="mb-4 px-4 py-2 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
          You are in read-only mode. You can view tasks but cannot create, edit, or delete.
        </div>
      }

      <div class="mb-6 max-w-sm">
        <app-task-completion-chart />
      </div>

      <div class="flex flex-wrap gap-4 mb-4">
        <select
          [value]="store.sort()"
          (change)="onSortChange($event)"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="createdAt">Sort by date</option>
          <option value="orderIndex">Sort by order</option>
        </select>
        <select
          [value]="store.categoryFilter() ?? ''"
          (change)="onCategoryChange($event)"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">All categories</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
        </select>
        <select
          [value]="store.statusFilter() ?? ''"
          (change)="onStatusChange($event)"
          class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">All statuses</option>
          <option value="Todo">Todo</option>
          <option value="InProgress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      @if (store.error()) {
        <p class="mb-4 text-red-600 dark:text-red-400">{{ store.error() }}</p>
      }

      @if (store.loading() && store.tasks().length === 0) {
        <p class="text-gray-500 dark:text-gray-400">Loading...</p>
      } @else {
        <ul
          [cdkDropListDisabled]="!auth.hasPermission(Permission.TaskUpdate)"
          cdkDropList
          (cdkDropListDropped)="onDrop($event)"
          class="space-y-3"
        >
          @for (task of store.filteredTasks(); track task.id) {
            <li [cdkDragDisabled]="!auth.hasPermission(Permission.TaskUpdate)" cdkDrag [class.cursor-move]="auth.hasPermission(Permission.TaskUpdate)">
              <app-task-card
                [task]="task"
                [canEdit]="auth.hasPermission(Permission.TaskUpdate)"
                [canDelete]="auth.hasPermission(Permission.TaskDelete)"
                (edit)="onEdit(task)"
                (delete)="onDelete(task.id)"
                (statusChange)="onStatusChangeTask(task.id, $event)"
              />
            </li>
          }
        </ul>
      }

      @if (showCreateForm()) {
        <app-task-form
          (submit)="onCreate($event)"
          (cancel)="showCreateForm.set(false)"
        />
      }
      @if (editingId(); as id) {
        <app-task-form
          [task]="editingTask()"
          (submit)="onUpdate(id, $event)"
          (cancel)="editingId.set(null)"
        />
      }
    </div>
  `,
})
export class TaskListComponent implements OnInit {
  store = inject(TasksStore);
  auth = inject(AuthService);
  protected Permission = Permission;
  showCreateForm = signal(false);
  editingId = signal<string | null>(null);
  editingTask = computed(() => {
    const id = this.editingId();
    if (!id) return undefined;
    return this.store.tasks().find((t) => t.id === id);
  });

  ngOnInit() {
    this.store.loadTasks();
  }

  onSortChange(e: Event) {
    this.store.setSort((e.target as HTMLSelectElement).value);
    this.store.loadTasks();
  }
  onCategoryChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.store.setCategoryFilter(v ? (v as TaskCategory) : null);
    this.store.loadTasks();
  }
  onStatusChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.store.setStatusFilter(v ? (v as TaskStatus) : null);
    this.store.loadTasks();
  }
  onCreate(dto: CreateTaskDto) {
    this.store.createTask(dto);
    this.showCreateForm.set(false);
  }
  onEdit(task: TaskDto) {
    this.editingId.set(task.id);
  }
  onUpdate(id: string, dto: UpdateTaskDto) {
    this.store.updateTask(id, dto);
    this.editingId.set(null);
  }
  onDelete(id: string) {
    if (confirm('Delete this task?')) this.store.deleteTask(id);
  }
  onStatusChangeTask(id: string, status: TaskStatus) {
    this.store.updateTask(id, { status });
  }
  onDrop(event: CdkDragDrop<TaskDto[]>) {
    if (!this.auth.hasPermission(Permission.TaskUpdate)) return;
    const tasks = [...this.store.filteredTasks()];
    moveItemInArray(tasks, event.previousIndex, event.currentIndex);
    this.store.reorderTasks(tasks);
  }

  onCancelShortcut() {
    if (this.showCreateForm()) this.showCreateForm.set(false);
    if (this.editingId()) this.editingId.set(null);
  }
}
