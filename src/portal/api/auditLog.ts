/**
 * Audit Log API client (Spec 04).
 *
 * Backend routes:
 *   GET /admin/audit-logs           — paginated, filtered audit entries
 *   GET /admin/audit-logs/actions   — distinct action names for filter UI
 */

import { apiFetch } from '@/portal/api/client';

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  changes: Record<string, unknown>;
  created_at: string;
  target_name: string | null;
  actor_name: string | null;
  summary: string | null;
}

export interface AuditLogFilters {
  limit?: number;
  offset?: number;
  target_type?: string;
  actor_id?: string;
  action?: string;
  since?: string;
  until?: string;
  include_sandbox?: boolean;
}

export function listAuditLogsApi(filters: AuditLogFilters = {}) {
  const params = new URLSearchParams();
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));
  if (filters.target_type) params.set('target_type', filters.target_type);
  if (filters.actor_id) params.set('actor_id', filters.actor_id);
  if (filters.action) params.set('action', filters.action);
  if (filters.since) params.set('since', filters.since);
  if (filters.until) params.set('until', filters.until);
  if (filters.include_sandbox) params.set('include_sandbox', 'true');
  const qs = params.toString();
  return apiFetch<AuditLogEntry[]>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
}

export function listAuditActionsApi() {
  return apiFetch<string[]>('/admin/audit-logs/actions');
}
