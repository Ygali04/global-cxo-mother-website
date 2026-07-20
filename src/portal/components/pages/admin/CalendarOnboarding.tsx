import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/portal/components/ui/card";
import { ApiError } from "@/portal/api/errors";
import {
  useCalcomAvailability,
  useCalcomMeetingPreferences,
  useCalcomOnboarding,
} from "@/portal/hooks/useCalcomOnboarding";
import type {
  CalcomAvailability,
  CalcomAvailabilitySlot,
  CalcomMeetingPreference,
} from "@/portal/api/types";
import CalendarOnboardingStep1 from "./CalendarOnboardingStep1";
import CalendarOnboardingStep2 from "./CalendarOnboardingStep2";
import CalendarOnboardingStep3 from "./CalendarOnboardingStep3";
import type { AvailabilitySlots } from "./CalendarOnboardingStep2";
import type { MeetingPreferences } from "./CalendarOnboardingStep3";
import type { CalendarOnboardingConfig } from "./calendarOnboardingTypes";

const STEPS = [
  { number: 1, label: "Connect calendar" },
  { number: 2, label: "Availability" },
  { number: 3, label: "Meeting type" },
] as const;

const AVAILABILITY_TOAST_ID = "calcom-availability";
const MEETING_PREFS_TOAST_ID = "calcom-meeting-prefs";

const DAY_KEY_MAP = {
  Monday: "monday",
  Tuesday: "tuesday",
  Wednesday: "wednesday",
  Thursday: "thursday",
  Friday: "friday",
  Saturday: "saturday",
  Sunday: "sunday",
} as const;

const VIDEO_PROVIDER_MAP: Record<string, string> = {
  "google-meet": "google_meet",
  zoom: "zoom",
  "ms-teams": "teams",
};

function availabilityToApi(
  slots: AvailabilitySlots,
  timezone: string
): CalcomAvailability {
  const apiSlots: CalcomAvailabilitySlot[] = (
    Object.keys(DAY_KEY_MAP) as (keyof typeof DAY_KEY_MAP)[]
  ).map((day) => ({
    day: DAY_KEY_MAP[day],
    enabled: slots[day].enabled,
    start_time: slots[day].start,
    end_time: slots[day].end,
  }));
  return { schedule_id: null, slots: apiSlots, timezone };
}

function meetingPrefsToApi(
  prefs: MeetingPreferences
): CalcomMeetingPreference[] {
  return [
    {
      type: "video",
      enabled: prefs.videoChat.enabled,
      provider:
        VIDEO_PROVIDER_MAP[prefs.videoChat.provider] ??
        prefs.videoChat.provider,
      details: null,
    },
    {
      type: "phone",
      enabled: prefs.phoneCall.enabled,
      provider: null,
      details: prefs.phoneCall.phoneNumber || null,
    },
    {
      type: "in_person",
      enabled: prefs.inPerson.enabled,
      provider: null,
      details: prefs.inPerson.location || null,
    },
  ];
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

interface CalendarOnboardingProps {
  simulationMode?: boolean;
  onSimulationExit?: () => void;
  config?: CalendarOnboardingConfig;
  tier?: string;
}

export default function CalendarOnboarding({
  simulationMode = false,
  onSimulationExit,
  config,
  tier,
}: CalendarOnboardingProps = {}) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const { startOnboarding } = useCalcomOnboarding();
  const { updateAvailability } = useCalcomAvailability();
  const { updatePreferences } = useCalcomMeetingPreferences();

  const goNext = useCallback(
    () => setCurrentStep((s) => Math.min(s + 1, 3)),
    []
  );
  const goBack = useCallback(
    () => setCurrentStep((s) => Math.max(s - 1, 1)),
    []
  );

  const saveWithOnboardingFallback = useCallback(
    async <T,>(options: {
      toastId: string;
      loadingMessage: string;
      successMessage: string;
      errorFallback: string;
      run: () => Promise<T>;
    }): Promise<boolean> => {
      const { toastId, loadingMessage, successMessage, errorFallback, run } =
        options;
      toast.loading(loadingMessage, { id: toastId });
      try {
        await run();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          try {
            await startOnboarding.mutateAsync();
            await run();
          } catch (retryError) {
            toast.error(extractErrorMessage(retryError, errorFallback), {
              id: toastId,
            });
            return false;
          }
        } else {
          toast.error(extractErrorMessage(error, errorFallback), {
            id: toastId,
          });
          return false;
        }
      }
      toast.success(successMessage, { id: toastId });
      return true;
    },
    [startOnboarding]
  );

  const handleSaveAvailability = useCallback(
    (slots: AvailabilitySlots, timezone: string): Promise<boolean> => {
      if (simulationMode) return Promise.resolve(true);
      const payload = availabilityToApi(slots, timezone);
      return saveWithOnboardingFallback({
        toastId: AVAILABILITY_TOAST_ID,
        loadingMessage: "Saving availability…",
        successMessage: "Availability saved",
        errorFallback: "Failed to save availability",
        run: () => updateAvailability.mutateAsync(payload),
      });
    },
    [simulationMode, updateAvailability, saveWithOnboardingFallback]
  );

  const handleSaveMeetingPrefs = useCallback(
    (preferences: MeetingPreferences): Promise<boolean> => {
      if (simulationMode) return Promise.resolve(true);
      const payload = meetingPrefsToApi(preferences);
      return saveWithOnboardingFallback({
        toastId: MEETING_PREFS_TOAST_ID,
        loadingMessage: "Saving meeting preferences…",
        successMessage: "Calendar configured",
        errorFallback: "Failed to save meeting preferences",
        run: () => updatePreferences.mutateAsync(payload),
      });
    },
    [simulationMode, updatePreferences, saveWithOnboardingFallback]
  );

  const handleComplete = useCallback(() => {
    if (simulationMode && onSimulationExit) {
      onSimulationExit();
    } else {
      navigate("/admin/calendar");
    }
  }, [navigate, simulationMode, onSimulationExit]);

  const isSavingAvailability =
    updateAvailability.isPending || startOnboarding.isPending;
  const isSavingPrefs =
    updatePreferences.isPending || startOnboarding.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Calendar Setup</h1>
        </div>

        {/* Step indicator */}
        <nav className="flex items-center justify-center gap-2">
          {STEPS.map((step, idx) => {
            const isActive = step.number === currentStep;
            const isComplete = step.number < currentStep;
            return (
              <div key={step.number} className="flex items-center gap-2">
                {idx > 0 && (
                  <div
                    className={`h-px w-8 ${
                      isComplete ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <div className="flex items-center gap-1.5">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      isComplete || isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : step.number}
                  </div>
                  <span
                    className={`hidden text-xs sm:inline ${
                      isActive
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Step content */}
        <Card>
          <CardContent className="p-6 sm:p-8">
            {currentStep === 1 && (
              <CalendarOnboardingStep1
                onNext={goNext}
                simulationMode={simulationMode}
                tier={tier}
                configProviders={config?.step1.providers}
                configCopy={config?.step1.copy}
              />
            )}
            {currentStep === 2 && (
              <CalendarOnboardingStep2
                onNext={goNext}
                onBack={goBack}
                onSave={handleSaveAvailability}
                simulationMode={simulationMode}
                configAvailability={config?.step2.availability}
                configCopy={config?.step2.copy}
                isSaving={isSavingAvailability}
              />
            )}
            {currentStep === 3 && (
              <CalendarOnboardingStep3
                onComplete={handleComplete}
                onBack={goBack}
                onSave={handleSaveMeetingPrefs}
                simulationMode={simulationMode}
                tier={tier}
                configMeetingTypes={config?.step3.meetingTypes}
                configCopy={config?.step3.copy}
                isSaving={isSavingPrefs}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
