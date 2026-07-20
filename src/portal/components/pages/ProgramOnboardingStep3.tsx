import React, { useState } from 'react';
import { Button } from '@/portal/components/ui/button';
import { Calendar, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getOnboardingCalcomSsoApi } from '@/portal/api/programs';

interface ProgramOnboardingStep3Props {
  onNext: () => void;
  onBack: () => void;
  onboardingToken: string;
  role: string;
  hoursCommitted: number;
}

const ProgramOnboardingStep3: React.FC<ProgramOnboardingStep3Props> = ({
  onNext,
  onBack,
  onboardingToken,
  role,
  hoursCommitted,
}) => {
  const isCxO = role === 'cxo';
  const [ssoLoading, setSsoLoading] = useState(false);
  const [calendarOpened, setCalendarOpened] = useState(false);
  const [availabilityOpened, setAvailabilityOpened] = useState(false);

  // Generate a per-user SSO URL and open Cal.com in a new tab.
  // Cal.com blocks iframes (X-Frame-Options: DENY), so the only
  // correct approach is a new-tab SSO redirect.
  const openCalcomPage = async (page: 'calendars' | 'availability') => {
    setSsoLoading(true);
    try {
      const { redirect_url } = await getOnboardingCalcomSsoApi(onboardingToken);
      // The SSO URL logs the user into their Cal.com account and
      // redirects to /event-types. We append a returnTo param so
      // the user lands on the right settings page after auth.
      const url = page === 'calendars'
        ? redirect_url + '&returnTo=/settings/my-account/calendars'
        : redirect_url + '&returnTo=/availability';
      window.open(url, '_blank', 'noopener,noreferrer');
      if (page === 'calendars') setCalendarOpened(true);
      if (page === 'availability') setAvailabilityOpened(true);
    } catch (e: unknown) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Could not connect to calendar service. Please try again.',
      );
    } finally {
      setSsoLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
          <Calendar className="h-7 w-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-navy-900">Connect Your Calendar</h2>
        <p className="text-navy-500 text-sm leading-relaxed">
          Connect your calendar and set your availability for advisory sessions.
          Each step opens in a new tab — come back here when you're done.
          {isCxO && (
            <span className="block mt-1 text-xs text-blue-600">
              You've committed to <strong>{hoursCommitted} hours</strong> — your calendar helps us schedule efficiently.
            </span>
          )}
        </p>
      </div>

      {/* Action cards */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => void openCalcomPage('calendars')}
          disabled={ssoLoading}
          className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
            calendarOpened
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-navy-100 bg-white hover:border-blue-200 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗓️</span>
            <div>
              <p className="font-medium text-navy-800">Connect Calendar</p>
              <p className="text-xs text-navy-500">Link Google, Outlook, or Apple Calendar</p>
            </div>
          </div>
          {calendarOpened ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : ssoLoading ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin shrink-0" />
          ) : (
            <ExternalLink className="h-4 w-4 text-navy-400 shrink-0" />
          )}
        </button>

        <button
          type="button"
          onClick={() => void openCalcomPage('availability')}
          disabled={ssoLoading}
          className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
            availabilityOpened
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-navy-100 bg-white hover:border-blue-200 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="font-medium text-navy-800">Set Availability</p>
              <p className="text-xs text-navy-500">Choose your available days and times</p>
            </div>
          </div>
          {availabilityOpened ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : ssoLoading ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin shrink-0" />
          ) : (
            <ExternalLink className="h-4 w-4 text-navy-400 shrink-0" />
          )}
        </button>
      </div>

      <p className="text-center text-xs text-navy-400">
        Each button opens your personal calendar settings in a new tab.
        You can skip this step and configure later from your program dashboard.
      </p>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          onClick={onNext}
          className="w-full h-11 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold shadow-lg shadow-navy-900/20 transition-all"
        >
          Continue
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-navy-500 hover:text-navy-700 transition-colors text-center"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ProgramOnboardingStep3;
