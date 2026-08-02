import { apiFetch } from '@/portal/api/client';

export interface PlatformConfig {
  demo_mode_enabled: boolean;
  public_registration_enabled: boolean;
  maintenance_mode: boolean;
  show_hero_event_toast?: boolean;
  cors_origins: string;
  default_timezone: string;
  booking_min_notice: string;
  booking_max_per_week: number;
  booking_cancellation_window: string;
  booking_auto_confirm: boolean;
}

export interface FormSchemaResponse {
  schema_type: string;
  schema_data: Record<string, unknown>;
}

export async function getPlatformConfigApi(): Promise<PlatformConfig> {
  return apiFetch<PlatformConfig>('/admin/config', { method: 'GET' });
}

export async function updatePlatformConfigApi(data: Partial<PlatformConfig>): Promise<PlatformConfig> {
  return apiFetch<PlatformConfig>('/admin/config', { method: 'PATCH', body: data });
}

export async function getFormSchemaApi(schemaType: string): Promise<FormSchemaResponse> {
  return apiFetch<FormSchemaResponse>(`/admin/form-schemas/${schemaType}`, { method: 'GET' });
}

export async function updateFormSchemaApi(
  schemaType: string,
  schemaData: Record<string, unknown>,
): Promise<FormSchemaResponse> {
  return apiFetch<FormSchemaResponse>(`/admin/form-schemas/${schemaType}`, {
    method: 'PUT',
    body: { schema_data: schemaData },
  });
}
