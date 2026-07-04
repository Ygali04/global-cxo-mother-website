import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/portal/components/ui/dialog';
import { Button } from '@/portal/components/ui/button';
import { Input } from '@/portal/components/ui/input';
import { Textarea } from '@/portal/components/ui/textarea';
import { Label } from '@/portal/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/portal/components/ui/select';
import { useCreateTimeShareRequest } from '@/portal/hooks/useTimeshare';

export interface TimeShareRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  currentUser: { id: string; tier: string; name: string };
  availablePartners: Array<{ id: string; name: string; company: string; tier: string }>;
  /** Hours already used by this startup (for cost estimation). Defaults to 0. */
  hoursAlreadyUsed?: number;
}

export function TimeShareRequestDialog({
  open,
  onOpenChange,
  programId,
  currentUser,
  availablePartners,
  hoursAlreadyUsed = 0,
}: TimeShareRequestDialogProps) {
  const [recipientId, setRecipientId] = useState('');
  const [search, setSearch] = useState('');
  const [hoursRequested, setHoursRequested] = useState(4);
  const [message, setMessage] = useState('');

  const createRequest = useCreateTimeShareRequest();

  // CXOs see startups, startups see CXOs
  const filteredPartners = useMemo(() => {
    const roleFilter = currentUser.tier === 'cxo' ? 'startup' : 'cxo';
    return availablePartners.filter(
      (p) =>
        p.tier === roleFilter &&
        (p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.company.toLowerCase().includes(search.toLowerCase())),
    );
  }, [availablePartners, currentUser.tier, search]);

  function reset() {
    setRecipientId('');
    setSearch('');
    setHoursRequested(4);
    setMessage('');
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientId) {
      toast.error('Please select a partner.');
      return;
    }
    if (hoursRequested < 1) {
      toast.error('Hours must be at least 1.');
      return;
    }
    try {
      await createRequest.mutateAsync({
        program_id: programId,
        recipient_id: recipientId,
        request_type: 'time_share',
        hours_requested: hoursRequested,
        message: message.trim() || undefined,
      });
      toast.success('Time-share request sent!');
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send request');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Time-Share</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
          {/* Search + partner select */}
          <div className="space-y-2">
            <Label>Search Partners</Label>
            <Input
              placeholder="Filter by name or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ts-partner">
              Partner <span className="text-destructive">*</span>
            </Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger id="ts-partner">
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent>
                {filteredPartners.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No partners found</div>
                ) : (
                  filteredPartners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.company}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Hours */}
          <div className="space-y-2">
            <Label htmlFor="ts-hours">
              Hours Requested <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ts-hours"
              type="number"
              min={1}
              max={40}
              value={hoursRequested}
              onChange={(e) => setHoursRequested(Number(e.target.value))}
            />
          </div>

          {/* Estimated cost — startup-only */}
          {currentUser.tier === 'startup' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Estimated Cost
              </p>
              {(() => {
                const INCLUDED_HOURS = 10;
                const MIN_RATE = 500;
                const MAX_RATE = 2000;
                const freeRemaining = Math.max(INCLUDED_HOURS - hoursAlreadyUsed, 0);
                const freeForThis = Math.min(hoursRequested, freeRemaining);
                const paidHours = Math.max(hoursRequested - freeForThis, 0);

                if (paidHours === 0) {
                  return (
                    <p className="text-sm text-green-700 font-medium">
                      $0 <span className="font-normal text-gray-500">(within included hours)</span>
                    </p>
                  );
                }
                return (
                  <div className="space-y-0.5">
                    {freeForThis > 0 && (
                      <p className="text-xs text-gray-500">
                        {freeForThis} hr{freeForThis !== 1 ? 's' : ''} covered by included hours
                      </p>
                    )}
                    <p className="text-sm text-amber-700 font-medium">
                      Estimated: ${(paidHours * MIN_RATE).toLocaleString()} – ${(paidHours * MAX_RATE).toLocaleString()}
                      <span className="font-normal text-gray-500">
                        {' '}({paidHours} hr{paidHours !== 1 ? 's' : ''} at ${MIN_RATE}–${MAX_RATE}/hr)
                      </span>
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="ts-message">Message (optional)</Label>
            <Textarea
              id="ts-message"
              rows={3}
              placeholder="Briefly describe what you'd like to work on..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRequest.isPending}>
              {createRequest.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TimeShareRequestDialog;
