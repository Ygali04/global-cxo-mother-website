import type { JSX } from 'react';
import { useState, useEffect, useCallback } from "react";
import { useFormSchema, useUpdateFormSchema } from "@/portal/hooks/useAdminConfig";
import { Button } from "@/portal/components/ui/button";
import { Input } from "@/portal/components/ui/input";
import { Switch } from "@/portal/components/ui/switch";
import { Badge } from "@/portal/components/ui/badge";
import { Checkbox } from "@/portal/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/portal/components/ui/dialog";
import {
  Lock,
  Pencil,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";

interface SessionFormField {
  id: string;
  label: string;
  type: "text" | "select" | "textarea" | "rating";
  required: boolean;
  tiers: ("cxo" | "startup")[];
  placeholder?: string;
  options?: string[];
  isCore?: boolean;
  section: "agenda" | "feedback";
}

const STORAGE_KEY = "gcio_session_form_config";

const uid = () => crypto.randomUUID();

const DEFAULT_FIELDS: SessionFormField[] = [
  // Agenda fields
  {
    id: uid(),
    label: "Discussion Topics",
    type: "textarea",
    required: true,
    tiers: ["cxo", "startup"],
    section: "agenda",
    isCore: true,
  },
  {
    id: uid(),
    label: "Preparation Notes",
    type: "textarea",
    required: false,
    tiers: ["cxo", "startup"],
    section: "agenda",
  },
  {
    id: uid(),
    label: "Expected Outcomes",
    type: "textarea",
    required: true,
    tiers: ["cxo", "startup"],
    section: "agenda",
  },
  // Feedback fields
  {
    id: uid(),
    label: "Rating",
    type: "select",
    required: true,
    tiers: ["cxo", "startup"],
    section: "feedback",
    options: ["1", "2", "3", "4", "5"],
    isCore: true,
  },
  {
    id: uid(),
    label: "Key Takeaways",
    type: "textarea",
    required: true,
    tiers: ["cxo", "startup"],
    section: "feedback",
  },
  {
    id: uid(),
    label: "Action Items",
    type: "textarea",
    required: false,
    tiers: ["cxo", "startup"],
    section: "feedback",
  },
  {
    id: uid(),
    label: "Would you meet again?",
    type: "select",
    required: true,
    tiers: ["cxo", "startup"],
    section: "feedback",
    options: ["Yes", "No", "Maybe"],
  },
];

function loadFields(): SessionFormField[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SessionFormField[];
  } catch {
    // ignore
  }
  return DEFAULT_FIELDS;
}

function saveFields(fields: SessionFormField[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
}

const TIER_LIST: ("cxo" | "startup")[] = ["cxo", "startup"];

const TIER_LABELS: Record<string, string> = { cxo: "CxO", startup: "Startup" };

const TIER_COLORS: Record<string, string> = {
  cxo: "bg-amber-100 text-amber-800 border-amber-300",
  startup: "bg-cyan-100 text-cyan-800 border-cyan-300",
};

const TIER_INACTIVE = "bg-gray-100 text-gray-400 border-gray-200";

const TYPE_BADGE: Record<string, string> = {
  text: "bg-blue-100 text-blue-700",
  select: "bg-purple-100 text-purple-700",
  textarea: "bg-orange-100 text-orange-700",
};

function AddFieldDialog({
  section,
  onAdd,
}: {
  section: "agenda" | "feedback";
  onAdd: (f: SessionFormField) => void;
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<SessionFormField["type"]>("text");
  const [required, setRequired] = useState(false);
  const [tiers, setTiers] = useState<SessionFormField["tiers"]>(["cxo", "startup"]);
  const [optionsStr, setOptionsStr] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  const reset = () => {
    setLabel("");
    setType("text");
    setRequired(false);
    setTiers(["cxo", "startup"]);
    setOptionsStr("");
    setPlaceholder("");
  };

  const toggleTier = (t: "cxo" | "startup") => {
    setTiers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleSubmit = () => {
    if (!label.trim()) return;
    const field: SessionFormField = {
      id: uid(),
      label: label.trim(),
      type,
      required,
      tiers,
      section,
      placeholder: placeholder.trim() || undefined,
      options:
        type === "select"
          ? optionsStr
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
    };
    onAdd(field);
    reset();
    setOpen(false);
  };

  const sectionLabel = section === "agenda" ? "Agenda" : "Feedback";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add Field
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add {sectionLabel} Field</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Field label"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as SessionFormField["type"])}
            >
              <option value="text">Text</option>
              <option value="select">Select</option>
              <option value="textarea">Textarea</option>
            </select>
          </div>

          {type === "select" && (
            <div>
              <label className="text-sm font-medium">Options (comma-separated)</label>
              <Input
                value={optionsStr}
                onChange={(e) => setOptionsStr(e.target.value)}
                placeholder="Option 1, Option 2, ..."
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Placeholder (optional)</label>
            <Input
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Placeholder text"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={required}
              onCheckedChange={(v) => setRequired(v === true)}
              id="add-required"
            />
            <label htmlFor="add-required" className="text-sm">
              Required
            </label>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tier Applicability</label>
            <div className="flex gap-2">
              {TIER_LIST.map((t) => (
                <label key={t} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={tiers.includes(t)}
                    onCheckedChange={() => toggleTier(t)}
                  />
                  {TIER_LABELS[t]}
                </label>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!label.trim()}
          >
            Add Field
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldCard({
  field,
  index,
  total,
  onUpdate,
  onDelete,
  onMove,
}: {
  field: SessionFormField;
  index: number;
  total: number;
  onUpdate: (id: string, patch: Partial<SessionFormField>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draftLabel, setDraftLabel] = useState(field.label);
  const [draftType, setDraftType] = useState(field.type);
  const [draftPlaceholder, setDraftPlaceholder] = useState(field.placeholder ?? "");
  const [draftOptions, setDraftOptions] = useState((field.options ?? []).join(", "));

  const toggleTier = (t: "cxo" | "startup") => {
    const next = field.tiers.includes(t)
      ? field.tiers.filter((x) => x !== t)
      : [...field.tiers, t];
    onUpdate(field.id, { tiers: next });
  };

  const saveEdits = () => {
    const patch: Partial<SessionFormField> = {};
    if (draftLabel.trim() && draftLabel.trim() !== field.label)
      patch.label = draftLabel.trim();
    if (draftType !== field.type) patch.type = draftType;
    if (draftPlaceholder.trim() !== (field.placeholder ?? ""))
      patch.placeholder = draftPlaceholder.trim() || undefined;
    if (draftType === "select") {
      patch.options = draftOptions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (Object.keys(patch).length > 0) onUpdate(field.id, patch);
    setExpanded(false);
  };

  const cancelEdits = () => {
    setDraftLabel(field.label);
    setDraftType(field.type);
    setDraftPlaceholder(field.placeholder ?? "");
    setDraftOptions((field.options ?? []).join(", "));
    setExpanded(false);
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-2 ${
        field.isCore ? "bg-slate-50" : "bg-white"
      } hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5 text-gray-400">
          {field.isCore ? (
            <Lock className="h-4 w-4" />
          ) : (
            <GripVertical className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{field.label}</span>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${TYPE_BADGE[field.type]}`}
            >
              {field.type}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-gray-400 hover:text-blue-600"
              onClick={() => setExpanded(!expanded)}
              title="Edit field"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {TIER_LIST.map((t) => {
              const active = field.tiers.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTier(t)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                    active ? TIER_COLORS[t] : TIER_INACTIVE
                  }`}
                >
                  {TIER_LABELS[t]}
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
              <span>Required</span>
              <Switch
                checked={field.required}
                onCheckedChange={(v) => onUpdate(field.id, { required: v })}
                className="scale-75"
              />
            </div>
          </div>

          {expanded && (
            <div className="mt-3 pt-3 border-t space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Label</label>
                  <Input
                    className="h-8 text-sm mt-1"
                    value={draftLabel}
                    onChange={(e) => setDraftLabel(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Type</label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm mt-1"
                    value={draftType}
                    onChange={(e) =>
                      setDraftType(e.target.value as SessionFormField["type"])
                    }
                    disabled={field.isCore}
                  >
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="textarea">Textarea</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Placeholder</label>
                <Input
                  className="h-8 text-sm mt-1"
                  value={draftPlaceholder}
                  onChange={(e) => setDraftPlaceholder(e.target.value)}
                  placeholder="Optional placeholder text"
                />
              </div>
              {draftType === "select" && (
                <div>
                  <label className="text-xs font-medium text-gray-500">
                    Options (comma-separated)
                  </label>
                  <Input
                    className="h-8 text-sm mt-1"
                    value={draftOptions}
                    onChange={(e) => setDraftOptions(e.target.value)}
                    placeholder="Option 1, Option 2, ..."
                  />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={cancelEdits}
                >
                  Cancel
                </Button>
                <Button size="sm" className="h-7 text-xs" onClick={saveEdits}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={index === 0}
            onClick={() => onMove(field.id, "up")}
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            disabled={index === total - 1}
            onClick={() => onMove(field.id, "down")}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          {!field.isCore && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-500 hover:text-red-700"
              onClick={() => onDelete(field.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionFieldList({
  title,
  section,
  fields,
  onUpdate,
  onDelete,
  onMove,
  onAdd,
}: {
  title: string;
  section: "agenda" | "feedback";
  fields: SessionFormField[];
  onUpdate: (id: string, patch: Partial<SessionFormField>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onAdd: (f: SessionFormField) => void;
}) {
  const sectionFields = fields.filter((f) => f.section === section);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <AddFieldDialog section={section} onAdd={onAdd} />
      </div>
      <div>
        {sectionFields.map((f, i) => (
          <FieldCard
            key={f.id}
            field={f}
            index={i}
            total={sectionFields.length}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
        {sectionFields.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No fields configured. Add a field to get started.
          </p>
        )}
      </div>
    </div>
  );
}

function PreviewSection({
  title,
  fields,
  tier,
}: {
  title: string;
  fields: SessionFormField[];
  tier: "cxo" | "startup";
}) {
  const visible = fields.filter((f) => f.tiers.includes(tier));

  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">
        {title}
      </h4>
      <div className="space-y-4">
        {visible.map((f) => (
          <div key={f.id}>
            <label className="block text-sm text-white/70 mb-1">
              {f.label}
              {f.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {f.type === "textarea" ? (
              <div className="w-full h-20 rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm text-white/40">
                {f.placeholder || f.label}
              </div>
            ) : f.type === "select" ? (
              <div className="w-full h-10 rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm text-white/40 flex items-center justify-between">
                <span>{f.options?.[0] || "Select..."}</span>
                <svg
                  className="h-4 w-4 text-white/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-full h-10 rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm text-white/40 flex items-center">
                {f.placeholder || f.label}
              </div>
            )}
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-white/40 text-sm text-center py-4">
            No fields for this tier.
          </p>
        )}
      </div>
    </div>
  );
}

function LivePreview({
  fields,
  tier,
  onTierChange,
}: {
  fields: SessionFormField[];
  tier: "cxo" | "startup";
  onTierChange: (t: "cxo" | "startup") => void;
}) {
  const agendaFields = fields.filter((f) => f.section === "agenda");
  const feedbackFields = fields.filter((f) => f.section === "feedback");

  return (
    <div className="bg-[#0a1628] rounded-xl p-6 text-white min-h-[500px]">
      {/* Tier selector */}
      <div className="flex gap-2 mb-6">
        {(["cxo", "startup"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTierChange(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tier === t
                ? "bg-white/20 text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            {TIER_LABELS[t]}
          </button>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-5">
        Session Forms Preview ({TIER_LABELS[tier]})
      </h3>

      <PreviewSection
        title="Session Invite — Agenda"
        fields={agendaFields}
        tier={tier}
      />

      <div className="border-t border-white/10 my-4" />

      <PreviewSection
        title="Post-Session Feedback"
        fields={feedbackFields}
        tier={tier}
      />
    </div>
  );
}

export default function AdminSessionEditor(): JSX.Element {
  const { data: schemaResponse } = useFormSchema("session_forms");
  const updateSchemaApi = useUpdateFormSchema("session_forms");
  const [fields, setFields] = useState<SessionFormField[]>(loadFields);
  const [previewTier, setPreviewTier] = useState<"cxo" | "startup">("cxo");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (schemaResponse && !initialized) {
      const apiFields = schemaResponse.schema_data?.fields as SessionFormField[] | undefined;
      if (apiFields && apiFields.length > 0) {
        setFields(apiFields);
      }
      setInitialized(true);
    }
  }, [schemaResponse, initialized]);

  useEffect(() => {
    saveFields(fields);
    if (initialized) {
      updateSchemaApi.mutate({ fields });
    }
  }, [fields]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback((id: string, patch: Partial<SessionFormField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const deleteField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const moveField = useCallback((id: string, dir: "up" | "down") => {
    setFields((prev) => {
      const sectionId = prev.find((f) => f.id === id)?.section;
      if (!sectionId) return prev;

      const sectionFields = prev.filter((f) => f.section === sectionId);
      const idx = sectionFields.findIndex((f) => f.id === id);
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sectionFields.length) return prev;

      const next = [...prev];
      const aIdx = next.findIndex((f) => f.id === id);
      const bIdx = next.findIndex((f) => f.id === sectionFields[swapIdx].id);
      [next[aIdx], next[bIdx]] = [next[bIdx], next[aIdx]];
      return next;
    });
  }, []);

  const addField = useCallback((f: SessionFormField) => {
    setFields((prev) => [...prev, f]);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column — Field List */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-lg font-semibold mb-5">Session Form Fields</h2>

        <SectionFieldList
          title="Agenda Fields"
          section="agenda"
          fields={fields}
          onUpdate={updateField}
          onDelete={deleteField}
          onMove={moveField}
          onAdd={addField}
        />

        <div className="border-t my-4" />

        <SectionFieldList
          title="Feedback Form Fields"
          section="feedback"
          fields={fields}
          onUpdate={updateField}
          onDelete={deleteField}
          onMove={moveField}
          onAdd={addField}
        />
      </div>

      {/* Right column — Live Preview */}
      <div>
        <LivePreview
          fields={fields}
          tier={previewTier}
          onTierChange={setPreviewTier}
        />
      </div>
    </div>
  );
}
