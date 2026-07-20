import * as XLSX from 'xlsx';
import type { UserTier } from '@/portal/data/mock';

export interface MemberSheetRow {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  companyAffiliation: string;
  role: string;
  aboutMe: string;
  tier: UserTier;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveValue(record: Record<string, unknown>, keys: string[]): string {
  for (const [rawKey, rawValue] of Object.entries(record)) {
    if (keys.includes(normalizeHeader(rawKey))) {
      return String(rawValue ?? '').trim();
    }
  }
  return '';
}

function normalizeTier(value: string): UserTier {
  const n = value.trim().toLowerCase();
  if (n === 'startup' || n === 'cxo' || n === 'vc' || n === 'admin' || n === 'dev') return n;
  return 'startup';
}

export async function parseMemberImportFile(file: File): Promise<MemberSheetRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

  return rawRows
    .map((row) => ({
      name: resolveValue(row, ['name', 'fullname', 'firstname']),
      email: resolveValue(row, ['email', 'workemail', 'emailaddress']),
      phone: resolveValue(row, ['phone', 'phonenumber', 'mobile']),
      linkedin: resolveValue(row, ['linkedin', 'linkedinurl', 'linkedinprofile']),
      companyAffiliation: resolveValue(row, ['companyaffiliation', 'company', 'organization', 'companyname']),
      role: resolveValue(row, ['role', 'title', 'jobtitle', 'position']),
      aboutMe: resolveValue(row, ['aboutme', 'bio', 'description', 'about']),
      tier: normalizeTier(resolveValue(row, ['tier', 'usertier', 'type', 'membertype'])),
    }))
    .filter((row) => row.email);
}

interface ExportableMember {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  companyAffiliation?: string;
  role?: string;
  tier?: string;
  onboardingStatus?: string;
  lastLoginAt?: string | null;
  createdAt?: string;
}

function toExportRow(r: ExportableMember) {
  return {
    Name: r.name,
    Email: r.email,
    Phone: r.phone ?? '',
    LinkedIn: r.linkedin ?? '',
    Company: r.companyAffiliation ?? '',
    Role: r.role ?? '',
    Tier: r.tier ?? '',
    Status: r.onboardingStatus ?? '',
    'Last Active': r.lastLoginAt ?? '',
    Created: r.createdAt ?? '',
  };
}

export function exportMembersToWorkbook(rows: ExportableMember[], filename: string): void {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(toExportRow));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
  XLSX.writeFile(workbook, filename);
}

export function exportMembersToCsv(rows: ExportableMember[], filename: string): void {
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
