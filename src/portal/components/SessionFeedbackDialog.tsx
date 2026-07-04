import React, { useMemo, useState } from 'react';
import { Star } from 'lucide-react';
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
import { Checkbox } from '@/portal/components/ui/checkbox';

export interface FeedbackField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'rating';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  section?: string;
  tiers?: string[];
}

export interface CompletedMeeting {
  id: string;
  partnerName: string;
  partnerCompany: string;
  topic: string;
  date: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: CompletedMeeting;
  currentUserTier?: string;
  onSubmit?: (meetingId: string, responses: Record<string, string | number>) => void;
}

const DEFAULT_FEEDBACK_FIELDS: FeedbackField[] = [
  { id: 'rating', label: 'Overall Rating', type: 'rating', required: true },
  { id: 'takeaways', label: 'Key Takeaways', type: 'textarea', required: true, placeholder: 'What were the main insights?' },
  { id: 'actions', label: 'Action Items', type: 'textarea', required: false, placeholder: 'Any follow-up actions?' },
  { id: 'meet_again', label: 'Would you meet again?', type: 'select', required: true, options: ['Yes', 'No', 'Maybe'] },
];

function readFeedbackFields(currentUserTier?: string): FeedbackField[] {
  try {
    const raw = localStorage.getItem('gcio_session_form_config');
    if (!raw) return DEFAULT_FEEDBACK_FIELDS;
    const config = JSON.parse(raw) as FeedbackField[];
    const fields = config.filter(
      (f) =>
        f.section === 'feedback' &&
        (!f.tiers || !currentUserTier || f.tiers.includes(currentUserTier))
    );
    return fields.length > 0 ? fields : DEFAULT_FEEDBACK_FIELDS;
  } catch {
    return DEFAULT_FEEDBACK_FIELDS;
  }
}

export const Stars: React.FC<{
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
}> = ({ value, size = 20, interactive = false, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => {
      const filled = star <= value;
      const cls = filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300';
      return interactive ? (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className="focus:outline-none"
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star size={size} className={cls} />
        </button>
      ) : (
        <Star key={star} size={size} className={cls} />
      );
    })}
  </div>
);

const SessionFeedbackDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  meeting,
  currentUserTier,
  onSubmit,
}) => {
  const fields = useMemo(() => readFeedbackFields(currentUserTier), [currentUserTier]);
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [issueChecked, setIssueChecked] = useState(false);
  const [issueText, setIssueText] = useState('');

  const setValue = (id: string, val: string | number) =>
    setResponses((prev) => ({ ...prev, [id]: val }));

  const handleSubmit = () => {
    const missing = fields.filter((f) => f.required && !responses[f.id]);
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }
    const payload = { ...responses, ...(issueChecked ? { _issue: issueText } : {}) };
    console.log('Session feedback submitted:', { meetingId: meeting.id, payload });
    onSubmit?.(meeting.id, payload);
    toast.success('Feedback submitted!');
    onOpenChange(false);
  };

  const formattedDate = new Date(meeting.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Session Feedback</DialogTitle>
        </DialogHeader>

        <div className="rounded-md bg-navy-50 border border-navy-100 p-3 text-sm space-y-0.5">
          <p className="font-semibold text-navy-900">{meeting.partnerName} &middot; {meeting.partnerCompany}</p>
          <p className="text-gray-600">{meeting.topic}</p>
          <p className="text-gray-500 text-xs">{formattedDate}</p>
        </div>

        <div className="space-y-4 mt-2">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </Label>

              {field.type === 'text' && (
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(responses[field.id] as string) ?? ''}
                  onChange={(e) => setValue(field.id, e.target.value)}
                />
              )}

              {field.type === 'textarea' && (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={(responses[field.id] as string) ?? ''}
                  onChange={(e) => setValue(field.id, e.target.value)}
                  rows={3}
                />
              )}

              {field.type === 'select' && field.options && (
                <Select
                  value={(responses[field.id] as string) ?? ''}
                  onValueChange={(val) => setValue(field.id, val)}
                >
                  <SelectTrigger id={field.id}>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === 'rating' && (
                <Stars
                  value={(responses[field.id] as number) ?? 0}
                  size={24}
                  interactive
                  onChange={(val) => setValue(field.id, val)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="issue-toggle"
              checked={issueChecked}
              onCheckedChange={(checked) => setIssueChecked(!!checked)}
            />
            <Label htmlFor="issue-toggle" className="text-sm text-gray-600 cursor-pointer">
              Something went wrong?
            </Label>
          </div>
          {issueChecked && (
            <Textarea
              placeholder="Describe the issue..."
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              rows={3}
            />
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSubmit} className="bg-navy-600 hover:bg-navy-700 text-white">
            Submit Feedback
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionFeedbackDialog;
