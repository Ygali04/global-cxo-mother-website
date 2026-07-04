import { useAuth } from '@/portal/hooks/useAuth';

/**
 * Returns true when the current user is allowed to see startup financial
 * information (pricing tier, price per hour, estimated cost, invoices,
 * contract status) and edit the startup profile.
 *
 * Rules:
 *   - admin or dev tier    → always true
 *   - startup tier + manager link_role → true
 *   - anyone else (regular startup members, cxo, vc) → false
 *
 * Be meticulous: every component that displays a dollar amount, a pricing
 * tier name, a contract flag, or a "Save" button on the startup profile
 * MUST gate on this hook. Other forms of non-financial data (hours used,
 * program name, enrollment role) should NOT be gated here.
 */
export function useCanSeeFinancials(): boolean {
  const { user } = useAuth();
  if (!user) return false;
  if (user.tier === 'admin' || user.tier === 'dev') return true;
  return !!user.isStartupManager;
}

/** Alias for clarity when the check is specifically about editing. */
export function useCanEditStartupProfile(): boolean {
  return useCanSeeFinancials();
}
