export interface OnboardField {
  id: string;
  label: string;
  type: "text" | "select" | "textarea";
  required: boolean;
  tiers: ("cxo" | "startup" | "vc")[];
  placeholder?: string;
  options?: string[];
  isCore?: boolean;
}

export const ONBOARDING_STORAGE_KEY = "gcio_onboarding_schema";

export function loadOnboardingSchema(): OnboardField[] | undefined {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as OnboardField[];
  } catch {
    // ignore parse errors
  }
  return undefined;
}
