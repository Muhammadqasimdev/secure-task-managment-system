import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { TaskDto, CreateTaskDto, UpdateTaskDto } from '@secure-task/data';
import type { TaskStatus, TaskCategory } from '@secure-task/data';
import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  constructor(private http: HttpClient) {}

  getTasks(sort?: string, category?: TaskCategory, status?: TaskStatus) {
    let params = new HttpParams();
    if (sort) params = params.set('sort', sort);
    if (category) params = params.set('category', category);
    if (status) params = params.set('status', status);
    return this.http.get<TaskDto[]>(`${API_BASE}/tasks`, { params });
  }

  getTask(id: string) {
    return this.http.get<TaskDto>(`${API_BASE}/tasks/${id}`);
  }

  createTask(dto: CreateTaskDto) {
    return this.http.post<TaskDto>(`${API_BASE}/tasks`, dto);
  }

  updateTask(id: string, dto: UpdateTaskDto) {
    return this.http.put<TaskDto>(`${API_BASE}/tasks/${id}`, dto);
  }

  deleteTask(id: string) {
    return this.http.delete<void>(`${API_BASE}/tasks/${id}`);
  }
}
