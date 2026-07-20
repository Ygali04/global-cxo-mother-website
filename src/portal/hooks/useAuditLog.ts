/**
 * React Query hooks for the audit log (Spec 04).
 *
 * Query keys:
 *   ['admin', 'audit-log', filters]   — paginated entries
 *   ['admin', 'audit-log', 'actions'] — distinct action names
 */

import { useQuery } from '@tanstack/react-query';
import {
  listAuditLogsApi,
  listAuditActionsApi,
  type AuditLogFilters,
} from '@/portal/api/auditLog';

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'audit-log', filters],
    queryFn: () => listAuditLogsApi(filters),
    refetchInterval: 60_000, // auto-refresh every 60s
  });
}

export function useAuditActions() {
  return useQuery({
    queryKey: ['admin', 'audit-log', 'actions'],
    queryFn: () => listAuditActionsApi(),
    staleTime: 300_000, // action list changes rarely
  });
}
