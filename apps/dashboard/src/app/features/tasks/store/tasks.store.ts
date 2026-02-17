import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import type { TaskDto, CreateTaskDto, UpdateTaskDto } from '@secure-task/data';
import type { TaskStatus, TaskCategory } from '@secure-task/data';
import { TasksApiService } from '../../../core/services/tasks-api.service';

type TasksState = {
  tasks: TaskDto[];
  loading: boolean;
  error: string | null;
  sort: string;
  categoryFilter: TaskCategory | null;
  statusFilter: TaskStatus | null;
};

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  sort: 'createdAt',
  categoryFilter: null,
  statusFilter: null,
};

export const TasksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredTasks: computed(() => {
      let list = [...store.tasks()];
      const cat = store.categoryFilter();
      const status = store.statusFilter();
      if (cat) list = list.filter((t) => t.category === cat);
      if (status) list = list.filter((t) => t.status === status);
      const sort = store.sort();
      if (sort === 'orderIndex') list.sort((a, b) => a.orderIndex - b.orderIndex);
      else if (sort === 'createdAt')
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    }),
  })),
  withMethods((store, api = inject(TasksApiService)) => ({
    setSort(sort: string) {
      patchState(store, { sort });
    },
    setCategoryFilter(category: TaskCategory | null) {
      patchState(store, { categoryFilter: category });
    },
    setStatusFilter(status: TaskStatus | null) {
      patchState(store, { statusFilter: status });
    },
    loadTasks() {
      patchState(store, { loading: true, error: null });
      api.getTasks(store.sort(), store.categoryFilter() ?? undefined, store.statusFilter() ?? undefined).subscribe({
        next: (tasks) => patchState(store, { tasks, loading: false }),
        error: (err) => patchState(store, { error: err?.message ?? 'Failed to load', loading: false }),
      });
    },
    createTask(dto: CreateTaskDto) {
      patchState(store, { loading: true });
      api.createTask(dto).subscribe({
        next: (task) => {
          patchState(store, (s) => ({ tasks: [task, ...s.tasks], loading: false }));
        },
        error: (err) => patchState(store, { error: err?.message ?? 'Create failed', loading: false }),
      });
    },
    updateTask(id: string, dto: UpdateTaskDto) {
      api.updateTask(id, dto).subscribe({
        next: (updated) => {
          patchState(store, (s: TasksState) => ({
            tasks: s.tasks.map((t: TaskDto) => (t.id === id ? updated : t)),
          }));
        },
        error: (err) => patchState(store, { error: err?.message ?? 'Update failed' }),
      });
    },
    deleteTask(id: string) {
      api.deleteTask(id).subscribe({
        next: () => {
          patchState(store, (s: TasksState) => ({ tasks: s.tasks.filter((t: TaskDto) => t.id !== id) }));
        },
        error: (err) => patchState(store, { error: err?.message ?? 'Delete failed' }),
      });
    },
    reorderTasks(orderedTasks: TaskDto[]) {
      const newOrder = orderedTasks.map((t, i) => ({ ...t, orderIndex: i }));
      const currentTasks = store.tasks();
      const byId = new Map(currentTasks.map((t) => [t.id, t]));
      newOrder.forEach((t) => byId.set(t.id, t));
      const updated = Array.from(byId.values()).sort((a, b) => a.orderIndex - b.orderIndex);
      patchState(store, { tasks: updated });
      newOrder.forEach((task) => api.updateTask(task.id, { orderIndex: task.orderIndex }).subscribe());
    },
  }))
);
