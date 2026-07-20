/**
 * BookSessionModal — embeds a Cal.com booking page in a dialog.
 *
 * Shows the partner's Cal.com availability calendar so the user can
 * pick a time slot and book directly without leaving GCXO. Uses an
 * iframe pointed at the Cal.com booking page with prefilled attendee
 * data via query params.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/portal/components/ui/dialog';
import { CALCOM_IFRAME_SRC } from '@/portal/api/config';

interface BookSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calcomUsername: string;
  attendeeName?: string;
  attendeeEmail?: string;
  eventTypeSlug?: string;
  onBookingConfirmed?: () => void;
}

export default function BookSessionModal({
  open,
  onOpenChange,
  calcomUsername,
  attendeeName,
  attendeeEmail,
  eventTypeSlug,
  onBookingConfirmed,
}: BookSessionModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  const bookingUrl = (() => {
    const slug = eventTypeSlug || '';
    const base = `${CALCOM_IFRAME_SRC}/${calcomUsername}${slug ? `/${slug}` : ''}`;
    const params = new URLSearchParams();
    if (attendeeName) params.set('name', attendeeName);
    if (attendeeEmail) params.set('email', attendeeEmail);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  })();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (typeof event.data !== 'object' || !event.data) return;
      const { type } = event.data;
      if (type === 'bookingSuccessful' || type === '__bookingSuccessful') {
        onBookingConfirmed?.();
        onOpenChange(false);
      }
    },
    [onBookingConfirmed, onOpenChange],
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [open, handleMessage]);

  useEffect(() => {
    if (open) setLoading(true);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Book a Session with {attendeeName || calcomUsername}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full" style={{ height: '600px' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-sm text-slate-500">Loading calendar...</span>
            </div>
          )}
          {open && (
            <iframe
              ref={iframeRef}
              src={bookingUrl}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              allow="camera; microphone"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
