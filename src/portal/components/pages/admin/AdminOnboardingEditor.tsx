import type { JSX } from 'react';
import { useState, useEffect, useCallback } from "react";
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
import { ONBOARDING_STORAGE_KEY } from "@/portal/types/onboarding";
import { useFormSchema, useUpdateFormSchema } from "@/portal/hooks/useAdminConfig";
import type { OnboardField } from "@/portal/types/onboarding";

const uid = () => crypto.randomUUID();

const DEFAULT_FIELDS: OnboardField[] = [
  { id: uid(), label: "First Name", type: "text", required: true, tiers: ["cxo", "startup", "vc"], isCore: true },
  { id: uid(), label: "Last Name", type: "text", required: false, tiers: ["cxo", "startup", "vc"], isCore: true },
  { id: uid(), label: "Password", type: "text", required: true, tiers: ["cxo", "startup", "vc"], isCore: true },
  { id: uid(), label: "LinkedIn URL", type: "text", required: false, tiers: ["startup", "vc"] },
  { id: uid(), label: "Company Name", type: "text", required: true, tiers: ["startup", "vc"] },
  { id: uid(), label: "Company Size", type: "select", required: false, tiers: ["startup", "vc"], options: ["1-10", "11-50", "51-200", "201-1000", "1000+"] },
  { id: uid(), label: "Title/Role", type: "text", required: false, tiers: ["cxo", "startup", "vc"] },
];

function loadFields(): OnboardField[] {
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as OnboardField[];
  } catch {
    // ignore
  }
  return DEFAULT_FIELDS;
}

function saveFields(fields: OnboardField[]) {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(fields));
}

const TIER_LIST: ("cxo" | "startup" | "vc")[] = ["cxo", "startup", "vc"];

const TIER_LABELS: Record<string, string> = { cxo: "CxO", startup: "Startup", vc: "VC" };

const TIER_COLORS: Record<string, string> = {
  cxo: "bg-amber-100 text-amber-800 border-amber-300",
  startup: "bg-cyan-100 text-cyan-800 border-cyan-300",
  vc: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const TIER_INACTIVE = "bg-gray-100 text-gray-400 border-gray-200";

const TYPE_BADGE: Record<string, string> = {
  text: "bg-blue-100 text-blue-700",
  select: "bg-purple-100 text-purple-700",
  textarea: "bg-orange-100 text-orange-700",
};

function AddFieldDialog({ onAdd }: { onAdd: (f: OnboardField) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<OnboardField["type"]>("text");
  const [required, setRequired] = useState(false);
  const [tiers, setTiers] = useState<OnboardField["tiers"]>(["cxo", "startup", "vc"]);
  const [optionsStr, setOptionsStr] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  const reset = () => {
    setLabel("");
    setType("text");
    setRequired(false);
    setTiers(["cxo", "startup", "vc"]);
    setOptionsStr("");
    setPlaceholder("");
  };

  const toggleTier = (t: "cxo" | "startup" | "vc") => {
    setTiers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const handleSubmit = () => {
    if (!label.trim()) return;
    const field: OnboardField = {
      id: uid(),
      label: label.trim(),
      type,
      required,
      tiers,
      placeholder: placeholder.trim() || undefined,
      options: type === "select" ? optionsStr.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
    };
    onAdd(field);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add Field
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Onboarding Field</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Label */}
          <div>
            <label className="text-sm font-medium">Label</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Field label" />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as OnboardField["type"])}
            >
              <option value="text">Text</option>
              <option value="select">Select</option>
              <option value="textarea">Textarea</option>
            </select>
          </div>

          {/* Options (select only) */}
          {type === "select" && (
            <div>
              <label className="text-sm font-medium">Options (comma-separated)</label>
              <Input value={optionsStr} onChange={(e) => setOptionsStr(e.target.value)} placeholder="Option 1, Option 2, ..." />
            </div>
          )}

          {/* Placeholder */}
          <div>
            <label className="text-sm font-medium">Placeholder (optional)</label>
            <Input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} placeholder="Placeholder text" />
          </div>

          {/* Required */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={required}
              onCheckedChange={(v) => setRequired(v === true)}
              id="add-required"
            />
            <label htmlFor="add-required" className="text-sm">Required</label>
          </div>

          {/* Tiers */}
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

          <Button className="w-full" onClick={handleSubmit} disabled={!label.trim()}>
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
  field: OnboardField;
  index: number;
  total: number;
  onUpdate: (id: string, patch: Partial<OnboardField>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draftLabel, setDraftLabel] = useState(field.label);
  const [draftType, setDraftType] = useState(field.type);
  const [draftPlaceholder, setDraftPlaceholder] = useState(field.placeholder ?? "");
  const [draftOptions, setDraftOptions] = useState((field.options ?? []).join(", "));

  const toggleTier = (t: "cxo" | "startup" | "vc") => {
    const next = field.tiers.includes(t)
      ? field.tiers.filter((x) => x !== t)
      : [...field.tiers, t];
    onUpdate(field.id, { tiers: next });
  };

  const saveEdits = () => {
    const patch: Partial<OnboardField> = {};
    if (draftLabel.trim() && draftLabel.trim() !== field.label) patch.label = draftLabel.trim();
    if (draftType !== field.type) patch.type = draftType;
    if (draftPlaceholder.trim() !== (field.placeholder ?? "")) patch.placeholder = draftPlaceholder.trim() || undefined;
    if (draftType === "select") {
      patch.options = draftOptions.split(",").map((s) => s.trim()).filter(Boolean);
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
      className={`border rounded-lg p-3 sm:p-4 mb-2 ${
        field.isCore ? "bg-slate-50" : "bg-white"
      } hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="pt-0.5 text-gray-400">
          {field.isCore ? <Lock className="h-4 w-4" /> : <GripVertical className="h-4 w-4" />}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{field.label}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TYPE_BADGE[field.type]}`}>
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
                  <Input className="h-8 text-sm mt-1" value={draftLabel} onChange={(e) => setDraftLabel(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Type</label>
                  <select
                    className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm mt-1"
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value as OnboardField["type"])}
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
                <Input className="h-8 text-sm mt-1" value={draftPlaceholder} onChange={(e) => setDraftPlaceholder(e.target.value)} placeholder="Optional placeholder text" />
              </div>
              {draftType === "select" && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Options (comma-separated)</label>
                  <Input className="h-8 text-sm mt-1" value={draftOptions} onChange={(e) => setDraftOptions(e.target.value)} placeholder="Option 1, Option 2, ..." />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={cancelEdits}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs" onClick={saveEdits}>Save</Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => onMove(field.id, "up")}>
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === total - 1} onClick={() => onMove(field.id, "down")}>
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          {!field.isCore && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={() => onDelete(field.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function LivePreview({
  fields,
  tier,
  onTierChange,
}: {
  fields: OnboardField[];
  tier: "cxo" | "startup" | "vc";
  onTierChange: (t: "cxo" | "startup" | "vc") => void;
}) {
  const visible = fields.filter((f) => f.tiers.includes(tier));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 text-slate-900 min-h-[500px] shadow-sm">
      {/* Tier selector */}
      <div className="flex gap-2 mb-6">
        {(["cxo", "startup", "vc"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTierChange(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tier === t
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {TIER_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Preview heading */}
      <h3 className="text-lg font-semibold mb-4 text-slate-900">
        Onboarding Preview ({TIER_LABELS[tier]})
      </h3>

      {/* Rendered fields */}
      <div className="space-y-4">
        {visible.map((f) => (
          <div key={f.id}>
            <label className="block text-sm text-slate-700 mb-1">
              {f.label}
              {f.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {f.type === "textarea" ? (
              <div className="w-full h-20 rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-400">
                {f.placeholder || f.label}
              </div>
            ) : f.type === "select" ? (
              <div className="w-full h-10 rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-400 flex items-center justify-between">
                <span>{f.options?.[0] || "Select..."}</span>
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : (
              <div className="w-full h-10 rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-400 flex items-center">
                {f.placeholder || f.label}
              </div>
            )}
          </div>
        ))}

        {visible.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">
            No fields configured for this tier.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminOnboardingEditor(): JSX.Element {
  const { data: schemaResponse } = useFormSchema("onboarding");
  const updateSchema = useUpdateFormSchema("onboarding");
  const [fields, setFields] = useState<OnboardField[]>(loadFields);
  const [previewTier, setPreviewTier] = useState<"cxo" | "startup" | "vc">("startup");
  const [initialized, setInitialized] = useState(false);

  // Load from API on first fetch, fall back to localStorage
  useEffect(() => {
    if (schemaResponse && !initialized) {
      const apiFields = schemaResponse.schema_data?.fields as OnboardField[] | undefined;
      if (apiFields && apiFields.length > 0) {
        setFields(apiFields);
      }
      setInitialized(true);
    }
  }, [schemaResponse, initialized]);

  // Persist to both localStorage (for simulator) and API
  useEffect(() => {
    saveFields(fields);
    if (initialized) {
      updateSchema.mutate({ fields });
    }
  }, [fields]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback((id: string, patch: Partial<OnboardField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const deleteField = useCallback((id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const moveField = useCallback((id: string, dir: "up" | "down") => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx < 0) return prev;
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }, []);

  const addField = useCallback((f: OnboardField) => {
    setFields((prev) => [...prev, f]);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column — Field List */}
      <div className="bg-white rounded-xl border p-3 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Onboarding Fields</h2>
          <AddFieldDialog onAdd={addField} />
        </div>
        <div>
          {fields.map((f, i) => (
            <FieldCard
              key={f.id}
              field={f}
              index={i}
              total={fields.length}
              onUpdate={updateField}
              onDelete={deleteField}
              onMove={moveField}
            />
          ))}
        </div>
      </div>

      {/* Right column — Live Preview */}
      <div>
        <LivePreview fields={fields} tier={previewTier} onTierChange={setPreviewTier} />
      </div>
    </div>
  );
}
