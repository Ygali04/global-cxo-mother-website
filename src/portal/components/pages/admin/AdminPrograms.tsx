import type { JSX } from 'react';
import { Suspense, lazy, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Network, Pencil, Search, Trash2, GripVertical, Lock, Plus, ArrowUp, ArrowDown, X, Info, Upload, Download, FileText, Eye } from 'lucide-react';
import { parseMemberImportFile, exportMembersToWorkbook } from '@/portal/lib/memberSheets';
import { deleteCohortApi } from '@/portal/api/programs';
import { apiFetch } from '@/portal/api/client';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/portal/components/ui/tooltip';
import { useAuth } from '@/portal/hooks/useAuth';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/portal/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/portal/components/ui/dialog';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import { Progress } from '@/portal/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/portal/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/portal/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/portal/components/ui/tabs';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/portal/components/ui/accordion';
import { Textarea } from '@/portal/components/ui/textarea';
import FadedScroll from '@/portal/components/ui/faded-scroll';
import {
  ProgramOverviewSkeleton,
  SkeletonBlock,
  TableSkeleton,
} from '@/portal/components/ui/admin-skeletons';
import {
  usePrograms,
  useEnrollments,
  useAssignments,
  useProgramHours,
  useEnrollUser,
  useCreateAssignment,
  useUpdateEnrollment,
  useUpdateEnrollmentDetails,
  useDeleteEnrollment,
  useUpdateAssignment,
  useDeleteAssignment,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
  useCohorts,
  useCreateCohort,
  useAllCohortEnrollments,
  useLedger,
  useInvoices,
  useUploadInvoice,
  useDeleteInvoice,
} from '@/portal/hooks/usePrograms';
import ProgramCalendar from '@/portal/components/ProgramCalendar';
import type { CalendarEvent } from '@/portal/components/ProgramCalendar';
import { CircleMemberDirectory } from '@/portal/components/CircleMemberDirectory';
import {
  useFieldSchemas, useCreateFieldSchema, useDeleteFieldSchema, useReorderFieldSchemas, useUpdateFieldSchema,
} from '@/portal/hooks/useFieldSchemas';
import { Switch } from '@/portal/components/ui/switch';
import { Checkbox } from '@/portal/components/ui/checkbox';
import {
  useTimeShareRequests,
  useResolveTimeShareRequest,
  usePricingTiers,
  useCreatePricingTier,
  useUpdatePricingTier,
  useDeletePricingTier,
  useDeleteTimeShareRequest,
} from '@/portal/hooks/useTimeshare';
import type {
  ProgramResponse,
  EnrollmentResponse,
  AssignmentResponse,
  TimeShareRequestResponse,
  PricingTierResponse,
  CohortResponse,
} from '@/portal/api/types';
// Lazy-load the relationship graph so @xyflow/react only ships when someone
// actually clicks "View Graph" — it's a 200KB dependency that's otherwise
// wasted on admins who never open the graph.
const ProgramGraph = lazy(() => import('./ProgramGraph'));
import type {
  GraphCxo,
  GraphStartupCompany,
  GraphAssignment,
} from './ProgramGraph';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function InfoTip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="inline h-3 w-3 text-slate-400 hover:text-slate-600 cursor-help ml-1 shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs font-normal">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    invited: 'bg-gray-100 text-gray-700',
    accepted: 'bg-blue-100 text-blue-700',
    pending_payment: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-purple-100 text-purple-700',
    withdrawn: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

function roleBadgeClass(role: string): string {
  return role === 'cxo' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700';
}

function programStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    draft: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-purple-100 text-purple-700',
    archived: 'bg-slate-100 text-slate-500',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

// ---------------------------------------------------------------------------
// Search picker for enrollment-based person selection (assignments dialog)
// ---------------------------------------------------------------------------
function EnrollmentSearchPicker({
  value,
  onChange,
  enrollments,
  label,
  placeholder,
}: {
  value: string;
  onChange: (id: string) => void;
  enrollments: EnrollmentResponse[];
  label: string;
  placeholder: string;
}): JSX.Element {
  const [search, setSearch] = useState('');
  const selected = enrollments.find((e) => e.user_id === value);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return [];
    return enrollments
      .filter(
        (e) =>
          (e.user_name ?? '').toLowerCase().includes(q) ||
          (e.user_email ?? '').toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [search, enrollments]);

  if (selected) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{selected.user_name ?? 'Unknown'}</p>
            <p className="text-xs text-slate-500 truncate">{selected.user_email ?? selected.user_id}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onChange('')}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      {search.trim().length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded-md border bg-white">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-slate-400">No matches</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((e) => (
                <li key={e.user_id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    onClick={() => { onChange(e.user_id); setSearch(''); }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{e.user_name ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-500 truncate">{e.user_email ?? e.user_id}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                      {e.role}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function assignmentStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-purple-100 text-purple-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

function marketplaceBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    denied: 'bg-red-100 text-red-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700';
}

// Derives onboarding status from enrollment status — no API call needed.
function onboardingBadge(
  enrollmentStatus: string,
): { label: string; className: string } | null {
  if (enrollmentStatus === 'active') {
    return { label: 'Complete', className: 'bg-green-100 text-green-700' };
  }
  if (enrollmentStatus === 'accepted' || enrollmentStatus === 'pending_payment') {
    return { label: 'In Progress', className: 'bg-amber-100 text-amber-700' };
  }
  if (enrollmentStatus === 'invited') {
    return { label: 'Pending', className: 'bg-gray-100 text-gray-700' };
  }
  // withdrawn / rejected / completed program — show nothing
  return null;
}

// ---------------------------------------------------------------------------
// Circle badge renderer — shared by Enrollments & Sessions tables
// ---------------------------------------------------------------------------
function CircleBadges({
  userId,
  userCohortMap,
  cohorts,
}: {
  userId: string;
  userCohortMap: Map<string, string[]>;
  cohorts: CohortResponse[];
}): JSX.Element {
  const cIds = userCohortMap.get(userId);
  if (!cIds || cIds.length === 0) return <span className="text-xs text-slate-400">--</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {cIds.map((cId) => {
        const c = cohorts.find((co) => co.id === cId);
        return c ? <Badge key={cId} variant="outline">{c.name}</Badge> : null;
      })}
    </div>
  );
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ---------------------------------------------------------------------------
// Program form state
// ---------------------------------------------------------------------------
type ProgramStatus = 'inactive' | 'active' | 'in_progress' | 'completed';

interface ProgramFormState {
  name: string;
  slug: string;
  description: string;
  status: ProgramStatus;
  hours_per_cxo: string;
  max_hours_per_startup: string;
  duration_months: string;
  starts_at: string;
  ends_at: string;
}

const defaultFormState: ProgramFormState = {
  name: '',
  slug: '',
  description: '',
  status: 'active',
  hours_per_cxo: '40',
  max_hours_per_startup: '40',
  duration_months: '6',
  starts_at: '',
  ends_at: '',
};

function programToFormState(p: ProgramResponse): ProgramFormState {
  const validStatuses: ProgramStatus[] = ['inactive', 'active', 'in_progress', 'completed'];
  const status: ProgramStatus = validStatuses.includes(p.status as ProgramStatus)
    ? (p.status as ProgramStatus)
    : 'inactive';
  return {
    name: p.name,
    slug: p.slug,
    description: p.description ?? '',
    status,
    hours_per_cxo: String(p.hours_per_cxo),
    max_hours_per_startup: String(p.max_hours_per_startup ?? 40),
    duration_months: String(p.duration_months),
    starts_at: p.starts_at ? p.starts_at.slice(0, 10) : '',
    ends_at: p.ends_at ? p.ends_at.slice(0, 10) : '',
  };
}

function formToPayload(form: ProgramFormState): Record<string, unknown> {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim() || null,
    status: form.status,
    hours_per_cxo: parseInt(form.hours_per_cxo, 10) || 40,
    max_hours_per_startup: parseInt(form.max_hours_per_startup, 10) || 40,
    duration_months: parseInt(form.duration_months, 10) || 6,
    starts_at: form.starts_at || null,
    ends_at: form.ends_at || null,
  };
}

// ---------------------------------------------------------------------------
// Program form dialog (shared for create & edit)
// ---------------------------------------------------------------------------
interface ProgramFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialValues?: ProgramFormState;
  onSubmit: (values: ProgramFormState) => Promise<void>;
  isPending: boolean;
}

function ProgramFormDialog({
  open,
  onOpenChange,
  mode,
  initialValues = defaultFormState,
  onSubmit,
  isPending,
}: ProgramFormDialogProps): JSX.Element {
  const [form, setForm] = useState<ProgramFormState>(initialValues);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Re-sync when dialog opens or initialValues change (e.g. switching to edit mode)
  useEffect(() => {
    setForm(initialValues);
    setSlugManuallyEdited(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof ProgramFormState>(key: K, value: ProgramFormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (value: string): void => {
    set('name', value);
    if (!slugManuallyEdited) {
      set('slug', toSlug(value));
    }
  };

  const handleSlugChange = (value: string): void => {
    setSlugManuallyEdited(true);
    set('slug', value);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!form.name.trim()) {
      toast.error('Program name is required');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }
    await onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'New Program' : 'Edit Program'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="prog-name">Name *</Label>
            <Input
              id="prog-name"
              placeholder="CxO Advisory Program"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="prog-slug">Slug</Label>
            <Input
              id="prog-slug"
              placeholder="cxo-advisory-program"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
            />
            <p className="text-xs text-slate-400">Auto-generated from name. Used in URLs.</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="prog-desc">Description</Label>
            <Textarea
              id="prog-desc"
              placeholder="Brief description of the program…"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="prog-status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => set('status', v as ProgramStatus)}
            >
              <SelectTrigger id="prog-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Numeric fields — 2-col grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prog-hrs-cxo">Hours per CxO</Label>
              <Input
                id="prog-hrs-cxo"
                type="number"
                min={1}
                value={form.hours_per_cxo}
                onChange={(e) => set('hours_per_cxo', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prog-hrs-startup">Hours per Startup</Label>
              <Input
                id="prog-hrs-startup"
                type="number"
                min={1}
                value={form.max_hours_per_startup}
                onChange={(e) => set('max_hours_per_startup', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prog-duration">Duration (months)</Label>
              <Input
                id="prog-duration"
                type="number"
                min={1}
                value={form.duration_months}
                onChange={(e) => set('duration_months', e.target.value)}
              />
            </div>
          </div>

          {/* Date fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prog-start">Start Date</Label>
              <Input
                id="prog-start"
                type="date"
                value={form.starts_at}
                onChange={(e) => set('starts_at', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prog-end">End Date</Label>
              <Input
                id="prog-end"
                type="date"
                value={form.ends_at}
                onChange={(e) => set('ends_at', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={() => void handleSubmit()}>
            {isPending
              ? mode === 'create'
                ? 'Creating…'
                : 'Saving…'
              : mode === 'create'
                ? 'Create Program'
                : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Stats card
// ---------------------------------------------------------------------------
interface StatCardProps {
  label: string;
  value: string | number;
  accent: 'amber' | 'cyan' | 'emerald' | 'purple';
}

function StatCard({ label, value, accent }: StatCardProps): JSX.Element {
  const accentClass: Record<StatCardProps['accent'], string> = {
    amber: 'text-amber-600',
    cyan: 'text-cyan-600',
    emerald: 'text-emerald-600',
    purple: 'text-purple-600',
  };
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${accentClass[accent]}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const FIELD_TYPE_BADGE: Record<string, string> = {
  text: 'bg-blue-100 text-blue-700',
  select: 'bg-purple-100 text-purple-700',
  textarea: 'bg-orange-100 text-orange-700',
  url: 'bg-green-100 text-green-700',
  number: 'bg-teal-100 text-teal-700',
  boolean: 'bg-pink-100 text-pink-700',
};

const FIELD_TYPES = ['text', 'textarea', 'select', 'url', 'number', 'boolean'] as const;

function ProgramFieldCard({
  field,
  index,
  total,
  entityType,
  onMove,
}: {
  field: import('@/portal/api/fieldSchemas').FieldSchema;
  index: number;
  total: number;
  entityType: string;
  onMove: (key: string, dir: 'up' | 'down') => void;
}) {
  const updateField = useUpdateFieldSchema(entityType);
  const deleteField = useDeleteFieldSchema(entityType);
  const [expanded, setExpanded] = useState(false);
  const [draftLabel, setDraftLabel] = useState(field.field_label);
  const [draftType, setDraftType] = useState(field.field_type);
  const [draftOptions, setDraftOptions] = useState(
    (field.options ?? []).map((o) => o.label).join(', '),
  );

  const saveEdits = () => {
    const body: import('@/portal/api/fieldSchemas').FieldSchemaUpdate = {};
    if (draftLabel.trim() && draftLabel.trim() !== field.field_label) body.field_label = draftLabel.trim();
    if (draftType !== field.field_type) body.field_type = draftType;
    if (draftType === 'select') {
      body.options = draftOptions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((v) => ({ value: v.toLowerCase().replace(/\s+/g, '_'), label: v }));
    }
    if (Object.keys(body).length > 0) {
      updateField.mutate(
        { fieldKey: field.field_key, body },
        { onSuccess: () => toast.success('Field updated'), onError: () => toast.error('Update failed') },
      );
    }
    setExpanded(false);
  };

  const cancelEdits = () => {
    setDraftLabel(field.field_label);
    setDraftType(field.field_type);
    setDraftOptions((field.options ?? []).map((o) => o.label).join(', '));
    setExpanded(false);
  };

  return (
    <div className={`border rounded-lg p-4 mb-2 ${field.is_system ? 'bg-slate-50' : 'bg-white'} hover:shadow-sm transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className="pt-0.5 text-gray-400">
          {field.is_system ? <Lock className="h-4 w-4" /> : <GripVertical className="h-4 w-4" />}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{field.field_label}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${FIELD_TYPE_BADGE[field.field_type] ?? 'bg-gray-100 text-gray-700'}`}>
              {field.field_type}
            </Badge>
            <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-blue-600" onClick={() => setExpanded(!expanded)} title="Edit field">
              <Pencil className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
              <span>Required</span>
              <Switch
                checked={field.required}
                onCheckedChange={(v) =>
                  updateField.mutate(
                    { fieldKey: field.field_key, body: { required: v } },
                    { onError: () => toast.error('Update failed') },
                  )
                }
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
                    onChange={(e) => setDraftType(e.target.value as typeof draftType)}
                    disabled={field.is_system}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {draftType === 'select' && (
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
          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => onMove(field.field_key, 'up')}>
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === total - 1} onClick={() => onMove(field.field_key, 'down')}>
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          {!field.is_system && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700" onClick={() => deleteField.mutate(field.field_key, { onSuccess: () => toast.success('Field deleted'), onError: () => toast.error('Cannot delete this field.') })}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgramAddFieldDialog({ entityType, onSuccess }: { entityType: string; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<string>('text');
  const [required, setRequired] = useState(false);
  const [optionsStr, setOptionsStr] = useState('');
  const createField = useCreateFieldSchema(entityType);

  const reset = () => { setLabel(''); setType('text'); setRequired(false); setOptionsStr(''); };

  const handleSubmit = () => {
    if (!label.trim()) return;
    const fieldKey = label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 128);
    createField.mutate(
      {
        field_key: fieldKey,
        field_label: label.trim(),
        field_type: type,
        required,
        options: type === 'select' ? optionsStr.split(',').map((s) => s.trim()).filter(Boolean).map((v) => ({ value: v.toLowerCase().replace(/\s+/g, '_'), label: v })) : undefined,
      },
      {
        onSuccess: () => { toast.success('Field added'); reset(); setOpen(false); onSuccess?.(); },
        onError: () => toast.error('Could not add field.'),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Field</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add {entityType === 'circle' ? 'Circle' : 'Program'} Field</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium">Label</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Field label" />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          {type === 'select' && (
            <div>
              <label className="text-sm font-medium">Options (comma-separated)</label>
              <Input value={optionsStr} onChange={(e) => setOptionsStr(e.target.value)} placeholder="Option 1, Option 2, ..." />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox checked={required} onCheckedChange={(v) => setRequired(v === true)} id="pfe-add-required" />
            <label htmlFor="pfe-add-required" className="text-sm">Required</label>
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={!label.trim()}>Add Field</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProgramFieldLivePreview({ fields }: { fields: import('@/portal/api/fieldSchemas').FieldSchema[] }) {
  return (
    <div className="bg-[#0a1628] rounded-xl p-6 text-white min-h-[500px]">
      <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.field_key}>
            <label className="block text-sm text-white/70 mb-1">
              {f.field_label}
              {f.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {f.field_type === 'textarea' ? (
              <div className="w-full h-20 rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm text-white/40">{f.field_label}</div>
            ) : f.field_type === 'select' ? (
              <div className="w-full h-10 rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm text-white/40 flex items-center justify-between">
                <span>{f.options?.[0]?.label || 'Select...'}</span>
                <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            ) : f.field_type === 'boolean' ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 rounded-full bg-white/20 border border-white/30" />
                <span className="text-sm text-white/40">Off</span>
              </div>
            ) : (
              <div className="w-full h-10 rounded-md bg-white/10 border border-white/20 px-3 py-2 text-sm text-white/40 flex items-center">{f.field_label}</div>
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

function ProgramFieldEditor() {
  const [entityType, setEntityType] = useState<'program' | 'circle'>('program');
  const { data: fields, isLoading } = useFieldSchemas(entityType);
  const reorderFields = useReorderFieldSchemas(entityType);

  const handleMove = (key: string, dir: 'up' | 'down') => {
    if (!fields) return;
    const keys = fields.map((f) => f.field_key);
    const idx = keys.indexOf(key);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= keys.length) return;
    [keys[idx], keys[swapIdx]] = [keys[swapIdx], keys[idx]];
    reorderFields.mutate(keys);
  };

  const fieldList = fields ?? [];

  return (
    <div className="space-y-4">
      {/* Entity type toggle */}
      <div className="flex gap-2">
        <Button
          variant={entityType === 'program' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setEntityType('program')}
        >
          Program Fields
        </Button>
        <Button
          variant={entityType === 'circle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setEntityType('circle')}
        >
          Circle Fields
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column -- Field list */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{entityType === 'circle' ? 'Circle' : 'Program'} Fields</h2>
            <ProgramAddFieldDialog entityType={entityType} />
          </div>
          {isLoading ? (
            <SkeletonBlock className="h-40" />
          ) : fieldList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No custom fields yet.</p>
          ) : (
            <div>
              {fieldList.map((f, i) => (
                <ProgramFieldCard
                  key={f.field_key}
                  field={f}
                  index={i}
                  total={fieldList.length}
                  entityType={entityType}
                  onMove={handleMove}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column -- Live preview */}
        <div>
          <ProgramFieldLivePreview fields={fieldList} />
        </div>
      </div>
    </div>
  );
}

function CirclesTab({ programId, onScopeCircle }: { programId: string | null; onScopeCircle?: (circleId: string) => void }) {
  const { data: cohorts, isLoading } = useCohorts(programId);
  const createCohort = useCreateCohort(programId);
  const queryClient = useQueryClient();
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [startupIndustry, setStartupIndustry] = useState('');
  const [startupDescription, setStartupDescription] = useState('');
  const [startupStage, setStartupStage] = useState('');
  const [startupAsk, setStartupAsk] = useState('');
  const [deletingCircleId, setDeletingCircleId] = useState<string | null>(null);

  const handleDeleteCircle = async (e: React.MouseEvent, circleId: string, circleName: string) => {
    e.stopPropagation();
    if (!programId) return;
    setDeletingCircleId(circleId);
    try {
      await deleteCohortApi(programId, circleId);
      toast.success(`Circle "${circleName}" deleted`);
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete circle');
    } finally {
      setDeletingCircleId(null);
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) { toast.error('Please enter a circle name.'); return; }
    if (!adminEmail.trim()) { toast.error('Please enter the startup admin email.'); return; }
    if (!adminPhone.trim()) { toast.error('Please enter the startup admin phone number.'); return; }
    const slug = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 255);
    createCohort.mutate(
      {
        name: newName.trim(),
        slug,
        description: newDesc.trim() || undefined,
        admin_email: adminEmail.trim(),
        admin_name: adminName.trim() || undefined,
        admin_phone: adminPhone.trim(),
        startup_industry: startupIndustry.trim() || undefined,
        startup_description: startupDescription.trim() || undefined,
        startup_stage: startupStage.trim() || undefined,
        startup_ask: startupAsk.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Circle "${newName.trim()}" created.`);
          setCreateOpen(false); setNewName(''); setNewDesc('');
          setAdminEmail(''); setAdminName(''); setAdminPhone('');
          setStartupIndustry(''); setStartupDescription(''); setStartupStage(''); setStartupAsk('');
        },
        onError: () => toast.error('Could not create circle. Please check the name and try again.'),
      },
    );
  };

  if (!programId) return <p className="text-sm text-muted-foreground py-4">Select a program to view its circles.</p>;
  if (isLoading) return <SkeletonBlock className="h-40" />;

  if (selectedCircleId) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedCircleId(null)}>
          ← Back to circles
        </Button>
        <CircleMemberDirectory
          programId={programId}
          circleId={selectedCircleId}
          circleName={cohorts?.find((c: any) => c.id === selectedCircleId)?.name ?? 'Circle'}
          isAdmin
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Circles in this program</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{cohorts?.length ?? 0}</Badge>
          <Button size="sm" onClick={() => setCreateOpen(true)}>+ New Circle</Button>
        </div>
      </div>
      {!cohorts || cohorts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-3">No circles created yet.</p>
          <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>Create your first circle</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {cohorts.map((c: any) => (
            <Card key={c.id} className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedCircleId(c.id)}>
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                  {c.enrollment_count != null && (
                    <Badge variant="secondary" className="text-[10px]">{c.enrollment_count} members</Badge>
                  )}
                  {onScopeCircle && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600" onClick={(e) => { e.stopPropagation(); onScopeCircle(c.id); }}>
                      View Data →
                    </Button>
                  )}
                  <button
                    type="button"
                    title="Delete circle"
                    disabled={deletingCircleId === c.id}
                    onClick={(e) => handleDeleteCircle(e, c.id, c.name)}
                    className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Circle Dialog */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setCreateOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Create a Circle</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="circle-name">Circle name *</Label>
                <Input id="circle-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Acme Corp Advisory Circle" />
              </div>
              <div>
                <Label htmlFor="circle-desc">Description (optional)</Label>
                <Input id="circle-desc" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="A brief description of this circle" />
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-3">Startup administrator — the person who will schedule advisory sessions</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="admin-name">Admin name</Label>
                    <Input id="admin-name" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="e.g. Jane Smith" />
                  </div>
                  <div>
                    <Label htmlFor="admin-email">Admin email *</Label>
                    <Input id="admin-email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@startup.com" />
                  </div>
                  <div>
                    <Label htmlFor="admin-phone">Admin phone *</Label>
                    <Input id="admin-phone" type="tel" value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} placeholder="+1 555-0123" />
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-3">About the startup</p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="startup-industry">Industry</Label>
                    <Input id="startup-industry" value={startupIndustry} onChange={(e) => setStartupIndustry(e.target.value)} placeholder="e.g. FinTech, HealthTech, SaaS" />
                  </div>
                  <div>
                    <Label htmlFor="startup-desc">What they do</Label>
                    <Input id="startup-desc" value={startupDescription} onChange={(e) => setStartupDescription(e.target.value)} placeholder="One-line description of the startup" />
                  </div>
                  <div>
                    <Label htmlFor="startup-stage">Stage</Label>
                    <Input id="startup-stage" value={startupStage} onChange={(e) => setStartupStage(e.target.value)} placeholder="e.g. Seed, Series A, Growth" />
                  </div>
                  <div>
                    <Label htmlFor="startup-ask">Their ask from a CxO advisor</Label>
                    <Input id="startup-ask" value={startupAsk} onChange={(e) => setStartupAsk(e.target.value)} placeholder="What kind of advisory support are they looking for?" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setCreateOpen(false); setAdminEmail(''); setAdminName(''); setAdminPhone(''); setStartupIndustry(''); setStartupDescription(''); setStartupStage(''); setStartupAsk(''); }}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createCohort.isPending}>
                  {createCohort.isPending ? 'Creating...' : 'Create Circle'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calendar wrapper — maps ledger entries to CalendarEvent[] for ProgramCalendar
// ---------------------------------------------------------------------------

function ProgramCalendarWrapper({ programId }: { programId: string | null }) {
  const { data: ledger = [] } = useLedger(programId || '');

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return (ledger as unknown as Record<string, unknown>[]).map((entry) => ({
      id: String(entry.id ?? ''),
      date: String(entry.meeting_date ?? entry.created_at ?? ''),
      title: `${entry.cxo_name || 'CxO'} \u2194 ${entry.startup_name || 'Startup'}`,
      duration: Number(entry.scheduled_duration ?? 60),
      status:
        entry.status === 'confirmed' || entry.status === 'admin_resolved'
          ? 'completed'
          : entry.status === 'voided'
            ? 'cancelled'
            : 'scheduled',
      participants: [entry.cxo_name, entry.startup_name].filter(Boolean) as string[],
    }));
  }, [ledger]);

  if (!programId) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Select a program to view its calendar.
      </p>
    );
  }

  return <ProgramCalendar events={calendarEvents} title="Program Sessions Calendar" />;
}

export default function AdminPrograms(): JSX.Element {
  const navigate = useNavigate();
  const { users: allUsers, startups, userStartupLinks } = useAuth();

  // Program selection
  const { data: programs = [], isLoading: programsLoading } = usePrograms();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const activeProgramId = selectedProgramId
    ?? [...programs].sort((a: ProgramResponse, b: ProgramResponse) => (b.cxo_count + b.startup_count) - (a.cxo_count + a.startup_count))[0]?.id
    ?? null;
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const activeProgram: ProgramResponse | null =
    programs.find((p: ProgramResponse) => p.id === activeProgramId) ?? null;

  // Data hooks — hooks require a non-null string; fall back to '' when no program selected
  const safeId = activeProgramId ?? '';
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments(safeId);
  const { data: assignments = [], isLoading: assignmentsLoading } = useAssignments(safeId);
  const { data: hoursData } = useProgramHours(safeId);
  const { mutateAsync: enrollMutate, isPending: enrollLoading } = useEnrollUser(safeId);
  const { mutateAsync: createAssignmentMutate, isPending: assignmentLoading } =
    useCreateAssignment(safeId);
  const { mutateAsync: updateEnrollmentMutate } = useUpdateEnrollment(safeId);
  const { mutateAsync: updateEnrollmentDetailsMutate, isPending: updateEnrollmentDetailsLoading } =
    useUpdateEnrollmentDetails(safeId);
  const { mutateAsync: deleteEnrollmentMutate } = useDeleteEnrollment(safeId);
  const { mutateAsync: updateAssignmentMutate, isPending: updateAssignmentLoading } =
    useUpdateAssignment(safeId);
  const { mutateAsync: deleteAssignmentMutate } = useDeleteAssignment(safeId);

  // Cohorts + user-cohort mapping (hoisted so Enrollments & Sessions tabs can show circle names)
  const { data: cohorts = [] } = useCohorts(activeProgramId);
  const cohortIds = useMemo(() => (cohorts as CohortResponse[]).map((c) => c.id), [cohorts]);
  const { userCohortMap } = useAllCohortEnrollments(safeId, cohortIds);

  // Reset circle selection when program changes
  useEffect(() => { setSelectedCircleId(null); }, [activeProgramId]);

  // Time-share requests hook — MUST be declared before circleScopedTimeShareRequests
  // which references it (TDZ: const used before declaration crashes in production).
  const [marketplaceStatusFilter, setMarketplaceStatusFilter] = useState<string>('all');
  const { data: timeShareRequests = [], isLoading: timeShareRequestsLoading } = useTimeShareRequests(
    activeProgramId,
    marketplaceStatusFilter === 'all' ? undefined : marketplaceStatusFilter,
  );

  // Circle-scoped data — filter enrollments/assignments/requests by selected circle
  const circleScopedEnrollments = useMemo(() => {
    if (!selectedCircleId) return enrollments as EnrollmentResponse[];
    const usersInCircle = new Set<string>();
    userCohortMap.forEach((cIds, uid) => {
      if (cIds.includes(selectedCircleId)) usersInCircle.add(uid);
    });
    return (enrollments as EnrollmentResponse[]).filter((e) => usersInCircle.has(e.user_id));
  }, [enrollments, selectedCircleId, userCohortMap]);

  const circleScopedAssignments = useMemo(() => {
    if (!selectedCircleId) return assignments as AssignmentResponse[];
    const usersInCircle = new Set<string>();
    userCohortMap.forEach((cIds, uid) => {
      if (cIds.includes(selectedCircleId)) usersInCircle.add(uid);
    });
    return (assignments as AssignmentResponse[]).filter(
      (a) => usersInCircle.has(a.cxo_user_id) || usersInCircle.has(a.startup_user_id),
    );
  }, [assignments, selectedCircleId, userCohortMap]);

  const circleScopedTimeShareRequests = useMemo(() => {
    if (!selectedCircleId) return timeShareRequests as TimeShareRequestResponse[];
    const usersInCircle = new Set<string>();
    userCohortMap.forEach((cIds, uid) => {
      if (cIds.includes(selectedCircleId)) usersInCircle.add(uid);
    });
    return (timeShareRequests as TimeShareRequestResponse[]).filter(
      (r) => usersInCircle.has(r.requester_id) || usersInCircle.has(r.recipient_id),
    );
  }, [timeShareRequests, selectedCircleId, userCohortMap]);

  const isCircleScopedTab = activeTab === 'enrollments' || activeTab === 'sessions' || activeTab === 'hours-assignments' || activeTab === 'finances';

  // Typed aliases — MUST be before any useCallback that references them,
  // otherwise the dependency array evaluation hits a TDZ in production builds.
  const allEnrollments = enrollments as EnrollmentResponse[];
  const allAssignments = assignments as AssignmentResponse[];
  const allTimeShareRequests = timeShareRequests as TimeShareRequestResponse[];

  // Create / Edit / Archive program mutations
  const { mutateAsync: createProgramMutate, isPending: createProgramLoading } = useCreateProgram();
  const { mutateAsync: updateProgramMutate, isPending: updateProgramLoading } = useUpdateProgram(
    activeProgramId ?? '',
  );

  const { mutateAsync: resolveRequest } = useResolveTimeShareRequest();
  const { mutateAsync: deleteRequestMutate } = useDeleteTimeShareRequest(activeProgramId);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyRequestId, setDenyRequestId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');

  const { data: pricingTiers = [], isLoading: pricingTiersLoading } = usePricingTiers(activeProgramId);
  const { mutateAsync: createPricingTierMutate, isPending: createTierLoading } =
    useCreatePricingTier(activeProgramId);
  const { mutateAsync: updatePricingTierMutate, isPending: updateTierLoading } =
    useUpdatePricingTier(activeProgramId);
  const { mutateAsync: deletePricingTierMutate } = useDeletePricingTier(activeProgramId);

  // Invoice / billing hooks
  const { data: invoices = [] } = useInvoices(activeProgramId);
  const { mutateAsync: uploadInvoiceMutate, isPending: uploadingInvoice } = useUploadInvoice(activeProgramId);
  const { mutateAsync: deleteInvoiceMutate } = useDeleteInvoice(activeProgramId);
  const [uploadInvoiceOpen, setUploadInvoiceOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ file_name: '', file_data: '', document_type: 'invoice', amount: '', notes: '' });

  const [createTierOpen, setCreateTierOpen] = useState(false);
  const [tierForm, setTierForm] = useState({
    tier_name: '',
    price_per_hour: '',
    accessible_cio_types: '',
    max_hours: '',
    description: '',
  });
  const [editTierOpen, setEditTierOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTierResponse | null>(null);
  const [editTierForm, setEditTierForm] = useState({
    tier_name: '',
    price_per_hour: '',
    accessible_cio_types: '',
    max_hours: '',
    description: '',
  });

  // Create program dialog
  const [createOpen, setCreateOpen] = useState(false);

  // Edit program dialog
  const [editOpen, setEditOpen] = useState(false);

  // Archive confirmation dialog
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);

  // Delete confirmation dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { mutateAsync: deleteProgramMutate } = useDeleteProgram();

  // Program relationship graph dialog
  const [graphOpen, setGraphOpen] = useState(false);

  // Escape-key handler — closes the fullscreen graph overlay.
  useEffect(() => {
    if (!graphOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGraphOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [graphOpen]);

  // Build the data shape ProgramGraph expects.
  //
  // The graph is driven by the program_assignments table. Every assignment
  // row already carries cxo_name/cxo_company/startup_name/startup_company
  // (populated server-side from user.company_affiliation at response time),
  // so we can build the full graph from assignments alone — no cross-
  // referencing of userStartupLinks or the startups table required.
  //
  // Topology:
  //   Program
  //    ├─ CxO (one per unique cxo_user_id across all assignments)
  //    │   └─ [dashed edge to each assigned startup company]
  //    └─ Startup Company (one per unique startup_company name)
  //        └─ Member (one per unique startup_user_id under that company)
  //
  // Enrollees who have NO assignment rows yet are still shown — a CxO
  // enrollee with no assignments hangs off the program node as an unpaired
  // advisor; a startup enrollee with no assignments becomes a standalone
  // company node with one member.
  const graphData = useMemo<
    {
      cxos: GraphCxo[];
      startupCompanies: GraphStartupCompany[];
      assignments: GraphAssignment[];
    } | null
  >(() => {
    if (!activeProgram) return null;

    const toSlug = (value: string): string =>
      value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // ─── Step 1: collect CxOs from assignments ────────────────────────
    // We key CxOs by user id. Each unique user becomes one node, and the
    // first row we encounter for that user supplies their name/company.
    const cxoMap = new Map<string, GraphCxo>();
    assignments.forEach((a) => {
      if (!a.cxo_user_id) return;
      if (!cxoMap.has(a.cxo_user_id)) {
        cxoMap.set(a.cxo_user_id, {
          userId: a.cxo_user_id,
          name: a.cxo_name ?? 'CxO',
          email: a.cxo_company ?? '',
        });
      }
    });

    // ─── Step 2: collect startup companies + their members from assignments ───
    // We key companies by their company name slug — this correctly groups
    // multiple startup enrollees at the same company into one node with
    // multiple members. If startup_company is missing, we fall back to the
    // person's own name so the row still renders.
    const companyMap = new Map<
      string,
      { id: string; name: string; members: GraphStartupCompany['members']; memberIds: Set<string> }
    >();
    assignments.forEach((a) => {
      if (!a.startup_user_id) return;
      const companyName =
        a.startup_company ?? a.startup_name ?? 'Unknown Startup';
      const companyId = toSlug(companyName) || `startup-${a.startup_user_id}`;

      let company = companyMap.get(companyId);
      if (!company) {
        company = {
          id: companyId,
          name: companyName,
          members: [],
          memberIds: new Set(),
        };
        companyMap.set(companyId, company);
      }

      // Dedupe members by user id — two assignments for the same founder
      // should still produce only one member node under the company.
      if (!company.memberIds.has(a.startup_user_id)) {
        company.memberIds.add(a.startup_user_id);
        company.members.push({
          userId: a.startup_user_id,
          name: a.startup_name ?? 'Unknown',
          email: '',
        });
      }
    });

    // ─── Step 3: fold in enrollees that don't appear in any assignment ───
    // A CxO enrolled in the program but not yet assigned to any startup
    // should still show up in the graph so the admin can see they're enrolled.
    // Same for a startup founder who hasn't been paired yet.
    enrollments.forEach((e) => {
      if (e.role === 'cxo') {
        if (!cxoMap.has(e.user_id)) {
          cxoMap.set(e.user_id, {
            userId: e.user_id,
            name: e.user_name ?? e.user_email ?? 'CxO',
            email: e.user_email ?? '',
          });
        }
      } else if (e.role === 'startup') {
        // For unpaired startups, we don't know their company affiliation
        // without a lookup, so fall back to the user's own name as the
        // company label. This keeps the graph honest — the admin can see
        // "this founder is enrolled but not yet in any assignment".
        const companyName = e.user_name ?? e.user_email ?? 'Unpaired Startup';
        const companyId = `unpaired-${e.user_id}`;

        let exists = false;
        companyMap.forEach((company) => {
          if (company.memberIds.has(e.user_id)) exists = true;
        });
        if (exists) return;

        companyMap.set(companyId, {
          id: companyId,
          name: companyName,
          members: [
            {
              userId: e.user_id,
              name: e.user_name ?? e.user_email ?? 'Unknown',
              email: e.user_email ?? '',
            },
          ],
          memberIds: new Set([e.user_id]),
        });
      }
    });

    // ─── Step 4: build the assignment edges ─────────────────────────
    // Each assignment row becomes one CxO → Company edge. We key to the
    // same companyId scheme used in Step 2 so edges land on real nodes.
    const graphAssignments: GraphAssignment[] = assignments
      .filter((a) => a.cxo_user_id && a.startup_user_id)
      .map((a) => {
        const companyName =
          a.startup_company ?? a.startup_name ?? 'Unknown Startup';
        const companyId = toSlug(companyName) || `startup-${a.startup_user_id}`;
        return {
          cxoUserId: a.cxo_user_id,
          startupCompanyId: companyId,
        };
      });

    const cxos = Array.from(cxoMap.values());
    const startupCompanies: GraphStartupCompany[] = Array.from(companyMap.values()).map(
      (c) => ({
        id: c.id,
        name: c.name,
        members: c.members,
      }),
    );

    return {
      cxos,
      startupCompanies,
      assignments: graphAssignments,
    };
  }, [activeProgram, enrollments, assignments]);

  // CRUD handlers
  const handleCreateProgram = async (form: ProgramFormState): Promise<void> => {
    try {
      await createProgramMutate(formToPayload(form));
      toast.success('Program created');
      setCreateOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create program');
    }
  };

  const handleEditProgram = async (form: ProgramFormState): Promise<void> => {
    if (!activeProgramId) return;
    try {
      await updateProgramMutate(formToPayload(form));
      toast.success('Program updated');
      setEditOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update program');
    }
  };

  const handleArchiveProgram = async (): Promise<void> => {
    if (!activeProgramId) return;
    setArchiveLoading(true);
    try {
      await updateProgramMutate({ status: 'archived' });
      toast.success('Program archived');
      setArchiveOpen(false);
      setSelectedProgramId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to archive program');
    } finally {
      setArchiveLoading(false);
    }
  };

  const activeEnrollmentCount = enrollments.filter(
    (e: EnrollmentResponse) => e.status === 'active',
  ).length;

  const handleDeleteProgram = async (): Promise<void> => {
    if (!activeProgramId) return;
    setDeleteLoading(true);
    try {
      await deleteProgramMutate(activeProgramId);
      toast.success('Program deleted');
      setDeleteOpen(false);
      setSelectedProgramId(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete program');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Enrollment status filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Table search filters
  const [enrollSearch, setEnrollSearch] = useState('');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');

  // Enroll dialog — multi-user search + batch enroll
  const [enrollOpen, setEnrollOpen] = useState(false);
  const enrollFileRef = useRef<HTMLInputElement>(null);
  const [enrollImporting, setEnrollImporting] = useState(false);

  const handleEnrollFileImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProgramId) return;
    setEnrollImporting(true);
    try {
      const rows = await parseMemberImportFile(file);
      const emails = rows.map((r) => r.email).filter(Boolean);
      if (emails.length === 0) { toast.error('No valid emails found in file.'); return; }
      const result = await apiFetch<{ enrolled: number; skipped: number; not_found: string[]; total: number }>(
        `/programs/${activeProgramId}/enroll-bulk`,
        { method: 'POST', body: { emails, role: 'startup' } },
      );
      toast.success(`Enrolled ${result.enrolled} members (${result.skipped} already enrolled)`);
      if (result.not_found.length > 0) {
        toast.warning(`${result.not_found.length} emails not found in members list`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setEnrollImporting(false);
      if (enrollFileRef.current) enrollFileRef.current.value = '';
    }
  }, [activeProgramId]);

  const handleEnrollExport = useCallback(() => {
    const data = allEnrollments.map((en) => ({
      name: en.user_name ?? '',
      email: en.user_email ?? '',
      role: en.role,
      tier: en.role,
      onboardingStatus: en.status,
      createdAt: en.created_at,
    }));
    const name = activeProgram?.name?.replace(/\s+/g, '-') ?? 'program';
    exportMembersToWorkbook(data, `${name}-enrollments-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`Exported ${data.length} enrollments`);
  }, [allEnrollments, activeProgram]);

  const [enrollRole, setEnrollRole] = useState<'cxo' | 'startup'>('cxo');
  const [enrollUserSearch, setEnrollUserSearch] = useState('');
  const [enrollSelected, setEnrollSelected] = useState<Array<{ id: string; name: string; email: string }>>([]);

  // Assignment dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignCioId, setAssignCioId] = useState('');
  const [assignStartupId, setAssignStartupId] = useState('');
  const [assignHours, setAssignHours] = useState('4');

  // Hours & Assignments combined tab
  const [haGroupBy, setHaGroupBy] = useState<'cxos' | 'startups'>('cxos');
  const [haSearch, setHaSearch] = useState('');
  const [bulkCxoHoursOpen, setBulkCxoHoursOpen] = useState(false);
  const [bulkStartupHoursOpen, setBulkStartupHoursOpen] = useState(false);
  const [bulkHoursValue, setBulkHoursValue] = useState('40');
  const [bulkHoursLoading, setBulkHoursLoading] = useState(false);

  // Confirmation dialog for manual hour edits
  const [hoursConfirmOpen, setHoursConfirmOpen] = useState(false);
  const [hoursConfirmDesc, setHoursConfirmDesc] = useState('');
  const [pendingHoursAction, setPendingHoursAction] = useState<(() => Promise<void>) | null>(null);
  const requestHoursConfirm = (description: string, action: () => Promise<void>) => {
    setHoursConfirmDesc(description);
    setPendingHoursAction(() => action);
    setHoursConfirmOpen(true);
  };

  // CxO payment tracking (Finances tab)
  const [editHoursPaidOpen, setEditHoursPaidOpen] = useState(false);
  const [editHoursPaidEnrollment, setEditHoursPaidEnrollment] = useState<EnrollmentResponse | null>(null);
  const [editHoursPaidValue, setEditHoursPaidValue] = useState('0');

  // Edit assignment dialog state
  const [editAssignmentOpen, setEditAssignmentOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState<AssignmentResponse | null>(null);
  const [editHoursAllocated, setEditHoursAllocated] = useState('4');
  const [editHoursUsed, setEditHoursUsed] = useState('0');
  const [editAssignmentStatus, setEditAssignmentStatus] = useState<string>('active');
  // editAssignmentMode tracks whether the edit dialog is operating on a real assignment
  // row (from the Assignments tab) or on a synthetic row projected from an enrollment in
  // the Hours tab. Different save paths are needed for each.
  const [editAssignmentMode, setEditAssignmentMode] = useState<'assignment' | 'enrollment'>(
    'assignment',
  );
  const [editEnrollmentId, setEditEnrollmentId] = useState<string | null>(null);

  // Edit enrollment dialog state (for pricing tier + hours allocated + hours completed)
  const [editEnrollmentOpen, setEditEnrollmentOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<EnrollmentResponse | null>(null);
  const [editEnrollmentForm, setEditEnrollmentForm] = useState({
    hours_committed: '',
    hours_used: '',
    pricing_tier: '',
  });

  // Generic confirm-delete dialog
  const [confirmDelete, setConfirmDelete] = useState<
    | { kind: 'enrollment'; id: string; label: string }
    | { kind: 'assignment'; id: string; label: string }
    | { kind: 'tier'; id: string; label: string }
    | { kind: 'request'; id: string; label: string }
    | null
  >(null);

  const allPricingTiers = pricingTiers as PricingTierResponse[];

  // Derived lists for assignment selectors
  const enrolledCios = allEnrollments.filter(
    (e) => e.role === 'cxo' && (e.status === 'active' || e.status === 'accepted'),
  );
  const enrolledStartups = allEnrollments.filter(
    (e) => e.role === 'startup' && (e.status === 'active' || e.status === 'accepted'),
  );

  const filteredEnrollments = circleScopedEnrollments.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (enrollSearch.trim()) {
      const q = enrollSearch.trim().toLowerCase();
      const searchable = `${e.user_name ?? ''} ${e.user_email ?? ''} ${e.role ?? ''}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  // ── Grouped enrollment view ──
  const cxoEnrollments = filteredEnrollments.filter((e) => e.role === 'cxo');

  type StartupGroup = { startupId: string; companyName: string; enrollments: EnrollmentResponse[]; totalHoursCommitted: number; totalHoursUsed: number };
  const startupGroups = useMemo<StartupGroup[]>(() => {
    const startupEnrollments = filteredEnrollments.filter((e) => e.role === 'startup');
    const byStartupId = new Map<string, EnrollmentResponse[]>();
    for (const enr of startupEnrollments) {
      const link = userStartupLinks.find((l) => l.userId === enr.user_id);
      const sid = link?.startupId ?? '__unlinked__';
      if (!byStartupId.has(sid)) byStartupId.set(sid, []);
      byStartupId.get(sid)!.push(enr);
    }
    const groups: StartupGroup[] = [];
    for (const [sid, enrs] of byStartupId) {
      const s = startups.find((st) => st.id === sid);
      groups.push({ startupId: sid, companyName: s?.companyName ?? 'Unlinked Members', enrollments: enrs, totalHoursCommitted: enrs.reduce((a, e) => a + e.hours_committed, 0), totalHoursUsed: enrs.reduce((a, e) => a + e.hours_used, 0) });
    }
    return groups.sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [filteredEnrollments, userStartupLinks, startups]);

  const [expandedStartups, setExpandedStartups] = useState<Set<string>>(new Set());
  const toggleStartup = (sid: string) => setExpandedStartups((prev) => { const next = new Set(prev); if (next.has(sid)) next.delete(sid); else next.add(sid); return next; });

  const [editStartupGroupId, setEditStartupGroupId] = useState<string | null>(null);
  const [editStartupGroupHours, setEditStartupGroupHours] = useState('');
  const [editStartupGroupUsed, setEditStartupGroupUsed] = useState('');
  const openEditStartupGroupHours = (group: StartupGroup) => { setEditStartupGroupId(group.startupId); setEditStartupGroupHours(String(group.totalHoursCommitted)); setEditStartupGroupUsed(String(group.totalHoursUsed)); };
  const handleSaveStartupGroupHours = async () => {
    if (!editStartupGroupId) return;
    const group = startupGroups.find((g) => g.startupId === editStartupGroupId);
    if (!group || group.enrollments.length === 0) return;
    const totalHours = parseInt(editStartupGroupHours, 10);
    const totalUsed = parseFloat(editStartupGroupUsed);
    if (isNaN(totalHours) || totalHours < 0) { toast.error('Hours allocated must be a valid number'); return; }
    if (isNaN(totalUsed) || totalUsed < 0) { toast.error('Hours received must be a valid number'); return; }
    const perMember = Math.floor(totalHours / group.enrollments.length);
    const remainder = totalHours - perMember * group.enrollments.length;
    const usedPerMember = Math.floor((totalUsed * 100) / group.enrollments.length) / 100;
    const usedRemainder = Math.round((totalUsed - usedPerMember * group.enrollments.length) * 100) / 100;
    let success = 0; let fail = 0;
    for (let i = 0; i < group.enrollments.length; i++) {
      try { await updateEnrollmentDetailsMutate({ enrollmentId: group.enrollments[i].id, data: { hours_committed: perMember + (i === 0 ? remainder : 0), hours_used: usedPerMember + (i === 0 ? usedRemainder : 0) } }); success++; } catch { fail++; }
    }
    if (success > 0) toast.success(`Updated hours for ${group.companyName}`);
    if (fail > 0) toast.error(`${fail} enrollment(s) failed to update`);
    setEditStartupGroupId(null);
  };

  // Handlers
  const handleEnrollSubmit = async (): Promise<void> => {
    if (enrollSelected.length === 0) {
      toast.error('Select at least one user to enroll');
      return;
    }
    let success = 0;
    let fail = 0;
    for (const u of enrollSelected) {
      try {
        await enrollMutate({ role: enrollRole, user_email: u.email, user_name: u.name });
        success++;
      } catch {
        fail++;
      }
    }
    if (success > 0) toast.success(`${success} member${success > 1 ? 's' : ''} enrolled`);
    if (fail > 0) toast.error(`${fail} enrollment${fail > 1 ? 's' : ''} failed (may already be enrolled)`);
    setEnrollOpen(false);
    setEnrollSelected([]);
    setEnrollUserSearch('');
  };

  const handleAssignmentSubmit = async (): Promise<void> => {
    if (!assignCioId || !assignStartupId) {
      toast.error('Select both a CXO and a startup');
      return;
    }
    const hours = parseInt(assignHours, 10);
    if (isNaN(hours) || hours < 1) {
      toast.error('Hours must be a positive number');
      return;
    }
    try {
      await createAssignmentMutate({
        cxo_user_id: assignCioId,
        startup_user_id: assignStartupId,
        hours_allocated: hours,
      });
      toast.success('Assignment created');
      setAssignOpen(false);
      setAssignCioId('');
      setAssignStartupId('');
      setAssignHours('4');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Assignment failed');
    }
  };

  const handleEnrollmentAction = async (
    enrollment: EnrollmentResponse,
    action: 'accept' | 'activate' | 'withdraw',
  ): Promise<void> => {
    const statusMap: Record<typeof action, string> = {
      accept: 'accepted',
      activate: 'active',
      withdraw: 'withdrawn',
    };
    try {
      await updateEnrollmentMutate({
        enrollmentId: enrollment.id,
        data: { status: statusMap[action] },
      });
      toast.success(`Enrollment ${action}d`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const handleApproveRequest = async (requestId: string): Promise<void> => {
    try {
      await resolveRequest({ requestId, action: 'approve' });
      toast.success('Request approved');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to approve request');
    }
  };

  const openDenyDialog = (requestId: string): void => {
    setDenyRequestId(requestId);
    setDenyReason('');
    setDenyDialogOpen(true);
  };

  const handleDenyRequest = async (): Promise<void> => {
    if (!denyRequestId) return;
    try {
      await resolveRequest({ requestId: denyRequestId, action: 'deny', reason: denyReason || undefined });
      toast.success('Request denied');
      setDenyDialogOpen(false);
      setDenyRequestId(null);
      setDenyReason('');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to deny request');
    }
  };

  const handleBulkSetHours = async (role: 'cxo' | 'startup'): Promise<void> => {
    const hours = parseInt(bulkHoursValue, 10);
    if (isNaN(hours) || hours < 0) {
      toast.error('Hours must be a non-negative number');
      return;
    }
    const targets = circleScopedEnrollments.filter((e) => e.role === role);
    if (targets.length === 0) {
      toast.error(`No ${role === 'cxo' ? 'CxO' : 'Startup'} enrollments found`);
      return;
    }
    setBulkHoursLoading(true);
    try {
      await Promise.all(
        targets.map((e) =>
          updateEnrollmentDetailsMutate({
            enrollmentId: e.id,
            data: { hours_committed: hours },
          }),
        ),
      );
      toast.success(`Set ${hours}h for ${targets.length} ${role === 'cxo' ? 'CxO' : 'Startup'} enrollment(s)`);
      if (role === 'cxo') setBulkCxoHoursOpen(false);
      else setBulkStartupHoursOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update hours');
    } finally {
      setBulkHoursLoading(false);
    }
  };

  const handleSaveHoursPaid = async (): Promise<void> => {
    if (!editHoursPaidEnrollment) return;
    const val = parseInt(editHoursPaidValue, 10);
    if (isNaN(val) || val < 0) {
      toast.error('Hours paid must be a non-negative number');
      return;
    }
    try {
      await updateEnrollmentDetailsMutate({
        enrollmentId: editHoursPaidEnrollment.id,
        data: { hours_paid: val } as unknown as Parameters<typeof updateEnrollmentDetailsMutate>[0]['data'],
      });
      toast.success('Hours paid updated');
      setEditHoursPaidOpen(false);
      setEditHoursPaidEnrollment(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update hours paid');
    }
  };

  const handleCreateTier = async (): Promise<void> => {
    if (!tierForm.tier_name.trim()) {
      toast.error('Tier name is required');
      return;
    }
    const price = parseFloat(tierForm.price_per_hour);
    if (isNaN(price) || price < 0) {
      toast.error('Price per hour must be a valid number');
      return;
    }
    try {
      await createPricingTierMutate({
        tier_name: tierForm.tier_name.trim(),
        price_per_hour: price,
        accessible_cio_types: tierForm.accessible_cio_types
          ? tierForm.accessible_cio_types.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        max_hours: tierForm.max_hours ? parseInt(tierForm.max_hours, 10) : undefined,
        description: tierForm.description.trim() || undefined,
      });
      toast.success('Pricing tier created');
      setCreateTierOpen(false);
      setTierForm({ tier_name: '', price_per_hour: '', accessible_cio_types: '', max_hours: '', description: '' });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create tier');
    }
  };

  // ── Assignment edit/delete ──
  const openEditAssignmentDialog = (a: AssignmentResponse): void => {
    setEditAssignment(a);
    setEditAssignmentMode('assignment');
    setEditEnrollmentId(null);
    setEditHoursAllocated(String(a.hours_allocated));
    setEditHoursUsed(String(a.hours_used));
    setEditAssignmentStatus(a.status ?? 'active');
    setEditAssignmentOpen(true);
  };

  const handleSaveAssignment = async (): Promise<void> => {
    if (!editAssignment) return;
    const hours = parseInt(editHoursAllocated, 10);
    if (isNaN(hours) || hours < 1) {
      toast.error('Hours must be a positive number');
      return;
    }
    try {
      if (editAssignmentMode === 'assignment') {
        const usedVal = parseFloat(editHoursUsed);
        await updateAssignmentMutate({
          assignmentId: editAssignment.id,
          data: { hours_allocated: hours, hours_used: isNaN(usedVal) ? undefined : usedVal, status: editAssignmentStatus },
        });
      } else if (editAssignmentMode === 'enrollment' && editEnrollmentId) {
        await updateEnrollmentDetailsMutate({
          enrollmentId: editEnrollmentId,
          data: { hours_committed: hours },
        });
      }
      toast.success('Saved');
      setEditAssignmentOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  // ── Enrollment edit/delete ──
  const openEditEnrollmentDialog = (enr: EnrollmentResponse): void => {
    setEditingEnrollment(enr);
    setEditEnrollmentForm({
      hours_committed: String(enr.hours_committed ?? ''),
      hours_used: String(enr.hours_used ?? ''),
      pricing_tier: enr.pricing_tier ?? '',
    });
    setEditEnrollmentOpen(true);
  };

  const handleSaveEnrollment = async (): Promise<void> => {
    if (!editingEnrollment) return;
    const hours = parseInt(editEnrollmentForm.hours_committed, 10);
    if (isNaN(hours) || hours < 0) {
      toast.error('Hours allocated must be a non-negative integer');
      return;
    }
    const hoursUsed = parseFloat(editEnrollmentForm.hours_used);
    if (isNaN(hoursUsed) || hoursUsed < 0) {
      toast.error('Hours completed must be a non-negative number');
      return;
    }
    try {
      await updateEnrollmentDetailsMutate({
        enrollmentId: editingEnrollment.id,
        data: {
          hours_committed: hours,
          hours_used: hoursUsed,
          pricing_tier: editEnrollmentForm.pricing_tier || undefined,
        },
      });
      toast.success('Enrollment updated');
      setEditEnrollmentOpen(false);
      setEditingEnrollment(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update enrollment');
    }
  };

  // ── Pricing tier edit ──
  const openEditTierDialog = (tier: PricingTierResponse): void => {
    setEditingTier(tier);
    setEditTierForm({
      tier_name: tier.tier_name,
      price_per_hour: String(tier.price_per_hour),
      accessible_cio_types: tier.accessible_cio_types.join(', '),
      max_hours: tier.max_hours != null ? String(tier.max_hours) : '',
      description: tier.description ?? '',
    });
    setEditTierOpen(true);
  };

  const handleSaveTier = async (): Promise<void> => {
    if (!editingTier) return;
    if (!editTierForm.tier_name.trim()) {
      toast.error('Tier name is required');
      return;
    }
    const price = parseFloat(editTierForm.price_per_hour);
    if (isNaN(price) || price < 0) {
      toast.error('Price per hour must be a valid number');
      return;
    }
    try {
      await updatePricingTierMutate({
        tierId: editingTier.id,
        data: {
          tier_name: editTierForm.tier_name.trim(),
          price_per_hour: price,
          accessible_cio_types: editTierForm.accessible_cio_types
            ? editTierForm.accessible_cio_types.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          max_hours: editTierForm.max_hours ? parseInt(editTierForm.max_hours, 10) : null,
          description: editTierForm.description.trim() || undefined,
        },
      });
      toast.success('Pricing tier updated');
      setEditTierOpen(false);
      setEditingTier(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update tier');
    }
  };

  // ── Confirm delete dispatcher ──
  const handleConfirmDelete = async (): Promise<void> => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.kind === 'enrollment') {
        await deleteEnrollmentMutate(confirmDelete.id);
        toast.success('Enrollment deleted');
      } else if (confirmDelete.kind === 'assignment') {
        await deleteAssignmentMutate(confirmDelete.id);
        toast.success('Assignment deleted');
      } else if (confirmDelete.kind === 'tier') {
        await deletePricingTierMutate(confirmDelete.id);
        toast.success('Pricing tier deleted');
      } else if (confirmDelete.kind === 'request') {
        await deleteRequestMutate(confirmDelete.id);
        toast.success('Request deleted');
      }
      setConfirmDelete(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  // ── Hours & Assignments: memoized grouping ──
  const haSearchNorm = haSearch.trim().toLowerCase();

  const cxoGrouped = useMemo(() => {
    const scopedAssignments = circleScopedAssignments;
    const scopedEnrollments = circleScopedEnrollments;
    const grouped = new Map<string, { name: string; company: string; assignments: AssignmentResponse[]; enrollment: EnrollmentResponse | undefined }>();
    scopedAssignments.forEach((a) => {
      if (!a.cxo_user_id) return;
      const searchable = `${a.cxo_name ?? ''} ${a.cxo_company ?? ''}`.toLowerCase();
      if (haSearchNorm && !searchable.includes(haSearchNorm)) return;
      if (!grouped.has(a.cxo_user_id)) {
        grouped.set(a.cxo_user_id, {
          name: a.cxo_name ?? 'CxO',
          company: a.cxo_company ?? '',
          assignments: [],
          enrollment: scopedEnrollments.find((e) => e.user_id === a.cxo_user_id && e.role === 'cxo'),
        });
      }
      grouped.get(a.cxo_user_id)!.assignments.push(a);
    });
    scopedEnrollments.filter((e) => e.role === 'cxo' && !grouped.has(e.user_id)).forEach((e) => {
      const searchable = `${e.user_name ?? ''} ${e.user_email ?? ''}`.toLowerCase();
      if (haSearchNorm && !searchable.includes(haSearchNorm)) return;
      grouped.set(e.user_id, { name: e.user_name ?? 'CxO', company: '', assignments: [], enrollment: e });
    });
    return Array.from(grouped.entries());
  }, [circleScopedAssignments, circleScopedEnrollments, haSearchNorm]);

  const startupGrouped = useMemo(() => {
    const scopedAssignments = circleScopedAssignments;
    const grouped = new Map<string, { company: string; assignments: AssignmentResponse[] }>();
    scopedAssignments.forEach((a) => {
      const company = a.startup_company ?? a.startup_name ?? 'Unknown Startup';
      const searchable = `${company} ${a.startup_name ?? ''}`.toLowerCase();
      if (haSearchNorm && !searchable.includes(haSearchNorm)) return;
      if (!grouped.has(company)) {
        grouped.set(company, { company, assignments: [] });
      }
      grouped.get(company)!.assignments.push(a);
    });
    return Array.from(grouped.entries());
  }, [circleScopedAssignments, haSearchNorm]);

  // Stats cards (shared between overview and hours tabs)
  const hoursUsed = hoursData?.hours_used ?? activeProgram?.hours_used ?? 0;
  const hoursTotal = hoursData?.total_hours ?? activeProgram?.total_hours ?? 0;
  const hoursRemaining = hoursData?.hours_remaining ?? hoursTotal - hoursUsed;

  const statsCards = (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="CXOs Enrolled" value={activeProgram?.cxo_count ?? 0} accent="amber" />
      <StatCard label="Startups Enrolled" value={activeProgram?.startup_count ?? 0} accent="cyan" />
      <StatCard
        label="Hours Used / Total"
        value={`${hoursUsed} / ${hoursTotal}`}
        accent="emerald"
      />
      <StatCard label="Time Remaining" value={`${hoursRemaining}h`} accent="purple" />
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Programs</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage CXO time-share programs — enrollments, marketplace requests, and pricing.
          </p>
        </div>

        {/* Program selector + CRUD actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {programs.length > 1 && (
            <Select
              value={activeProgramId ?? ''}
              onValueChange={(v) => setSelectedProgramId(v || null)}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                {[...programs].sort((a: ProgramResponse, b: ProgramResponse) => (b.cxo_count + b.startup_count) - (a.cxo_count + a.startup_count)).map((p: ProgramResponse) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.cxo_count + p.startup_count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {activeProgram && (
            <Badge className={programStatusBadgeClass(activeProgram.status)}>
              {activeProgram.status}
            </Badge>
          )}
          {activeProgram && (
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          )}
          {activeProgram && activeProgram.status !== 'archived' && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setArchiveOpen(true)}
            >
              Archive
            </Button>
          )}
          {activeProgram && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          )}
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            + New Program
          </Button>
        </div>
      </div>

      {/* Loading / empty state */}
      {programsLoading && <ProgramOverviewSkeleton />}

      {!programsLoading && programs.length === 0 && (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <svg
                className="h-7 w-7 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-700">No programs yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Create your first advisory program to get started.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>Create your first program</Button>
          </CardContent>
        </Card>
      )}

      {/* Main tabs — only show once we have programs OR while loading */}
      {(programs.length > 0 || programsLoading) && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex h-auto w-full justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap sm:justify-center">
            <TabsTrigger value="overview" className="shrink-0">Overview</TabsTrigger>
            <TabsTrigger value="circles" className="shrink-0">Circles</TabsTrigger>
            <TabsTrigger value="enrollments" className="shrink-0">Enrollments</TabsTrigger>
            <TabsTrigger value="sessions" className="shrink-0">Sessions</TabsTrigger>
            <TabsTrigger value="hours-assignments" className="shrink-0">Hours &amp; Assignments</TabsTrigger>
            <TabsTrigger value="finances" className="shrink-0">Finances</TabsTrigger>
            <TabsTrigger value="fields" className="shrink-0">Fields</TabsTrigger>
            <TabsTrigger value="calendar" className="shrink-0">Calendar</TabsTrigger>
          </TabsList>

          {/* Circle scope selector — always visible when circles exist */}
          {(cohorts as CohortResponse[]).length > 0 && (
            <div className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Scope:</span>
              <Select value={selectedCircleId ?? '__all__'} onValueChange={(v) => setSelectedCircleId(v === '__all__' ? null : v)}>
                <SelectTrigger className="h-8 w-52 text-xs bg-white">
                  <SelectValue placeholder="All circles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All circles (program-wide)</SelectItem>
                  {(cohorts as CohortResponse[]).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}{c.enrollment_count != null ? ` (${c.enrollment_count})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCircleId && (
                <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                  {circleScopedEnrollments.length} enrolled in circle
                </Badge>
              )}
              {selectedCircleId && (
                <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500" onClick={() => setSelectedCircleId(null)}>
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* ── Overview ── */}
          <TabsContent value="overview" className="mt-4 space-y-6">
            {statsCards}

            {activeProgram && (
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <CardTitle className="text-base">{activeProgram.name}</CardTitle>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setGraphOpen(true)}
                    >
                      <Network className="mr-1.5 h-4 w-4" />
                      View Graph
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                      Edit
                    </Button>
                    {activeProgram.status !== 'archived' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setArchiveOpen(true)}
                      >
                        Archive
                      </Button>
                    )}
                    {activeProgram && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteOpen(true)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  {activeProgram.description && (
                    <p className="text-slate-600">{activeProgram.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">Status:</span>
                    <Badge className={programStatusBadgeClass(activeProgram.status)}>
                      {activeProgram.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">Total hours:</span>
                    <span>{activeProgram.total_hours}h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">Duration:</span>
                    <span>{activeProgram.duration_months} months</span>
                  </div>
                  {activeProgram.starts_at && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">Start:</span>
                      <span>{new Date(activeProgram.starts_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  {activeProgram.ends_at && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">End:</span>
                      <span>{new Date(activeProgram.ends_at).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">Program ID:</span>
                    <code className="rounded bg-slate-100 px-1 text-xs">{activeProgram.id}</code>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Enrollments ── */}
          <TabsContent value="enrollments" className="mt-4 space-y-4">
            {/* Top action bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search enrollments..."
                    value={enrollSearch}
                    onChange={(e) => setEnrollSearch(e.target.value)}
                    className="pl-8 h-8 w-48 text-xs"
                  />
                </div>
                <p className="text-sm text-slate-600">
                  {filteredEnrollments.length} of{' '}
                  {allEnrollments.length} enrollment
                  {allEnrollments.length !== 1 ? 's' : ''}
                </p>

                {/* Status filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 w-full text-xs sm:w-36">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="pending_payment">Pending payment</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Link to AdminUsers filtered by program */}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  disabled={!activeProgramId}
                  onClick={() =>
                    activeProgramId &&
                    void navigate(`/admin/users?program=${activeProgramId}`)
                  }
                >
                  View in Members →
                </Button>

                <input
                  ref={enrollFileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => void handleEnrollFileImport(e)}
                />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!activeProgramId || enrollImporting}
                  onClick={() => enrollFileRef.current?.click()}
                  title="Import enrollments from Excel/CSV"
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  {enrollImporting ? 'Importing...' : 'Import'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={allEnrollments.length === 0}
                  onClick={handleEnrollExport}
                  title="Export enrollments to Excel"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export
                </Button>
                <Button
                  size="sm"
                  className="flex-1 sm:flex-none"
                  disabled={!activeProgramId}
                  onClick={() => setEnrollOpen(true)}
                >
                  Enroll Member
                </Button>
              </div>
            </div>

            {enrollmentsLoading && allEnrollments.length === 0 ? (
              <TableSkeleton rows={6} columns={5} />
            ) : null}

            {allEnrollments.length === 0 && !enrollmentsLoading ? (
              <p className="text-sm text-slate-500">No enrollments yet.</p>
            ) : null}

            {allEnrollments.length > 0 &&
              filteredEnrollments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No enrollments match the selected filter.
              </p>
            ) : null}

            {/* ── CxO Advisors ── */}
            {cxoEnrollments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">CxO Advisors ({cxoEnrollments.length})</h3>
                <Card><FadedScroll variant="subtle"><Table>
                  <TableHeader><TableRow>
                    <TableHead>Advisor</TableHead><TableHead>Circle<InfoTip text="The peer group this advisor belongs to within the program." /></TableHead><TableHead>Status<InfoTip text="Invited = onboarding email sent. Active = fully participating. Withdrawn = removed from program." /></TableHead><TableHead>Hours<InfoTip text="Advisory hours contributed vs. total allocated for this CxO." /></TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>{cxoEnrollments.map((enr) => (
                    <TableRow key={enr.id}>
                      <TableCell><div className="font-medium text-slate-900">{enr.user_name}</div><div className="text-xs text-slate-500">{enr.user_email}</div></TableCell>
                      <TableCell><CircleBadges userId={enr.user_id} userCohortMap={userCohortMap} cohorts={cohorts as CohortResponse[]} /></TableCell>
                      <TableCell><Badge className={statusBadgeClass(enr.status)}>{enr.status}</Badge></TableCell>
                      <TableCell><span className="text-sm text-slate-700">{enr.hours_used} / {enr.hours_committed}h</span> <span className="text-xs text-slate-400">contributed</span></TableCell>
                      <TableCell><div className="flex justify-end gap-1">
                        {enr.status === 'invited' && <Button size="sm" variant="outline" onClick={() => void handleEnrollmentAction(enr, 'accept')}>Accept</Button>}
                        {(enr.status === 'accepted' || enr.status === 'pending_payment') && <Button size="sm" variant="outline" onClick={() => void handleEnrollmentAction(enr, 'activate')}>Activate</Button>}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Edit" onClick={() => openEditEnrollmentDialog(enr)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Delete" onClick={() => setConfirmDelete({ kind: 'enrollment', id: enr.id, label: `${enr.user_name ?? 'member'} from this program` })}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div></TableCell>
                    </TableRow>
                  ))}</TableBody>
                </Table></FadedScroll></Card>
              </div>
            )}

            {/* ── Startup Companies (grouped accordion) ── */}
            {startupGroups.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Startup Companies ({startupGroups.length})</h3>
                <div className="space-y-2">{startupGroups.map((group) => {
                  const isExpanded = expandedStartups.has(group.startupId);
                  return (
                    <Card key={group.startupId}>
                      <button type="button" className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50 transition-colors" onClick={() => toggleStartup(group.startupId)}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-xs font-bold text-cyan-700">{group.companyName.slice(0, 2).toUpperCase()}</div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{group.companyName}</p>
                            <p className="text-xs text-slate-500">{group.enrollments.length} member{group.enrollments.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm text-slate-600">{group.totalHoursUsed} / {group.totalHoursCommitted}h<InfoTip text="Total advisory hours received vs. allocated for this startup company (shared across all members)." /></span>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Edit hours for this startup" onClick={(e) => { e.stopPropagation(); openEditStartupGroupHours(group); }}><Pencil className="h-3.5 w-3.5" /></Button>
                          <span className="text-slate-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t px-4 pb-3"><Table>
                          <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Circle<InfoTip text="The peer group this member belongs to." /></TableHead><TableHead>Status<InfoTip text="Invited = onboarding email sent. Accepted = onboarded, awaiting payment. Active = fully participating." /></TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                          <TableBody>{group.enrollments.map((enr) => (
                            <TableRow key={enr.id}>
                              <TableCell><div className="font-medium text-slate-900">{enr.user_name}</div><div className="text-xs text-slate-500">{enr.user_email}</div></TableCell>
                              <TableCell><CircleBadges userId={enr.user_id} userCohortMap={userCohortMap} cohorts={cohorts as CohortResponse[]} /></TableCell>
                              <TableCell><Badge className={statusBadgeClass(enr.status)}>{enr.status}</Badge></TableCell>
                              <TableCell><div className="flex justify-end gap-1">
                                {enr.status === 'invited' && <Button size="sm" variant="outline" onClick={() => void handleEnrollmentAction(enr, 'accept')}>Accept</Button>}
                                {enr.status !== 'withdrawn' && enr.status !== 'completed' && <Button size="sm" variant="ghost" className="text-amber-600 hover:text-amber-700" onClick={() => void handleEnrollmentAction(enr, 'withdraw')}>Withdraw</Button>}
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" title="Remove" onClick={() => setConfirmDelete({ kind: 'enrollment', id: enr.id, label: `${enr.user_name ?? 'member'} from this program` })}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div></TableCell>
                            </TableRow>
                          ))}</TableBody>
                        </Table></div>
                      )}
                    </Card>
                  );
                })}</div>
              </div>
            )}

            {/* Edit Startup Group Hours */}
            <Dialog open={!!editStartupGroupId} onOpenChange={(open) => { if (!open) setEditStartupGroupId(null); }}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader><DialogTitle>Edit Startup Hours</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Set the total hours for <strong>{startupGroups.find((g) => g.startupId === editStartupGroupId)?.companyName ?? 'this startup'}</strong>. Hours are distributed evenly across enrolled members.</p>
                  <div className="space-y-2"><Label htmlFor="startup-group-hours">Hours Allocated (denominator)</Label><Input id="startup-group-hours" type="number" min={0} value={editStartupGroupHours} onChange={(e) => setEditStartupGroupHours(e.target.value)} /></div>
                  <div className="space-y-2"><Label htmlFor="startup-group-used">Hours Received (numerator)</Label><Input id="startup-group-used" type="number" min={0} step="0.5" value={editStartupGroupUsed} onChange={(e) => setEditStartupGroupUsed(e.target.value)} /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setEditStartupGroupId(null)}>Cancel</Button><Button onClick={() => {
                  const group = startupGroups.find((g) => g.startupId === editStartupGroupId);
                  requestHoursConfirm(
                    `This will distribute ${editStartupGroupHours}h across ${group?.enrollments.length ?? 0} member(s) of ${group?.companyName ?? 'this startup'}.`,
                    handleSaveStartupGroupHours,
                  );
                }}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ── Sessions (formerly Marketplace / Requests) ── */}
          <TabsContent value="sessions" className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={marketplaceSearch}
                  onChange={(e) => setMarketplaceSearch(e.target.value)}
                  className="pl-8 h-8 w-48 text-xs"
                />
              </div>
              <p className="text-sm text-slate-600">Session requests for this program</p>
              <Select value={marketplaceStatusFilter} onValueChange={setMarketplaceStatusFilter}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeShareRequestsLoading && circleScopedTimeShareRequests.length === 0 ? (
              <TableSkeleton rows={6} columns={6} />
            ) : !timeShareRequestsLoading && circleScopedTimeShareRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No requests found.</p>
            ) : (
              <Card>
                <FadedScroll variant="subtle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requester<InfoTip text="The user who initiated this session request." /></TableHead>
                      <TableHead>Requester Circle<InfoTip text="Which circle the requester belongs to. Only members in the same circle can request sessions with each other." /></TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Recipient Circle</TableHead>
                      <TableHead>Type<InfoTip text="The type of advisory session requested (e.g. 1-on-1, group)." /></TableHead>
                      <TableHead>Hours<InfoTip text="Number of advisory hours requested for this session." /></TableHead>
                      <TableHead>Status<InfoTip text="Pending = awaiting admin approval. Approved = session confirmed. Denied = request rejected." /></TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {circleScopedTimeShareRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="font-medium text-slate-900">{req.requester_name ?? '—'}</div>
                          {req.requester_company && (
                            <div className="text-xs text-slate-500">{req.requester_company}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <CircleBadges userId={req.requester_id} userCohortMap={userCohortMap} cohorts={cohorts as CohortResponse[]} />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{req.recipient_name ?? '—'}</div>
                          {req.recipient_company && (
                            <div className="text-xs text-slate-500">{req.recipient_company}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <CircleBadges userId={req.recipient_id} userCohortMap={userCohortMap} cohorts={cohorts as CohortResponse[]} />
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {req.request_type ?? '—'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-700">{req.hours_requested}h</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={marketplaceBadgeClass(req.status)}>{req.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            {req.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void handleApproveRequest(req.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-amber-600 hover:text-amber-700"
                                  onClick={() => openDenyDialog(req.id)}
                                >
                                  Deny
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Delete request"
                              onClick={() =>
                                setConfirmDelete({
                                  kind: 'request',
                                  id: req.id,
                                  label: `${req.requester_name ?? 'Requester'} → ${req.recipient_name ?? 'recipient'}`,
                                })
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs text-blue-600"
                              onClick={() => navigate('/admin/meetings')}
                            >
                              View in Sessions &rarr;
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </FadedScroll>
              </Card>
            )}
          </TabsContent>

          {/* ── Hours & Assignments (combined) ── */}
          <TabsContent value="hours-assignments" className="mt-4 space-y-4">
            {/* Top bar: search, toggle, bulk actions, create */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or company..."
                    value={haSearch}
                    onChange={(e) => setHaSearch(e.target.value)}
                    className="pl-8 h-8 w-56 text-xs"
                  />
                </div>
                <div className="flex rounded-md border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-medium transition-colors ${haGroupBy === 'cxos' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    onClick={() => setHaGroupBy('cxos')}
                  >
                    CxOs First
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs font-medium transition-colors ${haGroupBy === 'startups' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    onClick={() => setHaGroupBy('startups')}
                  >
                    Startups First
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setBulkHoursValue(String(activeProgram?.hours_per_cxo ?? 40)); setBulkCxoHoursOpen(true); }}
                >
                  Set All CxO Hours
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setBulkHoursValue(String(activeProgram?.max_hours_per_startup ?? 40)); setBulkStartupHoursOpen(true); }}
                >
                  Set All Startup Hours
                </Button>
                <Button
                  size="sm"
                  disabled={!activeProgramId || enrolledCios.length === 0 || enrolledStartups.length === 0}
                  onClick={() => setAssignOpen(true)}
                >
                  Create Assignment
                </Button>
              </div>
            </div>

            {assignmentsLoading && allAssignments.length === 0 ? (
              <TableSkeleton rows={6} columns={4} />
            ) : allAssignments.length === 0 && allEnrollments.length === 0 && !assignmentsLoading ? (
              <p className="text-sm text-slate-500">No assignments or enrollments yet.</p>
            ) : (
              <>
                {/* ── CxOs-first accordion ── */}
                {haGroupBy === 'cxos' && (cxoGrouped.length === 0 ? (
                  <p className="text-sm text-slate-500">No matching CxOs found.</p>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {cxoGrouped.map(([userId, data]) => {
                      const totalUsed = data.assignments.reduce((s, a) => s + a.hours_used, 0);
                      const totalCommitted = data.enrollment?.hours_committed ?? 0;
                      const overallPct = totalCommitted > 0 ? Math.min(100, Math.round((totalUsed / totalCommitted) * 100)) : 0;
                      const expectedDenom = activeProgram?.hours_per_cxo ?? 40;
                      const denomMismatch = totalCommitted !== expectedDenom;
                      return (
                        <AccordionItem key={userId} value={userId} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex flex-1 items-center justify-between pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-slate-800">{data.name}</span>
                                {data.company && <span className="text-xs text-slate-500">{data.company}</span>}
                                <Badge className={roleBadgeClass('cxo')}>CxO</Badge>
                                {denomMismatch && (
                                  <Badge className="bg-amber-100 text-amber-700 text-[10px]" title={`Expected ${expectedDenom}h (per-CxO default), actual ${totalCommitted}h`}>
                                    ⚠ {totalCommitted}h ≠ {expectedDenom}h default
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">{totalUsed} / {totalCommitted}h</span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
                                </div>
                                {data.enrollment && (
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); openEditEnrollmentDialog(data.enrollment!); }} title="Edit committed hours">
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            {data.assignments.length === 0 ? (
                              <p className="text-xs text-slate-400 py-2">No assignments yet.</p>
                            ) : (
                              <div className="divide-y divide-slate-100">
                                {data.assignments.map((a) => {
                                  const aPct = a.hours_allocated > 0 ? Math.min(100, Math.round((a.hours_used / a.hours_allocated) * 100)) : 0;
                                  return (
                                    <div key={a.id} className="flex items-center justify-between py-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-700">{a.startup_company ?? a.startup_name ?? '—'}</span>
                                        <Badge className={assignmentStatusBadgeClass(a.status)}>{a.status}</Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">{a.hours_used} / {a.hours_allocated}h</span>
                                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${aPct}%` }} />
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditAssignmentDialog(a)}>
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => setConfirmDelete({ kind: 'assignment', id: a.id, label: `${a.cxo_name ?? 'CxO'} - ${a.startup_company ?? a.startup_name ?? 'startup'}` })}>
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ))}

                {/* ── Startups-first accordion ── */}
                {haGroupBy === 'startups' && (startupGrouped.length === 0 ? (
                  <p className="text-sm text-slate-500">No matching startups found.</p>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {startupGrouped.map(([key, data]) => {
                      const totalUsed = data.assignments.reduce((s, a) => s + a.hours_used, 0);
                      const totalAllocated = data.assignments.reduce((s, a) => s + a.hours_allocated, 0);
                      const overallPct = totalAllocated > 0 ? Math.min(100, Math.round((totalUsed / totalAllocated) * 100)) : 0;
                      const startupUserId = data.assignments[0]?.startup_user_id;
                      const startupEnrollment = startupUserId ? allEnrollments.find((e) => e.user_id === startupUserId) : undefined;
                      const expectedDenom = activeProgram?.max_hours_per_startup ?? 40;
                      const startupCommitted = startupEnrollment?.hours_committed ?? 0;
                      const denomMismatch = startupCommitted !== expectedDenom;
                      return (
                        <AccordionItem key={key} value={key} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex flex-1 items-center justify-between pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-slate-800">{data.company}</span>
                                <Badge className={roleBadgeClass('startup')}>Startup</Badge>
                                {denomMismatch && (
                                  <Badge className="bg-amber-100 text-amber-700 text-[10px]" title={`Expected ${expectedDenom}h (per-startup default), actual ${startupCommitted}h`}>
                                    ⚠ {startupCommitted}h ≠ {expectedDenom}h default
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">{totalUsed} / {totalAllocated}h</span>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
                                </div>
                                {startupEnrollment && (
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); openEditEnrollmentDialog(startupEnrollment); }} title="Edit committed hours">
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="divide-y divide-slate-100">
                              {data.assignments.map((a) => {
                                const aPct = a.hours_allocated > 0 ? Math.min(100, Math.round((a.hours_used / a.hours_allocated) * 100)) : 0;
                                return (
                                  <div key={a.id} className="flex items-center justify-between py-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-700">{a.cxo_name ?? '—'}</span>
                                      {a.cxo_company && <span className="text-xs text-slate-400">{a.cxo_company}</span>}
                                      <Badge className={assignmentStatusBadgeClass(a.status)}>{a.status}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-500">{a.hours_used} / {a.hours_allocated}h</span>
                                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${aPct}%` }} />
                                      </div>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditAssignmentDialog(a)}>
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => setConfirmDelete({ kind: 'assignment', id: a.id, label: `${a.cxo_name ?? 'CxO'} - ${a.startup_company ?? a.startup_name ?? 'startup'}` })}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ))}
              </>
            )}
          </TabsContent>

          {/* ── Finances (formerly Pricing) ── */}
          <TabsContent value="finances" className="mt-4 space-y-6">
            {/* CxO Payment Tracking */}
            {(() => {
              const cxoEnrollments = circleScopedEnrollments.filter((e) => e.role === 'cxo');
              if (cxoEnrollments.length === 0) return null;
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">CxO Payment Tracking<InfoTip text="Tracks how many advisory hours each CxO has been paid for. Green = paid, Yellow = contributed but unpaid, Gray = remaining to contribute." /></CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-slate-100">
                    {cxoEnrollments.map((enr) => {
                      const committed = enr.hours_committed || 1; // avoid div-by-zero
                      const paid = enr.hours_paid ?? 0;
                      const used = enr.hours_used;
                      const paidPct = Math.max(0, Math.min(100, (paid / committed) * 100));
                      const unpaidPct = Math.max(0, Math.min(100, ((used - paid) / committed) * 100));
                      const remainPct = Math.max(0, Math.min(100, ((committed - used) / committed) * 100));
                      return (
                        <div key={enr.id} className="py-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-slate-800">{enr.user_name}</span>
                              <Badge className={roleBadgeClass('cxo')}>CxO</Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openEditEnrollmentDialog(enr)} title="Edit committed hours">
                                <Pencil className="h-3 w-3 mr-1" />Hours
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditHoursPaidEnrollment(enr); setEditHoursPaidValue(String(paid)); setEditHoursPaidOpen(true); }}>
                                Edit Paid
                              </Button>
                            </div>
                          </div>
                          {/* 3-segment bar */}
                          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="bg-green-500 transition-all"
                              style={{ width: `${paidPct}%` }}
                              title={`Paid: ${paid}h`}
                            />
                            <div
                              className="bg-yellow-400 transition-all"
                              style={{ width: `${unpaidPct}%` }}
                              title={`Contributed, not paid: ${Math.max(0, used - paid)}h`}
                            />
                            <div
                              className="bg-gray-300 transition-all"
                              style={{ width: `${remainPct}%` }}
                              title={`Yet to contribute: ${Math.max(0, committed - used)}h`}
                            />
                          </div>
                          <div className="flex gap-4 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-green-500" />Paid: {paid}h</span>
                            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />Unpaid: {Math.max(0, used - paid)}h</span>
                            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-gray-300" />Remaining: {Math.max(0, committed - used)}h</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Billing History & Documents */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Billing History</CardTitle>
                <Button size="sm" onClick={() => { setInvoiceForm({ file_name: '', file_data: '', document_type: 'invoice', amount: '', notes: '' }); setUploadInvoiceOpen(true); }}>
                  <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                </Button>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No invoices or receipts uploaded yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center gap-4 py-3">
                        <div className="rounded-lg bg-slate-100 p-2 shrink-0">
                          <FileText className="h-4 w-4 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{inv.file_name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Badge variant="outline" className="text-[10px] capitalize">{inv.document_type}</Badge>
                            {inv.amount != null && <span>${inv.amount.toFixed(2)}</span>}
                            <span>{new Date(inv.created_at).toLocaleDateString()}</span>
                          </div>
                          {inv.notes && <p className="text-xs text-slate-500 mt-0.5 truncate">{inv.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="View document" onClick={() => {
                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(inv.file_name);
                            const ext = (inv.file_name.match(/\.(\w+)$/)?.[1] ?? 'pdf').toLowerCase();
                            const mime = isImage ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : 'application/pdf';
                            const binary = atob(inv.file_data);
                            const bytes = new Uint8Array(binary.length);
                            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                            const blob = new Blob([bytes], { type: mime });
                            window.open(URL.createObjectURL(blob), '_blank');
                          }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" title="Delete" onClick={() => {
                            if (confirm('Delete this document?')) void deleteInvoiceMutate(inv.id);
                          }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Tiers */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {allPricingTiers.length} pricing tier
                {allPricingTiers.length !== 1 ? 's' : ''}
              </p>
              <Button
                size="sm"
                disabled={!activeProgramId}
                onClick={() => setCreateTierOpen(true)}
              >
                + Create Tier
              </Button>
            </div>

            {pricingTiersLoading && allPricingTiers.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-200 bg-white p-4 space-y-3"
                    style={{ opacity: Math.max(0.5, 1 - i * 0.12) }}
                  >
                    <div className="flex items-center justify-between">
                      <SkeletonBlock className="h-4 w-24" />
                      <SkeletonBlock className="h-5 w-5 rounded" />
                    </div>
                    <SkeletonBlock className="h-6 w-20" />
                    <SkeletonBlock className="h-3 w-3/4" />
                    <SkeletonBlock className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : !pricingTiersLoading && allPricingTiers.length === 0 ? (
              <p className="text-sm text-slate-500">No pricing tiers yet. Create one to get started.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allPricingTiers.map((tier) => (
                  <Card key={tier.id}>
                    <CardHeader className="pb-2 flex flex-row items-start justify-between">
                      <CardTitle className="text-base">{tier.tier_name}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          title="Edit tier"
                          onClick={() => openEditTierDialog(tier)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          title="Delete tier"
                          onClick={() =>
                            setConfirmDelete({ kind: 'tier', id: tier.id, label: tier.tier_name })
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">Price / hr:</span>
                        <span>${tier.price_per_hour.toFixed(2)}</span>
                      </div>
                      {tier.max_hours !== null && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">Max hours:</span>
                          <span>{tier.max_hours}h</span>
                        </div>
                      )}
                      {tier.accessible_cio_types.length > 0 && (
                        <div>
                          <span className="font-medium text-slate-700">CXO types:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {tier.accessible_cio_types.map((t) => (
                              <Badge key={t} variant="outline" className="text-[10px]">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {tier.description && (
                        <p className="text-xs text-slate-500">{tier.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Circles (renamed cohorts) ── */}
          <TabsContent value="circles" className="mt-4 space-y-4">
            <CirclesTab programId={activeProgram?.id ?? null} onScopeCircle={(circleId) => { setSelectedCircleId(circleId); setActiveTab('enrollments'); }} />
          </TabsContent>

          {/* ── Fields Editor ── */}
          <TabsContent value="fields" className="mt-4 space-y-4">
            <ProgramFieldEditor />
          </TabsContent>

          {/* ── Calendar ── */}
          <TabsContent value="calendar" className="mt-4 space-y-4">
            <ProgramCalendarWrapper programId={activeProgramId} />
          </TabsContent>
        </Tabs>
      )}

      {/* ── Create Program Dialog ── */}
      <ProgramFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        initialValues={defaultFormState}
        onSubmit={handleCreateProgram}
        isPending={createProgramLoading}
      />

      {/* ── Edit Program Dialog ── */}
      <ProgramFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initialValues={activeProgram ? programToFormState(activeProgram) : defaultFormState}
        onSubmit={handleEditProgram}
        isPending={updateProgramLoading}
      />

      {/* ── Program Relationship Graph — Fullscreen Overlay ── */}
      {/* Uses a fixed-position overlay instead of a Dialog so it covers the
          full viewport with zero padding. The Exit Fullscreen button inside
          ProgramGraph calls back into setGraphOpen(false) to close it. */}
      {graphOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="relative min-h-0 flex-1">
            {activeProgram && graphData ? (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Loading graph…
                  </div>
                }
              >
                <ProgramGraph
                  programId={activeProgram.id}
                  programName={activeProgram.name}
                  programStatus={activeProgram.status}
                  cxos={graphData.cxos}
                  startupCompanies={graphData.startupCompanies}
                  assignments={graphData.assignments}
                  onExitFullscreen={() => setGraphOpen(false)}
                />
              </Suspense>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Select a program first.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Archive Confirmation Dialog ── */}
      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive Program</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to archive{' '}
            <strong>{activeProgram?.name ?? 'this program'}</strong>? It will be set to archived
            status and hidden from active views. You can restore it at any time by editing the
            program and changing its status.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setArchiveOpen(false)}
              disabled={archiveLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={archiveLoading}
              onClick={() => void handleArchiveProgram()}
            >
              {archiveLoading ? 'Archiving…' : 'Archive Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete{' '}
            <strong>{activeProgram?.name ?? 'this program'}</strong>?
            This will also remove all enrollments, assignments, circles, and session data for this program. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteLoading}
              onClick={() => void handleDeleteProgram()}
            >
              {deleteLoading ? 'Deleting…' : 'Delete Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Enroll Members Dialog (multi-user search) ── */}
      <Dialog open={enrollOpen} onOpenChange={(open) => { setEnrollOpen(open); if (!open) { setEnrollSelected([]); setEnrollUserSearch(''); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enroll Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={enrollRole} onValueChange={(v) => setEnrollRole(v as 'cxo' | 'startup')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cxo">CxO</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Search users</Label>
              <Input
                placeholder="Type a name or email..."
                value={enrollUserSearch}
                onChange={(e) => setEnrollUserSearch(e.target.value)}
              />
              {enrollUserSearch.trim().length >= 2 && (
                <div className="max-h-40 overflow-y-auto rounded-md border bg-white">
                  {allUsers
                    .filter((u) => {
                      const q = enrollUserSearch.toLowerCase();
                      return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && !enrollSelected.some((s) => s.id === u.id);
                    })
                    .slice(0, 10)
                    .map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setEnrollSelected((prev) => [...prev, { id: u.id, name: u.name, email: u.email }])}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="font-medium">{u.name}</span>
                        <span className="text-slate-400 text-xs">{u.email}</span>
                      </button>
                    ))}
                  {allUsers.filter((u) => { const q = enrollUserSearch.toLowerCase(); return (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) && !enrollSelected.some((s) => s.id === u.id); }).length === 0 && (
                    <p className="px-3 py-2 text-xs text-slate-400">No matching users found</p>
                  )}
                </div>
              )}
            </div>
            {enrollSelected.length > 0 && (
              <div className="space-y-1">
                <Label>Selected ({enrollSelected.length})</Label>
                <div className="flex flex-wrap gap-1.5">
                  {enrollSelected.map((u) => (
                    <span key={u.id} className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {u.name}
                      <button type="button" onClick={() => setEnrollSelected((prev) => prev.filter((s) => s.id !== u.id))} className="text-blue-400 hover:text-blue-700">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollOpen(false)}>Cancel</Button>
            <Button disabled={enrollLoading || enrollSelected.length === 0} onClick={() => void handleEnrollSubmit()}>
              {enrollLoading ? 'Enrolling…' : `Enroll ${enrollSelected.length} member${enrollSelected.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Assignment Dialog ── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <EnrollmentSearchPicker
              value={assignCioId}
              onChange={setAssignCioId}
              enrollments={enrolledCios}
              label="CXO"
              placeholder="Search enrolled CXOs..."
            />
            <EnrollmentSearchPicker
              value={assignStartupId}
              onChange={setAssignStartupId}
              enrollments={enrolledStartups}
              label="Startup"
              placeholder="Search enrolled startups..."
            />
            <div className="space-y-2">
              <Label htmlFor="assign-hours">Hours allocated</Label>
              <Input
                id="assign-hours"
                type="number"
                min={1}
                value={assignHours}
                onChange={(e) => setAssignHours(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button disabled={assignmentLoading} onClick={() => void handleAssignmentSubmit()}>
              {assignmentLoading ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Assignment Dialog ── */}
      <Dialog open={editAssignmentOpen} onOpenChange={setEditAssignmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editAssignmentMode === 'assignment' ? 'Edit Assignment' : 'Edit Enrollment Hours'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>CxO Advisor</Label>
              <p className="text-sm text-slate-700 mt-1">{editAssignment?.cxo_name ?? '—'}</p>
            </div>
            {editAssignmentMode === 'assignment' && (
              <div>
                <Label>Startup</Label>
                <p className="text-sm text-slate-700 mt-1">
                  {editAssignment?.startup_company ?? editAssignment?.startup_name ?? '—'}
                </p>
              </div>
            )}
            <div>
              <Label>Hours Allocated<InfoTip text="Denominator — total hours for this pairing. Defaults to program's hours per pairing." /></Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={editHoursAllocated}
                onChange={(e) => setEditHoursAllocated(e.target.value)}
                className="mt-1"
              />
              {(() => {
                const role = editAssignmentMode === 'enrollment' ? editingEnrollment?.role : 'cxo';
                const defaultHours = role === 'cxo' ? (activeProgram?.hours_per_cxo ?? 40) : (activeProgram?.max_hours_per_startup ?? 40);
                const current = parseInt(editHoursAllocated, 10) || 0;
                if (current !== defaultHours) {
                  return (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] text-amber-700 border-amber-300 hover:bg-amber-50 mt-1"
                      onClick={() => setEditHoursAllocated(String(defaultHours))}
                    >
                      Reset to {defaultHours}h ({role === 'cxo' ? 'per-CxO' : 'per-startup'} default)
                    </Button>
                  );
                }
                return null;
              })()}
            </div>
            {editAssignmentMode === 'assignment' && (
              <div>
                <Label>Hours Used<InfoTip text="Numerator — hours actually consumed in this pairing so far." /></Label>
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  step="0.5"
                  value={editHoursUsed}
                  onChange={(e) => setEditHoursUsed(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            {editAssignmentMode === 'assignment' && (
              <div>
                <Label>Status</Label>
                <Select
                  value={editAssignmentStatus}
                  onValueChange={setEditAssignmentStatus}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAssignmentOpen(false)}>Cancel</Button>
            <Button
              disabled={updateAssignmentLoading || updateEnrollmentDetailsLoading}
              onClick={() => void handleSaveAssignment()}
            >
              {updateAssignmentLoading || updateEnrollmentDetailsLoading ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Enrollment Dialog ── */}
      <Dialog open={editEnrollmentOpen} onOpenChange={setEditEnrollmentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Enrollment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Member</Label>
              <p className="text-sm text-slate-700 mt-1">
                {editingEnrollment?.user_name}{' '}
                <span className="text-slate-400">({editingEnrollment?.user_email})</span>
              </p>
            </div>
            <div>
              <Label htmlFor="edit-enr-hours">Hours Allocated</Label>
              <Input
                id="edit-enr-hours"
                type="number"
                min={0}
                max={1000}
                className="mt-1"
                value={editEnrollmentForm.hours_committed}
                onChange={(e) =>
                  setEditEnrollmentForm((f) => ({ ...f, hours_committed: e.target.value }))
                }
              />
              {(() => {
                const role = editingEnrollment?.role;
                const defaultHours = role === 'cxo' ? (activeProgram?.hours_per_cxo ?? 40) : (activeProgram?.max_hours_per_startup ?? 40);
                const current = parseInt(editEnrollmentForm.hours_committed, 10) || 0;
                return (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-400">Total hours allocated (denominator)</p>
                    {current !== defaultHours && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] text-amber-700 border-amber-300 hover:bg-amber-50"
                        onClick={() => setEditEnrollmentForm((f) => ({ ...f, hours_committed: String(defaultHours) }))}
                      >
                        Reset to {defaultHours}h ({role === 'cxo' ? 'per-CxO' : 'per-startup'} default)
                      </Button>
                    )}
                  </div>
                );
              })()}
            </div>
            <div>
              <Label htmlFor="edit-enr-used">{editingEnrollment?.role === 'cxo' ? 'Hours Completed' : 'Hours Received'}</Label>
              <Input
                id="edit-enr-used"
                type="number"
                min={0}
                max={1000}
                step="0.5"
                className="mt-1"
                value={editEnrollmentForm.hours_used}
                onChange={(e) =>
                  setEditEnrollmentForm((f) => ({ ...f, hours_used: e.target.value }))
                }
              />
              <p className="text-xs text-slate-400 mt-1">{editingEnrollment?.role === 'cxo' ? 'Hours contributed so far (numerator)' : 'Hours received so far (numerator)'}</p>
            </div>
            {editingEnrollment?.role !== 'cxo' && (<div>
              <Label htmlFor="edit-enr-tier">Pricing Tier<InfoTip text="Pricing tiers apply to startup enrollments only. Defines the rate for advisory hours." /></Label>
              {allPricingTiers.length > 0 ? (
                <Select
                  value={editEnrollmentForm.pricing_tier}
                  onValueChange={(v) =>
                    setEditEnrollmentForm((f) => ({ ...f, pricing_tier: v }))
                  }
                >
                  <SelectTrigger id="edit-enr-tier" className="mt-1">
                    <SelectValue placeholder="Select a tier…" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPricingTiers.map((t) => (
                      <SelectItem key={t.id} value={t.tier_name}>
                        {t.tier_name} — ${t.price_per_hour.toFixed(2)}/hr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="edit-enr-tier"
                  className="mt-1"
                  placeholder="Create tiers in the Finances tab"
                  value={editEnrollmentForm.pricing_tier}
                  onChange={(e) =>
                    setEditEnrollmentForm((f) => ({ ...f, pricing_tier: e.target.value }))
                  }
                />
              )}
            </div>)}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEnrollmentOpen(false)}>Cancel</Button>
            <Button
              disabled={updateEnrollmentDetailsLoading}
              onClick={() => void handleSaveEnrollment()}
            >
              {updateEnrollmentDetailsLoading ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Pricing Tier Dialog ── */}
      <Dialog open={editTierOpen} onOpenChange={setEditTierOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pricing Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-tier-name">Tier Name *</Label>
              <Input
                id="edit-tier-name"
                value={editTierForm.tier_name}
                onChange={(e) => setEditTierForm((f) => ({ ...f, tier_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-tier-price">Price per Hour ($) *</Label>
              <Input
                id="edit-tier-price"
                type="number"
                min={0}
                step={0.01}
                value={editTierForm.price_per_hour}
                onChange={(e) =>
                  setEditTierForm((f) => ({ ...f, price_per_hour: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-tier-types">Accessible CXO Types</Label>
              <Input
                id="edit-tier-types"
                placeholder="cio, cto, cfo (comma-separated)"
                value={editTierForm.accessible_cio_types}
                onChange={(e) =>
                  setEditTierForm((f) => ({ ...f, accessible_cio_types: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-tier-max-hours">Max Hours</Label>
              <Input
                id="edit-tier-max-hours"
                type="number"
                min={1}
                value={editTierForm.max_hours}
                onChange={(e) => setEditTierForm((f) => ({ ...f, max_hours: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-tier-desc">Description</Label>
              <Textarea
                id="edit-tier-desc"
                rows={2}
                value={editTierForm.description}
                onChange={(e) => setEditTierForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTierOpen(false)}>Cancel</Button>
            <Button disabled={updateTierLoading} onClick={() => void handleSaveTier()}>
              {updateTierLoading ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Delete Dialog ── */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            {confirmDelete
              ? `This will permanently delete ${confirmDelete.label}. This action cannot be undone.`
              : ''}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => void handleConfirmDelete()}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Deny Request Dialog ── */}
      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Deny Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="deny-reason">Reason (optional)</Label>
            <Textarea
              id="deny-reason"
              placeholder="Provide a reason for denial…"
              rows={3}
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDenyRequest()}>
              Deny
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Pricing Tier Dialog ── */}
      <Dialog open={createTierOpen} onOpenChange={setCreateTierOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Pricing Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tier-name">Tier Name *</Label>
              <Input
                id="tier-name"
                placeholder="e.g. Starter, Growth, Enterprise"
                value={tierForm.tier_name}
                onChange={(e) => setTierForm((f) => ({ ...f, tier_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tier-price">Price per Hour ($) *</Label>
              <Input
                id="tier-price"
                type="number"
                min={0}
                step={0.01}
                placeholder="250.00"
                value={tierForm.price_per_hour}
                onChange={(e) => setTierForm((f) => ({ ...f, price_per_hour: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tier-types">Accessible CXO Types</Label>
              <Input
                id="tier-types"
                placeholder="cio, cto, cfo (comma-separated)"
                value={tierForm.accessible_cio_types}
                onChange={(e) => setTierForm((f) => ({ ...f, accessible_cio_types: e.target.value }))}
              />
              <p className="text-xs text-slate-400">Comma-separated list of CXO types that can access this tier.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tier-max-hours">Max Hours</Label>
              <Input
                id="tier-max-hours"
                type="number"
                min={1}
                placeholder="40"
                value={tierForm.max_hours}
                onChange={(e) => setTierForm((f) => ({ ...f, max_hours: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tier-desc">Description</Label>
              <Textarea
                id="tier-desc"
                placeholder="Optional description of this pricing tier…"
                rows={2}
                value={tierForm.description}
                onChange={(e) => setTierForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTierOpen(false)}>
              Cancel
            </Button>
            <Button disabled={createTierLoading} onClick={() => void handleCreateTier()}>
              {createTierLoading ? 'Creating…' : 'Create Tier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Hours Paid Dialog ── */}
      <Dialog open={editHoursPaidOpen} onOpenChange={setEditHoursPaidOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Hours Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              {editHoursPaidEnrollment?.user_name ?? 'Member'}
            </p>
            <Label htmlFor="edit-hours-paid">Hours Paid</Label>
            <Input
              id="edit-hours-paid"
              type="number"
              min={0}
              value={editHoursPaidValue}
              onChange={(e) => setEditHoursPaidValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditHoursPaidOpen(false)}>Cancel</Button>
            <Button
              disabled={updateEnrollmentDetailsLoading}
              onClick={() => void handleSaveHoursPaid()}
            >
              {updateEnrollmentDetailsLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Set CxO Hours Dialog ── */}
      <Dialog open={bulkCxoHoursOpen} onOpenChange={setBulkCxoHoursOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set All CxO Hours</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="bulk-cxo-hours">Hours committed per CxO</Label>
            <Input
              id="bulk-cxo-hours"
              type="number"
              min={0}
              value={bulkHoursValue}
              onChange={(e) => setBulkHoursValue(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              This will update hours allocated for all {allEnrollments.filter((e) => e.role === 'cxo').length} CxO enrollment(s).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkCxoHoursOpen(false)}>Cancel</Button>
            <Button disabled={bulkHoursLoading} onClick={() => {
              const count = allEnrollments.filter((e) => e.role === 'cxo').length;
              requestHoursConfirm(
                `This will update hours for all ${count} CxO enrollment(s) to ${bulkHoursValue}h.`,
                () => handleBulkSetHours('cxo'),
              );
            }}>
              {bulkHoursLoading ? 'Updating...' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Set Startup Hours Dialog ── */}
      <Dialog open={bulkStartupHoursOpen} onOpenChange={setBulkStartupHoursOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set All Startup Hours</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="bulk-startup-hours">Hours committed per Startup</Label>
            <Input
              id="bulk-startup-hours"
              type="number"
              min={0}
              value={bulkHoursValue}
              onChange={(e) => setBulkHoursValue(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              This will update hours allocated for all {allEnrollments.filter((e) => e.role === 'startup').length} Startup enrollment(s).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkStartupHoursOpen(false)}>Cancel</Button>
            <Button disabled={bulkHoursLoading} onClick={() => {
              const count = allEnrollments.filter((e) => e.role === 'startup').length;
              requestHoursConfirm(
                `This will update hours for all ${count} Startup enrollment(s) to ${bulkHoursValue}h.`,
                () => handleBulkSetHours('startup'),
              );
            }}>
              {bulkHoursLoading ? 'Updating...' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Hours Change Confirmation Dialog ── */}
      <Dialog open={hoursConfirmOpen} onOpenChange={setHoursConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Hours Change</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">{hoursConfirmDesc}</p>
          <p className="text-xs text-slate-400">Are you sure you want to proceed?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHoursConfirmOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setHoursConfirmOpen(false);
              if (pendingHoursAction) void pendingHoursAction();
            }}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Upload Invoice Dialog ── */}
      <Dialog open={uploadInvoiceOpen} onOpenChange={setUploadInvoiceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Payment / Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Document Type</Label>
              <Select value={invoiceForm.document_type} onValueChange={(v) => setInvoiceForm((f) => ({ ...f, document_type: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="payment_proof">Payment Proof</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>File (PDF or Image)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                className="mt-1"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
                  const reader = new FileReader();
                  reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    setInvoiceForm((f) => ({ ...f, file_name: file.name, file_data: base64 }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
            <div>
              <Label>Amount (optional)</Label>
              <Input type="number" min={0} step="0.01" placeholder="0.00" value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, amount: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Input placeholder="Payment for Q1 advisory hours..." value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadInvoiceOpen(false)}>Cancel</Button>
            <Button disabled={!invoiceForm.file_data || uploadingInvoice} onClick={async () => {
              try {
                await uploadInvoiceMutate({
                  file_name: invoiceForm.file_name,
                  file_data: invoiceForm.file_data,
                  document_type: invoiceForm.document_type,
                  amount: invoiceForm.amount ? parseFloat(invoiceForm.amount) : undefined,
                  notes: invoiceForm.notes || undefined,
                });
                toast.success('Document uploaded');
                setUploadInvoiceOpen(false);
              } catch (err: any) {
                toast.error(err.message || 'Failed to upload');
              }
            }}>
              {uploadingInvoice ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
