import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/portal/components/ui/input";
import { Switch } from "@/portal/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/portal/components/ui/select";
import { usePlatformConfig, useUpdatePlatformConfig } from "@/portal/hooks/useAdminConfig";
import { CALCOM_ADMIN_URL as CALCOM_URL } from "@/portal/api/config";
import { SettingsFormSkeleton } from "@/portal/components/ui/admin-skeletons";

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Anchorage", "Pacific/Honolulu", "Europe/London", "Europe/Paris",
  "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney",
];

const NOTICE_OPTIONS = ["1h", "2h", "4h", "12h", "24h", "48h"];
const CANCEL_OPTIONS = ["1h", "2h", "4h", "12h", "24h"];

export default function AdminCalendarSettings() {
  const { data: config, isLoading } = usePlatformConfig();
  const updateConfig = useUpdatePlatformConfig();

  const handleUpdate = (key: string, value: string | number | boolean) => {
    updateConfig.mutate({ [key]: value } as Record<string, unknown>, {
      onSuccess: () => toast.success('Setting saved.'),
      onError: () => toast.error('Failed to save.'),
    });
  };

  if (isLoading) {
    // Replaced the center-screen spinner with a shape-matched skeleton.
    // Spinners don't hint at the shape of the content that's about to
    // appear; a settings-form skeleton reserves the two-column layout so
    // the real fields slide into place with zero layout shift.
    return <SettingsFormSkeleton />;
  }

  const calcomConfigured = !!CALCOM_URL && CALCOM_URL !== 'http://localhost:3000';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Cal.com Connection</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {calcomConfigured ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-slate-700">
              {calcomConfigured ? "Connected" : "Not configured"}
            </span>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p>URL: {CALCOM_URL}</p>
            <p>Webhook: {calcomConfigured ? 'Configured via Railway' : 'Not set'}</p>
          </div>
          {calcomConfigured && (
            <a
              href={CALCOM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              Open Cal.com Dashboard <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Global Defaults</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Default Timezone</label>
            <Select
              value={config?.default_timezone ?? "America/New_York"}
              onValueChange={(v) => handleUpdate('default_timezone', v)}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Booking Policies</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Min Notice</label>
            <Select
              value={config?.booking_min_notice ?? "24h"}
              onValueChange={(v) => handleUpdate('booking_min_notice', v)}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {NOTICE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Max / Week</label>
            <Input
              type="number"
              min={1}
              max={50}
              value={config?.booking_max_per_week ?? 10}
              onChange={(e) => handleUpdate('booking_max_per_week', Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Cancellation Window</label>
            <Select
              value={config?.booking_cancellation_window ?? "12h"}
              onValueChange={(v) => handleUpdate('booking_cancellation_window', v)}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CANCEL_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Auto-Confirm</label>
            <div className="flex items-center gap-2 mt-2">
              <Switch
                checked={config?.booking_auto_confirm ?? true}
                onCheckedChange={(v) => handleUpdate('booking_auto_confirm', v)}
              />
              <span className="text-xs text-slate-600">
                {config?.booking_auto_confirm ? "Auto" : "Manual"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">User Onboarding Status</h3>
        <p className="text-xs text-slate-500 mb-3">View enrollment status in the Programs tab.</p>
        <a
          href="/admin/programs"
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          Go to Programs →
        </a>
      </div>
    </div>
  );
}
