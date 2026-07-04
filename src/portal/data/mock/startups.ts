import type { MockStartupProfile, MockUserStartupLink } from './types';

export const mockStartups: MockStartupProfile[] = [
  {
    id: 'sup-001',
    companyName: 'NexarAI',
    companyWebsite: 'https://nexarai.com',
    companyDomain: 'nexarai.com',
    description:
      'Enterprise-grade computer vision pipelines for manufacturing quality control. Our platform processes millions of images per day with sub-millisecond latency, enabling real-time defect detection across production lines.',
    registeredBy: 'usr-001',
    isVerified: true,
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2025-09-01T14:00:00Z',
  },
  {
    id: 'sup-002',
    companyName: 'PayBridge',
    companyWebsite: 'https://paybridge.io',
    companyDomain: 'paybridge.io',
    description:
      'Cross-border B2B payment infrastructure for emerging markets. PayBridge reduces settlement time from days to seconds while cutting transaction costs by 80% through blockchain-backed rails.',
    registeredBy: 'usr-003',
    isVerified: true,
    createdAt: '2025-07-01T08:30:00Z',
    updatedAt: '2025-10-15T09:00:00Z',
  },
  {
    id: 'sup-003',
    companyName: 'VitaleDx',
    companyWebsite: 'https://vitaledx.com',
    companyDomain: 'vitaledx.com',
    description:
      'AI-powered point-of-care diagnostic devices that deliver lab-quality results in under 15 minutes. Currently deployed across 200+ clinics in Sub-Saharan Africa and Southeast Asia.',
    registeredBy: 'usr-005',
    isVerified: true,
    createdAt: '2025-07-10T14:00:00Z',
    updatedAt: '2025-11-20T11:00:00Z',
  },
  {
    id: 'sup-004',
    companyName: 'GridLeap',
    companyWebsite: 'https://gridleap.energy',
    companyDomain: 'gridleap.energy',
    description:
      'The operating system for distributed energy resources. GridLeap orchestrates solar, battery, and EV charging assets into virtual power plants, optimizing grid economics in real time.',
    registeredBy: 'usr-006',
    isVerified: false,
    createdAt: '2025-08-05T09:00:00Z',
    updatedAt: '2025-08-05T09:00:00Z',
  },
  {
    id: 'sup-005',
    companyName: 'CypherShield',
    companyWebsite: 'https://cyphershield.io',
    companyDomain: 'cyphershield.io',
    description:
      'Zero-trust security platform for hybrid cloud environments. CypherShield provides continuous identity verification, micro-segmentation, and encrypted service mesh for enterprise workloads.',
    registeredBy: 'usr-007',
    isVerified: true,
    createdAt: '2025-08-20T11:00:00Z',
    updatedAt: '2025-12-01T16:00:00Z',
  },
];

export const mockUserStartupLinks: MockUserStartupLink[] = [
  { id: 'lnk-001', userId: 'usr-001', startupId: 'sup-001', role: 'founder', linkedAt: '2025-06-15T10:00:00Z' },
  { id: 'lnk-002', userId: 'usr-002', startupId: 'sup-001', role: 'member', linkedAt: '2025-06-15T10:05:00Z' },
  { id: 'lnk-003', userId: 'usr-003', startupId: 'sup-002', role: 'founder', linkedAt: '2025-07-01T08:30:00Z' },
  { id: 'lnk-004', userId: 'usr-004', startupId: 'sup-002', role: 'member', linkedAt: '2025-07-01T08:35:00Z' },
  { id: 'lnk-005', userId: 'usr-005', startupId: 'sup-003', role: 'founder', linkedAt: '2025-07-10T14:00:00Z' },
  { id: 'lnk-006', userId: 'usr-006', startupId: 'sup-004', role: 'founder', linkedAt: '2025-08-05T09:00:00Z' },
  { id: 'lnk-007', userId: 'usr-007', startupId: 'sup-005', role: 'founder', linkedAt: '2025-08-20T11:00:00Z' },
  { id: 'lnk-008', userId: 'usr-008', startupId: 'sup-005', role: 'member', linkedAt: '2025-08-20T11:05:00Z' },
];
