import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/portal/components/ui/dialog';
import { Stars } from '@/portal/components/SessionFeedbackDialog';

export interface PartnerFeedback {
  partnerName: string;
  responses: Record<string, string | number>;
  fieldLabels?: Record<string, string>;
  ratingFields?: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: PartnerFeedback;
}

const FeedbackViewDialog: React.FC<Props> = ({ open, onOpenChange, feedback }) => {
  const ratingFields = new Set(feedback.ratingFields ?? ['rating']);
  const entries = Object.entries(feedback.responses).filter(([key]) => !key.startsWith('_'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Feedback from {feedback.partnerName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {entries.map(([key, value]) => {
            const label = feedback.fieldLabels?.[key] ?? key.replace(/_/g, ' ');
            const isRating = ratingFields.has(key);

            return (
              <div key={key} className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                {isRating && typeof value === 'number' ? (
                  <Stars value={value} />
                ) : (
                  <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-800 leading-relaxed">
                    {String(value)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackViewDialog;
