import * as XLSX from 'xlsx';
import type { RegistrationStatus, UserTier } from '@/portal/data/mock';

export interface AttendeeSheetRowInput {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  companyAffiliation: string;
  role: string;
  aboutMe: string;
  tier: UserTier;
  status?: RegistrationStatus;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveValue(record: Record<string, unknown>, keys: string[]): string {
  for (const [rawKey, rawValue] of Object.entries(record)) {
    const normalized = normalizeHeader(rawKey);
    if (keys.includes(normalized)) {
      return String(rawValue ?? '').trim();
    }
  }

  return '';
}

function normalizeTier(value: string): UserTier {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'startup' || normalized === 'cxo' || normalized === 'vc' || normalized === 'admin' || normalized === 'dev') {
    return normalized;
  }

  return 'startup';
}

function normalizeStatus(value: string): RegistrationStatus {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'pending' || normalized === 'cancelled' || normalized === 'confirmed') {
    return normalized;
  }

  return 'confirmed';
}

export async function parseAttendeeImportFile(file: File): Promise<AttendeeSheetRowInput[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
  });

  return rawRows
    .map((row) => ({
      name: resolveValue(row, ['name', 'fullname']),
      email: resolveValue(row, ['email', 'workemail']),
      phone: resolveValue(row, ['phone', 'phonenumber', 'mobile']),
      linkedin: resolveValue(row, ['linkedin', 'linkedinurl']),
      companyAffiliation: resolveValue(row, ['companyaffiliation', 'company', 'organization']),
      role: resolveValue(row, ['role', 'title', 'jobtitle']),
      aboutMe: resolveValue(row, ['aboutme', 'bio', 'description']),
      tier: normalizeTier(resolveValue(row, ['tier', 'usertier'])),
      status: normalizeStatus(resolveValue(row, ['status', 'registrationstatus'])),
    }))
    .filter((row) => row.name || row.email || row.companyAffiliation);
}

export function exportAttendeesToWorkbook(
  rows: Array<AttendeeSheetRowInput & { registeredAt?: string }>,
  filename: string,
): void {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(toExportRow));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');
  XLSX.writeFile(workbook, filename);
}

function toExportRow(row: AttendeeSheetRowInput & { registeredAt?: string }) {
  return {
    name: row.name,
    email: row.email,
    phone: row.phone,
    linkedin: row.linkedin,
    companyAffiliation: row.companyAffiliation,
    role: row.role,
    aboutMe: row.aboutMe,
    tier: row.tier,
    status: row.status ?? 'confirmed',
    registeredAt: row.registeredAt ?? '',
  };
}

export function exportAttendeesToCsv(
  rows: Array<AttendeeSheetRowInput & { registeredAt?: string }>,
  filename: string,
): void {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(toExportRow));
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
