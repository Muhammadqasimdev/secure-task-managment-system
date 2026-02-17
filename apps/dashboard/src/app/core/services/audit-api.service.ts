import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { AuditLogListDto } from '@secure-task/data';
import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  constructor(private http: HttpClient) {}

  getAuditLog(page = 1, limit = 50) {
    const params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    return this.http.get<AuditLogListDto>(`${API_BASE}/audit-log`, { params });
  }
}
