import { mockUsers } from './users';
import { mockStartups, mockUserStartupLinks } from './startups';
import type { MockUser } from './types';

// ─────────────────────────────────────────────────────────────────────────
// Boomerang integration — phase 1 mock data
//
// This file is the single source of truth for UI consumption in the
// /admin/boomerang tab. It is deliberately isolated from the real API so
// that phase 2 can swap the import line in AdminBoomerang.tsx for an API
// hook module without any JSX changes. See docs/features/boomerang-integration.md
// for the wire-format spec.
//
// Do NOT import React, do NOT add side effects (outside the dev-only
// referential integrity guard at the end of this file), and do NOT fetch
// anything. Keep this module pure and synchronous.
// ─────────────────────────────────────────────────────────────────────────

// Silence unused-import warning; mockUserStartupLinks is re-exported for
// downstream consumers but not referenced inside this file.
void mockUserStartupLinks;

// ─── Types ───────────────────────────────────────────────────────────────

export type BoomerangStatus =
  | 'not_ready'
  | 'ready'
  | 'exporting'
  | 'exported'
  | 'archived';

export type IntroStage =
  | 'queued'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'meeting_scheduled'
  | 'meeting_completed'
  | 'pilot'
  | 'closed_won'
  | 'closed_lost';

export type SignalHealth = 'cold' | 'warming' | 'active' | 'hot';

export type BoomerangExportKind =
  | 'startup_registered'
  | 'target_accounts_upsert'
  | 'cxo_circle_sync'
  | 'intro_purchase_unlock';

export type BoomerangWebhookEventType =
  | 'candidate.ack'
  | 'signal.scored'
  | 'intro.updated'
  | 'deal.updated';

export interface BoomerangTargetAccount {
  id: string;
  startupId: string;
  companyName: string;
  industry: string;
  geography: string;
  contactName: string;
  contactTitle: string;
  linkedinUrl: string;
  signalScore: number | null;
  connectionStrength: 1 | 2 | 3 | 4 | 5;
  shortestPathCxoId: string | null;
  shortestPathHops: number;
  health: SignalHealth;
}

export interface BoomerangCandidate {
  startupId: string;
  status: BoomerangStatus;
  readinessScore: number;
  targetAccountIds: string[];
  freeIntrosLimit: number;
  freeIntrosUsed: number;
  paidIntrosUnlocked: number;
  firstExportedAt: string | null;
  lastExportedAt: string | null;
  boomerangStartupId: string | null;
}

export interface BoomerangIntroduction {
  id: string;
  startupId: string;
  targetAccountId: string;
  referrerCxoId: string;
  stage: IntroStage;
  stageEnteredAt: string;
  templateKey: 'warm_intro_v1' | 'problem_statement_v1' | 'custom';
  notes: string | null;
  meetingScheduledAt: string | null;
  outcomeSummary: string | null;
  isFreeIntro: boolean;
}

export interface BoomerangDeal {
  id: string;
  introductionId: string;
  startupId: string;
  targetAccountId: string;
  stage: Extract<
    IntroStage,
    'meeting_completed' | 'pilot' | 'closed_won' | 'closed_lost'
  >;
  dealValueUsd: number;
  probability: number;
  lastUpdateAt: string;
}

export interface BoomerangCxoContribution {
  cxoUserId: string;
  startupsSupported: number;
  introsMade: number;
  introsAccepted: number;
  meetingsBooked: number;
  pipelineAttributedUsd: number;
}

export interface BoomerangExportLogEntry {
  id: string;
  kind: BoomerangExportKind;
  startupId: string | null;
  payloadBytes: number;
  httpStatus: 200 | 202 | 400 | 401 | 500;
  idempotencyKey: string;
  triggeredByUserId: string;
  timestamp: string;
  errorMessage: string | null;
}

export interface BoomerangWebhookReceipt {
  id: string;
  receivedAt: string;
  eventType: BoomerangWebhookEventType;
  payloadSummary: string;
  processed: boolean;
  error: string | null;
}

export interface BoomerangSyncState {
  environment: 'mock' | 'staging' | 'production';
  baseUrlMasked: string;
  authMode: 'api_key' | 'hmac' | 'mtls';
  webhookSecretConfigured: boolean;
  lastHandshakeAt: string;
  lastSyncAt: string;
  consecutiveFailures: number;
  featureFlags: {
    exportEnabled: boolean;
    inboundWebhooksEnabled: boolean;
    paidIntrosEnabled: boolean;
  };
}

export interface BoomerangActivityEvent {
  id: string;
  at: string;
  actor: string;
  verb: string;
  subject: string;
  context: string;
  icon: 'send' | 'handshake' | 'dollar' | 'radar' | 'shield';
}

// ─── Seeding helpers ─────────────────────────────────────────────────────

function seed(a: number, b: number): number {
  return (a * 31 + b * 7 + 11) % 100;
}

function scoreToHealth(score: number | null): SignalHealth {
  if (score === null) return 'cold';
  if (score >= 75) return 'hot';
  if (score >= 55) return 'active';
  if (score >= 35) return 'warming';
  return 'cold';
}

function scoreToStrength(score: number | null): 1 | 2 | 3 | 4 | 5 {
  if (score === null) return 1;
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

// ─── CxO bridge routing ──────────────────────────────────────────────────
// Each of the 4 demo CxOs is the shortest-path bridge for a specific
// enterprise segment, mirroring their real (mock) company + role:
//
//   usr-009 Richard Huang    → TechInnovate Corp (manufacturing)
//   usr-010 Catherine Dubois → Alstom Group (transportation / energy)
//   usr-011 Daniel Adeyemi   → Zenith Financial Group (banking)
//   usr-012 Laura Kim        → Meridian Health Systems (healthcare)

const BRIDGE_BY_STARTUP: Record<string, string> = {
  'sup-001': 'usr-009', // NexarAI     → Richard Huang
  'sup-002': 'usr-011', // PayBridge   → Daniel Adeyemi
  'sup-003': 'usr-012', // VitaleDx    → Laura Kim
  'sup-005': 'usr-010', // CypherShield → Catherine Dubois
};

// ─── Target accounts ─────────────────────────────────────────────────────

interface TargetSeed {
  companyName: string;
  industry: string;
  geography: string;
  contactName: string;
  contactTitle: string;
}

const NEXARAI_TARGETS: TargetSeed[] = [
  { companyName: 'Siemens Digital Industries', industry: 'Manufacturing', geography: 'DE', contactName: 'Klara Weiss', contactTitle: 'VP Smart Factory' },
  { companyName: 'Bosch Rexroth', industry: 'Manufacturing', geography: 'DE', contactName: 'Matthias Keller', contactTitle: 'CIO' },
  { companyName: 'Foxconn Technology', industry: 'Manufacturing', geography: 'TW', contactName: 'Wei-Chen Lin', contactTitle: 'Head of Digital Factory' },
  { companyName: 'Flex Ltd', industry: 'Manufacturing', geography: 'SG', contactName: 'Arjun Patel', contactTitle: 'VP Manufacturing Tech' },
  { companyName: 'Jabil', industry: 'Manufacturing', geography: 'US', contactName: 'Maria Rodriguez', contactTitle: 'Director of Smart Manufacturing' },
  { companyName: 'TSMC', industry: 'Semiconductors', geography: 'TW', contactName: 'Li-Hua Chang', contactTitle: 'CIO' },
  { companyName: 'Magna International', industry: 'Automotive', geography: 'CA', contactName: 'Robert Schmitt', contactTitle: 'VP Operations Technology' },
  { companyName: 'Denso Corporation', industry: 'Automotive', geography: 'JP', contactName: 'Hiroshi Tanaka', contactTitle: 'Chief Digital Officer' },
  { companyName: 'Hitachi Industrial', industry: 'Manufacturing', geography: 'JP', contactName: 'Yuki Sato', contactTitle: 'Head of Operations Intelligence' },
  { companyName: 'Mitsubishi Electric', industry: 'Manufacturing', geography: 'JP', contactName: 'Kenji Nakamura', contactTitle: 'VP Factory Automation' },
  { companyName: 'Samsung SDI', industry: 'Batteries', geography: 'KR', contactName: 'Ji-Woo Park', contactTitle: 'Director of Quality Systems' },
  { companyName: 'LG Display', industry: 'Electronics', geography: 'KR', contactName: 'Min-Jun Lee', contactTitle: 'VP Production Engineering' },
  { companyName: 'Panasonic', industry: 'Electronics', geography: 'JP', contactName: 'Akira Yamamoto', contactTitle: 'CIO' },
  { companyName: 'Schneider Electric', industry: 'Industrial', geography: 'FR', contactName: 'Élise Moreau', contactTitle: 'VP EcoStruxure' },
  { companyName: 'ABB Group', industry: 'Industrial', geography: 'CH', contactName: 'Stefan Müller', contactTitle: 'Head of Digital Industries' },
  { companyName: 'Honeywell', industry: 'Industrial', geography: 'US', contactName: 'Jennifer Cross', contactTitle: 'VP Connected Plant' },
  { companyName: 'Emerson Electric', industry: 'Industrial', geography: 'US', contactName: 'David Harrison', contactTitle: 'CIO' },
  { companyName: 'Rockwell Automation', industry: 'Industrial', geography: 'US', contactName: 'Sarah Bennett', contactTitle: 'VP Information Solutions' },
  { companyName: 'Yokogawa Electric', industry: 'Industrial', geography: 'JP', contactName: 'Takeshi Ito', contactTitle: 'Head of Industrial AI' },
  { companyName: 'Omron Industrial', industry: 'Industrial', geography: 'JP', contactName: 'Naomi Hashimoto', contactTitle: 'VP Automation' },
];

const PAYBRIDGE_TARGETS: TargetSeed[] = [
  { companyName: 'HSBC Holdings', industry: 'Banking', geography: 'UK', contactName: 'Sarah Reeves', contactTitle: 'Group CIO' },
  { companyName: 'Standard Chartered', industry: 'Banking', geography: 'UK', contactName: 'Rajiv Kumar', contactTitle: 'Head of Transaction Banking Tech' },
  { companyName: 'Citi Payments', industry: 'Banking', geography: 'US', contactName: 'Michael Chen', contactTitle: 'MD Global Treasury' },
  { companyName: 'JPMorgan Payments', industry: 'Banking', geography: 'US', contactName: 'Olivia Grant', contactTitle: 'Head of Treasury Products' },
  { companyName: 'Santander Corporate', industry: 'Banking', geography: 'ES', contactName: 'Carlos Fernández', contactTitle: 'CIO Corporate Banking' },
  { companyName: 'BBVA', industry: 'Banking', geography: 'ES', contactName: 'Lucía Martínez', contactTitle: 'Head of Payments Innovation' },
  { companyName: 'Nubank', industry: 'Fintech', geography: 'BR', contactName: 'Pedro Almeida', contactTitle: 'VP Platform' },
  { companyName: 'Mercado Pago', industry: 'Fintech', geography: 'AR', contactName: 'Sofía Ramírez', contactTitle: 'Head of Cross-Border' },
  { companyName: 'Rapyd', industry: 'Fintech', geography: 'UK', contactName: 'Avi Cohen', contactTitle: 'CTO' },
  { companyName: 'Wise Business', industry: 'Fintech', geography: 'UK', contactName: 'Anna Kowalski', contactTitle: 'Head of Business Products' },
  { companyName: 'Revolut Business', industry: 'Fintech', geography: 'UK', contactName: 'James Whitmore', contactTitle: 'VP B2B' },
  { companyName: 'Adyen', industry: 'Fintech', geography: 'NL', contactName: 'Willem de Vries', contactTitle: 'Director of Platform' },
  { companyName: 'Checkout.com', industry: 'Fintech', geography: 'UK', contactName: 'Layla Hassan', contactTitle: 'VP Engineering' },
  { companyName: 'Airwallex', industry: 'Fintech', geography: 'AU', contactName: 'Chen Zhang', contactTitle: 'Head of Treasury Products' },
  { companyName: 'Brex', industry: 'Fintech', geography: 'US', contactName: 'Tyler Brooks', contactTitle: 'VP Corporate Cards' },
  { companyName: 'Ramp', industry: 'Fintech', geography: 'US', contactName: 'Hannah Cohen', contactTitle: 'Head of Product' },
  { companyName: 'Mercury', industry: 'Fintech', geography: 'US', contactName: 'Derek Lin', contactTitle: 'Engineering Lead' },
  { companyName: 'Thunes', industry: 'Fintech', geography: 'SG', contactName: 'Amal Nair', contactTitle: 'VP Global Payments' },
  { companyName: 'Remitly', industry: 'Fintech', geography: 'US', contactName: 'Priya Iyer', contactTitle: 'Head of Business Remittance' },
  { companyName: 'MUFG Americas', industry: 'Banking', geography: 'JP', contactName: 'Takashi Abe', contactTitle: 'CDO Corporate Banking' },
];

const VITALEDX_TARGETS: TargetSeed[] = [
  { companyName: 'Mayo Clinic', industry: 'Healthcare', geography: 'US', contactName: 'Dr. Amanda Reeves', contactTitle: 'CMIO' },
  { companyName: 'Cleveland Clinic', industry: 'Healthcare', geography: 'US', contactName: "Dr. James O'Connor", contactTitle: 'Chief Innovation Officer' },
  { companyName: 'Kaiser Permanente', industry: 'Healthcare', geography: 'US', contactName: 'Dr. Linda Tran', contactTitle: 'VP Diagnostics' },
  { companyName: 'Mount Sinai Health', industry: 'Healthcare', geography: 'US', contactName: 'Dr. Michael Klein', contactTitle: 'CMIO' },
  { companyName: 'Johns Hopkins Medicine', industry: 'Healthcare', geography: 'US', contactName: 'Dr. Sarah Washington', contactTitle: 'VP Clinical Innovation' },
  { companyName: 'UCSF Health', industry: 'Healthcare', geography: 'US', contactName: 'Dr. Rajiv Shah', contactTitle: 'Chief Digital Officer' },
  { companyName: 'NHS Digital', industry: 'Healthcare', geography: 'UK', contactName: 'Emma Whitfield', contactTitle: 'Director of Diagnostics' },
  { companyName: 'Apollo Hospitals', industry: 'Healthcare', geography: 'IN', contactName: 'Dr. Arvind Menon', contactTitle: 'CIO' },
  { companyName: 'Bumrungrad International', industry: 'Healthcare', geography: 'TH', contactName: 'Dr. Somchai Thongchai', contactTitle: 'CMIO' },
  { companyName: "KK Women's and Children's", industry: 'Healthcare', geography: 'SG', contactName: 'Dr. Mei Ling Tan', contactTitle: 'Head of Innovation' },
  { companyName: 'Aster DM Healthcare', industry: 'Healthcare', geography: 'AE', contactName: 'Dr. Fatima Al-Rashid', contactTitle: 'CIO' },
  { companyName: 'Sheba Medical Center', industry: 'Healthcare', geography: 'IL', contactName: 'Dr. Daniel Cohen', contactTitle: 'Chief Innovation Officer' },
  { companyName: 'Hartford HealthCare', industry: 'Healthcare', geography: 'US', contactName: 'Dr. Patricia Moore', contactTitle: 'CMIO' },
  { companyName: 'Novant Health', industry: 'Healthcare', geography: 'US', contactName: 'Dr. Robert Lee', contactTitle: 'VP Clinical Informatics' },
  { companyName: 'HCA Healthcare', industry: 'Healthcare', geography: 'US', contactName: 'Dr. Jennifer Adams', contactTitle: 'VP Diagnostics' },
  { companyName: 'Humana', industry: 'Health Insurance', geography: 'US', contactName: 'Thomas Reilly', contactTitle: 'CIO Clinical' },
  { companyName: 'Cigna', industry: 'Health Insurance', geography: 'US', contactName: 'Susan Patel', contactTitle: 'VP Clinical Technology' },
  { companyName: 'CVS Health', industry: 'Healthcare', geography: 'US', contactName: 'Mark Stevens', contactTitle: 'VP Retail Health' },
];

const CYPHERSHIELD_TARGETS: TargetSeed[] = [
  { companyName: 'Deutsche Bank', industry: 'Banking', geography: 'DE', contactName: 'Hans Berger', contactTitle: 'CISO' },
  { companyName: 'UBS', industry: 'Banking', geography: 'CH', contactName: 'Elena Moser', contactTitle: 'Head of Security Architecture' },
  { companyName: 'Credit Suisse', industry: 'Banking', geography: 'CH', contactName: 'Lukas Frei', contactTitle: 'VP Cloud Security' },
  { companyName: 'Barclays Markets', industry: 'Banking', geography: 'UK', contactName: 'Oliver Stanton', contactTitle: 'Head of Cybersecurity' },
  { companyName: 'Morgan Stanley', industry: 'Banking', geography: 'US', contactName: 'Rebecca Hayes', contactTitle: 'CISO Wealth Management' },
  { companyName: 'Goldman Sachs', industry: 'Banking', geography: 'US', contactName: 'Daniel Rosenberg', contactTitle: 'VP Security Engineering' },
  { companyName: 'BlackRock', industry: 'Asset Management', geography: 'US', contactName: 'Sophia Nguyen', contactTitle: 'Head of Platform Security' },
  { companyName: 'BNP Paribas', industry: 'Banking', geography: 'FR', contactName: 'Antoine Dubois', contactTitle: 'CISO' },
  { companyName: 'ING Group', industry: 'Banking', geography: 'NL', contactName: 'Femke van der Berg', contactTitle: 'Head of Cyber' },
  { companyName: 'Lloyds Banking', industry: 'Banking', geography: 'UK', contactName: 'Charlotte Reeves', contactTitle: 'CISO' },
  { companyName: 'Nordea', industry: 'Banking', geography: 'SE', contactName: 'Erik Johansson', contactTitle: 'VP Information Security' },
  { companyName: 'DBS Bank', industry: 'Banking', geography: 'SG', contactName: 'Wei Ming Tan', contactTitle: 'Head of Security Engineering' },
  { companyName: 'OCBC Bank', industry: 'Banking', geography: 'SG', contactName: 'Mei Hua Lim', contactTitle: 'CISO' },
  { companyName: 'UOB', industry: 'Banking', geography: 'SG', contactName: 'Jun Ho Park', contactTitle: 'VP Cloud Security' },
  { companyName: 'Mizuho Financial', industry: 'Banking', geography: 'JP', contactName: 'Kenichi Sato', contactTitle: 'CISO' },
  { companyName: 'Sumitomo Mitsui', industry: 'Banking', geography: 'JP', contactName: 'Ryo Yamada', contactTitle: 'Head of Cyber Defense' },
  { companyName: 'Westpac', industry: 'Banking', geography: 'AU', contactName: 'Olivia Parker', contactTitle: 'CISO' },
  { companyName: 'ANZ Bank', industry: 'Banking', geography: 'AU', contactName: 'Liam Carter', contactTitle: 'VP Security Operations' },
  { companyName: 'Commonwealth Bank', industry: 'Banking', geography: 'AU', contactName: 'Isabella Bennett', contactTitle: 'Head of Cloud Security' },
  { companyName: 'Société Générale', industry: 'Banking', geography: 'FR', contactName: 'Philippe Laurent', contactTitle: 'CISO Markets' },
];

function buildTargets(startupId: string, seeds: TargetSeed[]): BoomerangTargetAccount[] {
  return seeds.map((s, i) => {
    const rawScore = seed(parseInt(startupId.slice(-1), 10) || 0, i + 1);
    const scoreNullable = i % 19 === 0 ? null : rawScore;
    const linkedinSlug = `${s.contactName.toLowerCase().replace(/[^a-z]+/g, '')}-${s.companyName.toLowerCase().replace(/[^a-z]+/g, '')}`;
    return {
      id: `tgt-${startupId}-${String(i + 1).padStart(2, '0')}`,
      startupId,
      companyName: s.companyName,
      industry: s.industry,
      geography: s.geography,
      contactName: s.contactName,
      contactTitle: s.contactTitle,
      linkedinUrl: `https://linkedin.com/in/${linkedinSlug}`,
      signalScore: scoreNullable,
      connectionStrength: scoreToStrength(scoreNullable),
      shortestPathCxoId: BRIDGE_BY_STARTUP[startupId] ?? null,
      shortestPathHops: scoreNullable !== null && scoreNullable >= 60 ? 2 : 3,
      health: scoreToHealth(scoreNullable),
    };
  });
}

export const boomerangTargetAccounts: BoomerangTargetAccount[] = [
  ...buildTargets('sup-001', NEXARAI_TARGETS),
  ...buildTargets('sup-002', PAYBRIDGE_TARGETS),
  ...buildTargets('sup-003', VITALEDX_TARGETS),
  ...buildTargets('sup-005', CYPHERSHIELD_TARGETS),
];

// ─── Candidates ──────────────────────────────────────────────────────────

function targetIdsFor(startupId: string): string[] {
  return boomerangTargetAccounts.filter((t) => t.startupId === startupId).map((t) => t.id);
}

export const boomerangCandidates: BoomerangCandidate[] = [
  {
    startupId: 'sup-001',
    status: 'exported',
    readinessScore: 92,
    targetAccountIds: targetIdsFor('sup-001'),
    freeIntrosLimit: 10,
    freeIntrosUsed: 8,
    paidIntrosUnlocked: 3,
    firstExportedAt: '2026-02-10T14:00:00Z',
    lastExportedAt: '2026-03-28T09:30:00Z',
    boomerangStartupId: 'bmr-startup-001',
  },
  {
    startupId: 'sup-002',
    status: 'exported',
    readinessScore: 88,
    targetAccountIds: targetIdsFor('sup-002'),
    freeIntrosLimit: 10,
    freeIntrosUsed: 5,
    paidIntrosUnlocked: 0,
    firstExportedAt: '2026-02-18T10:00:00Z',
    lastExportedAt: '2026-03-30T11:15:00Z',
    boomerangStartupId: 'bmr-startup-002',
  },
  {
    startupId: 'sup-003',
    status: 'exported',
    readinessScore: 81,
    targetAccountIds: targetIdsFor('sup-003'),
    freeIntrosLimit: 10,
    freeIntrosUsed: 3,
    paidIntrosUnlocked: 0,
    firstExportedAt: '2026-03-05T08:45:00Z',
    lastExportedAt: '2026-03-29T15:20:00Z',
    boomerangStartupId: 'bmr-startup-003',
  },
  {
    startupId: 'sup-004',
    status: 'not_ready',
    readinessScore: 42,
    targetAccountIds: [],
    freeIntrosLimit: 10,
    freeIntrosUsed: 0,
    paidIntrosUnlocked: 0,
    firstExportedAt: null,
    lastExportedAt: null,
    boomerangStartupId: null,
  },
  {
    startupId: 'sup-005',
    status: 'exported',
    readinessScore: 85,
    targetAccountIds: targetIdsFor('sup-005'),
    freeIntrosLimit: 10,
    freeIntrosUsed: 4,
    paidIntrosUnlocked: 0,
    firstExportedAt: '2026-02-22T13:00:00Z',
    lastExportedAt: '2026-03-31T10:00:00Z',
    boomerangStartupId: 'bmr-startup-005',
  },
];

// ─── Introductions ───────────────────────────────────────────────────────

function targetId(startupId: string, index: number): string {
  const t = boomerangTargetAccounts.filter((x) => x.startupId === startupId);
  return t[index]?.id ?? t[0]?.id ?? 'tgt-missing';
}

export const boomerangIntroductions: BoomerangIntroduction[] = [
  { id: 'intro-001', startupId: 'sup-001', targetAccountId: targetId('sup-001', 0),  referrerCxoId: 'usr-009', stage: 'queued',            stageEnteredAt: '2026-03-31T09:00:00Z', templateKey: 'warm_intro_v1',       notes: 'Waiting on Klara Weiss availability before sending.', meetingScheduledAt: null,                   outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-002', startupId: 'sup-002', targetAccountId: targetId('sup-002', 3),  referrerCxoId: 'usr-011', stage: 'queued',            stageEnteredAt: '2026-04-01T10:30:00Z', templateKey: 'problem_statement_v1', notes: null,                                                   meetingScheduledAt: null,                   outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-003', startupId: 'sup-005', targetAccountId: targetId('sup-005', 7),  referrerCxoId: 'usr-010', stage: 'queued',            stageEnteredAt: '2026-04-01T14:00:00Z', templateKey: 'warm_intro_v1',       notes: 'Catherine confirmed — sending tomorrow.',             meetingScheduledAt: null,                   outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-004', startupId: 'sup-003', targetAccountId: targetId('sup-003', 5),  referrerCxoId: 'usr-012', stage: 'queued',            stageEnteredAt: '2026-04-02T08:00:00Z', templateKey: 'warm_intro_v1',       notes: null,                                                   meetingScheduledAt: null,                   outcomeSummary: null, isFreeIntro: true },

  { id: 'intro-005', startupId: 'sup-001', targetAccountId: targetId('sup-001', 1),  referrerCxoId: 'usr-009', stage: 'sent',              stageEnteredAt: '2026-03-29T11:00:00Z', templateKey: 'warm_intro_v1',       notes: null, meetingScheduledAt: null, outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-006', startupId: 'sup-001', targetAccountId: targetId('sup-001', 4),  referrerCxoId: 'usr-009', stage: 'sent',              stageEnteredAt: '2026-03-28T15:30:00Z', templateKey: 'warm_intro_v1',       notes: null, meetingScheduledAt: null, outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-007', startupId: 'sup-002', targetAccountId: targetId('sup-002', 0),  referrerCxoId: 'usr-011', stage: 'sent',              stageEnteredAt: '2026-03-30T09:00:00Z', templateKey: 'problem_statement_v1', notes: null, meetingScheduledAt: null, outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-008', startupId: 'sup-003', targetAccountId: targetId('sup-003', 1),  referrerCxoId: 'usr-012', stage: 'sent',              stageEnteredAt: '2026-03-30T13:00:00Z', templateKey: 'warm_intro_v1',       notes: null, meetingScheduledAt: null, outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-009', startupId: 'sup-005', targetAccountId: targetId('sup-005', 11), referrerCxoId: 'usr-010', stage: 'sent',              stageEnteredAt: '2026-03-27T10:00:00Z', templateKey: 'warm_intro_v1',       notes: null, meetingScheduledAt: null, outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-010', startupId: 'sup-005', targetAccountId: targetId('sup-005', 0),  referrerCxoId: 'usr-010', stage: 'sent',              stageEnteredAt: '2026-03-26T16:00:00Z', templateKey: 'warm_intro_v1',       notes: null, meetingScheduledAt: null, outcomeSummary: null, isFreeIntro: true },

  { id: 'intro-011', startupId: 'sup-001', targetAccountId: targetId('sup-001', 6),  referrerCxoId: 'usr-009', stage: 'accepted',          stageEnteredAt: '2026-03-25T14:00:00Z', templateKey: 'warm_intro_v1',       notes: 'Robert Schmitt replied positively, wants 30-min intro call.',    meetingScheduledAt: null, outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-012', startupId: 'sup-002', targetAccountId: targetId('sup-002', 10), referrerCxoId: 'usr-011', stage: 'accepted',          stageEnteredAt: '2026-03-24T09:00:00Z', templateKey: 'problem_statement_v1', notes: 'Revolut Business interested in a pilot discussion.',             meetingScheduledAt: null, outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-013', startupId: 'sup-003', targetAccountId: targetId('sup-003', 7),  referrerCxoId: 'usr-012', stage: 'accepted',          stageEnteredAt: '2026-03-23T12:00:00Z', templateKey: 'warm_intro_v1',       notes: null, meetingScheduledAt: null, outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-014', startupId: 'sup-005', targetAccountId: targetId('sup-005', 6),  referrerCxoId: 'usr-010', stage: 'accepted',          stageEnteredAt: '2026-03-22T11:00:00Z', templateKey: 'warm_intro_v1',       notes: null, meetingScheduledAt: null, outcomeSummary: null, isFreeIntro: true },

  { id: 'intro-015', startupId: 'sup-001', targetAccountId: targetId('sup-001', 7),  referrerCxoId: 'usr-009', stage: 'meeting_scheduled', stageEnteredAt: '2026-03-20T10:00:00Z', templateKey: 'warm_intro_v1',       notes: 'Hiroshi Tanaka booked for April 8.',               meetingScheduledAt: '2026-04-08T14:00:00Z', outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-016', startupId: 'sup-002', targetAccountId: targetId('sup-002', 1),  referrerCxoId: 'usr-011', stage: 'meeting_scheduled', stageEnteredAt: '2026-03-19T15:00:00Z', templateKey: 'problem_statement_v1', notes: 'Standard Chartered team meeting April 10.',       meetingScheduledAt: '2026-04-10T09:30:00Z', outcomeSummary: null, isFreeIntro: true },
  { id: 'intro-017', startupId: 'sup-005', targetAccountId: targetId('sup-005', 14), referrerCxoId: 'usr-010', stage: 'meeting_scheduled', stageEnteredAt: '2026-03-18T09:00:00Z', templateKey: 'warm_intro_v1',       notes: null,                                                 meetingScheduledAt: '2026-04-06T13:00:00Z', outcomeSummary: null, isFreeIntro: true },

  { id: 'intro-018', startupId: 'sup-003', targetAccountId: targetId('sup-003', 7),  referrerCxoId: 'usr-012', stage: 'meeting_completed', stageEnteredAt: '2026-03-15T10:00:00Z', templateKey: 'warm_intro_v1',       notes: 'First meeting went well. Apollo Hospitals requested technical deep-dive.', meetingScheduledAt: '2026-03-14T09:00:00Z', outcomeSummary: 'Positive first meeting. Follow-up scoping workshop proposed for mid-April.', isFreeIntro: true },
  { id: 'intro-019', startupId: 'sup-002', targetAccountId: targetId('sup-002', 9),  referrerCxoId: 'usr-011', stage: 'meeting_completed', stageEnteredAt: '2026-03-12T14:00:00Z', templateKey: 'problem_statement_v1', notes: 'Wise Business treasury team pushing for joint evaluation.',               meetingScheduledAt: '2026-03-11T10:00:00Z', outcomeSummary: 'Treasury team aligned on use case. Waiting on procurement sign-off.',         isFreeIntro: true },
  { id: 'intro-020', startupId: 'sup-001', targetAccountId: targetId('sup-001', 13), referrerCxoId: 'usr-009', stage: 'meeting_completed', stageEnteredAt: '2026-03-10T11:00:00Z', templateKey: 'warm_intro_v1',       notes: 'Schneider Electric interested but wants proof-of-life on a single line first.', meetingScheduledAt: '2026-03-09T08:30:00Z', outcomeSummary: 'Pilot scope being drafted for Q2 2026.',                                        isFreeIntro: true },

  { id: 'intro-021', startupId: 'sup-002', targetAccountId: targetId('sup-002', 0),  referrerCxoId: 'usr-011', stage: 'pilot',             stageEnteredAt: '2026-03-05T09:00:00Z', templateKey: 'problem_statement_v1', notes: 'HSBC pilot signed — scope includes 3 corridors over 8 weeks.', meetingScheduledAt: '2026-03-02T14:00:00Z', outcomeSummary: '8-week paid pilot signed. $180K value.',          isFreeIntro: true },
  { id: 'intro-022', startupId: 'sup-001', targetAccountId: targetId('sup-001', 1),  referrerCxoId: 'usr-009', stage: 'pilot',             stageEnteredAt: '2026-02-28T10:00:00Z', templateKey: 'warm_intro_v1',       notes: 'Bosch Rexroth pilot across 2 factories. Success criteria signed.', meetingScheduledAt: '2026-02-25T13:00:00Z', outcomeSummary: '12-week pilot signed covering 2 Bosch Rexroth factories. $240K ACV.', isFreeIntro: true },

  { id: 'intro-023', startupId: 'sup-005', targetAccountId: targetId('sup-005', 11), referrerCxoId: 'usr-010', stage: 'closed_won',        stageEnteredAt: '2026-02-20T10:00:00Z', templateKey: 'warm_intro_v1',       notes: 'DBS signed annual contract — first CypherShield enterprise win.', meetingScheduledAt: '2026-02-12T09:00:00Z', outcomeSummary: 'Annual enterprise license signed. $95K ARR.', isFreeIntro: true },

  { id: 'intro-024', startupId: 'sup-003', targetAccountId: targetId('sup-003', 15), referrerCxoId: 'usr-012', stage: 'closed_lost',       stageEnteredAt: '2026-02-18T14:00:00Z', templateKey: 'warm_intro_v1',       notes: 'Humana went with an incumbent vendor after 6-week eval.', meetingScheduledAt: '2026-02-05T11:00:00Z', outcomeSummary: 'Declined — Humana chose an existing vendor. Good feedback on product depth.', isFreeIntro: true },
];

// ─── Deals ───────────────────────────────────────────────────────────────

export const boomerangDeals: BoomerangDeal[] = [
  { id: 'deal-001', introductionId: 'intro-018', startupId: 'sup-003', targetAccountId: targetId('sup-003', 7),  stage: 'meeting_completed', dealValueUsd: 0,      probability: 0.25, lastUpdateAt: '2026-03-16T10:00:00Z' },
  { id: 'deal-002', introductionId: 'intro-019', startupId: 'sup-002', targetAccountId: targetId('sup-002', 9),  stage: 'meeting_completed', dealValueUsd: 0,      probability: 0.35, lastUpdateAt: '2026-03-13T12:00:00Z' },
  { id: 'deal-003', introductionId: 'intro-020', startupId: 'sup-001', targetAccountId: targetId('sup-001', 13), stage: 'meeting_completed', dealValueUsd: 0,      probability: 0.40, lastUpdateAt: '2026-03-11T09:00:00Z' },
  { id: 'deal-004', introductionId: 'intro-021', startupId: 'sup-002', targetAccountId: targetId('sup-002', 0),  stage: 'pilot',             dealValueUsd: 180000, probability: 0.60, lastUpdateAt: '2026-03-06T10:00:00Z' },
  { id: 'deal-005', introductionId: 'intro-022', startupId: 'sup-001', targetAccountId: targetId('sup-001', 1),  stage: 'pilot',             dealValueUsd: 240000, probability: 0.65, lastUpdateAt: '2026-03-01T11:00:00Z' },
  { id: 'deal-006', introductionId: 'intro-023', startupId: 'sup-005', targetAccountId: targetId('sup-005', 11), stage: 'closed_won',        dealValueUsd: 95000,  probability: 1.00, lastUpdateAt: '2026-02-22T10:00:00Z' },
  { id: 'deal-007', introductionId: 'intro-024', startupId: 'sup-003', targetAccountId: targetId('sup-003', 15), stage: 'closed_lost',       dealValueUsd: 0,      probability: 0.00, lastUpdateAt: '2026-02-20T14:00:00Z' },
];

// ─── CxO contributions ───────────────────────────────────────────────────

export const boomerangCxoContributions: BoomerangCxoContribution[] = [
  { cxoUserId: 'usr-009', startupsSupported: 1, introsMade: 6, introsAccepted: 4, meetingsBooked: 3, pipelineAttributedUsd: 240000 },
  { cxoUserId: 'usr-010', startupsSupported: 1, introsMade: 5, introsAccepted: 3, meetingsBooked: 2, pipelineAttributedUsd: 95000 },
  { cxoUserId: 'usr-011', startupsSupported: 1, introsMade: 5, introsAccepted: 3, meetingsBooked: 2, pipelineAttributedUsd: 180000 },
  { cxoUserId: 'usr-012', startupsSupported: 1, introsMade: 4, introsAccepted: 2, meetingsBooked: 1, pipelineAttributedUsd: 0 },
];

// ─── Export log ──────────────────────────────────────────────────────────

export const boomerangExportLog: BoomerangExportLogEntry[] = [
  { id: 'exp-018', kind: 'target_accounts_upsert', startupId: 'sup-001', payloadBytes: 4821, httpStatus: 202, idempotencyKey: 'idem-f0a1-4b8e', triggeredByUserId: 'usr-017', timestamp: '2026-03-31T10:02:14Z', errorMessage: null },
  { id: 'exp-017', kind: 'cxo_circle_sync',        startupId: null,      payloadBytes: 2344, httpStatus: 202, idempotencyKey: 'idem-9d2b-4c1a', triggeredByUserId: 'usr-017', timestamp: '2026-03-30T16:45:00Z', errorMessage: null },
  { id: 'exp-016', kind: 'target_accounts_upsert', startupId: 'sup-005', payloadBytes: 5102, httpStatus: 202, idempotencyKey: 'idem-3e7f-41a9', triggeredByUserId: 'usr-017', timestamp: '2026-03-30T11:20:00Z', errorMessage: null },
  { id: 'exp-015', kind: 'target_accounts_upsert', startupId: 'sup-002', payloadBytes: 4988, httpStatus: 202, idempotencyKey: 'idem-7c44-40de', triggeredByUserId: 'usr-019', timestamp: '2026-03-29T14:11:00Z', errorMessage: null },
  { id: 'exp-014', kind: 'target_accounts_upsert', startupId: 'sup-003', payloadBytes: 4510, httpStatus: 202, idempotencyKey: 'idem-1b6d-4f33', triggeredByUserId: 'usr-017', timestamp: '2026-03-29T09:05:00Z', errorMessage: null },
  { id: 'exp-013', kind: 'intro_purchase_unlock',  startupId: 'sup-001', payloadBytes: 312,  httpStatus: 200, idempotencyKey: 'idem-a055-4c80', triggeredByUserId: 'usr-017', timestamp: '2026-03-27T13:30:00Z', errorMessage: null },
  { id: 'exp-012', kind: 'target_accounts_upsert', startupId: 'sup-001', payloadBytes: 4800, httpStatus: 202, idempotencyKey: 'idem-b917-4d55', triggeredByUserId: 'usr-017', timestamp: '2026-03-26T15:22:00Z', errorMessage: null },
  { id: 'exp-011', kind: 'cxo_circle_sync',        startupId: null,      payloadBytes: 2298, httpStatus: 500, idempotencyKey: 'idem-c4a3-4e21', triggeredByUserId: 'usr-019', timestamp: '2026-03-25T18:00:00Z', errorMessage: 'upstream timeout after 30s' },
  { id: 'exp-010', kind: 'cxo_circle_sync',        startupId: null,      payloadBytes: 2298, httpStatus: 202, idempotencyKey: 'idem-c4a3-4e21', triggeredByUserId: 'usr-019', timestamp: '2026-03-25T18:00:42Z', errorMessage: null },
  { id: 'exp-009', kind: 'target_accounts_upsert', startupId: 'sup-005', payloadBytes: 5088, httpStatus: 202, idempotencyKey: 'idem-d771-4a66', triggeredByUserId: 'usr-017', timestamp: '2026-03-22T10:45:00Z', errorMessage: null },
  { id: 'exp-008', kind: 'target_accounts_upsert', startupId: 'sup-002', payloadBytes: 4944, httpStatus: 202, idempotencyKey: 'idem-e033-4b12', triggeredByUserId: 'usr-017', timestamp: '2026-03-20T11:30:00Z', errorMessage: null },
  { id: 'exp-007', kind: 'startup_registered',     startupId: 'sup-003', payloadBytes: 892,  httpStatus: 202, idempotencyKey: 'idem-f492-4d99', triggeredByUserId: 'usr-017', timestamp: '2026-03-05T08:45:00Z', errorMessage: null },
  { id: 'exp-006', kind: 'target_accounts_upsert', startupId: 'sup-003', payloadBytes: 4510, httpStatus: 202, idempotencyKey: 'idem-2c88-4a77', triggeredByUserId: 'usr-017', timestamp: '2026-03-05T08:46:11Z', errorMessage: null },
  { id: 'exp-005', kind: 'startup_registered',     startupId: 'sup-005', payloadBytes: 910,  httpStatus: 202, idempotencyKey: 'idem-6e11-4f88', triggeredByUserId: 'usr-017', timestamp: '2026-02-22T13:00:00Z', errorMessage: null },
  { id: 'exp-004', kind: 'startup_registered',     startupId: 'sup-002', payloadBytes: 905,  httpStatus: 202, idempotencyKey: 'idem-8a9b-4ce3', triggeredByUserId: 'usr-017', timestamp: '2026-02-18T10:00:00Z', errorMessage: null },
  { id: 'exp-003', kind: 'startup_registered',     startupId: 'sup-001', payloadBytes: 930,  httpStatus: 202, idempotencyKey: 'idem-5d4e-4a01', triggeredByUserId: 'usr-017', timestamp: '2026-02-10T14:00:00Z', errorMessage: null },
  { id: 'exp-002', kind: 'cxo_circle_sync',        startupId: null,      payloadBytes: 2220, httpStatus: 202, idempotencyKey: 'idem-7f20-4c44', triggeredByUserId: 'usr-017', timestamp: '2026-02-10T14:01:30Z', errorMessage: null },
  { id: 'exp-001', kind: 'target_accounts_upsert', startupId: 'sup-001', payloadBytes: 4780, httpStatus: 202, idempotencyKey: 'idem-1234-4abc', triggeredByUserId: 'usr-017', timestamp: '2026-02-10T14:05:00Z', errorMessage: null },
];

// ─── Webhook receipts ────────────────────────────────────────────────────

export const boomerangWebhookReceipts: BoomerangWebhookReceipt[] = [
  { id: 'whk-010', receivedAt: '2026-04-02T09:10:00Z', eventType: 'signal.scored', payloadSummary: 'PayBridge ↔ Santander Corporate: score 72 (active)', processed: true,  error: null },
  { id: 'whk-009', receivedAt: '2026-04-02T09:09:12Z', eventType: 'signal.scored', payloadSummary: 'NexarAI ↔ Siemens: score 88 (hot)',                   processed: true,  error: null },
  { id: 'whk-008', receivedAt: '2026-04-02T08:55:03Z', eventType: 'intro.updated', payloadSummary: 'intro-015 → meeting_scheduled (NexarAI ↔ Denso)',     processed: true,  error: null },
  { id: 'whk-007', receivedAt: '2026-04-01T22:14:07Z', eventType: 'deal.updated',  payloadSummary: 'deal-004 PayBridge ↔ HSBC: probability 0.55 → 0.60',  processed: true,  error: null },
  { id: 'whk-006', receivedAt: '2026-04-01T16:02:45Z', eventType: 'signal.scored', payloadSummary: 'CypherShield ↔ Deutsche Bank: score 81 (hot)',         processed: true,  error: null },
  { id: 'whk-005', receivedAt: '2026-04-01T14:30:21Z', eventType: 'intro.updated', payloadSummary: 'intro-011 → accepted (NexarAI ↔ Magna)',               processed: true,  error: null },
  { id: 'whk-004', receivedAt: '2026-04-01T11:18:00Z', eventType: 'signal.scored', payloadSummary: 'VitaleDx ↔ NHS Digital: score 48 (warming)',           processed: false, error: 'Unknown target_contact_id: trying to match by linkedin_url' },
  { id: 'whk-003', receivedAt: '2026-03-31T20:00:09Z', eventType: 'candidate.ack', payloadSummary: 'sup-003 → boomerang_startup_id bmr-startup-003',       processed: true,  error: null },
  { id: 'whk-002', receivedAt: '2026-03-31T19:58:14Z', eventType: 'candidate.ack', payloadSummary: 'sup-005 → boomerang_startup_id bmr-startup-005',       processed: true,  error: null },
  { id: 'whk-001', receivedAt: '2026-03-31T19:58:03Z', eventType: 'candidate.ack', payloadSummary: 'sup-002 → boomerang_startup_id bmr-startup-002',       processed: true,  error: null },
];

// ─── Sync state ──────────────────────────────────────────────────────────

export const boomerangSyncState: BoomerangSyncState = {
  environment: 'mock',
  baseUrlMasked: 'https://api.boomerang.***.io',
  authMode: 'hmac',
  webhookSecretConfigured: true,
  lastHandshakeAt: '2026-04-02T09:10:00Z',
  lastSyncAt: '2026-04-02T09:10:00Z',
  consecutiveFailures: 0,
  featureFlags: {
    exportEnabled: true,
    inboundWebhooksEnabled: true,
    paidIntrosEnabled: true,
  },
};

// ─── Activity log ────────────────────────────────────────────────────────

export const boomerangActivityLog: BoomerangActivityEvent[] = [
  { id: 'act-012', at: '2026-04-02T09:10:00Z', actor: 'Boomerang',        verb: 'scored',     subject: 'PayBridge ↔ Santander',   context: 'signal 72 (active)',                  icon: 'radar' },
  { id: 'act-011', at: '2026-04-02T09:09:12Z', actor: 'Boomerang',        verb: 'scored',     subject: 'NexarAI ↔ Siemens',       context: 'signal 88 (hot)',                     icon: 'radar' },
  { id: 'act-010', at: '2026-04-02T08:55:03Z', actor: 'Richard Huang',    verb: 'scheduled',  subject: 'meeting with Denso',      context: 'for NexarAI on April 8',              icon: 'handshake' },
  { id: 'act-009', at: '2026-04-01T22:14:07Z', actor: 'Boomerang',        verb: 'updated',    subject: 'HSBC pilot deal',         context: 'probability 0.55 → 0.60 ($180K)',    icon: 'dollar' },
  { id: 'act-008', at: '2026-04-01T14:30:21Z', actor: 'Robert Schmitt',   verb: 'accepted',   subject: 'intro to NexarAI',        context: 'wants 30-min intro call',             icon: 'handshake' },
  { id: 'act-007', at: '2026-04-01T10:30:00Z', actor: 'Sarah Mitchell',   verb: 'queued',     subject: 'intro for PayBridge',     context: 'target: JPMorgan Payments',           icon: 'send' },
  { id: 'act-006', at: '2026-03-31T10:02:14Z', actor: 'Sarah Mitchell',   verb: 'synced',     subject: 'NexarAI target accounts', context: '20 accounts upserted',                icon: 'send' },
  { id: 'act-005', at: '2026-03-30T16:45:00Z', actor: 'Sarah Mitchell',   verb: 'synced',     subject: 'CxO circle',              context: '4 CxOs, 4 assignments',               icon: 'send' },
  { id: 'act-004', at: '2026-03-27T13:30:00Z', actor: 'Sarah Mitchell',   verb: 'unlocked',   subject: '3 paid intros',           context: 'for NexarAI — $4,500 (mock)',         icon: 'dollar' },
  { id: 'act-003', at: '2026-03-22T10:00:00Z', actor: 'Catherine Dubois', verb: 'made',       subject: 'intro to UOB',            context: 'for CypherShield',                    icon: 'handshake' },
  { id: 'act-002', at: '2026-02-22T10:00:00Z', actor: 'Boomerang',        verb: 'closed won', subject: 'CypherShield ↔ DBS',      context: '$95K ARR — first enterprise win',     icon: 'shield' },
  { id: 'act-001', at: '2026-02-10T14:00:00Z', actor: 'Sarah Mitchell',   verb: 'exported',   subject: 'NexarAI',                 context: 'first startup exported to Boomerang', icon: 'send' },
];

// ─── Derivation helpers ──────────────────────────────────────────────────

export function getBoomerangCandidateForStartup(startupId: string): BoomerangCandidate | undefined {
  return boomerangCandidates.find((c) => c.startupId === startupId);
}

export function getTargetAccountsForStartup(startupId: string): BoomerangTargetAccount[] {
  return boomerangTargetAccounts.filter((t) => t.startupId === startupId);
}

export function getIntroductionsForStartup(startupId: string): BoomerangIntroduction[] {
  return boomerangIntroductions.filter((i) => i.startupId === startupId);
}

export function getCxoReferrer(cxoUserId: string): MockUser | undefined {
  return mockUsers.find((u) => u.id === cxoUserId);
}

// ─── Dev-only referential integrity guard ───────────────────────────────
// Runs in dev builds only. Surfaces FK drift the instant a demo user id is
// renamed or a startup id changes.

if (process.env.NODE_ENV === 'development') {
  const startupIds = new Set(mockStartups.map((s) => s.id));
  const userIds = new Set(mockUsers.map((u) => u.id));
  const targetIds = new Set(boomerangTargetAccounts.map((t) => t.id));

  boomerangCandidates.forEach((c) => {
    console.assert(
      startupIds.has(c.startupId),
      `[boomerang.ts] candidate.startupId ${c.startupId} not found in mockStartups`,
    );
    c.targetAccountIds.forEach((tid) => {
      console.assert(
        targetIds.has(tid),
        `[boomerang.ts] candidate ${c.startupId} references missing target ${tid}`,
      );
    });
  });

  boomerangTargetAccounts.forEach((t) => {
    console.assert(
      startupIds.has(t.startupId),
      `[boomerang.ts] target ${t.id} references missing startup ${t.startupId}`,
    );
    if (t.shortestPathCxoId) {
      console.assert(
        userIds.has(t.shortestPathCxoId),
        `[boomerang.ts] target ${t.id} references missing CxO ${t.shortestPathCxoId}`,
      );
    }
  });

  boomerangIntroductions.forEach((i) => {
    console.assert(
      startupIds.has(i.startupId),
      `[boomerang.ts] intro ${i.id} references missing startup ${i.startupId}`,
    );
    console.assert(
      targetIds.has(i.targetAccountId),
      `[boomerang.ts] intro ${i.id} references missing target ${i.targetAccountId}`,
    );
    console.assert(
      userIds.has(i.referrerCxoId),
      `[boomerang.ts] intro ${i.id} references missing CxO ${i.referrerCxoId}`,
    );
  });

  boomerangDeals.forEach((d) => {
    console.assert(
      boomerangIntroductions.some((i) => i.id === d.introductionId),
      `[boomerang.ts] deal ${d.id} references missing intro ${d.introductionId}`,
    );
  });

  boomerangCxoContributions.forEach((c) => {
    console.assert(
      userIds.has(c.cxoUserId),
      `[boomerang.ts] cxoContribution references missing user ${c.cxoUserId}`,
    );
  });
}
