import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPlatformConfigApi,
  updatePlatformConfigApi,
  getFormSchemaApi,
  updateFormSchemaApi,
  type PlatformConfig,
} from '@/portal/api/admin';

const CONFIG_KEY = ['admin', 'config'] as const;

export function usePlatformConfig() {
  return useQuery({
    queryKey: CONFIG_KEY,
    queryFn: getPlatformConfigApi,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdatePlatformConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PlatformConfig>) => updatePlatformConfigApi(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CONFIG_KEY });
    },
  });
}

export function useFormSchema(schemaType: string) {
  return useQuery({
    queryKey: ['admin', 'form-schemas', schemaType],
    queryFn: () => getFormSchemaApi(schemaType),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateFormSchema(schemaType: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (schemaData: Record<string, unknown>) => updateFormSchemaApi(schemaType, schemaData),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'form-schemas', schemaType] });
    },
  });
}
