import type { MockUser, UserTier } from '@/portal/data/mock/types';

/** Wire format expected from FastAPI-style JSON (snake_case). */
export interface ApiUserJson {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  phone?: string;
  linkedin?: string;
  company_affiliation?: string;
  role?: string;
  about_me?: string;
  avatar_url?: string;
  enterprise_size?: string | null;
  company_size?: string | null;
  is_student?: boolean;
  is_demo?: boolean;
  boomerang_enabled?: boolean;
  is_startup_manager?: boolean;
  advisory_hourly_rate?: number | null;
  onboarding_status?: string;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiLoginResponseJson {
  access_token?: string;
  token_type?: string;
  user?: ApiUserJson;
}

const empty = '';

export function mapApiUserToMockUser(raw: ApiUserJson): MockUser {
  const now = new Date().toISOString();
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? empty,
    linkedin: raw.linkedin ?? empty,
    companyAffiliation: raw.company_affiliation ?? empty,
    role: raw.role ?? empty,
    aboutMe: raw.about_me ?? empty,
    tier: raw.tier,
    avatarUrl: raw.avatar_url,
    enterpriseSize: raw.enterprise_size ?? null,
    companySize: raw.company_size ?? null,
    isStudent: raw.is_student ?? false,
    isDemo: raw.is_demo ?? false,
    boomerangEnabled: raw.boomerang_enabled ?? false,
    isStartupManager: raw.is_startup_manager ?? false,
    advisoryHourlyRate: raw.advisory_hourly_rate ?? null,
    onboardingStatus: raw.onboarding_status ?? 'none',
    lastLoginAt: raw.last_login_at ?? null,
    createdAt: raw.created_at ?? now,
    updatedAt: raw.updated_at ?? now,
  };
}
