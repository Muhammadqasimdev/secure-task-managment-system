export interface AuditLogEntryDto {
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  result: string;
  details?: string;
}

export interface AuditLogListDto {
  entries: AuditLogEntryDto[];
  total: number;
  page: number;
  limit: number;
}
