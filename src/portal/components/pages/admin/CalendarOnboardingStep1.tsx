import { Check, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/portal/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/portal/components/ui/card";
import { Badge } from "@/portal/components/ui/badge";
import type { ProviderConfig, StepCopy } from "./calendarOnboardingTypes";

const PROVIDER_STYLES: Record<string, { color: string; iconBg: string }> = {
  google: { color: "bg-red-50 border-red-200 hover:border-red-400", iconBg: "bg-red-100 text-red-600" },
  apple: { color: "bg-gray-50 border-gray-200 hover:border-gray-400", iconBg: "bg-gray-100 text-gray-600" },
  microsoft: { color: "bg-blue-50 border-blue-200 hover:border-blue-400", iconBg: "bg-blue-100 text-blue-600" },
};

const FALLBACK_STYLE = { color: "bg-slate-50 border-slate-200 hover:border-slate-400", iconBg: "bg-slate-100 text-slate-600" };

const HARDCODED_PROVIDERS = [
  { id: "google", name: "Google Calendar", description: "Connect your Google Workspace or personal calendar" },
  { id: "apple", name: "Apple Calendar", description: "Connect your iCloud or Apple calendar" },
  { id: "microsoft", name: "Microsoft Outlook", description: "Connect your Outlook or Microsoft 365 calendar" },
];

interface CalendarOnboardingStep1Props {
  onNext: () => void;
  simulationMode?: boolean;
  tier?: string;
  configProviders?: ProviderConfig[];
  configCopy?: StepCopy;
  onboardingStatus?: {
    connected_calendars: string[];
    calcom_profile_url?: string;
  };
}

export default function CalendarOnboardingStep1({
  onNext,
  simulationMode,
  tier,
  configProviders,
  configCopy,
  onboardingStatus,
}: CalendarOnboardingStep1Props) {
  const connectedCalendars = onboardingStatus?.connected_calendars ?? [];

  const providers = configProviders
    ? configProviders.filter(
        (p) => p.enabled && (tier ? p.tiers.includes(tier) : true)
      ).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.helperText,
      }))
    : HARDCODED_PROVIDERS;

  const title = configCopy?.title ?? "Connect your calendar";
  const subtitle = configCopy?.subtitle ?? "We cross-reference your calendar to avoid double bookings and keep your schedule in sync.";

  const handleConnect = (providerId: string) => {
    if (simulationMode) {
      const provider = providers.find((p) => p.id === providerId)?.name ?? providerId;
      toast.success(`Simulated: ${provider} calendar connected`);
      return;
    }
    if (onboardingStatus?.calcom_profile_url) {
      window.open(
        `${onboardingStatus.calcom_profile_url}/settings/calendars`,
        "_blank"
      );
    } else {
      console.log(`[CalendarOnboarding] Connect provider: ${providerId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{subtitle}</p>
      </div>

      <div className="grid gap-4 max-w-lg mx-auto">
        {providers.map((provider) => {
          const isConnected = connectedCalendars.includes(provider.id);
          const style = PROVIDER_STYLES[provider.id] ?? FALLBACK_STYLE;
          return (
            <Card
              key={provider.id}
              className={`relative cursor-pointer transition-all ${style.color} ${
                isConnected ? "ring-2 ring-green-500" : ""
              }`}
              onClick={() => !isConnected && handleConnect(provider.id)}
            >
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${style.iconBg}`}
                >
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-base font-semibold">
                    {provider.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {provider.description}
                  </CardDescription>
                </div>
                {isConnected ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Button variant="outline" size="sm">
                    Connect
                  </Button>
                )}
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-sm mx-auto">
        You can connect additional calendars later from your settings.
      </p>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
