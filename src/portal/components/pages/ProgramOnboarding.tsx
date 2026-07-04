import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useOnboardingInfo, useUpdateOnboardingProfile, useCompleteOnboarding } from '@/portal/hooks/useProgramOnboarding';
import ProgramOnboardingStep1 from '@/portal/components/pages/ProgramOnboardingStep1';
import ProgramOnboardingStep2 from '@/portal/components/pages/ProgramOnboardingStep2';
import ProgramOnboardingStep3 from '@/portal/components/pages/ProgramOnboardingStep3';
import ProgramOnboardingStep4 from '@/portal/components/pages/ProgramOnboardingStep4';
import type { ProfileFormData } from '@/portal/components/pages/ProgramOnboardingStep2';
import { CALCOM_URL } from '@/portal/api/config';

const TOTAL_STEPS = 4;

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------
interface StepProgressProps {
  current: number;
  total: number;
}

function StepProgress({ current, total }: StepProgressProps) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                done
                  ? 'bg-navy-900 text-white'
                  : active
                  ? 'bg-navy-900 text-white ring-2 ring-navy-300 ring-offset-2'
                  : 'bg-navy-100 text-navy-400'
              }`}
            >
              {done ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < total && (
              <div
                className={`flex-1 h-0.5 rounded-full transition-all ${
                  done ? 'bg-navy-900' : 'bg-navy-100'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error / loading screens
// ---------------------------------------------------------------------------
function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-navy-25 to-navy-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-navy-200 border-t-navy-900 rounded-full animate-spin" />
        <p className="text-sm text-navy-500">Loading your onboarding…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-navy-25 to-navy-50 px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-navy-900">Unable to load onboarding</h2>
          <p className="text-sm text-navy-500 mt-1">{message}</p>
        </div>
        <Link to="/" className="inline-block text-sm text-blue-600 hover:underline">
          Return to home
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------
const ProgramOnboarding: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);

  const { data: info, isLoading, error } = useOnboardingInfo(token);
  const { mutateAsync: saveProfile, isPending: isSaving } = useUpdateOnboardingProfile(token);
  const { mutateAsync: completeOnboarding, isPending: isCompleting } = useCompleteOnboarding(token);

  // The onboarding API now returns the full user profile directly, so we
  // don't need useAuth() — the user may not even have a session (they
  // clicked an email link). All profile fields come from the API response.

  // ---------- loading / error states ----------
  if (!token) return <ErrorScreen message="No onboarding token provided." />;
  if (isLoading) return <FullPageSpinner />;
  if (error || !info) {
    return (
      <ErrorScreen
        message={
          error instanceof Error
            ? error.message
            : 'This onboarding link may have expired or is invalid.'
        }
      />
    );
  }

  // ---------- step handlers ----------
  const goNext = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleStep2Next = async (data: ProfileFormData) => {
    setProfileData(data);
    try {
      await saveProfile({
        name: data.fullName,
        title: data.title,
        company: data.company,
        linkedin_url: data.linkedinUrl,
        phone: data.phone,
        timezone: data.timezone,
        bio: data.bio,
        photo_url: data.photoUrl,
      });
    } catch (e) {
      // Non-fatal: show warning but allow progression
      toast.warning('Profile save failed — you can update it later from settings.');
    }
    goNext();
  };

  const handleStep3Next = async () => {
    try {
      await completeOnboarding();
    } catch (e) {
      toast.warning('Could not mark onboarding complete on the server — continuing anyway.');
    }
    goNext();
  };

  // ---------- render ----------
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-navy-25 to-navy-50 flex flex-col">
      {/* Header */}
      <header className="w-full py-5 px-4 flex justify-center border-b border-navy-100/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/cxo-circle-logo.png"
            alt="Global CXO Circle"
            className="w-9 h-9 object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-xl font-bold text-navy-900 tracking-tight">Global CXO Circle</span>
        </Link>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-[560px] space-y-6">
          {/* Step progress */}
          <StepProgress current={currentStep} total={TOTAL_STEPS} />

          {/* Step label */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-navy-400">
              Step {currentStep} of {TOTAL_STEPS}
            </p>
          </div>

          {/* Card body */}
          <div className="rounded-2xl border border-navy-200/60 bg-white/90 backdrop-blur-xl shadow-xl shadow-navy-200/20 p-6 md:p-8">
            {currentStep === 1 && (
              <ProgramOnboardingStep1
                onNext={goNext}
                info={info}
              />
            )}

            {currentStep === 2 && (
              <ProgramOnboardingStep2
                onNext={(data) => void handleStep2Next(data)}
                onBack={goBack}
                userData={{
                  name: info.user.name,
                  email: info.user.email,
                  title: info.user.role ?? '',
                  company: info.user.company_affiliation ?? '',
                  linkedin: info.user.linkedin ?? '',
                  phone: info.user.phone ?? '',
                  bio: info.user.about_me ?? '',
                }}
                isSaving={isSaving}
              />
            )}

            {currentStep === 3 && (
              <ProgramOnboardingStep3
                onNext={() => void handleStep3Next()}
                onBack={goBack}
                onboardingToken={token}
                role={info.role}
                hoursCommitted={info.hours_committed}
              />
            )}

            {currentStep === 4 && (
              <ProgramOnboardingStep4
                program={info.program}
                role={info.role}
                hoursCommitted={info.hours_committed}
                partnersCount={info.partners.length}
              />
            )}
          </div>

          {/* Footer note */}
          {currentStep < TOTAL_STEPS && (
            <p className="text-center text-xs text-navy-400">
              Questions? Email{' '}
              <a href="mailto:programs@globalciocircle.com" className="underline hover:text-navy-600 transition-colors">
                programs@globalciocircle.com
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProgramOnboarding;
