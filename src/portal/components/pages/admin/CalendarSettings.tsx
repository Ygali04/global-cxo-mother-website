import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  Monitor,
  Phone,
  MapPin,
  Plus,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/portal/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/portal/components/ui/card";
import { Badge } from "@/portal/components/ui/badge";
import { Button } from "@/portal/components/ui/button";
import { Switch } from "@/portal/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/portal/components/ui/select";
import { CALCOM_ADMIN_URL as CALCOM_URL } from "@/portal/api/config";

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

// Mock data -- will be replaced with real API hooks
const MOCK_ONBOARDING_COMPLETE = true;

const MOCK_CALENDARS = [
  {
    id: "1",
    provider: "Google Calendar",
    email: "user@gmail.com",
    connected: true,
  },
  {
    id: "2",
    provider: "Outlook / Office 365",
    email: "user@company.com",
    connected: true,
  },
];

type DaySchedule = {
  enabled: boolean;
  start: string;
  end: string;
};

const DEFAULT_AVAILABILITY: Record<string, DaySchedule> = {
  Monday: { enabled: true, start: "09:00", end: "17:00" },
  Tuesday: { enabled: true, start: "09:00", end: "17:00" },
  Wednesday: { enabled: true, start: "09:00", end: "17:00" },
  Thursday: { enabled: true, start: "09:00", end: "17:00" },
  Friday: { enabled: true, start: "09:00", end: "17:00" },
  Saturday: { enabled: false, start: "09:00", end: "17:00" },
  Sunday: { enabled: false, start: "09:00", end: "17:00" },
};

type MeetingPreferences = {
  video: boolean;
  phone: boolean;
  inPerson: boolean;
  defaultDuration: number;
  bufferBefore: number;
  bufferAfter: number;
};

const DEFAULT_MEETING_PREFS: MeetingPreferences = {
  video: true,
  phone: true,
  inPerson: false,
  defaultDuration: 30,
  bufferBefore: 5,
  bufferAfter: 5,
};

const MEETING_TYPES = [
  { key: "video" as const, label: "Video Call", icon: Monitor },
  { key: "phone" as const, label: "Phone Call", icon: Phone },
  { key: "inPerson" as const, label: "In Person", icon: MapPin },
];

const DURATION_OPTIONS = [15, 30, 45, 60, 90];
const BUFFER_OPTIONS = [0, 5, 10, 15, 30];

function ConnectedCalendarsTab() {
  return (
    <div className="space-y-4">
      {MOCK_CALENDARS.map((cal) => (
        <Card key={cal.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{cal.provider}</p>
                <p className="text-xs text-muted-foreground">{cal.email}</p>
              </div>
            </div>
            <Badge
              variant={cal.connected ? "default" : "secondary"}
              className="gap-1"
            >
              {cal.connected && <CheckCircle2 className="h-3 w-3" />}
              {cal.connected ? "Connected" : "Disconnected"}
            </Badge>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="gap-2" asChild>
        <a
          href={`${CALCOM_URL}/settings/my-account/calendars`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Plus className="h-4 w-4" />
          Add Calendar
          <ExternalLink className="h-3 w-3" />
        </a>
      </Button>
    </div>
  );
}

function AvailabilityTab() {
  const [editing, setEditing] = useState(false);
  const [schedule, setSchedule] =
    useState<Record<string, DaySchedule>>(DEFAULT_AVAILABILITY);
  const [draft, setDraft] =
    useState<Record<string, DaySchedule>>(DEFAULT_AVAILABILITY);

  const startEditing = () => {
    setDraft({ ...schedule });
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft({ ...schedule });
    setEditing(false);
  };

  const saveChanges = () => {
    setSchedule({ ...draft });
    setEditing(false);
  };

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setDraft((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const data = editing ? draft : schedule;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Set your weekly recurring availability for meetings.
        </p>
        {!editing ? (
          <Button variant="outline" size="sm" className="gap-1" onClick={startEditing}>
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="gap-1" onClick={cancelEditing}>
              <X className="h-3 w-3" />
              Cancel
            </Button>
            <Button size="sm" className="gap-1" onClick={saveChanges}>
              <Save className="h-3 w-3" />
              Save
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {Object.entries(data).map(([day, daySchedule]) => (
          <Card key={day}>
            <CardContent className="flex items-center gap-4 p-4">
              <Switch
                checked={daySchedule.enabled}
                disabled={!editing}
                onCheckedChange={(checked) => updateDay(day, "enabled", checked)}
              />
              <span className="w-24 text-sm font-medium">{day}</span>
              {daySchedule.enabled ? (
                <div className="flex items-center gap-2 text-sm">
                  <Select
                    value={daySchedule.start}
                    onValueChange={(v) => updateDay(day, "start", v)}
                    disabled={!editing}
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
                  <span className="text-muted-foreground">to</span>
                  <Select
                    value={daySchedule.end}
                    onValueChange={(v) => updateDay(day, "end", v)}
                    disabled={!editing}
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
                <span className="text-sm text-muted-foreground">Unavailable</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MeetingPreferencesTab() {
  const [editing, setEditing] = useState(false);
  const [prefs, setPrefs] = useState<MeetingPreferences>(DEFAULT_MEETING_PREFS);
  const [draft, setDraft] = useState<MeetingPreferences>(DEFAULT_MEETING_PREFS);

  const startEditing = () => {
    setDraft({ ...prefs });
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft({ ...prefs });
    setEditing(false);
  };

  const saveChanges = () => {
    setPrefs({ ...draft });
    setEditing(false);
  };

  const current = editing ? draft : prefs;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Configure your default meeting type and duration preferences.
        </p>
        {!editing ? (
          <Button variant="outline" size="sm" className="gap-1" onClick={startEditing}>
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="gap-1" onClick={cancelEditing}>
              <X className="h-3 w-3" />
              Cancel
            </Button>
            <Button size="sm" className="gap-1" onClick={saveChanges}>
              <Save className="h-3 w-3" />
              Save
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meeting Types</CardTitle>
          <CardDescription>
            Select which meeting formats you want to offer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {MEETING_TYPES.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{label}</span>
              </div>
              <Switch
                checked={current[key]}
                disabled={!editing}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Duration &amp; Buffers</CardTitle>
          <CardDescription>
            Set the default meeting length and buffer time around meetings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Default duration</span>
            <Select
              value={String(current.defaultDuration)}
              onValueChange={(v) =>
                setDraft((prev) => ({ ...prev, defaultDuration: Number(v) }))
              }
              disabled={!editing}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((d) => (
                  <SelectItem key={d} value={String(d)} className="text-xs">
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Buffer before</span>
            <Select
              value={String(current.bufferBefore)}
              onValueChange={(v) =>
                setDraft((prev) => ({ ...prev, bufferBefore: Number(v) }))
              }
              disabled={!editing}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {BUFFER_OPTIONS.map((b) => (
                  <SelectItem key={b} value={String(b)} className="text-xs">
                    {b} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Buffer after</span>
            <Select
              value={String(current.bufferAfter)}
              onValueChange={(v) =>
                setDraft((prev) => ({ ...prev, bufferAfter: Number(v) }))
              }
              disabled={!editing}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {BUFFER_OPTIONS.map((b) => (
                  <SelectItem key={b} value={String(b)} className="text-xs">
                    {b} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const CalendarSettings = () => {
  if (!MOCK_ONBOARDING_COMPLETE) {
    return <Navigate to="/admin/calendar/onboarding" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Calendar Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your Cal.com calendar integration, availability, and meeting
          preferences.
        </p>
      </div>

      <Tabs defaultValue="calendars">
        <TabsList>
          <TabsTrigger value="calendars">Connected Calendars</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="preferences">Meeting Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="calendars" className="mt-6">
          <ConnectedCalendarsTab />
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <AvailabilityTab />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <MeetingPreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarSettings;
