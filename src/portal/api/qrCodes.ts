import { apiFetch } from '@/portal/api/client';

export interface QRCodeResponse {
  id: string;
  label: string;
  slug: string;
  target_url: string;
  created_by_id: string;
  scan_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function listQRCodesApi(): Promise<QRCodeResponse[]> {
  return apiFetch<QRCodeResponse[]>('/qr-codes', { method: 'GET' });
}

export async function createQRCodeApi(data: {
  label: string;
  slug: string;
  target_url: string;
}): Promise<QRCodeResponse> {
  return apiFetch<QRCodeResponse>('/qr-codes', { method: 'POST', body: data });
}

export async function updateQRCodeApi(
  id: string,
  data: { label?: string; target_url?: string; is_active?: boolean },
): Promise<QRCodeResponse> {
  return apiFetch<QRCodeResponse>(`/qr-codes/${id}`, { method: 'PATCH', body: data });
}

export async function deleteQRCodeApi(id: string): Promise<void> {
  await apiFetch<void>(`/qr-codes/${id}`, { method: 'DELETE' });
}
