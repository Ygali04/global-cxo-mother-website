export const CALENDAR_ONBOARDING_STORAGE_KEY = "gcio_calendar_onboarding_config";

export interface ProviderConfig {
  id: string;
  name: string;
  enabled: boolean;
  tiers: string[];
  helperText: string;
}

export interface AvailabilityDefaults {
  days: Record<string, boolean>;
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface MeetingTypeConfig {
  id: string;
  label: string;
  enabled: boolean;
  tiers: string[];
  provider?: string;
}

export interface StepCopy {
  title: string;
  subtitle: string;
}

export interface CalendarOnboardingConfig {
  step1: { providers: ProviderConfig[]; copy: StepCopy };
  step2: { availability: AvailabilityDefaults; copy: StepCopy };
  step3: {
    meetingTypes: MeetingTypeConfig[];
    defaultDuration: number;
    bufferBefore: number;
    bufferAfter: number;
    copy: StepCopy;
  };
}

export function loadCalendarOnboardingConfig(): CalendarOnboardingConfig | undefined {
  try {
    const raw = localStorage.getItem(CALENDAR_ONBOARDING_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CalendarOnboardingConfig;
  } catch { /* ignore */ }
  return undefined;
}
