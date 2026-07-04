/**
 * DynamicFieldRenderer — renders all fields for an entity type from the
 * generalized field schema system (Spec 02).
 *
 * Usage:
 *   <DynamicFieldRenderer
 *     entityType="startup"
 *     surface="profile"
 *     values={startup.custom_fields ?? {}}
 *     onChange={(key, value) => patchField(key, value)}
 *   />
 */

import { useMemo } from 'react';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import { Textarea } from '@/portal/components/ui/textarea';
import { Checkbox } from '@/portal/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/portal/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useFieldSchemas } from '@/portal/hooks/useFieldSchemas';
import type { FieldSchema } from '@/portal/api/fieldSchemas';

interface DynamicFieldRendererProps {
  entityType: string;
  surface?: string;
  values: Record<string, string | boolean | number>;
  onChange: (key: string, value: string | boolean | number) => void;
  readOnly?: boolean;
  className?: string;
}

function renderField(
  field: FieldSchema,
  value: string | boolean | number | undefined,
  onChange: (v: string | boolean | number) => void,
  readOnly: boolean,
) {
  const strValue = value != null ? String(value) : '';

  switch (field.field_type) {
    case 'textarea':
      return (
        <Textarea
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={field.help_text ?? field.field_label}
          rows={3}
        />
      );

    case 'select':
      return (
        <Select
          value={strValue}
          onValueChange={onChange}
          disabled={readOnly}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${field.field_label}`} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'multiselect':
      return (
        <Input
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={`${field.field_label} (comma-separated)`}
        />
      );

    case 'boolean':
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={value === true || value === 'true'}
            onCheckedChange={(v) => onChange(v === true)}
            disabled={readOnly}
          />
        </div>
      );

    case 'number':
      return (
        <Input
          type="number"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={field.help_text ?? field.field_label}
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
        />
      );

    case 'url':
    case 'email':
      return (
        <Input
          type={field.field_type}
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={field.help_text ?? field.field_label}
        />
      );

    default:
      return (
        <Input
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={field.help_text ?? field.field_label}
        />
      );
  }
}

export function DynamicFieldRenderer({
  entityType,
  surface,
  values,
  onChange,
  readOnly = false,
  className,
}: DynamicFieldRendererProps) {
  const { data: fields, isLoading } = useFieldSchemas(entityType, surface);

  // Memoize sorted fields to prevent re-renders from resetting Select state
  // (this is the fix for the dropdown-reset bug described in Spec 02).
  const sortedFields = useMemo(
    () => (fields ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
    [fields],
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading fields...
      </div>
    );
  }

  if (sortedFields.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-4 ${className ?? ''}`}>
      {sortedFields.map((field) => (
        <div key={field.field_key} className="grid gap-1.5">
          <Label className="text-sm font-medium">
            {field.field_label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          {renderField(
            field,
            values[field.field_key],
            (v) => onChange(field.field_key, v),
            readOnly,
          )}
          {field.help_text && (
            <p className="text-xs text-muted-foreground">{field.help_text}</p>
          )}
        </div>
      ))}
    </div>
  );
}
