import { useState, useEffect, useCallback } from "react";
import { Monitor, Phone, MapPin, GripVertical } from "lucide-react";
import { Switch } from "@/portal/components/ui/switch";
import { Input } from "@/portal/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/portal/components/ui/select";
import type {
  ProviderConfig,
  AvailabilityDefaults,
  MeetingTypeConfig,
  CalendarOnboardingConfig,
} from "./calendarOnboardingTypes";
import { CALENDAR_ONBOARDING_STORAGE_KEY } from "./calendarOnboardingTypes";
import { useFormSchema, useUpdateFormSchema } from "@/portal/hooks/useAdminConfig";

// ── Constants ──────────────────────────────────────────────────────────────

const ALL_TIERS = ["cxo", "startup", "vc"];

const TIER_COLORS: Record<string, string> = {
  cxo: "bg-amber-100 text-amber-800 border-amber-300",
  startup: "bg-cyan-100 text-cyan-800 border-cyan-300",
  vc: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const TIER_INACTIVE = "bg-gray-100 text-gray-400 border-gray-200";

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Anchorage", "Pacific/Honolulu", "Europe/London", "Europe/Paris",
  "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney",
];

const DURATIONS = [15, 30, 45, 60, 90];
const BUFFERS = [0, 5, 10, 15, 30];

const DEFAULT_CONFIG: CalendarOnboardingConfig = {
  step1: {
    providers: [
      { id: "google", name: "Google Calendar", enabled: true, tiers: ["cxo", "startup", "vc"], helperText: "Connect your Google Workspace or personal calendar" },
      { id: "microsoft", name: "Microsoft Outlook", enabled: true, tiers: ["cxo", "startup", "vc"], helperText: "Connect your Outlook or Office 365 calendar" },
      { id: "apple", name: "Apple Calendar", enabled: false, tiers: ["cxo", "startup"], helperText: "Connect your iCloud calendar" },
    ],
    copy: { title: "Connect Your Calendar", subtitle: "Link your scheduling tool to get started" },
  },
  step2: {
    availability: {
      days: { Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: false, Sunday: false },
      startTime: "09:00",
      endTime: "17:00",
      timezone: "America/New_York",
    },
    copy: { title: "Set Your Availability", subtitle: "Choose when you're available for meetings" },
  },
  step3: {
    meetingTypes: [
      { id: "video", label: "Video Chat", enabled: true, tiers: ["cxo", "startup", "vc"], provider: "google-meet" },
      { id: "phone", label: "Phone Call", enabled: true, tiers: ["cxo", "startup"], provider: undefined },
      { id: "inPerson", label: "In Person", enabled: false, tiers: ["cxo"], provider: undefined },
    ],
    defaultDuration: 30,
    bufferBefore: 5,
    bufferAfter: 5,
    copy: { title: "Meeting Preferences", subtitle: "Choose how people can meet with you" },
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function loadConfig(): CalendarOnboardingConfig {
  try {
    const raw = localStorage.getItem(CALENDAR_ONBOARDING_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CalendarOnboardingConfig;
  } catch { /* ignore */ }
  return DEFAULT_CONFIG;
}

function saveConfig(config: CalendarOnboardingConfig) {
  localStorage.setItem(CALENDAR_ONBOARDING_STORAGE_KEY, JSON.stringify(config));
}

type StepId = 1 | 2 | 3;

const STEP_LABELS: Record<StepId, string> = {
  1: "Connect Calendar",
  2: "Availability",
  3: "Meeting Prefs",
};

// ── Component ───────────────────────────────────────────────────────────────

export default function AdminCalendarEditor() {
  const { data: schemaResponse } = useFormSchema("calendar_onboarding");
  const updateSchemaApi = useUpdateFormSchema("calendar_onboarding");
  const [config, setConfig] = useState<CalendarOnboardingConfig>(loadConfig);
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [previewTier, setPreviewTier] = useState<string>("cxo");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (schemaResponse && !initialized) {
      const apiConfig = schemaResponse.schema_data?.config as CalendarOnboardingConfig | undefined;
      if (apiConfig?.step1) {
        setConfig(apiConfig);
      }
      setInitialized(true);
    }
  }, [schemaResponse, initialized]);

  useEffect(() => {
    saveConfig(config);
    if (initialized) {
      updateSchemaApi.mutate({ config });
    }
  }, [config]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateConfig = useCallback((patch: Partial<CalendarOnboardingConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Provider helpers ──
  const toggleProvider = (id: string) => {
    const providers = config.step1.providers.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    updateConfig({ step1: { ...config.step1, providers } });
  };

  const toggleProviderTier = (providerId: string, tier: string) => {
    const providers = config.step1.providers.map((p) => {
      if (p.id !== providerId) return p;
      const tiers = p.tiers.includes(tier)
        ? p.tiers.filter((t) => t !== tier)
        : [...p.tiers, tier];
      return { ...p, tiers };
    });
    updateConfig({ step1: { ...config.step1, providers } });
  };

  const updateProviderHelper = (id: string, helperText: string) => {
    const providers = config.step1.providers.map((p) =>
      p.id === id ? { ...p, helperText } : p
    );
    updateConfig({ step1: { ...config.step1, providers } });
  };

  const moveProvider = (id: string, dir: -1 | 1) => {
    const providers = [...config.step1.providers];
    const idx = providers.findIndex((p) => p.id === id);
    const target = idx + dir;
    if (target < 0 || target >= providers.length) return;
    [providers[idx], providers[target]] = [providers[target], providers[idx]];
    updateConfig({ step1: { ...config.step1, providers } });
  };

  // ── Meeting type helpers ──
  const toggleMeetingType = (id: string) => {
    const meetingTypes = config.step3.meetingTypes.map((m) =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    updateConfig({ step3: { ...config.step3, meetingTypes } });
  };

  const toggleMeetingTypeTier = (mtId: string, tier: string) => {
    const meetingTypes = config.step3.meetingTypes.map((m) => {
      if (m.id !== mtId) return m;
      const tiers = m.tiers.includes(tier)
        ? m.tiers.filter((t) => t !== tier)
        : [...m.tiers, tier];
      return { ...m, tiers };
    });
    updateConfig({ step3: { ...config.step3, meetingTypes } });
  };

  const updateMeetingProvider = (id: string, provider: string) => {
    const meetingTypes = config.step3.meetingTypes.map((m) =>
      m.id === id ? { ...m, provider } : m
    );
    updateConfig({ step3: { ...config.step3, meetingTypes } });
  };

  // ── Render helpers ──
  const renderTierBadges = (
    activeTiers: string[],
    onToggle: (tier: string) => void
  ) => (
    <div className="flex gap-1">
      {ALL_TIERS.map((tier) => (
        <button
          key={tier}
          onClick={() => onToggle(tier)}
          className={`rounded px-2 py-0.5 text-xs font-medium border transition-colors ${
            activeTiers.includes(tier) ? TIER_COLORS[tier] : TIER_INACTIVE
          }`}
        >
          {tier.toUpperCase()}
        </button>
      ))}
    </div>
  );

  // ── Step Config Panels ──

  const renderStep1Config = () => (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-slate-500">Step Title</label>
        <Input
          value={config.step1.copy.title}
          onChange={(e) =>
            updateConfig({ step1: { ...config.step1, copy: { ...config.step1.copy, title: e.target.value } } })
          }
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-slate-500">Subtitle</label>
        <Input
          value={config.step1.copy.subtitle}
          onChange={(e) =>
            updateConfig({ step1: { ...config.step1, copy: { ...config.step1.copy, subtitle: e.target.value } } })
          }
          className="mt-1"
        />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Calendar Providers</h4>
        <div className="space-y-2">
          {config.step1.providers.map((provider) => (
            <div
              key={provider.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-opacity ${
                provider.enabled ? "border-slate-200" : "border-slate-100 opacity-50"
              }`}
            >
              <button
                className="text-slate-400 hover:text-slate-600 cursor-grab"
                onClick={() => moveProvider(provider.id, -1)}
                title="Move up"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{provider.name}</span>
                  {renderTierBadges(provider.tiers, (tier) => toggleProviderTier(provider.id, tier))}
                </div>
                <Input
                  value={provider.helperText}
                  onChange={(e) => updateProviderHelper(provider.id, e.target.value)}
                  className="h-7 text-xs"
                  placeholder="Helper text..."
                />
              </div>
              <Switch
                checked={provider.enabled}
                onCheckedChange={() => toggleProvider(provider.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2Config = () => {
    const { availability } = config.step2;
    const days = Object.entries(availability.days);

    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500">Step Title</label>
          <Input
            value={config.step2.copy.title}
            onChange={(e) =>
              updateConfig({ step2: { ...config.step2, copy: { ...config.step2.copy, title: e.target.value } } })
            }
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Subtitle</label>
          <Input
            value={config.step2.copy.subtitle}
            onChange={(e) =>
              updateConfig({ step2: { ...config.step2, copy: { ...config.step2.copy, subtitle: e.target.value } } })
            }
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Default Timezone</label>
          <Select
            value={availability.timezone}
            onValueChange={(tz) =>
              updateConfig({ step2: { ...config.step2, availability: { ...availability, timezone: tz } } })
            }
          >
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>{tz.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-slate-500">Default Start</label>
            <Input type="time" value={availability.startTime} onChange={(e) =>
              updateConfig({ step2: { ...config.step2, availability: { ...availability, startTime: e.target.value } } })
            } className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Default End</label>
            <Input type="time" value={availability.endTime} onChange={(e) =>
              updateConfig({ step2: { ...config.step2, availability: { ...availability, endTime: e.target.value } } })
            } className="mt-1" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Default Days</h4>
          <div className="grid grid-cols-2 gap-2">
            {days.map(([day, enabled]) => (
              <label key={day} className="flex items-center gap-2 text-sm">
                <Switch
                  checked={enabled}
                  onCheckedChange={(val) => {
                    const newDays = { ...availability.days, [day]: val };
                    updateConfig({ step2: { ...config.step2, availability: { ...availability, days: newDays } } });
                  }}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStep3Config = () => {
    const MEETING_ICONS: Record<string, React.ElementType> = { video: Monitor, phone: Phone, inPerson: MapPin };
    const VIDEO_PROVIDERS = [
      { value: "google-meet", label: "Google Meet" },
      { value: "zoom", label: "Zoom" },
      { value: "ms-teams", label: "Microsoft Teams" },
    ];

    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-500">Step Title</label>
          <Input
            value={config.step3.copy.title}
            onChange={(e) =>
              updateConfig({ step3: { ...config.step3, copy: { ...config.step3.copy, title: e.target.value } } })
            }
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Subtitle</label>
          <Input
            value={config.step3.copy.subtitle}
            onChange={(e) =>
              updateConfig({ step3: { ...config.step3, copy: { ...config.step3.copy, subtitle: e.target.value } } })
            }
            className="mt-1"
          />
        </div>

        <h4 className="text-sm font-semibold text-slate-700">Meeting Types</h4>
        {config.step3.meetingTypes.map((mt) => {
          const Icon = MEETING_ICONS[mt.id] ?? Monitor;
          return (
            <div
              key={mt.id}
              className={`rounded-lg border p-3 transition-opacity ${
                mt.enabled ? "border-slate-200" : "border-slate-100 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-slate-500" />
                <span className="text-sm font-medium flex-1">{mt.label}</span>
                {renderTierBadges(mt.tiers, (tier) => toggleMeetingTypeTier(mt.id, tier))}
                <Switch checked={mt.enabled} onCheckedChange={() => toggleMeetingType(mt.id)} />
              </div>
              {mt.id === "video" && mt.enabled && (
                <div className="mt-2 ml-8">
                  <Select value={mt.provider ?? "google-meet"} onValueChange={(v) => updateMeetingProvider(mt.id, v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VIDEO_PROVIDERS.map((vp) => (
                        <SelectItem key={vp.value} value={vp.value}>{vp.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          );
        })}

        <div className="grid grid-cols-3 gap-2 pt-2">
          <div>
            <label className="text-xs font-medium text-slate-500">Duration</label>
            <Select
              value={String(config.step3.defaultDuration)}
              onValueChange={(v) => updateConfig({ step3: { ...config.step3, defaultDuration: Number(v) } })}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => <SelectItem key={d} value={String(d)}>{d} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Buffer Before</label>
            <Select
              value={String(config.step3.bufferBefore)}
              onValueChange={(v) => updateConfig({ step3: { ...config.step3, bufferBefore: Number(v) } })}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUFFERS.map((b) => <SelectItem key={b} value={String(b)}>{b} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Buffer After</label>
            <Select
              value={String(config.step3.bufferAfter)}
              onValueChange={(v) => updateConfig({ step3: { ...config.step3, bufferAfter: Number(v) } })}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUFFERS.map((b) => <SelectItem key={b} value={String(b)}>{b} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };

  // ── Live Preview ──

  const renderStep1Preview = () => {
    const visibleProviders = config.step1.providers.filter(
      (p) => p.enabled && p.tiers.includes(previewTier)
    );
    return (
      <div className="space-y-3">
        <div className="text-center mb-4">
          <h3 className="text-sm font-semibold text-white">{config.step1.copy.title}</h3>
          <p className="text-xs text-slate-400 mt-1">{config.step1.copy.subtitle}</p>
        </div>
        {visibleProviders.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No providers visible for this tier</p>
        ) : (
          visibleProviders.map((p) => (
            <div key={p.id} className="rounded-lg border border-slate-600 bg-slate-800 p-3 text-center">
              <span className="text-sm text-slate-200">{p.name}</span>
              <p className="text-xs text-slate-400 mt-0.5">{p.helperText}</p>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderStep2Preview = () => {
    const { availability } = config.step2;
    const enabledDays = Object.entries(availability.days).filter(([, on]) => on);
    return (
      <div className="space-y-3">
        <div className="text-center mb-4">
          <h3 className="text-sm font-semibold text-white">{config.step2.copy.title}</h3>
          <p className="text-xs text-slate-400 mt-1">{config.step2.copy.subtitle}</p>
        </div>
        <div className="text-xs text-slate-400 text-center">Timezone: {availability.timezone.replace(/_/g, " ")}</div>
        {enabledDays.map(([day]) => (
          <div key={day} className="flex justify-between rounded-lg border border-slate-600 bg-slate-800 px-3 py-2">
            <span className="text-sm text-slate-200">{day}</span>
            <span className="text-xs text-slate-400">{availability.startTime} – {availability.endTime}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderStep3Preview = () => {
    const visibleTypes = config.step3.meetingTypes.filter(
      (m) => m.enabled && m.tiers.includes(previewTier)
    );
    return (
      <div className="space-y-3">
        <div className="text-center mb-4">
          <h3 className="text-sm font-semibold text-white">{config.step3.copy.title}</h3>
          <p className="text-xs text-slate-400 mt-1">{config.step3.copy.subtitle}</p>
        </div>
        {visibleTypes.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No meeting types visible for this tier</p>
        ) : (
          visibleTypes.map((m) => (
            <div key={m.id} className="rounded-lg border border-slate-600 bg-slate-800 p-3">
              <span className="text-sm text-slate-200">{m.label}</span>
              {m.provider && <span className="ml-2 text-xs text-slate-500">({m.provider})</span>}
            </div>
          ))
        )}
        <div className="text-xs text-slate-500 text-center pt-2">
          {config.step3.defaultDuration} min · {config.step3.bufferBefore}min before · {config.step3.bufferAfter}min after
        </div>
      </div>
    );
  };

  const STEP_PREVIEWS: Record<StepId, () => React.ReactNode> = {
    1: renderStep1Preview,
    2: renderStep2Preview,
    3: renderStep3Preview,
  };

  const STEP_CONFIGS: Record<StepId, () => React.ReactNode> = {
    1: renderStep1Config,
    2: renderStep2Config,
    3: renderStep3Config,
  };

  return (
    <div>
      {/* Step selector */}
      <div className="flex gap-0 border-b border-slate-200 mb-0">
        {([1, 2, 3] as StepId[]).map((step) => (
          <button
            key={step}
            onClick={() => setActiveStep(step)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeStep === step
                ? "text-blue-600 border-blue-600"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            Step {step}: {STEP_LABELS[step]}
          </button>
        ))}
      </div>

      {/* Two-column layout — stacks on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row min-h-[500px] border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
        {/* Left: Config */}
        <div className="flex-1 p-5 border-b md:border-b-0 md:border-r border-slate-200 md:overflow-y-auto md:max-h-[600px]">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Configuration</h3>
          {STEP_CONFIGS[activeStep]()}
        </div>

        {/* Right: Preview */}
        <div className="flex-1 p-5 bg-slate-900 md:overflow-y-auto md:max-h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Live Preview</h3>
            <div className="flex gap-1">
              {ALL_TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setPreviewTier(tier)}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    previewTier === tier ? TIER_COLORS[tier] : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {tier.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            {STEP_PREVIEWS[activeStep]()}
          </div>
        </div>
      </div>
    </div>
  );
}
