import { Component, input, output, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { TaskDto, CreateTaskDto } from '@secure-task/data';
import { TaskStatus, TaskCategory } from '@secure-task/data';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-10">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{{ task() ? 'Edit task' : 'New task' }} <span class="text-xs font-normal text-gray-500 dark:text-gray-400">(Esc to close)</span></h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              formControlName="title"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Task title"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              formControlName="description"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              rows="3"
              placeholder="Optional description"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select formControlName="category" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select formControlName="status" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="Todo">Todo</option>
              <option value="InProgress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              (click)="cancel.emit()"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              {{ task() ? 'Save' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TaskFormComponent {
  task = input<TaskDto | undefined>();
  submit = output<CreateTaskDto | { title: string; description: string | null; status: TaskStatus; category: TaskCategory }>();
  cancel = output<void>();

  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    category: [TaskCategory.Work],
    status: [TaskStatus.Todo],
  });

  constructor() {
    effect(() => {
      const t = this.task();
      if (t) {
        this.form.patchValue({
          title: t.title,
          description: t.description ?? '',
          category: t.category,
          status: t.status,
        });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.submit.emit({
      title: v.title,
      description: v.description || null,
      category: v.category,
      status: v.status,
    });
  }
}
