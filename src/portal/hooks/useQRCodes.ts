import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listQRCodesApi,
  createQRCodeApi,
  updateQRCodeApi,
  deleteQRCodeApi,
  type QRCodeResponse,
} from '@/portal/api/qrCodes';

const keys = {
  all: ['qr-codes'] as const,
};

export function useQRCodes() {
  return useQuery({
    queryKey: keys.all,
    queryFn: listQRCodesApi,
  });
}

export function useCreateQRCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQRCodeApi,
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: keys.all });
      const prev = qc.getQueryData<QRCodeResponse[]>(keys.all);
      qc.setQueryData<QRCodeResponse[]>(keys.all, (old) => [
        {
          id: `temp-${Date.now()}`, ...data, created_by_id: '', scan_count: 0,
          is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        },
        ...(old ?? []),
      ]);
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(keys.all, ctx.prev),
    onSettled: () => void qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateQRCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateQRCodeApi>[1] }) =>
      updateQRCodeApi(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: keys.all });
      const prev = qc.getQueryData<QRCodeResponse[]>(keys.all);
      qc.setQueryData<QRCodeResponse[]>(keys.all, (old) =>
        (old ?? []).map((c) => (c.id === id ? { ...c, ...data } as QRCodeResponse : c)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(keys.all, ctx.prev),
    onSettled: () => void qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteQRCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteQRCodeApi,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.all });
      const prev = qc.getQueryData<QRCodeResponse[]>(keys.all);
      qc.setQueryData<QRCodeResponse[]>(keys.all, (old) =>
        (old ?? []).filter((c) => c.id !== id),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(keys.all, ctx.prev),
    onSettled: () => void qc.invalidateQueries({ queryKey: keys.all }),
  });
}
