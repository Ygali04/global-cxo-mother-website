/**
 * React Query hooks for the generalized field schema system (Spec 02).
 *
 * Query keys:
 *   ['field-schemas', entityType]            — all fields for an entity type
 *   ['field-schemas', entityType, surface]   — filtered by surface
 *
 * Mutations invalidate the relevant entity-type queries on success.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  listFieldSchemasApi,
  createFieldSchemaApi,
  updateFieldSchemaApi,
  deleteFieldSchemaApi,
  reorderFieldSchemasApi,
  type FieldSchemaCreate,
  type FieldSchemaUpdate,
} from '@/portal/api/fieldSchemas';

function fieldsKey(entityType: string, surface?: string) {
  return surface
    ? ['field-schemas', entityType, surface] as const
    : ['field-schemas', entityType] as const;
}

export function useFieldSchemas(entityType: string, surface?: string) {
  return useQuery({
    queryKey: fieldsKey(entityType, surface),
    queryFn: () => listFieldSchemasApi(entityType, surface),
  });
}

export function useCreateFieldSchema(entityType: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FieldSchemaCreate) => createFieldSchemaApi(entityType, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['field-schemas', entityType] });
    },
  });
}

export function useUpdateFieldSchema(entityType: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldKey, body }: { fieldKey: string; body: FieldSchemaUpdate }) =>
      updateFieldSchemaApi(entityType, fieldKey, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['field-schemas', entityType] });
    },
  });
}

export function useDeleteFieldSchema(entityType: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fieldKey: string) => deleteFieldSchemaApi(entityType, fieldKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['field-schemas', entityType] });
    },
  });
}

export function useReorderFieldSchemas(entityType: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedKeys: string[]) => reorderFieldSchemasApi(entityType, orderedKeys),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['field-schemas', entityType] });
    },
  });
}
