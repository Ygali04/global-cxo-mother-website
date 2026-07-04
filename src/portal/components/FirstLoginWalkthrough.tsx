import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/portal/hooks/useAuth';

export default function FirstLoginWalkthrough() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const key = `gcio_walkthrough_seen_${user.id}`;
    if (localStorage.getItem(key)) return;

    // Check if profile is incomplete
    const incomplete = !user.linkedin || !user.aboutMe || user.aboutMe.length < 10;
    if (incomplete) setShow(true);
  }, [user]);

  const dismiss = () => {
    if (user?.id) localStorage.setItem(`gcio_walkthrough_seen_${user.id}`, 'true');
    setShow(false);
  };

  if (!show) return null;

  const missingFields: string[] = [];
  if (!user?.linkedin) missingFields.push('LinkedIn URL');
  if (!user?.aboutMe || user.aboutMe.length < 10) missingFields.push('About Me');
  if (!user?.phone) missingFields.push('Phone number');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Orbital rings background decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="relative w-[800px] h-[800px]">
          <div className="absolute inset-0 border border-white/10 rounded-full animate-spin" style={{ animationDuration: '60s' }} />
          <div className="absolute inset-[25%] border border-blue-400/10 rounded-full animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
          <div className="absolute inset-[50%] border border-white/10 rounded-full animate-spin" style={{ animationDuration: '30s' }} />
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 max-w-md w-full mx-4 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 text-center">
        <img
          src="/cxo-circle-logo.png"
          alt="Global CXO Circle"
          className="w-14 h-14 mx-auto mb-5 drop-shadow-[0_0_16px_rgba(59,130,246,0.3)]"
        />
        <h2 className="text-xl font-bold text-white mb-2">
          Welcome to Global CXO Circle!
        </h2>
        <p className="text-white/50 text-sm mb-6">
          Your account is set up. Let&apos;s complete your profile so other members can connect with you.
        </p>

        {missingFields.length > 0 && (
          <div className="rounded-lg bg-white/[0.05] border border-white/[0.1] p-4 mb-6 text-left">
            <p className="text-white/60 text-xs font-medium mb-2">Missing profile fields:</p>
            <ul className="space-y-1.5">
              {missingFields.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => { dismiss(); navigate('/settings'); }}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all mb-3"
        >
          Complete Profile
        </button>
        <button
          onClick={dismiss}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
