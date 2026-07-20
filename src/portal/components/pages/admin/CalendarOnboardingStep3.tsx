import { useState } from "react";
import { Video, Phone, MapPin } from "lucide-react";
import { Button } from "@/portal/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/portal/components/ui/card";
import { Switch } from "@/portal/components/ui/switch";
import { Input } from "@/portal/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/portal/components/ui/select";
import type { MeetingTypeConfig, StepCopy } from "./calendarOnboardingTypes";

interface MeetingPreferences {
  videoChat: {
    enabled: boolean;
    provider: string;
  };
  phoneCall: {
    enabled: boolean;
    phoneNumber: string;
  };
  inPerson: {
    enabled: boolean;
    location: string;
  };
}

const DEFAULT_PREFERENCES: MeetingPreferences = {
  videoChat: { enabled: true, provider: "google-meet" },
  phoneCall: { enabled: false, phoneNumber: "" },
  inPerson: { enabled: false, location: "" },
};

const VIDEO_PROVIDERS = [
  { value: "google-meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "ms-teams", label: "Microsoft Teams" },
] as const;

interface CalendarOnboardingStep3Props {
  onComplete: () => void;
  onBack: () => void;
  onSave: (preferences: MeetingPreferences) => void | Promise<boolean>;
  simulationMode?: boolean;
  tier?: string;
  configMeetingTypes?: MeetingTypeConfig[];
  configCopy?: StepCopy;
  isSaving?: boolean;
}

function buildPrefsFromConfig(
  meetingTypes: MeetingTypeConfig[],
  tier: string | undefined
): MeetingPreferences {
  const visible = meetingTypes.filter(
    (m) => tier ? m.tiers.includes(tier) : true
  );
  const video = visible.find((m) => m.id === "video");
  const phone = visible.find((m) => m.id === "phone");
  const inPerson = visible.find((m) => m.id === "inPerson");
  return {
    videoChat: { enabled: video?.enabled ?? false, provider: video?.provider ?? "google-meet" },
    phoneCall: { enabled: phone?.enabled ?? false, phoneNumber: "" },
    inPerson: { enabled: inPerson?.enabled ?? false, location: "" },
  };
}

export default function CalendarOnboardingStep3({
  onComplete,
  onBack,
  onSave,
  simulationMode: _simulationMode,
  tier,
  configMeetingTypes,
  configCopy,
  isSaving = false,
}: CalendarOnboardingStep3Props) {
  const [prefs, setPrefs] = useState<MeetingPreferences>(() =>
    configMeetingTypes
      ? buildPrefsFromConfig(configMeetingTypes, tier)
      : DEFAULT_PREFERENCES
  );

  const hasAtLeastOne =
    prefs.videoChat.enabled || prefs.phoneCall.enabled || prefs.inPerson.enabled;

  const handleFinish = async () => {
    const result = onSave(prefs);
    if (result instanceof Promise) {
      const ok = await result;
      if (!ok) return;
    }
    onComplete();
  };

  const title = configCopy?.title ?? "Choose how to meet";
  const subtitle = configCopy?.subtitle ?? "Select one or more ways you would like to meet with attendees.";

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{subtitle}</p>
      </div>

      <div className="grid gap-4 max-w-lg mx-auto">
        {/* Video Chat */}
        <Card
          className={`transition-all ${
            prefs.videoChat.enabled
              ? "ring-2 ring-primary border-primary"
              : "opacity-80"
          }`}
        >
          <CardHeader className="flex flex-row items-start gap-4 p-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Video className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-base font-semibold">
                Video chat
              </CardTitle>
              <CardDescription className="text-xs">
                Meet face-to-face over video call
              </CardDescription>
            </div>
            <Switch
              checked={prefs.videoChat.enabled}
              onCheckedChange={(checked) =>
                setPrefs((p) => ({
                  ...p,
                  videoChat: { ...p.videoChat, enabled: !!checked },
                }))
              }
            />
          </CardHeader>
          {prefs.videoChat.enabled && (
            <CardContent className="px-4 pb-4 pt-0 pl-[72px]">
              <Select
                value={prefs.videoChat.provider}
                onValueChange={(v) =>
                  setPrefs((p) => ({
                    ...p,
                    videoChat: { ...p.videoChat, provider: v },
                  }))
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_PROVIDERS.map((vp) => (
                    <SelectItem key={vp.value} value={vp.value}>
                      {vp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          )}
        </Card>

        {/* Phone Call */}
        <Card
          className={`transition-all ${
            prefs.phoneCall.enabled
              ? "ring-2 ring-primary border-primary"
              : "opacity-80"
          }`}
        >
          <CardHeader className="flex flex-row items-start gap-4 p-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <Phone className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-base font-semibold">
                Phone call
              </CardTitle>
              <CardDescription className="text-xs">
                Connect over a traditional phone call
              </CardDescription>
            </div>
            <Switch
              checked={prefs.phoneCall.enabled}
              onCheckedChange={(checked) =>
                setPrefs((p) => ({
                  ...p,
                  phoneCall: { ...p.phoneCall, enabled: !!checked },
                }))
              }
            />
          </CardHeader>
          {prefs.phoneCall.enabled && (
            <CardContent className="px-4 pb-4 pt-0 pl-[72px]">
              <Input
                type="tel"
                placeholder="Enter phone number"
                value={prefs.phoneCall.phoneNumber}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    phoneCall: { ...p.phoneCall, phoneNumber: e.target.value },
                  }))
                }
                className="h-8 text-sm"
              />
            </CardContent>
          )}
        </Card>

        {/* In Person */}
        <Card
          className={`transition-all ${
            prefs.inPerson.enabled
              ? "ring-2 ring-primary border-primary"
              : "opacity-80"
          }`}
        >
          <CardHeader className="flex flex-row items-start gap-4 p-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-base font-semibold">
                In person
              </CardTitle>
              <CardDescription className="text-xs">
                Meet at a physical location
              </CardDescription>
            </div>
            <Switch
              checked={prefs.inPerson.enabled}
              onCheckedChange={(checked) =>
                setPrefs((p) => ({
                  ...p,
                  inPerson: { ...p.inPerson, enabled: !!checked },
                }))
              }
            />
          </CardHeader>
          {prefs.inPerson.enabled && (
            <CardContent className="px-4 pb-4 pt-0 pl-[72px]">
              <Input
                type="text"
                placeholder="Default meeting location"
                value={prefs.inPerson.location}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    inPerson: { ...p.inPerson, location: e.target.value },
                  }))
                }
                className="h-8 text-sm"
              />
            </CardContent>
          )}
        </Card>
      </div>

      {!hasAtLeastOne && (
        <p className="text-xs text-destructive text-center">
          Please enable at least one meeting option to continue.
        </p>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button onClick={handleFinish} disabled={!hasAtLeastOne || isSaving}>
          {isSaving ? "Saving…" : "Finish setup"}
        </Button>
      </div>
    </div>
  );
}

export type { MeetingPreferences };
