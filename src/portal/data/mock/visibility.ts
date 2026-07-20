import type { VisibilitySetting } from './types';

export const visibilityPresets: Record<string, VisibilitySetting> = {
  'everything-private': {
    startupCanSee: [],
    cxoCanSee: [],
    vcCanSee: [],
  },
  'full-open': {
    startupCanSee: ['startup', 'cxo', 'vc'],
    cxoCanSee: ['startup', 'cxo', 'vc'],
    vcCanSee: ['startup', 'cxo', 'vc'],
  },
  'cxo-premium': {
    startupCanSee: ['startup'],
    cxoCanSee: ['startup', 'cxo', 'vc'],
    vcCanSee: ['startup', 'vc'],
  },
  'vc-focused': {
    startupCanSee: ['vc'],
    cxoCanSee: ['vc', 'cxo'],
    vcCanSee: ['startup', 'cxo', 'vc'],
  },
  'startup-showcase': {
    startupCanSee: ['startup', 'cxo', 'vc'],
    cxoCanSee: ['startup'],
    vcCanSee: ['startup'],
  },
  'networking-lite': {
    startupCanSee: ['startup'],
    cxoCanSee: ['cxo'],
    vcCanSee: ['vc'],
  },
};

export const mockEventVisibility: Record<string, VisibilitySetting> = {
  'sri-lanka-2025': visibilityPresets['full-open'],
  'sf-conference-2025': visibilityPresets['cxo-premium'],
  'dubai-summit-2026': visibilityPresets['full-open'],
};
