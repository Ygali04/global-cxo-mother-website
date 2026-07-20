import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/portal/hooks/useAuth';

/**
 * "Viewing as … — Return to Admin" bar shown while an admin is impersonating
 * another user. Extracted from the old portal Navigation so it survives the
 * switch to the shared marketing header (HeaderFive) on portal pages —
 * otherwise an impersonating admin would be stranded with no way back.
 * Self-hides when not proxying.
 */
export default function ImpersonationBanner() {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, exitProxySession } = useAuth();

  const proxyAdminId =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('gcio_proxy_admin_id')
      : null;
  const isProxying =
    isAuthenticated && !!proxyAdminId && currentUser.id !== proxyAdminId;

  if (!isProxying) return null;

  const handleReturnToAdmin = async () => {
    const restored = await exitProxySession();
    if (restored) {
      toast.success(`Returned to ${restored.name}`);
      navigate('/admin/members');
    } else {
      toast.error('Admin session expired — please log in again.');
      navigate('/login');
    }
  };

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[10001] flex items-center justify-center gap-4 bg-amber-400 px-4 py-2 text-sm font-medium text-amber-900"
    >
      <span>
        Viewing as: {currentUser.name} ({currentUser.tier})
      </span>
      <button
        onClick={handleReturnToAdmin}
        className="inline-flex items-center gap-1 rounded bg-amber-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
      >
        <ArrowLeft className="h-3 w-3" />
        Return to Admin
      </button>
    </div>
  );
}
