/**
 * Field Schemas API client (Spec 02).
 *
 * Backend routes under `/api/admin/field-schemas`:
 *   GET    /{entity_type}             — list fields
 *   POST   /{entity_type}             — create a field
 *   PATCH  /{entity_type}/{field_key} — update a field
 *   DELETE /{entity_type}/{field_key} — soft-delete a field
 *   PUT    /{entity_type}/order       — reorder fields
 */

import { apiFetch } from '@/portal/api/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FieldSchema {
  id: string;
  entity_type: string;
  field_key: string;
  field_label: string;
  field_type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'date' | 'url' | 'email' | 'boolean';
  options: { value: string; label: string }[] | null;
  required: boolean;
  help_text: string | null;
  sort_order: number;
  visible_on: ('onboarding' | 'profile' | 'admin')[];
  is_system: boolean;
}

export interface FieldSchemaCreate {
  field_key: string;
  field_label: string;
  field_type?: string;
  options?: { value: string; label: string }[] | null;
  required?: boolean;
  help_text?: string | null;
  sort_order?: number;
  visible_on?: string[];
}

export interface FieldSchemaUpdate {
  field_label?: string;
  field_type?: string;
  options?: { value: string; label: string }[] | null;
  required?: boolean;
  help_text?: string | null;
  sort_order?: number;
  visible_on?: string[];
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export function listFieldSchemasApi(entityType: string, surface?: string) {
  const params = surface ? `?surface=${surface}` : '';
  return apiFetch<FieldSchema[]>(`/admin/field-schemas/${entityType}${params}`);
}

/** Public (no auth) endpoint for reading field schemas — used by onboarding pages. */
export function listFieldSchemasPublicApi(entityType: string, surface?: string) {
  const params = surface ? `?surface=${surface}` : '';
  return apiFetch<FieldSchema[]>(`/field-schemas/${entityType}${params}`, { skipAuthHeader: true });
}

export function createFieldSchemaApi(entityType: string, body: FieldSchemaCreate) {
  return apiFetch<FieldSchema>(`/admin/field-schemas/${entityType}`, {
    method: 'POST',
    body,
  });
}

export function updateFieldSchemaApi(entityType: string, fieldKey: string, body: FieldSchemaUpdate) {
  return apiFetch<FieldSchema>(`/admin/field-schemas/${entityType}/${fieldKey}`, {
    method: 'PATCH',
    body,
  });
}

export function deleteFieldSchemaApi(entityType: string, fieldKey: string) {
  return apiFetch<void>(`/admin/field-schemas/${entityType}/${fieldKey}`, {
    method: 'DELETE',
  });
}

export function reorderFieldSchemasApi(entityType: string, orderedKeys: string[]) {
  return apiFetch<void>(`/admin/field-schemas/${entityType}/order`, {
    method: 'PUT',
    body: { ordered_keys: orderedKeys },
  });
}
