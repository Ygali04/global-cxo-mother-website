export type BackOfficeRole = 'cio' | 'founder' | 'ops' | 'admin';
export type OrganizationType = 'enterprise' | 'startup';
export type RecordStatus =
  | 'pending'
  | 'active'
  | 'inactive'
  | 'under review'
  | 'invited'
  | 'accepted'
  | 'rejected'
  | 'profile incomplete';

export type OnboardingStageStatus =
  | 'invited'
  | 'profile incomplete'
  | 'under review'
  | 'approved'
  | 'active'
  | 'applied'
  | 'accepted'
  | 'rejected'
  | 'inactive';

export interface BackOfficeOrganization {
  id: string;
  name: string;
  type: OrganizationType;
  geography: string;
  industry: string;
  website: string;
  tags: string[];
  notes: string;
  status: 'active' | 'inactive';
}

export interface BackOfficeUser {
  id: string;
  fullName: string;
  title: string;
  role: BackOfficeRole;
  organizationId: string;
  email: string;
  phone: string;
  geography: string;
  status: RecordStatus;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  innovationPriorities?: string[];
  availabilityNotes?: string;
  startupCategory?: string;
  enterpriseUseCase?: string;
  stage?: string;
}

export interface OnboardingRecord {
  id: string;
  userId: string;
  role: 'cio' | 'founder';
  source: 'invite' | 'application';
  status: OnboardingStageStatus;
  owner: string;
  submittedAt: string;
  completionPercent: number;
  nextAction: string;
  materials: string[];
}

export const backOfficeOrganizations: BackOfficeOrganization[] = [
  {
    id: 'org-ent-001',
    name: 'Meridian Bank Group',
    type: 'enterprise',
    geography: 'UAE',
    industry: 'Financial Services',
    website: 'https://meridianbankgroup.com',
    tags: ['priority account', 'innovation council'],
    notes: 'Anchor enterprise for MENA closed-door CIO roundtables.',
    status: 'active',
  },
  {
    id: 'org-ent-002',
    name: 'Northstar Health Systems',
    type: 'enterprise',
    geography: 'US',
    industry: 'Healthcare',
    website: 'https://northstarhealthsystems.com',
    tags: ['clinical AI', 'telehealth'],
    notes: 'Interested in diagnostics and workflow automation startups.',
    status: 'active',
  },
  {
    id: 'org-ent-003',
    name: 'Apex Retail Holdings',
    type: 'enterprise',
    geography: 'Singapore',
    industry: 'Retail',
    website: 'https://apexretailholdings.com',
    tags: ['customer data', 'supply chain'],
    notes: 'Good CIO target for product feedback and use-case discovery.',
    status: 'active',
  },
  {
    id: 'org-sta-001',
    name: 'NexarAI',
    type: 'startup',
    geography: 'US',
    industry: 'Enterprise AI',
    website: 'https://nexarai.com',
    tags: ['computer vision', 'manufacturing'],
    notes: 'Strong founder team, already resonating with enterprise buyers.',
    status: 'active',
  },
  {
    id: 'org-sta-002',
    name: 'PayBridge',
    type: 'startup',
    geography: 'UK',
    industry: 'Fintech',
    website: 'https://paybridge.io',
    tags: ['payments', 'cross-border'],
    notes: 'Potential fit for CIO dinners focused on treasury transformation.',
    status: 'active',
  },
  {
    id: 'org-sta-003',
    name: 'VitaleDx',
    type: 'startup',
    geography: 'Kenya',
    industry: 'Healthtech',
    website: 'https://vitaledx.com',
    tags: ['diagnostics', 'AI health'],
    notes: 'Founder under review, deck is strong but needs enterprise positioning.',
    status: 'active',
  },
];

export const backOfficeUsers: BackOfficeUser[] = [
  {
    id: 'bo-user-001',
    fullName: 'Farah Al Mansoori',
    title: 'Chief Information Officer',
    role: 'cio',
    organizationId: 'org-ent-001',
    email: 'farah.almansoori@meridianbankgroup.com',
    phone: '+971501112233',
    geography: 'Dubai',
    status: 'active',
    tags: ['AI strategy', 'payments', 'speaker-ready'],
    notes: 'Very responsive. Strong candidate for matching with fintech founders.',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-03-16T14:15:00Z',
    innovationPriorities: ['fraud prevention', 'agentic operations', 'customer onboarding'],
    availabilityNotes: 'Available Tuesdays and Thursdays after 2pm GST.',
  },
  {
    id: 'bo-user-002',
    fullName: 'Daniel Wu',
    title: 'Chief Digital Officer',
    role: 'cio',
    organizationId: 'org-ent-002',
    email: 'daniel.wu@northstarhealthsystems.com',
    phone: '+14155550144',
    geography: 'San Francisco',
    status: 'under review',
    tags: ['clinical AI', 'workflow tooling'],
    notes: 'Profile completed, waiting on admin approval.',
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-03-18T09:10:00Z',
    innovationPriorities: ['diagnostics', 'patient operations', 'ambient documentation'],
    availabilityNotes: 'Prefers mornings PT. Avoid Fridays.',
  },
  {
    id: 'bo-user-003',
    fullName: 'Sonia Patel',
    title: 'VP Technology Innovation',
    role: 'cio',
    organizationId: 'org-ent-003',
    email: 'sonia.patel@apexretailholdings.com',
    phone: '+6581237788',
    geography: 'Singapore',
    status: 'profile incomplete',
    tags: ['retail media', 'data infra'],
    notes: 'Invite accepted, profile missing innovation priorities.',
    createdAt: '2026-02-11T10:00:00Z',
    updatedAt: '2026-03-14T12:05:00Z',
    innovationPriorities: ['customer intelligence'],
    availabilityNotes: 'Shared general availability only.',
  },
  {
    id: 'bo-user-004',
    fullName: 'Priya Sharma',
    title: 'Co-Founder & CEO',
    role: 'founder',
    organizationId: 'org-sta-001',
    email: 'priya@nexarai.com',
    phone: '+14155550101',
    geography: 'San Francisco',
    status: 'active',
    tags: ['flagship founder', 'manufacturing'],
    notes: 'Ready for enterprise advisory sessions immediately.',
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-03-19T15:10:00Z',
    startupCategory: 'Enterprise AI',
    enterpriseUseCase: 'Plant-floor defect detection and predictive QA.',
    stage: 'Series A',
  },
  {
    id: 'bo-user-005',
    fullName: 'Sofia Martinez',
    title: 'Founder & CEO',
    role: 'founder',
    organizationId: 'org-sta-002',
    email: 'sofia@paybridge.io',
    phone: '+447700900123',
    geography: 'London',
    status: 'accepted',
    tags: ['payments', 'cross-border'],
    notes: 'Accepted into program, onboarding activation pending ops handoff.',
    createdAt: '2026-02-03T11:30:00Z',
    updatedAt: '2026-03-20T08:20:00Z',
    startupCategory: 'Fintech',
    enterpriseUseCase: 'Cross-border treasury workflows for multi-market enterprises.',
    stage: 'Seed+',
  },
  {
    id: 'bo-user-006',
    fullName: 'Amara Osei',
    title: 'Co-Founder & CEO',
    role: 'founder',
    organizationId: 'org-sta-003',
    email: 'amara@vitaledx.com',
    phone: '+254711334455',
    geography: 'Nairobi',
    status: 'under review',
    tags: ['healthtech', 'diagnostics'],
    notes: 'Deck uploaded. Needs tighter articulation of enterprise buyer persona.',
    createdAt: '2026-02-22T16:00:00Z',
    updatedAt: '2026-03-18T18:45:00Z',
    startupCategory: 'Healthtech',
    enterpriseUseCase: 'AI-supported triage and point-of-care screening.',
    stage: 'Pre-Series A',
  },
  {
    id: 'bo-user-007',
    fullName: 'Sarah Mitchell',
    title: 'Head of Operations',
    role: 'admin',
    organizationId: 'org-ent-001',
    email: 'sarah@globalcio.org',
    phone: '+14155550117',
    geography: 'New York',
    status: 'active',
    tags: ['admin'],
    notes: 'Approves CIO and founder onboarding.',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-03-21T00:00:00Z',
  },
  {
    id: 'bo-user-008',
    fullName: 'David Nakamura',
    title: 'Program Manager',
    role: 'ops',
    organizationId: 'org-ent-001',
    email: 'david@globalcio.org',
    phone: '+14155550118',
    geography: 'San Francisco',
    status: 'active',
    tags: ['ops', 'matching'],
    notes: 'Owns founder intake and session prep.',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-03-21T00:00:00Z',
  },
];

export const onboardingRecords: OnboardingRecord[] = [
  {
    id: 'onb-001',
    userId: 'bo-user-001',
    role: 'cio',
    source: 'invite',
    status: 'active',
    owner: 'Sarah Mitchell',
    submittedAt: '2026-01-07T10:00:00Z',
    completionPercent: 100,
    nextAction: 'Ready for session matching.',
    materials: [],
  },
  {
    id: 'onb-002',
    userId: 'bo-user-002',
    role: 'cio',
    source: 'invite',
    status: 'under review',
    owner: 'Sarah Mitchell',
    submittedAt: '2026-03-18T09:10:00Z',
    completionPercent: 85,
    nextAction: 'Admin approval needed after priorities review.',
    materials: [],
  },
  {
    id: 'onb-003',
    userId: 'bo-user-003',
    role: 'cio',
    source: 'invite',
    status: 'profile incomplete',
    owner: 'David Nakamura',
    submittedAt: '2026-03-14T12:05:00Z',
    completionPercent: 55,
    nextAction: 'Collect priorities and availability notes.',
    materials: [],
  },
  {
    id: 'onb-004',
    userId: 'bo-user-004',
    role: 'founder',
    source: 'application',
    status: 'active',
    owner: 'David Nakamura',
    submittedAt: '2026-01-16T09:00:00Z',
    completionPercent: 100,
    nextAction: 'Available for CIO matching.',
    materials: ['Deck.pdf', 'One-pager.pdf'],
  },
  {
    id: 'onb-005',
    userId: 'bo-user-005',
    role: 'founder',
    source: 'invite',
    status: 'accepted',
    owner: 'David Nakamura',
    submittedAt: '2026-03-17T14:00:00Z',
    completionPercent: 92,
    nextAction: 'Activate and add to founder scheduling pool.',
    materials: ['Deck.pdf'],
  },
  {
    id: 'onb-006',
    userId: 'bo-user-006',
    role: 'founder',
    source: 'application',
    status: 'under review',
    owner: 'Sarah Mitchell',
    submittedAt: '2026-03-18T18:45:00Z',
    completionPercent: 80,
    nextAction: 'Review enterprise use case and deck positioning.',
    materials: ['Pitch Deck.pdf', 'Clinical Pilot Brief.pdf'],
  },
];

export function getBackOfficeUser(userId: string): BackOfficeUser | undefined {
  return backOfficeUsers.find((user) => user.id === userId);
}

export function getBackOfficeOrganization(
  organizationId: string,
): BackOfficeOrganization | undefined {
  return backOfficeOrganizations.find((organization) => organization.id === organizationId);
}

export function getOnboardingRecord(userId: string): OnboardingRecord | undefined {
  return onboardingRecords.find((record) => record.userId === userId);
}
