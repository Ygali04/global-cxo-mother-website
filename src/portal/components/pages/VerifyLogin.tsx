import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { verifyLoginTokenApi } from '@/portal/api/auth';

export default function VerifyLogin(): JSX.Element {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const isSandbox = searchParams.get('sandbox') === 'true';

  useEffect(() => {
    if (isSandbox) { setStatus('success'); return; }
    if (!token) { setStatus('error'); setErrorMsg('No verification token provided.'); return; }

    let cancelled = false;
    void (async () => {
      try {
        await verifyLoginTokenApi(token);
        if (cancelled) return;
        setStatus('success');
        // Full page reload so AuthContext bootstraps with the new token
        setTimeout(() => { window.location.href = '/'; }, 1500);
      } catch {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg('This verification link is invalid or has expired.');
      }
    })();
    return () => { cancelled = true; };
  }, [token, navigate, isSandbox]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Orbital background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1628] via-[#0f1d3a] to-[#0a1628]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[900px] h-[900px]">
            <div className="absolute inset-0 border border-white/[0.06] rounded-full animate-spin" style={{ animationDuration: '60s' }} />
            <div className="absolute inset-[20%] border border-blue-400/[0.08] rounded-full animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
            <div className="absolute inset-[40%] border border-white/[0.06] rounded-full animate-spin" style={{ animationDuration: '30s' }} />
          </div>
        </div>
        <div className="absolute top-[15%] right-[12%] text-white/[0.07] text-2xl">&#10022;</div>
        <div className="absolute bottom-[20%] left-[10%] text-white/[0.05] text-xl">&#10022;</div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center">
          <img
            src="/cxo-circle-logo.png"
            alt="Global CXO Circle"
            className="w-16 h-16 mb-8 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          />

          <div className="max-w-md w-full rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] p-10 text-center">
            {status === 'verifying' && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                </div>
                <h1 className="text-xl font-bold text-white mb-2">Verifying your login...</h1>
                <p className="text-sm text-white/50">Please wait while we verify your identity.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle className="h-9 w-9 text-emerald-400" />
                </div>
                <h1 className="text-xl font-bold text-white mb-3">
                  {isSandbox ? 'Email Verified!' : 'Login Verified!'}
                </h1>
                <p className="text-sm text-white/50 mb-6">
                  {isSandbox
                    ? 'Your email has been verified successfully. You can now close this tab and return to the onboarding screen to continue.'
                    : 'Redirecting you to your dashboard...'}
                </p>
                {isSandbox && (
                  <div className="rounded-lg bg-amber-400/10 border border-amber-400/20 px-4 py-3">
                    <p className="text-xs text-amber-300/80">
                      Sandbox test — no real account changes were made.
                    </p>
                  </div>
                )}
                {!isSandbox && (
                  <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 animate-pulse" />
                  </div>
                )}
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle className="h-9 w-9 text-red-400" />
                </div>
                <h1 className="text-xl font-bold text-white mb-3">Verification Failed</h1>
                <p className="text-sm text-white/50 mb-6">{errorMsg}</p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all"
                >
                  Back to Login
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
