import type { MockEventRegistration } from './types';

export const mockRegistrations: MockEventRegistration[] = [
  // ── sri-lanka-2025 (past event — 8 registrations) ────────────────
  { id: 'reg-001', userId: 'usr-009', eventId: 'sri-lanka-2025', status: 'confirmed', registeredAt: '2025-03-10T09:00:00Z' },
  { id: 'reg-002', userId: 'usr-010', eventId: 'sri-lanka-2025', status: 'confirmed', registeredAt: '2025-03-12T14:00:00Z' },
  { id: 'reg-003', userId: 'usr-013', eventId: 'sri-lanka-2025', status: 'confirmed', registeredAt: '2025-03-15T10:00:00Z' },
  { id: 'reg-004', userId: 'usr-001', eventId: 'sri-lanka-2025', startupId: 'sup-001', status: 'confirmed', registeredAt: '2025-03-18T11:00:00Z' },
  { id: 'reg-005', userId: 'usr-003', eventId: 'sri-lanka-2025', startupId: 'sup-002', status: 'confirmed', registeredAt: '2025-03-20T08:30:00Z' },
  { id: 'reg-006', userId: 'usr-017', eventId: 'sri-lanka-2025', status: 'confirmed', registeredAt: '2025-02-01T00:00:00Z' },
  { id: 'reg-007', userId: 'usr-014', eventId: 'sri-lanka-2025', status: 'cancelled', registeredAt: '2025-03-22T16:00:00Z' },
  { id: 'reg-008', userId: 'usr-011', eventId: 'sri-lanka-2025', status: 'confirmed', registeredAt: '2025-03-25T07:00:00Z' },

  // ── sf-conference-2025 (past event — 7 registrations) ─────────────
  { id: 'reg-009', userId: 'usr-009', eventId: 'sf-conference-2025', status: 'confirmed', registeredAt: '2025-06-01T10:00:00Z' },
  { id: 'reg-010', userId: 'usr-012', eventId: 'sf-conference-2025', status: 'confirmed', registeredAt: '2025-06-05T12:00:00Z' },
  { id: 'reg-011', userId: 'usr-013', eventId: 'sf-conference-2025', status: 'confirmed', registeredAt: '2025-06-08T09:00:00Z' },
  { id: 'reg-012', userId: 'usr-014', eventId: 'sf-conference-2025', status: 'confirmed', registeredAt: '2025-06-10T14:00:00Z' },
  { id: 'reg-013', userId: 'usr-005', eventId: 'sf-conference-2025', startupId: 'sup-003', status: 'confirmed', registeredAt: '2025-06-12T08:00:00Z' },
  { id: 'reg-014', userId: 'usr-007', eventId: 'sf-conference-2025', startupId: 'sup-005', status: 'pending', registeredAt: '2025-06-15T11:00:00Z' },
  { id: 'reg-015', userId: 'usr-018', eventId: 'sf-conference-2025', status: 'confirmed', registeredAt: '2025-05-15T00:00:00Z' },

  // ── dubai-summit-2026 (upcoming — 15 registrations) ───────────────
  { id: 'reg-016', userId: 'usr-009', eventId: 'dubai-summit-2026', status: 'confirmed', registeredAt: '2025-11-01T09:00:00Z' },
  { id: 'reg-017', userId: 'usr-010', eventId: 'dubai-summit-2026', status: 'confirmed', registeredAt: '2025-11-05T10:00:00Z' },
  { id: 'reg-018', userId: 'usr-011', eventId: 'dubai-summit-2026', status: 'confirmed', registeredAt: '2025-11-08T14:00:00Z' },
  { id: 'reg-019', userId: 'usr-012', eventId: 'dubai-summit-2026', status: 'pending', registeredAt: '2025-12-01T08:00:00Z' },
  { id: 'reg-020', userId: 'usr-013', eventId: 'dubai-summit-2026', status: 'confirmed', registeredAt: '2025-11-10T11:00:00Z' },
  { id: 'reg-021', userId: 'usr-014', eventId: 'dubai-summit-2026', status: 'confirmed', registeredAt: '2025-11-12T09:30:00Z' },
  { id: 'reg-022', userId: 'usr-015', eventId: 'dubai-summit-2026', status: 'confirmed', registeredAt: '2025-11-15T13:00:00Z' },
  { id: 'reg-023', userId: 'usr-016', eventId: 'dubai-summit-2026', status: 'confirmed', registeredAt: '2025-11-18T10:00:00Z' },
  { id: 'reg-024', userId: 'usr-001', eventId: 'dubai-summit-2026', startupId: 'sup-001', status: 'confirmed', registeredAt: '2025-11-20T08:00:00Z' },
  { id: 'reg-025', userId: 'usr-002', eventId: 'dubai-summit-2026', startupId: 'sup-001', status: 'confirmed', registeredAt: '2025-11-20T08:05:00Z' },
  { id: 'reg-026', userId: 'usr-003', eventId: 'dubai-summit-2026', startupId: 'sup-002', status: 'pending', registeredAt: '2025-12-05T09:00:00Z' },
  { id: 'reg-027', userId: 'usr-005', eventId: 'dubai-summit-2026', startupId: 'sup-003', status: 'confirmed', registeredAt: '2025-11-22T07:00:00Z' },
  { id: 'reg-028', userId: 'usr-006', eventId: 'dubai-summit-2026', startupId: 'sup-004', status: 'pending', registeredAt: '2025-12-10T15:00:00Z' },
  { id: 'reg-029', userId: 'usr-007', eventId: 'dubai-summit-2026', startupId: 'sup-005', status: 'confirmed', registeredAt: '2025-11-25T12:00:00Z' },
  { id: 'reg-030', userId: 'usr-017', eventId: 'dubai-summit-2026', status: 'confirmed', registeredAt: '2025-10-01T00:00:00Z' },
];
