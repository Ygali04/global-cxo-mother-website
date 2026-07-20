import type { EventDetail } from '@/portal/data/EventsData';

export type UserTier = 'startup' | 'cxo' | 'advisor' | 'vc' | 'admin' | 'dev';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  companyAffiliation: string;
  role: string;
  aboutMe: string;
  tier: UserTier;
  avatarUrl?: string;
  enterpriseSize?: string | null;
  companySize?: string | null;
  isStudent?: boolean;
  isDemo?: boolean;
  boomerangEnabled?: boolean;
  /**
   * True when this user has a UserStartupLink with link_role = 'manager'.
   * Only managers (+ admin/dev) may see startup financial fields or edit
   * the startup profile. Populated from /users/me. Defaults to false.
   */
  isStartupManager?: boolean;
  advisoryHourlyRate?: number | null;
  onboardingStatus?: string;
  activeCohort?: {
    programName: string;
    cohortName: string;
    role: 'cxo' | 'startup';
    status: 'invited' | 'active' | 'completed';
  };
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type StartupRole = 'founder' | 'manager' | 'member' | 'proxy';

export interface MockStartupProfile {
  id: string;
  companyName: string;
  companyWebsite: string;
  companyDomain: string;
  description: string;
  logoUrl?: string;
  registeredBy: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockUserStartupLink {
  id: string;
  userId: string;
  startupId: string;
  role: StartupRole;
  linkedAt: string;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface MockEventRegistration {
  id: string;
  userId: string;
  eventId: string;
  startupId?: string;
  status: RegistrationStatus;
  registeredAt: string;
}

export interface VisibilitySetting {
  startupCanSee: UserTier[];
  cxoCanSee: UserTier[];
  vcCanSee: UserTier[];
}

export type EventVisibilityMap = Record<string, VisibilitySetting>;

export interface MockDatabaseSnapshot {
  version: number;
  currentUserId: string | null;
  events: EventDetail[];
  users: MockUser[];
  startups: MockStartupProfile[];
  userStartupLinks: MockUserStartupLink[];
  registrations: MockEventRegistration[];
  eventVisibility: EventVisibilityMap;
}
