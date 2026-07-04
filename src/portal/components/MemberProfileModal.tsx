/**
 * MemberProfileModal — minimal profile view for circle members.
 * Data comes directly from the partner object (MyProgramPartner).
 */

import { ExternalLink } from 'lucide-react';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/portal/components/ui/dialog';
import type { MyProgramPartner } from '@/portal/api/types';

interface MemberProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: MyProgramPartner | null;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Unknown';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function MemberProfileModal({
  open,
  onOpenChange,
  partner,
}: MemberProfileModalProps) {
  if (!partner) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Member Profile</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500 py-4">Profile not available.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const tierLabel = partner.role === 'cxo' ? 'CxO' : partner.role === 'vc' ? 'VC' : 'Startup';
  const tierColor = partner.role === 'cxo'
    ? 'bg-amber-100 text-amber-700'
    : partner.role === 'startup'
      ? 'bg-cyan-100 text-cyan-700'
      : 'bg-emerald-100 text-emerald-700';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {partner.avatar_url ? (
              <img src={partner.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-100 text-navy-700 font-semibold text-lg">
                {partner.name?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <span className="text-lg">{partner.name}</span>
              <Badge className={`ml-2 text-[10px] ${tierColor}`}>{tierLabel}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            {partner.user_role && (
              <div className="flex gap-2 text-sm">
                <span className="text-slate-400 w-24 shrink-0">Role</span>
                <span className="text-slate-700">{partner.user_role}</span>
              </div>
            )}
            {partner.company && (
              <div className="flex gap-2 text-sm">
                <span className="text-slate-400 w-24 shrink-0">Company</span>
                <span className="text-slate-700">{partner.company}</span>
              </div>
            )}
          </div>

          {partner.linkedin && (
            <div>
              <a
                href={partner.linkedin.startsWith('http') ? partner.linkedin : `https://${partner.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                LinkedIn Profile
              </a>
            </div>
          )}

          {partner.about_me && partner.about_me.length > 5 && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">About</p>
              <p className="text-sm text-slate-600 leading-relaxed">{partner.about_me}</p>
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-xs text-slate-400">
              Joined GCXO {formatDate(partner.created_at)}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
