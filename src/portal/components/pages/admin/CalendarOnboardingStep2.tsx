import { useState, useCallback } from "react";
import { Copy, Globe } from "lucide-react";
import { Button } from "@/portal/components/ui/button";
import { Card, CardContent } from "@/portal/components/ui/card";
import { Switch } from "@/portal/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/portal/components/ui/select";
import type { AvailabilityDefaults, StepCopy } from "./calendarOnboardingTypes";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type DayName = (typeof DAYS)[number];

interface TimeSlot {
  enabled: boolean;
  start: string;
  end: string;
}

type AvailabilitySlots = Record<DayName, TimeSlot>;

const DEFAULT_SLOTS: AvailabilitySlots = {
  Monday: { enabled: true, start: "09:00", end: "17:00" },
  Tuesday: { enabled: true, start: "09:00", end: "17:00" },
  Wednesday: { enabled: true, start: "09:00", end: "17:00" },
  Thursday: { enabled: true, start: "09:00", end: "17:00" },
  Friday: { enabled: true, start: "09:00", end: "17:00" },
  Saturday: { enabled: false, start: "09:00", end: "17:00" },
  Sunday: { enabled: false, start: "09:00", end: "17:00" },
};

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
] as const;

function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      options.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

function formatTime(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

interface CalendarOnboardingStep2Props {
  onNext: () => void;
  onBack: () => void;
  onSave: (slots: AvailabilitySlots, timezone: string) => void | Promise<boolean>;
  simulationMode?: boolean;
  configAvailability?: AvailabilityDefaults;
  configCopy?: StepCopy;
  isSaving?: boolean;
}

function buildSlotsFromConfig(config: AvailabilityDefaults): AvailabilitySlots {
  const slots = { ...DEFAULT_SLOTS };
  for (const day of DAYS) {
    const enabled = config.days[day] ?? false;
    slots[day] = { enabled, start: config.startTime, end: config.endTime };
  }
  return slots;
}

export default function CalendarOnboardingStep2({
  onNext,
  onBack,
  onSave,
  simulationMode: _simulationMode,
  configAvailability,
  configCopy,
  isSaving = false,
}: CalendarOnboardingStep2Props) {
  const [slots, setSlots] = useState<AvailabilitySlots>(() =>
    configAvailability ? buildSlotsFromConfig(configAvailability) : DEFAULT_SLOTS
  );
  const [timezone, setTimezone] = useState<string>(
    () => configAvailability?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const updateDay = useCallback(
    (day: DayName, updates: Partial<TimeSlot>) => {
      setSlots((prev) => ({
        ...prev,
        [day]: { ...prev[day], ...updates },
      }));
    },
    []
  );

  const copyToAllWeekdays = useCallback(() => {
    setSlots((prev) => {
      const monday = prev.Monday;
      const next = { ...prev };
      for (const day of DAYS.slice(0, 5)) {
        next[day] = { ...monday };
      }
      return next;
    });
  }, []);

  const handleContinue = async () => {
    const result = onSave(slots, timezone);
    if (result instanceof Promise) {
      const ok = await result;
      if (!ok) return;
    }
    onNext();
  };

  const title = configCopy?.title ?? "Set your availability";
  const subtitle = configCopy?.subtitle ?? "Define when you are available for meetings. Block weekends and set buffers between appointments.";

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{subtitle}</p>
      </div>

      {/* Timezone selector */}
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Day-by-day grid */}
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-4 space-y-3">
          {DAYS.map((day) => {
            const slot = slots[day];
            return (
              <div
                key={day}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <Switch
                  checked={slot.enabled}
                  onCheckedChange={(checked) =>
                    updateDay(day, { enabled: !!checked })
                  }
                />
                <span
                  className={`w-24 text-sm font-medium ${
                    slot.enabled ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {day}
                </span>
                {slot.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Select
                      value={slot.start}
                      onValueChange={(v) => updateDay(day, { start: v })}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs">
                            {formatTime(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">to</span>
                    <Select
                      value={slot.end}
                      onValueChange={(v) => updateDay(day, { end: v })}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs">
                            {formatTime(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic flex-1">
                    Unavailable
                  </span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Copy to all weekdays */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToAllWeekdays}
          className="text-xs"
        >
          <Copy className="h-3 w-3 mr-1" />
          Copy Monday hours to all weekdays
        </Button>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={isSaving}>
          {isSaving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

export type { AvailabilitySlots, TimeSlot };
