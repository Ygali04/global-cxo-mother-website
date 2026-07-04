import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/portal/components/ui/dialog";
import { Button } from "@/portal/components/ui/button";
import { Input } from "@/portal/components/ui/input";
import { Textarea } from "@/portal/components/ui/textarea";
import { Label } from "@/portal/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/portal/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/portal/components/ui/select";

export interface Partner {
  id: string;
  name: string;
  company: string;
  role: string;
  tier: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  tier: string;
}

interface AgendaFieldOption {
  value: string;
  label: string;
}

interface AgendaField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: AgendaFieldOption[];
  section: string;
  tiers: string[];
}

interface SessionInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: CurrentUser;
  partners: Partner[];
}

const ALL_TIERS = ["cxo", "startup", "admin"];

const DEFAULT_AGENDA_FIELDS: AgendaField[] = [
  {
    id: "topics",
    label: "Discussion Topics",
    type: "textarea",
    required: true,
    placeholder: "What would you like to discuss?",
    section: "agenda",
    tiers: ALL_TIERS,
  },
  {
    id: "prep",
    label: "Preparation Notes",
    type: "textarea",
    required: false,
    placeholder: "Any materials to review beforehand?",
    section: "agenda",
    tiers: ALL_TIERS,
  },
  {
    id: "outcomes",
    label: "Expected Outcomes",
    type: "textarea",
    required: true,
    placeholder: "What do you hope to achieve?",
    section: "agenda",
    tiers: ALL_TIERS,
  },
];

const MEETING_TYPES = [
  { value: "video", label: "Video" },
  { value: "phone", label: "Phone" },
  { value: "in-person", label: "In-Person" },
];

function loadAgendaFields(userTier: string): AgendaField[] {
  try {
    const raw = localStorage.getItem("gcio_session_form_config");
    if (!raw) return DEFAULT_AGENDA_FIELDS;
    const parsed: AgendaField[] = JSON.parse(raw);
    return parsed.filter(
      (f) => f.section === "agenda" && f.tiers.includes(userTier)
    );
  } catch {
    return DEFAULT_AGENDA_FIELDS;
  }
}

export function SessionInviteDialog({
  open,
  onOpenChange,
  currentUser,
  partners,
}: SessionInviteDialogProps) {
  const agendaFields = useMemo(
    () => loadAgendaFields(currentUser.tier),
    [currentUser.tier]
  );

  const [recipientId, setRecipientId] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingType, setMeetingType] = useState("video");
  const [agendaValues, setAgendaValues] = useState<Record<string, string>>({});

  function handleAgendaChange(fieldId: string, value: string) {
    setAgendaValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function validate(): string | null {
    if (!recipientId) return "Please select a recipient.";
    if (!preferredDate) return "Please select a preferred date.";
    if (!startTime) return "Please enter a start time.";
    for (const field of agendaFields) {
      if (field.required && !agendaValues[field.id]?.trim()) {
        return `"${field.label}" is required.`;
      }
    }
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    const recipient = partners.find((p) => p.id === recipientId);
    const inviteData = {
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      recipientId,
      recipientName: recipient?.name,
      preferredDate,
      timeRange: { start: startTime, end: endTime },
      meetingType,
      agenda: agendaValues,
    };

    console.log("[SessionInviteDialog] Session invite data:", inviteData);
    toast.success("Session request submitted successfully!");

    setRecipientId("");
    setPreferredDate("");
    setStartTime("");
    setEndTime("");
    setMeetingType("video");
    setAgendaValues({});
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="recipient">
              Recipient <span className="text-destructive">*</span>
            </Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger id="recipient">
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.company} ({p.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="preferred-date">
              Preferred Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="preferred-date"
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-time">
                Start Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Meeting Type</Label>
            <RadioGroup
              value={meetingType}
              onValueChange={setMeetingType}
              className="flex gap-4"
            >
              {MEETING_TYPES.map((t) => (
                <div key={t.value} className="flex items-center gap-1.5">
                  <RadioGroupItem value={t.value} id={`mt-${t.value}`} />
                  <Label htmlFor={`mt-${t.value}`} className="font-normal">
                    {t.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {agendaFields.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Agenda</p>
              {agendaFields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <Label htmlFor={`agenda-${field.id}`}>
                    {field.label}
                    {field.required && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>

                  {field.type === "textarea" && (
                    <Textarea
                      id={`agenda-${field.id}`}
                      placeholder={field.placeholder}
                      value={agendaValues[field.id] ?? ""}
                      onChange={(e) =>
                        handleAgendaChange(field.id, e.target.value)
                      }
                      rows={3}
                    />
                  )}

                  {field.type === "text" && (
                    <Input
                      id={`agenda-${field.id}`}
                      placeholder={field.placeholder}
                      value={agendaValues[field.id] ?? ""}
                      onChange={(e) =>
                        handleAgendaChange(field.id, e.target.value)
                      }
                    />
                  )}

                  {field.type === "select" && (
                    <Select
                      value={agendaValues[field.id] ?? ""}
                      onValueChange={(v) => handleAgendaChange(field.id, v)}
                    >
                      <SelectTrigger id={`agenda-${field.id}`}>
                        <SelectValue
                          placeholder={field.placeholder ?? "Select an option"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
