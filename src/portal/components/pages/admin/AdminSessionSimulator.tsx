import { useState } from "react";
import { Star, UserCheck, Rocket, Check, X, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/portal/components/ui/button";
import { Input } from "@/portal/components/ui/input";
import { Textarea } from "@/portal/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/portal/components/ui/select";
import { Label } from "@/portal/components/ui/label";


type SimStep = "select" | "invite" | "scheduled" | "feedback" | "mutual";
type Perspective = "cxo" | "startup" | null;

interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "rating";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  section?: string;
}

// Matches the shape saved by AdminSessionEditor
interface StoredSessionField extends FormField {
  section: "agenda" | "feedback";
  tiers: ("cxo" | "startup")[];
  required: boolean;
  isCore?: boolean;
}


const CXO_MOCK = { name: "Jane Rodriguez", company: "Acme Corp", role: "CXO" };
const STARTUP_MOCK = { name: "Alex Kim", company: "TechVenture AI", role: "CEO" };

// Keyed by field id — covers default fields; custom fields fall back to "—"
const MOCK_PARTNER_FEEDBACK: Record<string, string | number> = {
  rating: 4,
  takeaways: "Great insights on cloud migration strategy. Very actionable.",
  actions: "Schedule follow-up in 2 weeks to review progress.",
  meet_again: "Yes",
};

const MOCK_MEETING = {
  date: "Thursday, April 10, 2026",
  time: "2:00 PM – 3:00 PM ET",
  link: "https://meet.google.com/xyz-mock-abc",
};

// Pre-filled agenda shown to the Startup when receiving an invite
const MOCK_INVITE_AGENDA: Record<string, string> = {
  topic: "Cloud Migration Strategy",
  goals: "Discuss your infrastructure roadmap and identify where enterprise CXO experience can accelerate decisions.",
  duration: "60 minutes",
};


const DEFAULT_AGENDA_FIELDS: FormField[] = [
  { id: "topic", label: "Session Topic", type: "text", placeholder: "e.g. Cloud Migration Strategy" },
  { id: "goals", label: "Goals for this session", type: "textarea", placeholder: "What do you hope to accomplish?" },
  { id: "duration", label: "Duration", type: "select", options: ["30 minutes", "45 minutes", "60 minutes", "90 minutes"] },
];

const DEFAULT_FEEDBACK_FIELDS: FormField[] = [
  { id: "rating", label: "Session Rating", type: "rating" },
  { id: "takeaways", label: "Key Takeaways", type: "textarea", placeholder: "What were the most valuable insights?" },
  { id: "actions", label: "Action Items", type: "textarea", placeholder: "What follow-up actions did you agree on?" },
  { id: "meet_again", label: "Would you meet again?", type: "select", options: ["Yes", "Maybe", "No"] },
];

interface SplitConfig {
  agendaFields: FormField[];
  feedbackFields: FormField[];
}

// Reads the flat SessionFormField[] saved by AdminSessionEditor and splits by section.
function loadSessionFormConfig(): SplitConfig | null {
  try {
    const raw = localStorage.getItem("gcio_session_form_config");
    if (!raw) return null;
    const all = JSON.parse(raw) as StoredSessionField[];
    if (!Array.isArray(all) || all.length === 0) return null;
    return {
      agendaFields: all.filter((f) => f.section === "agenda"),
      feedbackFields: all.filter((f) => f.section === "feedback"),
    };
  } catch { /* ignore */ }
  return null;
}


interface StarRatingProps {
  value: number;
  onChange: (v: number) => void;
}

function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="focus:outline-none"
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              n <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

interface DynamicFieldProps {
  field: FormField;
  value: string | number;
  onChange: (id: string, val: string | number) => void;
}

function DynamicField({ field, value, onChange }: DynamicFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.id}>{field.label}</Label>
      {field.type === "text" && (
        <Input
          id={field.id}
          placeholder={field.placeholder}
          value={value as string}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}
      {field.type === "textarea" && (
        <Textarea
          id={field.id}
          placeholder={field.placeholder}
          value={value as string}
          rows={3}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      )}
      {field.type === "select" && (
        <Select
          value={value as string}
          onValueChange={(v) => onChange(field.id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {field.type === "rating" && (
        <StarRating
          value={value as number}
          onChange={(v) => onChange(field.id, v)}
        />
      )}
    </div>
  );
}

export default function AdminSessionSimulator() {
  const [step, setStep] = useState<SimStep>("select");
  const [perspective, setPerspective] = useState<Perspective>(null);
  const [agendaValues, setAgendaValues] = useState<Record<string, string | number>>({});
  const [feedbackValues, setFeedbackValues] = useState<Record<string, string | number>>({});

  // Load once on mount; falls back to defaults if nothing is stored yet.
  const [config] = useState(() => loadSessionFormConfig());
  const agendaFields = config?.agendaFields.length ? config.agendaFields : DEFAULT_AGENDA_FIELDS;
  const feedbackFields = config?.feedbackFields.length ? config.feedbackFields : DEFAULT_FEEDBACK_FIELDS;

  const partner = perspective === "cxo" ? STARTUP_MOCK : CXO_MOCK;
  const self = perspective === "cxo" ? CXO_MOCK : STARTUP_MOCK;

  function handleAgendaChange(id: string, val: string | number) {
    setAgendaValues((prev) => ({ ...prev, [id]: val }));
  }

  function handleFeedbackChange(id: string, val: string | number) {
    setFeedbackValues((prev) => ({ ...prev, [id]: val }));
  }

  function selectPerspective(p: Perspective) {
    setPerspective(p);
    setStep("invite");
  }

  function handleSendInvite() {
    toast.success("Invite sent to " + partner.name + "!");
    setStep("scheduled");
  }

  function handleAcceptInvite() {
    toast.success("Session accepted!");
    setStep("scheduled");
  }

  function handleDeclineInvite() {
    toast("Invite declined.", { description: "In a real flow the CXO would be notified." });
    setStep("select");
    setPerspective(null);
  }

  function handleSubmitFeedback() {
    toast.success("Feedback submitted!");
    setStep("mutual");
  }

  function handleRestart() {
    setStep("select");
    setPerspective(null);
    setAgendaValues({});
    setFeedbackValues({});
  }

  if (step === "select") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-2">
            Session Invite Simulator
          </h2>
          <p className="text-slate-500 text-center mb-6 text-sm">
            Choose a perspective to walk through the full session lifecycle.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => selectPerspective("cxo")}
              className="border border-amber-200 hover:border-amber-400 hover:shadow-lg rounded-xl p-6 text-left transition-all cursor-pointer bg-white"
            >
              <UserCheck className="h-8 w-8 text-amber-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-900">Experience as CXO</h3>
              <p className="mt-1 text-sm text-slate-500">
                Create and send a session invite to a startup partner.
              </p>
            </button>
            <button
              onClick={() => selectPerspective("startup")}
              className="border border-cyan-200 hover:border-cyan-400 hover:shadow-lg rounded-xl p-6 text-left transition-all cursor-pointer bg-white"
            >
              <Rocket className="h-8 w-8 text-cyan-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-900">Experience as Startup</h3>
              <p className="mt-1 text-sm text-slate-500">
                Receive and respond to a session invite from a CXO.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "invite") {
    if (perspective === "cxo") {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="h-6 w-6 text-amber-600" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">You ({self.name}, {self.role})</p>
                <h2 className="text-lg font-semibold text-slate-900">Create Session Invite</h2>
              </div>
            </div>
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
              Sending to: <strong>{partner.name}</strong> — {partner.role} at {partner.company}
            </div>
            <div className="space-y-4">
              {agendaFields.map((field) => (
                <DynamicField
                  key={field.id}
                  field={field}
                  value={agendaValues[field.id] ?? ""}
                  onChange={handleAgendaChange}
                />
              ))}
            </div>
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleRestart}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={handleSendInvite}>
                Send Invite <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="h-6 w-6 text-cyan-600" />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">You ({self.name}, {self.role})</p>
              <h2 className="text-lg font-semibold text-slate-900">Session Invite Received</h2>
            </div>
          </div>
          <div className="mb-4 rounded-lg bg-cyan-50 border border-cyan-100 px-4 py-3 text-sm text-cyan-800">
            From: <strong>{partner.name}</strong> — {partner.role} at {partner.company}
          </div>
          <div className="space-y-4">
            {agendaFields.map((field) => (
              <div key={field.id} className="space-y-1">
                <Label>{field.label}</Label>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                  {MOCK_INVITE_AGENDA[field.id] ?? "—"}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleRestart}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeclineInvite}>
                <X className="h-4 w-4 mr-1" /> Decline
              </Button>
              <Button onClick={handleAcceptInvite}>
                <Check className="h-4 w-4 mr-1" /> Accept
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "scheduled") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
            <Check className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Meeting Scheduled!</h2>
          <p className="text-slate-500 text-sm mb-6">Both parties will receive calendar invites.</p>
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Participants</span>
              <span className="font-medium text-slate-800">{CXO_MOCK.name} &amp; {STARTUP_MOCK.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-slate-800">{MOCK_MEETING.date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Time</span>
              <span className="font-medium text-slate-800">{MOCK_MEETING.time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Link</span>
              <span className="font-medium text-blue-600 truncate ml-4">{MOCK_MEETING.link}</span>
            </div>
          </div>
          <Button className="w-full" onClick={() => setStep("feedback")}>
            Continue to Post-Meeting Feedback <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === "feedback") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Post-Meeting Feedback</h2>
          <p className="text-sm text-slate-500 mb-6">
            Session with {partner.name} — {MOCK_MEETING.date}
          </p>
          <div className="space-y-4">
            {feedbackFields.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={feedbackValues[field.id] ?? (field.type === "rating" ? 0 : "")}
                onChange={handleFeedbackChange}
              />
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setStep("scheduled")}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button onClick={handleSubmitFeedback}>
              Submit Feedback <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // step === "mutual"
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Mutual Feedback</h2>
        <p className="text-slate-500 text-center text-sm mb-6">Both parties' feedback side-by-side.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Your feedback */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Your feedback</p>
            <p className="text-sm font-medium text-slate-800 mb-4">{self.name} ({self.role})</p>
            <div className="space-y-3">
              {feedbackFields.map((field) => {
                const val = feedbackValues[field.id];
                return (
                  <div key={field.id} className="text-sm">
                    <p className="text-slate-500 text-xs mb-0.5">{field.label}</p>
                    {field.type === "rating" ? (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-4 w-4 ${n <= (val as number) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-800">{val as string || "—"}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Partner's feedback</p>
            <p className="text-sm font-medium text-slate-800 mb-4">{partner.name} ({partner.role})</p>
            <div className="space-y-3">
              {feedbackFields.map((field) => {
                const val = MOCK_PARTNER_FEEDBACK[field.id];
                return (
                  <div key={field.id} className="text-sm">
                    <p className="text-slate-500 text-xs mb-0.5">{field.label}</p>
                    {field.type === "rating" ? (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-4 w-4 ${n <= (val as number) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-800">{(val as string) || "—"}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <Button onClick={handleRestart}>
            Restart Simulation
          </Button>
        </div>
      </div>
    </div>
  );
}
