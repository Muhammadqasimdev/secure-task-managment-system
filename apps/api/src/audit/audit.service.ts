import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface AuditEntry {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  result: string;
  details?: string;
}

@Injectable()
export class AuditService {
  private readonly logPath: string | null =
    process.env.AUDIT_LOG_PATH ?? null;

  log(entry: Omit<AuditEntry, 'timestamp'>): void {
    const full: AuditEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    const line = JSON.stringify(full) + '\n';
    if (this.logPath) {
      try {
        const dir = path.dirname(this.logPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(this.logPath, line);
      } catch (e) {
        console.error('[AuditService] write failed', e);
        console.log('[AUDIT]', line.trim());
      }
    } else {
      console.log('[AUDIT]', line.trim());
    }
  }

  getEntries(page: number = 1, limit: number = 50): { entries: AuditEntry[]; total: number } {
    if (!this.logPath || !fs.existsSync(this.logPath)) {
      return { entries: [], total: 0 };
    }
    const content = fs.readFileSync(this.logPath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const entries: AuditEntry[] = lines
      .map((l) => {
        try {
          return JSON.parse(l) as AuditEntry;
        } catch {
          return null;
        }
      })
      .filter((e): e is AuditEntry => e != null)
      .reverse();
    const total = entries.length;
    const start = (page - 1) * limit;
    const paginated = entries.slice(start, start + limit);
    return { entries: paginated, total };
  }
}
