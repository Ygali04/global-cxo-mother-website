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
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useFieldSchemas, useCreateFieldSchema, useUpdateFieldSchema, useDeleteFieldSchema, useReorderFieldSchemas } from "@/portal/hooks/useFieldSchemas";
import { toast } from "sonner";

export interface StartupProfileField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

const uid = () => crypto.randomUUID();

const DEFAULT_FIELDS: StartupProfileField[] = [
  { id: uid(), label: "Trupeer Link", type: "text", required: false, placeholder: "https://trupeer.com/..." },
  { id: uid(), label: "Pitch Deck URL", type: "text", required: true, placeholder: "https://drive.google.com/..." },
  { id: uid(), label: "Current Customers", type: "textarea", required: false, placeholder: "List your current customers..." },
  { id: uid(), label: "Funding Stage", type: "select", required: true, options: ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped"] },
  { id: uid(), label: "Team Size", type: "select", required: false, options: ["1-5", "6-15", "16-50", "51-100", "100+"] },
];

const TYPE_BADGE: Record<string, string> = {
  text: "bg-blue-100 text-blue-700",
  select: "bg-purple-100 text-purple-700",
  textarea: "bg-orange-100 text-orange-700",
};

/** Map backend FieldSchema → local StartupProfileField for the UI. */
function toLocal(f: { id: string; field_key: string; field_label: string; field_type: string; required: boolean; help_text?: string | null; options?: { value: string; label: string }[] | null }): StartupProfileField {
  return {
    id: f.field_key,
    label: f.field_label,
    type: (f.field_type === "select" || f.field_type === "textarea") ? f.field_type : "text",
    required: f.required,
    placeholder: f.help_text ?? undefined,
    options: f.options?.map((o) => o.label) ?? undefined,
  };
}

function AddFieldDialog({ onAdd }: { onAdd: (f: StartupProfileField) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<StartupProfileField["type"]>("text");
  const [required, setRequired] = useState(false);
  const [optionsStr, setOptionsStr] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  const reset = () => {
    setLabel("");
    setType("text");
    setRequired(false);
    setOptionsStr("");
    setPlaceholder("");
  };

  const handleSubmit = () => {
    if (!label.trim()) return;
    const field: StartupProfileField = {
      id: uid(),
      label: label.trim(),
      type,
      required,
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
          <DialogTitle>Add Startup Profile Field</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium">Label</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Field label" />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as StartupProfileField["type"])}
            >
              <option value="text">Text</option>
              <option value="select">Select</option>
              <option value="textarea">Textarea</option>
            </select>
          </div>

          {type === "select" && (
            <div>
              <label className="text-sm font-medium">Options (comma-separated)</label>
              <Input value={optionsStr} onChange={(e) => setOptionsStr(e.target.value)} placeholder="Option 1, Option 2, ..." />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Placeholder (optional)</label>
            <Input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} placeholder="Placeholder text" />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={required}
              onCheckedChange={(v) => setRequired(v === true)}
              id="add-sp-required"
            />
            <label htmlFor="add-sp-required" className="text-sm">Required</label>
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
  field: StartupProfileField;
  index: number;
  total: number;
  onUpdate: (id: string, patch: Partial<StartupProfileField>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draftLabel, setDraftLabel] = useState(field.label);
  const [draftType, setDraftType] = useState(field.type);
  const [draftPlaceholder, setDraftPlaceholder] = useState(field.placeholder ?? "");
  const [draftOptions, setDraftOptions] = useState((field.options ?? []).join(", "));

  const saveEdits = () => {
    const patch: Partial<StartupProfileField> = {};
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
    <div className="border rounded-lg p-4 mb-2 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <div className="pt-0.5 text-gray-400">
          <GripVertical className="h-4 w-4" />
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

          <div className="flex items-center gap-2">
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
                    onChange={(e) => setDraftType(e.target.value as StartupProfileField["type"])}
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
          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={() => onDelete(field.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LivePreview({ fields }: { fields: StartupProfileField[] }) {
  return (
    <div className="bg-[#0a1628] rounded-xl p-6 text-white min-h-[500px]">
      <h3 className="text-lg font-semibold mb-6">Startup Profile Preview</h3>
      <div className="space-y-4">
        {fields.map((f) => (
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
                <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : (
              <div className="w-full h-10 rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm text-white/40 flex items-center">
                {f.placeholder || f.label}
              </div>
            )}
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-white/40 text-sm text-center py-8">No fields configured.</p>
        )}
      </div>
    </div>
  );
}

export default function AdminStartupFieldEditor(): JSX.Element {
  const { data: backendFields, isLoading } = useFieldSchemas("startup");
  const createField = useCreateFieldSchema("startup");
  const updateFieldMut = useUpdateFieldSchema("startup");
  const deleteFieldMut = useDeleteFieldSchema("startup");
  const reorderMut = useReorderFieldSchemas("startup");

  // Map backend FieldSchema[] → local StartupProfileField[] for the existing UI.
  const fields: StartupProfileField[] = (backendFields ?? []).map(toLocal);

  const updateField = useCallback((id: string, patch: Partial<StartupProfileField>) => {
    const body: Record<string, unknown> = {};
    if (patch.label) body.field_label = patch.label;
    if (patch.type) body.field_type = patch.type;
    if (patch.required !== undefined) body.required = patch.required;
    if (patch.placeholder !== undefined) body.help_text = patch.placeholder || null;
    if (patch.options) body.options = patch.options.map((o) => ({ value: o, label: o }));
    updateFieldMut.mutate(
      { fieldKey: id, body },
      { onError: () => toast.error("Failed to update field") },
    );
  }, [updateFieldMut]);

  const deleteField = useCallback((id: string) => {
    deleteFieldMut.mutate(id, {
      onError: () => toast.error("Cannot delete this field (may be a system field)"),
    });
  }, [deleteFieldMut]);

  const moveField = useCallback((id: string, dir: "up" | "down") => {
    const keys = fields.map((f) => f.id);
    const idx = keys.indexOf(id);
    if (idx < 0) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= keys.length) return;
    [keys[idx], keys[swapIdx]] = [keys[swapIdx], keys[idx]];
    reorderMut.mutate(keys, {
      onError: () => toast.error("Failed to reorder fields"),
    });
  }, [fields, reorderMut]);

  const addField = useCallback((f: StartupProfileField) => {
    createField.mutate(
      {
        field_key: f.id || f.label.toLowerCase().replace(/\s+/g, "_").slice(0, 128),
        field_label: f.label,
        field_type: f.type,
        required: f.required,
        help_text: f.placeholder || null,
        options: f.type === "select" && f.options
          ? f.options.map((o) => ({ value: o, label: o }))
          : undefined,
      },
      {
        onSuccess: () => toast.success("Field added"),
        onError: () => toast.error("Failed to add field"),
      },
    );
  }, [createField]);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading fields...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Startup Profile Fields</h2>
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
          {fields.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-8">No fields yet. Add one above.</p>
          )}
        </div>
      </div>

      <div>
        <LivePreview fields={fields} />
      </div>
    </div>
  );
}
