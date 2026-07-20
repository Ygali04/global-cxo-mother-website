import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOnboardInfoApi, submitOnboardApi, enroll2faApi, type OnboardInfo } from '@/portal/api/auth';
import { listFieldSchemasPublicApi, type FieldSchema } from '@/portal/api/fieldSchemas';
import { apiFetch } from '@/portal/api/client';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle } from 'lucide-react';

const OnboardCxO = React.lazy(() => import('./onboarding/OnboardCxO'));
const OnboardStartup = React.lazy(() => import('./onboarding/OnboardStartup'));

type PageState = 'loading' | 'form' | 'error' | 'completed';

/* ---------- shared visual components ---------- */

function OnboardingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-[#0a1628] via-[#0f1d3a] to-[#0a1628]">
      {/* Orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[800px] h-[800px] md:w-[1100px] md:h-[1100px]">
          {/* Ring 1 - outermost */}
          <div className="absolute inset-0 border border-white/[0.07] rounded-full animate-spin" style={{ animationDuration: '60s' }} />
          {/* Ring 2 */}
          <div className="absolute inset-[15%] border border-amber-400/[0.1] rounded-full animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
          {/* Ring 3 */}
          <div className="absolute inset-[30%] border border-white/[0.08] rounded-full animate-spin" style={{ animationDuration: '35s' }} />
          {/* Ring 4 - innermost */}
          <div className="absolute inset-[45%] border border-blue-400/[0.1] rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />

          {/* Orbiting planet dots — each container matches its ring's inset
              exactly so the dot sits ON the ring border, not floating freely */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '60s' }}>
            <div className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]" style={{ top: '-6px', left: '50%', transform: 'translateX(-50%)' }} />
          </div>
          <div className="absolute inset-[15%] animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }}>
            <div className="absolute w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ top: '50%', right: '-5px', transform: 'translateY(-50%)' }} />
          </div>
          <div className="absolute inset-[30%] animate-spin" style={{ animationDuration: '35s' }}>
            <div className="absolute w-2 h-2 bg-blue-300 rounded-full shadow-[0_0_8px_rgba(147,197,253,0.5)]" style={{ bottom: '-4px', left: '50%', transform: 'translateX(-50%)' }} />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '80s', animationDirection: 'reverse' }}>
            <div className="absolute w-2 h-2 bg-amber-300 rounded-full shadow-[0_0_8px_rgba(252,211,77,0.4)]" style={{ top: '50%', left: '-4px', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      {/* Sparkle decorations */}
      <div className="absolute top-[20%] right-[15%] text-white/10 text-2xl">&#10022;</div>
      <div className="absolute bottom-[10%] right-[8%] text-white/15 text-xl">&#10022;</div>
      <div className="absolute top-[60%] left-[10%] text-white/10 text-lg">&#10022;</div>
      <div className="absolute top-[15%] left-[25%] text-white/[0.07] text-3xl">&#10022;</div>
    </div>
  );
}

const STEP_LABELS = ['Terms', 'Profile', 'Preferences', 'Verify', 'Setup'];

function StepIndicator({ currentStep, onStepClick }: { currentStep: number; onStepClick?: (step: number) => void }) {
  const progress = Math.round((currentStep / (STEP_LABELS.length - 1)) * 100);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-80">
      <div className="flex items-center justify-between mb-2">
        {STEP_LABELS.map((label, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          const isClickable = isCompleted && !!onStepClick;
          return (
            <button
              key={i}
              onClick={() => isClickable && onStepClick!(i)}
              disabled={!isClickable}
              className={`text-[10px] font-medium transition-colors ${
                isCurrent ? 'text-white/80' : isCompleted ? 'text-blue-400 hover:text-blue-300 cursor-pointer' : 'text-white/25'
              } ${!isClickable ? 'cursor-default' : ''}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      relative max-w-md w-full rounded-2xl
      bg-white/[0.05] backdrop-blur-xl
      border border-white/[0.12]
      shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
      p-8
      ${className}
    `}>
      {children}
    </div>
  );
}

/* ---------- sub-screens ---------- */

// AI preferences are loaded dynamically from the field schema API
// (entity_type='preference') so admins can add/remove/reorder them.

function LoadingScreen() {
  return (
    <div className="min-h-screen relative">
      <OnboardingBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin" />
          <img
            src="/cxo-circle-logo.png"
            alt="Global CXO Circle"
            className="absolute inset-0 m-auto h-10 w-auto object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          />
        </div>
        <div className="text-center">
          <p className="text-white text-sm font-medium">Global CXO Circle</p>
          <p className="text-white/40 text-xs mt-1 animate-pulse">
            Preparing your onboarding experience...
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen relative">
      <OnboardingBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center">
          <img src="/cxo-circle-logo.png" alt="Global CXO Circle" className="w-16 h-16 mb-6 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
          <GlassCard className="border-red-500/20">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-400" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Unable to load onboarding
              </h2>
              <p className="text-white/60 mb-6">{message}</p>
              <Link
                to="/"
                className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
              >
                Return to Home
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function CompletedScreen() {
  return (
    <div className="min-h-screen relative">
      <OnboardingBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center">
          <img src="/cxo-circle-logo.png" alt="Global CXO Circle" className="w-16 h-16 mb-6 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
          <GlassCard className="border-emerald-500/20">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-10 w-10 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white mb-2">
                You&rsquo;re all set!
              </h2>
              <p className="text-white/60 mb-6">
                Your account has already been activated.
              </p>
              <Link
                to="/dashboard"
                className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ---------- main router ---------- */

export default function Onboard() {
  const params = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Support both /onboard/:token (from email links) and /onboard?token=... (legacy)
  const token = params.token ?? searchParams.get('token') ?? '';

  const formDataRef = useRef<Record<string, string> | null>(null);
  const [state, setState] = useState<PageState>('loading');
  const [userInfo, setUserInfo] = useState<OnboardInfo | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-password steps
  const [tosAccepted, setTosAccepted] = useState(false);
  const [showTos, setShowTos] = useState(true); // starts with T&S screen

  // Custom fields from admin field schema system
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const entityType = userInfo?.tier === 'cxo' ? 'cxo' : 'startup';
  const { data: customFields } = useQuery({
    queryKey: ['field-schemas-public', entityType, 'onboarding'],
    queryFn: () => listFieldSchemasPublicApi(entityType, 'onboarding'),
    enabled: !!userInfo,
    staleTime: 0, // always refetch to pick up admin changes instantly
  });
  const hasCustomFields = (customFields ?? []).length > 0;

  // AI preferences — loaded from field schema API so admins can edit them
  const { data: preferenceFields } = useQuery({
    queryKey: ['field-schemas-public', 'preference', 'onboarding'],
    queryFn: () => listFieldSchemasPublicApi('preference', 'onboarding'),
    enabled: !!userInfo,
    staleTime: 0,
  });
  const hasPreferences = (preferenceFields ?? []).length > 0;
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [showPreferences, setShowPreferences] = useState(false);

  // Sandbox detection: test tokens from admin sandbox contain "sandbox" patterns
  // or the URL has ?sandbox=true — these should NOT write data
  const isSandbox = searchParams.get('sandbox') === 'true' ||
    token.includes('sandbox') || token === '';

  // Post-password multi-step flow
  type PostStep = 'twofa' | 'boomerang' | null;
  const [postStep, setPostStep] = useState<PostStep>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [boomerangConsent, setBoomerangConsent] = useState<boolean | null>(null);

  // Compute current step number for StepIndicator
  // Steps: 0=Terms, 1=Profile/Password, 2=Preferences, 3=Verify, 4=Setup
  // Calendar connection is NOT part of basic onboarding — only program onboarding.
  const currentStepNumber = (() => {
    if (state !== 'form') return 0;
    if (showTos) return 0;
    if (postStep === 'boomerang') return 4;
    if (postStep === 'twofa') return 3;
    if (showPreferences) return 2;
    if (showCustomFields) return 2;
    return 1; // profile/password step (includes CxO welcome + password)
  })();

  const goToStep = (targetStep: number) => {
    // Can only go backwards
    if (targetStep >= currentStepNumber) return;

    if (targetStep <= 0) {
      // Go to Terms
      setShowTos(true);
      setShowCustomFields(false);
      setShowPreferences(false);
      setPostStep(null);
    } else if (targetStep === 1) {
      // Go to Profile
      setShowTos(false);
      setShowCustomFields(false);
      setShowPreferences(false);
      setPostStep(null);
    } else if (targetStep === 2) {
      // Go to Preferences
      setShowTos(false);
      setShowCustomFields(false);
      setShowPreferences(true);
      setPostStep(null);
    } else if (targetStep === 3) {
      // Go to Verify
      setPostStep('twofa');
      setShowPreferences(false);
    } else if (targetStep === 4) {
      // Go to Setup (Boomerang)
      setPostStep('boomerang');
      setShowPreferences(false);
    }
  };

  useEffect(() => {
    // Guard: don't re-fetch if we already have user info or are in post-password steps.
    if (userInfo || postStep) return;

    // Sandbox mode: skip the API call entirely — the ephemeral user was
    // never persisted so the token lookup would always 404.
    if (isSandbox && token) {
      setUserInfo({
        name: 'Sandbox Test User',
        email: 'sandbox@test.gcio.com',
        tier: 'cxo',
        onboarding_status: 'pending',
        company_affiliation: 'Sandbox Inc.',
        role: 'Test CIO',
        linkedin: '',
        about_me: 'Sandbox test user — no data persisted.',
      });
      setState('form');
      return;
    }

    if (!token) {
      setError('No onboarding token provided.');
      setState('error');
      return;
    }

    getOnboardInfoApi(token)
      .then((info) => {
        setUserInfo(info);
        setState('form');
      })
      .catch((err) => {
        if (err.status === 410) {
          setError('Your onboarding link has expired. Please contact your admin for a new invitation.');
          setState('error');
        } else {
          setError(err.message || 'Invalid or expired link.');
          setState('error');
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (data: Record<string, string>) => {
    if (isSandbox) {
      toast.success('[SANDBOX] Test onboarding — no data saved. Proceeding through steps...');
      setPostStep('twofa');
      return;
    }

    setIsSubmitting(true);
    try {
      // Always send all required fields — the schema requires name (1+), company (1+),
      // role (1+), about_me (10+). Phone must match regex or be omitted.
      const aboutMe = data.about_me || userInfo?.about_me || '';
      const selectedPreferences = Object.entries(preferences)
        .filter(([, v]) => v)
        .map(([k]) => k);
      const payload = {
        name: data.name || userInfo?.name || 'Member',
        linkedin: data.linkedin || userInfo?.linkedin || undefined,
        company_affiliation: data.company_affiliation || userInfo?.company_affiliation || 'GCXO',
        role: data.role || userInfo?.role || 'Member',
        about_me: aboutMe.length >= 10 ? aboutMe : `${aboutMe} — GCXO member.`.slice(0, 200),
        company_size: data.company_size,
        ...(Object.keys(customFieldValues).length > 0 ? { custom_fields: customFieldValues } : {}),
        ...(selectedPreferences.length > 0 ? { preferences: selectedPreferences } : {}),
      };

      await submitOnboardApi(token, payload as unknown as Parameters<typeof submitOnboardApi>[1]);
      toast.success('Account created! A few more steps...');
      setPostStep('twofa');
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnroll2fa = async () => {
    if (isSandbox) {
      try {
        // Public endpoint — no auth needed. Sends a real email via Resend.
        // The admin's email is passed via URL param from the sandbox test email.
        const targetEmail = searchParams.get('admin_email') || userInfo?.email || '';
        if (!targetEmail || targetEmail === 'sandbox@test.gcio.com') {
          throw new Error('No admin email available');
        }
        await apiFetch('/auth/sandbox-verify-email', { method: 'POST', body: { email: targetEmail }, skipAuthHeader: true });
        setEmailVerificationSent(true);
        toast.success(`Verification email sent to ${targetEmail}!`);
      } catch {
        setEmailVerificationSent(true);
        toast.success('[SANDBOX] Verification email simulated.');
      }
      return;
    }
    try {
      await enroll2faApi();
      setEmailVerificationSent(true);
    } catch {
      // 'calendar' was a dead post-step here — no JSX branch ever handled it,
      // so a failed verification-email send stranded the user on a blank
      // screen with no way to proceed. Move to the next real step instead.
      toast.error('Could not send verification email. You can set it up later in Settings.');
      setPostStep('boomerang');
    }
  };

  // Start email verification when entering the step
  useEffect(() => {
    if (postStep === 'twofa' && !emailVerificationSent) {
      void handleEnroll2fa();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postStep, emailVerificationSent]);

  return (
    <div className="min-h-screen relative">
      <OnboardingBackground />

      {state === 'loading' && <LoadingScreen />}
      {state === 'error' && <ErrorScreen message={error} />}
      {state === 'completed' && <CompletedScreen />}

      {/* Sandbox banner */}
      {isSandbox && state === 'form' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 text-center py-2 text-xs font-medium">
          SANDBOX MODE — This is a test onboarding. No data will be saved.
        </div>
      )}

      {/* Step: Terms & Services */}
      {state === 'form' && userInfo && !postStep && showTos && (
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="flex flex-col items-center">
            <img src="/cxo-circle-logo.png" alt="Global CXO Circle" className="w-16 h-16 mb-6 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
            <GlassCard className="!max-w-xl">
              <h2 className="text-xl font-semibold text-white mb-2">
                Welcome to Global CXO Circle, {userInfo.name.split(' ')[0]}
              </h2>
              <p className="text-white/60 text-sm mb-6">
                Before we get started, please review and accept our terms of service.
              </p>
              <div className="rounded-lg bg-white/[0.05] border border-white/[0.1] p-5 mb-6 max-h-[360px] overflow-y-auto text-sm text-white/60 leading-relaxed">
                <p className="font-medium text-white mb-2">Terms of Service</p>
                <p className="mb-2">By creating an account with Global CXO Circle, you agree to:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Maintain the confidentiality of discussions within GCXO programs and circles</li>
                  <li>Use the platform for legitimate professional networking and advisory purposes</li>
                  <li>Not share other members' contact information without their explicit consent</li>
                  <li>Comply with all applicable laws and regulations in your jurisdiction</li>
                  <li>Allow GCXO to send you transactional emails related to your account and programs</li>
                </ul>
                <p className="mt-3">Full terms available at <a href="/terms-of-service/" className="text-blue-400 hover:underline">globalcxocircle.com/terms-of-service</a></p>
              </div>
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tosAccepted}
                  onChange={(e) => setTosAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/[0.08]"
                />
                <span className="text-sm text-white/70">
                  I accept the Terms of Service and Privacy Policy
                </span>
              </label>
              <button
                disabled={!tosAccepted}
                onClick={() => setShowTos(false)}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </GlassCard>
          </div>
          <StepIndicator currentStep={0} onStepClick={goToStep} />
        </div>
      )}

      {/* Profile + Password form (pre-password) */}
      {state === 'form' && userInfo && !postStep && !showTos && !showCustomFields && !showPreferences && (
        <Suspense fallback={<LoadingScreen />}>
          <div className="relative z-10">
            <div className="max-w-md mx-auto pt-4 px-4">
              <button onClick={() => goToStep(0)} className="text-xs text-white/40 hover:text-white/70 transition-colors mb-2">&larr; Back to Terms</button>
            </div>
            {userInfo.tier === 'cxo' ? (
              <OnboardCxO
                userInfo={userInfo}
                onSubmit={async (password) => {
                  // CxO onSubmit sends just the password string — wrap it into the object shape handleSubmit expects
                  formDataRef.current = { password };
                  if (hasCustomFields) { setShowCustomFields(true); } else if (hasPreferences) { setShowPreferences(true); } else { void handleSubmit({ password }); }
                }}
                isSubmitting={isSubmitting}
              />
            ) : (
              <OnboardStartup
                userInfo={userInfo}
                onSubmit={async (data) => {
                  formDataRef.current = data;
                  if (hasCustomFields) { setShowCustomFields(true); } else if (hasPreferences) { setShowPreferences(true); } else { void handleSubmit(data); }
                }}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
          <StepIndicator currentStep={currentStepNumber} onStepClick={goToStep} />
        </Suspense>
      )}

      {/* Step: Custom Fields (admin-configured via field schema editor) */}
      {state === 'form' && showCustomFields && !showPreferences && !postStep && (
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="flex flex-col items-center">
            <img src="/cxo-circle-logo.png" alt="Global CXO Circle" className="w-16 h-16 mb-6 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
            <GlassCard>
              <button onClick={() => goToStep(currentStepNumber - 1)} className="text-xs text-white/40 hover:text-white/70 transition-colors mb-2">&larr; Back</button>
              <h2 className="text-xl font-semibold text-white mb-2">Additional Information</h2>
              <p className="text-white/60 text-sm mb-6">
                Please fill in these additional fields to complete your profile.
              </p>
              <div className="space-y-4 mb-6">
                {(customFields ?? []).map((field) => (
                  <div key={field.field_key}>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      {field.field_label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.field_type === 'select' ? (
                      <select
                        value={customFieldValues[field.field_key] ?? ''}
                        onChange={(e) => setCustomFieldValues((p) => ({ ...p, [field.field_key]: e.target.value }))}
                        className="w-full rounded-lg border border-white/[0.15] bg-white/[0.08] px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select...</option>
                        {(field.options ?? []).map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.field_type === 'textarea' ? (
                      <textarea
                        value={customFieldValues[field.field_key] ?? ''}
                        onChange={(e) => setCustomFieldValues((p) => ({ ...p, [field.field_key]: e.target.value }))}
                        placeholder={field.help_text ?? field.field_label}
                        rows={3}
                        className="w-full rounded-lg border border-white/[0.15] bg-white/[0.08] px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none resize-none"
                      />
                    ) : (
                      <input
                        type={field.field_type === 'url' ? 'url' : field.field_type === 'email' ? 'email' : field.field_type === 'number' ? 'number' : 'text'}
                        value={customFieldValues[field.field_key] ?? ''}
                        onChange={(e) => setCustomFieldValues((p) => ({ ...p, [field.field_key]: e.target.value }))}
                        placeholder={field.help_text ?? field.field_label}
                        className="w-full rounded-lg border border-white/[0.15] bg-white/[0.08] px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={async () => { setShowCustomFields(false); if (hasPreferences) { setShowPreferences(true); } else { const d = formDataRef.current; if (d) await handleSubmit(d); else setPostStep('twofa'); } }}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
              >
                Continue
              </button>
            </GlassCard>
          </div>
          <StepIndicator currentStep={3} onStepClick={goToStep} />
        </div>
      )}

      {/* Step: AI Preferences Questionnaire */}
      {state === 'form' && showPreferences && !postStep && (
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="flex flex-col items-center">
            <img src="/cxo-circle-logo.png" alt="Global CXO Circle" className="w-16 h-16 mb-6 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
            <GlassCard>
              <button onClick={() => goToStep(currentStepNumber - 1)} className="text-xs text-white/40 hover:text-white/70 transition-colors mb-2">&larr; Back</button>
              <h2 className="text-xl font-semibold text-white mb-2">What are you looking for?</h2>
              <p className="text-white/60 text-sm mb-6">
                Select the topics that interest you most. This helps us match you with the right programs and peers.
              </p>
              <div className="space-y-3 mb-6">
                {(preferenceFields ?? []).map((pref) => (
                  <label key={pref.field_key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preferences[pref.field_key] ?? false}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, [pref.field_key]: e.target.checked }))}
                      className="h-4 w-4 rounded border-white/30 bg-white/[0.08]"
                    />
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                      {pref.field_label}
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={async () => {
                  setShowPreferences(false);
                  const stashedData = formDataRef.current;
                  if (stashedData) {
                    await handleSubmit(stashedData);
                  } else {
                    setPostStep('twofa');
                  }
                }}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
              >
                Continue
              </button>
              <button
                onClick={async () => {
                  setShowPreferences(false);
                  const stashedData = formDataRef.current;
                  if (stashedData) await handleSubmit(stashedData); else setPostStep('twofa');
                }}
                className="w-full mt-3 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Skip — I'll set preferences later
              </button>
            </GlassCard>
          </div>
          <StepIndicator currentStep={3} onStepClick={goToStep} />
        </div>
      )}

      {/* -- Post-password steps -- */}

      {/* Step: 2FA Enrollment */}
      {postStep === 'twofa' && (
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="flex flex-col items-center">
            <img src="/cxo-circle-logo.png" alt="Global CXO Circle" className="w-16 h-16 mb-6 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
            <GlassCard>
              <button onClick={() => goToStep(currentStepNumber - 1)} className="text-xs text-white/40 hover:text-white/70 transition-colors mb-2">&larr; Back</button>
              <h2 className="text-xl font-semibold text-white mb-2">Verify Your Email</h2>
              <p className="text-white/60 text-sm mb-6">
                We've sent a verification email to secure your account. Check your inbox and click the link to verify.
              </p>

              {emailVerificationSent ? (
                <div>
                  <div className="flex justify-center mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20">
                      <span className="text-4xl">&#x1F4E7;</span>
                    </div>
                  </div>
                  <p className="text-emerald-400 text-sm font-medium text-center mb-2">Verification email sent!</p>
                  <p className="text-white/60 text-xs text-center mb-6">
                    Check your inbox for a link from Global CXO Circle. The link expires in 15 minutes.
                  </p>
                  <button
                    onClick={() => setPostStep('boomerang')}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => { setEmailVerificationSent(false); void handleEnroll2fa(); }}
                    className="w-full mt-3 text-xs text-white/40 hover:text-white/70 transition-colors"
                  >
                    Resend verification email
                  </button>
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
            </GlassCard>
          </div>
          <StepIndicator currentStep={3} onStepClick={goToStep} />
        </div>
      )}

      {/* Step: Boomerang Permissions */}
      {postStep === 'boomerang' && (
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="flex flex-col items-center">
            <img src="/cxo-circle-logo.png" alt="Global CXO Circle" className="w-16 h-16 mb-6 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
            <GlassCard className="text-center">
              <button onClick={() => goToStep(currentStepNumber - 1)} className="text-xs text-white/40 hover:text-white/70 transition-colors mb-2 block text-left">&larr; Back</button>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-3xl">&#x1FA83;</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Boomerang Network Analysis</h2>
              <p className="text-white/60 text-sm mb-6">
                Boomerang can analyze your peer-to-peer network to suggest warm introductions
                between CxOs, startups, and VCs in the GCXO ecosystem.
              </p>
              <p className="text-white/40 text-xs mb-6">
                This is optional. You can change this in Settings at any time.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    try {
                      if (!isSandbox) {
                        await apiFetch('/users/me', { method: 'PATCH', body: { boomerang_enabled: false } });
                      }
                      toast.success('Welcome to Global CXO Circle!');
                      navigate('/dashboard');
                    } catch {
                      toast.error('We couldn\'t save your preference, but your account is ready. You can update this in Settings.');
                      navigate('/dashboard');
                    }
                  }}
                  className="flex-1 rounded-xl border border-white/[0.15] px-4 py-3.5 text-sm font-medium text-white hover:bg-white/[0.08] transition-all duration-300"
                >
                  No thanks
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (!isSandbox) {
                        await apiFetch('/users/me', { method: 'PATCH', body: { boomerang_enabled: true } });
                      }
                      toast.success('Welcome to Global CXO Circle! Boomerang is enabled.');
                      navigate('/dashboard');
                    } catch {
                      toast.error('We couldn\'t save your preference, but your account is ready. You can update this in Settings.');
                      navigate('/dashboard');
                    }
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300"
                >
                  Yes, enable Boomerang
                </button>
              </div>
            </GlassCard>
          </div>
          <StepIndicator currentStep={4} onStepClick={goToStep} />
        </div>
      )}
    </div>
  );
}
