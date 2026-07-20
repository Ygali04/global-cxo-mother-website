import { useMemo } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProgramResponse,
  EnrollmentResponse,
  AssignmentResponse,
} from '@/portal/api/types';
import {
  createProgramApi,
  listProgramsApi,
  getProgramApi,
  getMyProgramContextApi,
  updateProgramApi,
  enrollUserApi,
  listEnrollmentsApi,
  updateEnrollmentApi,
  updateEnrollmentDetailsApi,
  deleteEnrollmentApi,
  createAssignmentApi,
  listAssignmentsApi,
  updateAssignmentApi,
  deleteAssignmentApi,
  getProgramHoursApi,
  getLedgerApi,
  confirmMeetingApi,
  disputeMeetingApi,
  resolveDisputeApi,
  submitFeedbackApi,
  getPendingFeedbackApi,
  issueCreditApi,
  listCohortsApi,
  createCohortApi,
  updateCohortApi,
  listCohortEnrollmentsApi,
  enrollUserInCohortApi,
  deleteProgramApi,
  listInvoicesApi,
  uploadInvoiceApi,
  deleteInvoiceApi,
} from '@/portal/api/programs';

// ---------------------------------------------------------------------------
// Query key helpers
// ---------------------------------------------------------------------------

const programKeys = {
  all: ['programs'] as const,
  detail: (id: string) => ['programs', id] as const,
  enrollments: (programId: string) => ['programs', programId, 'enrollments'] as const,
  assignments: (programId: string) => ['programs', programId, 'assignments'] as const,
  hours: (programId: string) => ['programs', programId, 'hours'] as const,
};

// ---------------------------------------------------------------------------
// Queries (unchanged)
// ---------------------------------------------------------------------------

export function usePrograms() {
  return useQuery({
    queryKey: programKeys.all,
    queryFn: listProgramsApi,
  });
}

export function useMyProgram() {
  return useQuery({
    queryKey: ['programs', 'me'],
    queryFn: getMyProgramContextApi,
  });
}

export function useProgram(id: string | null | undefined) {
  return useQuery({
    queryKey: programKeys.detail(id ?? ''),
    queryFn: () => getProgramApi(id!),
    enabled: !!id,
  });
}

export function useEnrollments(programId: string) {
  return useQuery({
    queryKey: programKeys.enrollments(programId),
    queryFn: () => listEnrollmentsApi(programId),
    enabled: !!programId,
  });
}

export function useAssignments(programId: string) {
  return useQuery({
    queryKey: programKeys.assignments(programId),
    queryFn: () => listAssignmentsApi(programId),
    enabled: !!programId,
  });
}

export function useProgramHours(programId: string) {
  return useQuery({
    queryKey: programKeys.hours(programId),
    queryFn: () => getProgramHoursApi(programId),
    enabled: !!programId,
  });
}

export function useLedger(programId: string) {
  return useQuery({
    queryKey: ['programs', programId, 'ledger'],
    queryFn: () => getLedgerApi(programId),
    enabled: !!programId,
  });
}

export function usePendingFeedback() {
  return useQuery({
    queryKey: ['feedback', 'pending'],
    queryFn: getPendingFeedbackApi,
  });
}

export function useCohorts(programId: string | null) {
  return useQuery({
    queryKey: ['programs', programId, 'cohorts'],
    queryFn: () => listCohortsApi(programId!),
    enabled: !!programId,
  });
}

export function useCohortEnrollments(programId: string | null, cohortId: string | null) {
  return useQuery({
    queryKey: ['programs', programId, 'cohorts', cohortId, 'enrollments'],
    queryFn: () => listCohortEnrollmentsApi(programId!, cohortId!),
    enabled: !!programId && !!cohortId,
  });
}

export function useAllCohortEnrollments(programId: string | null, cohortIds: string[]) {
  const queries = useQueries({
    queries: cohortIds.map((cohortId) => ({
      queryKey: ['programs', programId, 'cohorts', cohortId, 'enrollments'] as const,
      queryFn: () => listCohortEnrollmentsApi(programId!, cohortId),
      enabled: !!programId,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const userCohortMap = useMemo(() => {
    const map = new Map<string, string[]>();
    queries.forEach((q, idx) => {
      if (!q.data) return;
      const cohortId = cohortIds[idx];
      for (const enrollment of q.data) {
        const existing = map.get(enrollment.user_id) ?? [];
        existing.push(cohortId);
        map.set(enrollment.user_id, existing);
      }
    });
    return map;
  }, [queries, cohortIds]);

  return { userCohortMap, isLoading: queries.some((q) => q.isLoading) };
}

// ---------------------------------------------------------------------------
// Optimistic mutation helpers
// ---------------------------------------------------------------------------

type Snapshot = { key: readonly unknown[]; data: unknown }[];

async function snap(qc: ReturnType<typeof useQueryClient>, keys: (readonly unknown[])[]) {
  const snaps: Snapshot = [];
  for (const key of keys) {
    await qc.cancelQueries({ queryKey: key });
    snaps.push({ key, data: qc.getQueryData(key) });
  }
  return snaps;
}

function rollback(qc: ReturnType<typeof useQueryClient>, snaps: Snapshot) {
  for (const s of snaps) qc.setQueryData(s.key, s.data);
}

function settle(qc: ReturnType<typeof useQueryClient>, keys: (readonly unknown[])[]) {
  for (const key of keys) void qc.invalidateQueries({ queryKey: key });
}

// ---------------------------------------------------------------------------
// Program mutations — optimistic
// ---------------------------------------------------------------------------

export function useCreateProgram() {
  const qc = useQueryClient();
  const keys = [programKeys.all];
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createProgramApi(data),
    onMutate: async (data) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<ProgramResponse[]>(programKeys.all, (old) => [
        ...(old ?? []),
        { id: `temp-${Date.now()}`, name: String(data.name ?? ''), status: 'draft', ...data } as unknown as ProgramResponse,
      ]);
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useUpdateProgram(id: string) {
  const qc = useQueryClient();
  const keys = [programKeys.all, programKeys.detail(id)];
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateProgramApi(id, data),
    onMutate: async (data) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<ProgramResponse[]>(programKeys.all, (old) =>
        (old ?? []).map((p) => (p.id === id ? { ...p, ...data } as ProgramResponse : p)),
      );
      qc.setQueryData<ProgramResponse>(programKeys.detail(id), (old) =>
        old ? { ...old, ...data } as ProgramResponse : old,
      );
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useDeleteProgram() {
  const qc = useQueryClient();
  const keys = [programKeys.all];
  return useMutation({
    mutationFn: (id: string) => deleteProgramApi(id),
    onMutate: async (id) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<ProgramResponse[]>(programKeys.all, (old) =>
        (old ?? []).filter((p) => p.id !== id),
      );
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

// ---------------------------------------------------------------------------
// Enrollment mutations — optimistic
// ---------------------------------------------------------------------------

export function useEnrollUser(programId: string) {
  const qc = useQueryClient();
  const keys = [programKeys.enrollments(programId)];
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => enrollUserApi(programId, data),
    onMutate: async (data) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<EnrollmentResponse[]>(programKeys.enrollments(programId), (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`, program_id: programId, user_id: '',
          user_name: String(data.user_name ?? data.user_email ?? ''),
          user_email: String(data.user_email ?? ''), role: String(data.role ?? 'startup'),
          status: 'invited', pricing_tier: null, pricing_locked: false,
          hours_committed: 0, hours_used: 0, hours_paid: 0,
          contract_signed: false, invoice_sent: false,
          enrolled_at: null, activated_at: null, created_at: new Date().toISOString(),
        },
      ]);
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useUpdateEnrollment(programId: string) {
  const qc = useQueryClient();
  const keys = [programKeys.enrollments(programId)];
  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: Record<string, unknown> }) =>
      updateEnrollmentApi(programId, enrollmentId, data),
    onMutate: async ({ enrollmentId, data }) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<EnrollmentResponse[]>(programKeys.enrollments(programId), (old) =>
        (old ?? []).map((e) => (e.id === enrollmentId ? { ...e, ...data } as EnrollmentResponse : e)),
      );
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useUpdateEnrollmentDetails(programId: string) {
  const qc = useQueryClient();
  const keys = [programKeys.enrollments(programId), programKeys.hours(programId)];
  return useMutation({
    mutationFn: ({ enrollmentId, data }: { enrollmentId: string; data: Parameters<typeof updateEnrollmentDetailsApi>[2] }) =>
      updateEnrollmentDetailsApi(programId, enrollmentId, data),
    onMutate: async ({ enrollmentId, data }) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<EnrollmentResponse[]>(programKeys.enrollments(programId), (old) =>
        (old ?? []).map((e) => (e.id === enrollmentId ? { ...e, ...data } as EnrollmentResponse : e)),
      );
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useDeleteEnrollment(programId: string) {
  const qc = useQueryClient();
  const keys = [programKeys.enrollments(programId), programKeys.assignments(programId), programKeys.hours(programId), programKeys.all];
  return useMutation({
    mutationFn: (enrollmentId: string) => deleteEnrollmentApi(programId, enrollmentId),
    onMutate: async (enrollmentId) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<EnrollmentResponse[]>(programKeys.enrollments(programId), (old) =>
        (old ?? []).filter((e) => e.id !== enrollmentId),
      );
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

// ---------------------------------------------------------------------------
// Assignment mutations — optimistic
// ---------------------------------------------------------------------------

export function useCreateAssignment(programId: string) {
  const qc = useQueryClient();
  const keys = [programKeys.assignments(programId), programKeys.enrollments(programId), programKeys.hours(programId)];
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createAssignmentApi(programId, data),
    onMutate: async (data) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<AssignmentResponse[]>(programKeys.assignments(programId), (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`, program_id: programId,
          cxo_user_id: String(data.cxo_user_id ?? ''), cxo_name: null, cxo_company: null,
          startup_user_id: String(data.startup_user_id ?? ''), startup_name: null, startup_company: null,
          hours_allocated: Number(data.hours_allocated ?? 4), hours_used: 0,
          status: 'active', request_type: null, request_status: null, deny_reason: null,
          created_at: new Date().toISOString(),
        },
      ]);
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useUpdateAssignment(programId: string) {
  const qc = useQueryClient();
  const keys = [programKeys.assignments(programId), programKeys.hours(programId)];
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: Parameters<typeof updateAssignmentApi>[2] }) =>
      updateAssignmentApi(programId, assignmentId, data),
    onMutate: async ({ assignmentId, data }) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<AssignmentResponse[]>(programKeys.assignments(programId), (old) =>
        (old ?? []).map((a) => (a.id === assignmentId ? { ...a, ...data } as AssignmentResponse : a)),
      );
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useDeleteAssignment(programId: string) {
  const qc = useQueryClient();
  const keys = [programKeys.assignments(programId), programKeys.enrollments(programId), programKeys.hours(programId)];
  return useMutation({
    mutationFn: (assignmentId: string) => deleteAssignmentApi(programId, assignmentId),
    onMutate: async (assignmentId) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<AssignmentResponse[]>(programKeys.assignments(programId), (old) =>
        (old ?? []).filter((a) => a.id !== assignmentId),
      );
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

// ---------------------------------------------------------------------------
// Ledger / Meeting mutations — optimistic
// ---------------------------------------------------------------------------

export function useConfirmMeeting(programId: string) {
  const qc = useQueryClient();
  const keys = [['programs', programId, 'ledger'] as const, programKeys.hours(programId)];
  return useMutation({
    mutationFn: (ledgerId: string) => confirmMeetingApi(programId, ledgerId),
    onMutate: async () => ({ snaps: await snap(qc, keys) }),
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useDisputeMeeting(programId: string) {
  const qc = useQueryClient();
  const keys = [['programs', programId, 'ledger'] as const];
  return useMutation({
    mutationFn: (ledgerId: string) => disputeMeetingApi(programId, ledgerId),
    onMutate: async () => ({ snaps: await snap(qc, keys) }),
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useResolveDispute(programId: string) {
  const qc = useQueryClient();
  const keys = [['programs', programId, 'ledger'] as const, programKeys.hours(programId)];
  return useMutation({
    mutationFn: (data: { ledgerId: string; action: string; admin_notes?: string }) =>
      resolveDisputeApi(programId, data.ledgerId, { action: data.action, admin_notes: data.admin_notes }),
    onMutate: async () => ({ snaps: await snap(qc, keys) }),
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useSubmitFeedback() {
  const qc = useQueryClient();
  const keys = [['feedback'] as const];
  return useMutation({
    mutationFn: (data: { ledgerEntryId: string; rating: number; comment?: string; something_wrong?: boolean; wrong_description?: string; extra_time_offered?: number }) =>
      submitFeedbackApi(data.ledgerEntryId, data),
    onMutate: async () => ({ snaps: await snap(qc, keys) }),
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useIssueCredit(programId: string) {
  const qc = useQueryClient();
  const keys = [programKeys.hours(programId)];
  return useMutation({
    mutationFn: (data: { startup_user_id: string; hours_credited: number; reason: string }) =>
      issueCreditApi(programId, data),
    onMutate: async () => ({ snaps: await snap(qc, keys) }),
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

// ---------------------------------------------------------------------------
// Cohort mutations — optimistic
// ---------------------------------------------------------------------------

export function useCreateCohort(programId: string | null) {
  const qc = useQueryClient();
  const keys = [['programs', programId, 'cohorts'] as const];
  return useMutation({
    mutationFn: (data: Parameters<typeof createCohortApi>[1]) =>
      createCohortApi(programId!, data),
    onMutate: async (data) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData(keys[0], (old: unknown[] | undefined) => [
        ...(old ?? []),
        { id: `temp-${Date.now()}`, program_id: programId, ...data, status: 'active', enrollment_count: 0, created_at: new Date().toISOString() },
      ]);
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useUpdateCohort(programId: string | null) {
  const qc = useQueryClient();
  const keys = [['programs', programId, 'cohorts'] as const];
  return useMutation({
    mutationFn: ({ cohortId, data }: { cohortId: string; data: Parameters<typeof updateCohortApi>[2] }) =>
      updateCohortApi(programId!, cohortId, data),
    onMutate: async ({ cohortId, data }) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData(keys[0], (old: unknown[] | undefined) =>
        (old ?? []).map((c: any) => (c.id === cohortId ? { ...c, ...data } : c)),
      );
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useEnrollUserInCohort(programId: string | null, cohortId: string | null) {
  const qc = useQueryClient();
  const keys = [
    ['programs', programId, 'cohorts', cohortId, 'enrollments'] as const,
    ['programs', programId, 'cohorts'] as const,
  ];
  return useMutation({
    mutationFn: (data: { user_email: string; role: string }) =>
      enrollUserInCohortApi(programId!, cohortId!, data),
    onMutate: async (data) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData(keys[0], (old: unknown[] | undefined) => [
        ...(old ?? []),
        { id: `temp-${Date.now()}`, cohort_id: cohortId, user_id: '', user_name: data.user_email, user_email: data.user_email, role: data.role, status: 'active', enrolled_at: new Date().toISOString(), created_at: new Date().toISOString() },
      ]);
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

// Invoices
export function useInvoices(programId: string | null) {
  return useQuery({
    queryKey: ['programs', programId, 'invoices'],
    queryFn: () => listInvoicesApi(programId!),
    enabled: !!programId,
  });
}

export function useUploadInvoice(programId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof uploadInvoiceApi>[1]) =>
      uploadInvoiceApi(programId!, data),
    onSettled: () => {
      if (programId) void qc.invalidateQueries({ queryKey: ['programs', programId, 'invoices'] });
    },
  });
}

export function useDeleteInvoice(programId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (invoiceId: string) => deleteInvoiceApi(programId!, invoiceId),
    onSettled: () => {
      if (programId) void qc.invalidateQueries({ queryKey: ['programs', programId, 'invoices'] });
    },
  });
}
