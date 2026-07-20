import { Input } from "@/portal/components/ui/input";
import { Label } from "@/portal/components/ui/label";
import { Textarea } from "@/portal/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/portal/components/ui/select";
import type { OnboardField } from "@/portal/types/onboarding";

const THEME_CLASSES = {
  slate: {
    label: "text-slate-300",
    input:
      "h-12 text-base rounded-xl border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20",
    textarea:
      "rounded-xl border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none",
  },
  navy: {
    label: "text-white",
    input:
      "h-12 text-base rounded-xl border-navy-600 bg-navy-900/50 text-white placeholder:text-navy-500 focus-visible:ring-blue-500",
    textarea:
      "rounded-xl border-navy-600 bg-navy-900/50 text-white placeholder:text-navy-500 focus-visible:ring-blue-500 resize-none",
  },
} as const;

interface DynamicFieldProps {
  field: OnboardField;
  value: string;
  onChange: (v: string) => void;
  theme?: keyof typeof THEME_CLASSES;
}

export function DynamicField({
  field,
  value,
  onChange,
  theme = "slate",
}: DynamicFieldProps) {
  const cls = THEME_CLASSES[theme];
  return (
    <div className="space-y-2">
      <Label className={`${cls.label} block`}>
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      {field.type === "textarea" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || field.label}
          className={cls.textarea}
          rows={3}
        />
      ) : field.type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={cls.input}>
            <SelectValue
              placeholder={field.placeholder || `Select ${field.label}`}
            />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls.input}
          placeholder={field.placeholder || field.label}
        />
      )}
    </div>
  );
}
