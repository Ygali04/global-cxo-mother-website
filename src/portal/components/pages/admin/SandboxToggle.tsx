/**
 * SandboxToggle — checkbox to enable sandbox mode on admin forms.
 *
 * When checked, the parent form should pass `sandbox=true` to the
 * backend so emails are routed through the sandbox queue.
 *
 * Usage:
 *   const [sandbox, setSandbox] = useState(false);
 *   <SandboxToggle checked={sandbox} onChange={setSandbox} />
 *   // On submit: POST /users?sandbox=true
 */

import { Checkbox } from '@/portal/components/ui/checkbox';
import { Label } from '@/portal/components/ui/label';
import { FlaskConical } from 'lucide-react';

interface SandboxToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function SandboxToggle({ checked, onChange, className }: SandboxToggleProps) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 ${className ?? ''}`}>
      <Checkbox
        id="sandbox-toggle"
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
      />
      <Label
        htmlFor="sandbox-toggle"
        className="flex items-center gap-1.5 text-sm font-medium text-amber-800 cursor-pointer"
      >
        <FlaskConical className="h-4 w-4" />
        Send as test (to my inbox, no data saved)
      </Label>
    </div>
  );
}
