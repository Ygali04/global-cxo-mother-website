import type { JSX } from 'react';
/**
 * Admin Email Studio — compose-and-send mailer
 *
 * Single-view admin tool. Pick a starter template (or a saved custom,
 * or blank), fill out the form, pick a recipient from the ecosystem
 * (or type a custom email), and send the email immediately via Resend.
 *
 * Layout:
 *   - Left pane (320px fixed): template picker
 *       · Blank option (write from scratch, rich-text editor)
 *       · Starters section (8 code-owned transactional templates)
 *       · My Templates section (admin-authored saved customs)
 *   - Right pane: compose form
 *       · Recipient picker (user autocomplete + free-form email)
 *       · Template header (title/description of what was picked)
 *       · Subject input
 *       · Variable form fields (one per $placeholder) OR rich-text body
 *       · Brand wrapper toggle
 *       · Live preview iframe (sandboxed)
 *       · Action row: Send, Save as Template, Clear
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Check,
  FileText,
  Loader2,
  Mail,
  PenLine,
  Save,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/portal/components/ui/alert';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/portal/components/ui/card';
import { Checkbox } from '@/portal/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/portal/components/ui/dialog';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import { RichTextEditor } from '@/portal/components/ui/rich-text-editor';
import { ScrollArea } from '@/portal/components/ui/scroll-area';
import { Textarea } from '@/portal/components/ui/textarea';

import type {
  AdminEmailComposition,
  RecipientUser,
  StarterTemplate,
  VariableDef,
} from '@/portal/api/emailStudio';
import {
  useCompositions,
  useCreateComposition,
  useDeleteComposition,
  usePreviewEmail,
  useSearchRecipients,
  useSendEmail,
  useStarterTemplates,
} from '@/portal/hooks/useEmailStudio';

// ---------------------------------------------------------------------------
// Types + helpers
// ---------------------------------------------------------------------------

type ComposeMode = 'blank' | 'starter' | 'custom';

interface VariableBinding {
  name: string;
  label: string;
  value: string;
  multiline: boolean;
  hint?: string | null;
}

/**
 * Mirror of Python's string.Template.safe_substitute:
 * - Replaces $name and ${name} with vars[name]
 * - Missing keys pass through as literal $name (no crash)
 */
function substituteVariables(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(
    /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g,
    (match, braced: string | undefined, bare: string | undefined) => {
      const name = braced ?? bare ?? '';
      if (!name) return match;
      const value = vars[name];
      return value !== undefined ? value : match;
    },
  );
}

/** Extract every $name / ${name} reference from a template string. */
function extractVariableNames(template: string): string[] {
  const seen = new Set<string>();
  const re = /\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let match;
  while ((match = re.exec(template)) !== null) {
    const name = match[1] ?? match[2];
    if (name) seen.add(name);
  }
  return Array.from(seen);
}

/** Auto-fill variable bindings from a selected recipient user. */
function autoFillFromRecipient(
  bindings: VariableBinding[],
  recipient: RecipientUser | null,
): VariableBinding[] {
  if (!recipient) return bindings;
  const mapping: Record<string, string> = {
    user_name: recipient.name,
    recipient_name: recipient.name,
    user_email: recipient.email,
    recipient_email: recipient.email,
  };
  return bindings.map((b) => {
    const suggested = mapping[b.name];
    // Only fill empty fields — don't clobber values the admin already typed.
    if (suggested && !b.value) {
      return { ...b, value: suggested };
    }
    return b;
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminEmailStudio(): JSX.Element {
  // --- data sources ---
  const startersQuery = useStarterTemplates();
  const compositionsQuery = useCompositions();
  const starters = startersQuery.data ?? [];
  const compositions = compositionsQuery.data ?? [];

  // --- compose mode + selection ---
  const [mode, setMode] = useState<ComposeMode>('blank');
  const [selectedStarterKey, setSelectedStarterKey] = useState<string | null>(null);
  const [selectedCompositionId, setSelectedCompositionId] = useState<string | null>(null);

  // --- compose form state ---
  const [subject, setSubject] = useState('');
  const [subjectTemplate, setSubjectTemplate] = useState(''); // raw template with $vars
  const [bodyTemplate, setBodyTemplate] = useState(''); // raw template with $vars (starter/custom)
  const [blankBody, setBlankBody] = useState(''); // rich-text HTML (blank mode)
  const [bindings, setBindings] = useState<VariableBinding[]>([]);
  const [applyBrandWrapper, setApplyBrandWrapper] = useState(true);
  const [replyToAdmin, setReplyToAdmin] = useState(true);
  // Gradient-header subtitle passed through to the brand chrome at
  // render time. Starter mode sets this from the starter's metadata
  // (e.g. "Program Onboarding"); Blank mode leaves it null and the
  // backend defaults to "From {admin name}". Custom saved templates
  // don't carry eyebrow metadata yet so they fall back to the default.
  const [selectedEyebrow, setSelectedEyebrow] = useState<string | null>(null);
  const [selectedFooterNote, setSelectedFooterNote] = useState<string | null>(null);

  // --- recipient state ---
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [pickedRecipient, setPickedRecipient] = useState<RecipientUser | null>(null);
  const [customRecipientEmail, setCustomRecipientEmail] = useState('');
  const [customRecipientName, setCustomRecipientName] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkRecipients, setBulkRecipients] = useState<RecipientUser[]>([]);
  const [bulkSending, setBulkSending] = useState(false);

  // --- preview state ---
  const [previewHtml, setPreviewHtml] = useState('');

  // --- save dialog state ---
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  // --- mutations ---
  const previewMutation = usePreviewEmail();
  const sendMutation = useSendEmail();
  const createMutation = useCreateComposition();
  const deleteMutation = useDeleteComposition();

  // Debounce the recipient search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const recipientsQuery = useSearchRecipients(debouncedQuery);

  // Auto-fill variable bindings from the picked recipient
  useEffect(() => {
    if (!pickedRecipient) return;
    setBindings((prev) => autoFillFromRecipient(prev, pickedRecipient));
  }, [pickedRecipient]);

  // ---- derived: current vars dict and rendered subject/body ----
  const variablesDict = useMemo<Record<string, string>>(
    () => Object.fromEntries(bindings.map((b) => [b.name, b.value])),
    [bindings],
  );

  const renderedSubject = useMemo(() => {
    if (mode === 'blank') return subject;
    return substituteVariables(subjectTemplate, variablesDict);
  }, [mode, subject, subjectTemplate, variablesDict]);

  const renderedBody = useMemo(() => {
    if (mode === 'blank') return blankBody;
    return substituteVariables(bodyTemplate, variablesDict);
  }, [mode, blankBody, bodyTemplate, variablesDict]);

  // ---- live preview: debounced backend render ----
  useEffect(() => {
    const t = setTimeout(() => {
      previewMutation.mutate(
        {
          subject: renderedSubject || '(no subject)',
          html_body: renderedBody || '<p>(empty body)</p>',
          variables: {},
          apply_brand_wrapper: applyBrandWrapper,
          eyebrow: selectedEyebrow,
          footer_note: selectedFooterNote,
        },
        {
          onSuccess: (data) => setPreviewHtml(data.html_body),
        },
      );
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderedSubject, renderedBody, applyBrandWrapper, selectedEyebrow, selectedFooterNote]);

  // ---- template picker handlers ----
  const handleBlankClick = () => {
    setMode('blank');
    setSelectedStarterKey(null);
    setSelectedCompositionId(null);
    setSubject('');
    setSubjectTemplate('');
    setBodyTemplate('');
    setBlankBody('');
    setBindings([]);
    setApplyBrandWrapper(true);
    // Blank mode: backend falls back to "From {admin name}" eyebrow
    setSelectedEyebrow(null);
    setSelectedFooterNote(null);
  };

  const loadStarter = (starter: StarterTemplate) => {
    setMode('starter');
    setSelectedStarterKey(starter.template_key);
    setSelectedCompositionId(null);
    setSubject(starter.subject_template);
    setSubjectTemplate(starter.subject_template);
    setBodyTemplate(starter.html_body_template);
    setBlankBody('');
    const newBindings: VariableBinding[] = starter.variables.map((v: VariableDef) => ({
      name: v.name,
      label: v.label,
      value: v.default_value ?? '',
      multiline: v.multiline,
      hint: v.hint,
    }));
    setBindings(autoFillFromRecipient(newBindings, pickedRecipient));
    setApplyBrandWrapper(true);
    // Starter-specific eyebrow + footer (e.g. "Program Onboarding")
    setSelectedEyebrow(starter.eyebrow || null);
    setSelectedFooterNote(starter.footer_note || null);
  };

  const loadComposition = (comp: AdminEmailComposition) => {
    setMode('custom');
    setSelectedCompositionId(comp.id);
    setSelectedStarterKey(null);
    setSubject(comp.subject_template);
    setSubjectTemplate(comp.subject_template);
    setBodyTemplate(comp.html_body_template);
    setBlankBody('');
    // Custom templates don't carry variable metadata — infer from the raw $ names
    const allNames = Array.from(
      new Set([
        ...extractVariableNames(comp.subject_template),
        ...extractVariableNames(comp.html_body_template),
      ]),
    );
    const newBindings: VariableBinding[] = allNames.map((name) => ({
      name,
      label: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: '',
      multiline: name === 'body' || name === 'body_html' || name === 'intro_text',
    }));
    setBindings(autoFillFromRecipient(newBindings, pickedRecipient));
    setApplyBrandWrapper(comp.use_brand_wrapper);
    // Saved customs don't carry eyebrow metadata yet — fall back to the
    // "From {admin name}" default by leaving the fields null.
    setSelectedEyebrow(null);
    setSelectedFooterNote(null);
  };

  const handleDeleteComposition = (id: string) => {
    if (!window.confirm('Delete this saved template?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Template deleted.');
        if (selectedCompositionId === id) handleBlankClick();
      },
      onError: (err) => toast.error(`Delete failed: ${err.message}`),
    });
  };

  // ---- recipient handlers ----
  const pickRecipient = (user: RecipientUser) => {
    setPickedRecipient(user);
    setSearchQuery('');
    setCustomRecipientEmail('');
    setCustomRecipientName('');
  };

  const clearRecipient = () => {
    setPickedRecipient(null);
    setCustomRecipientEmail('');
    setCustomRecipientName('');
  };

  // ---- variable binding handlers ----
  const updateBinding = (name: string, value: string) => {
    setBindings((prev) => prev.map((b) => (b.name === name ? { ...b, value } : b)));
  };

  // ---- save as template ----
  const openSaveDialog = () => {
    setSaveName('');
    setShowSaveDialog(true);
  };

  const handleSaveComposition = () => {
    if (!saveName.trim()) {
      toast.error('Name is required.');
      return;
    }
    const subjectTpl = mode === 'blank' ? subject : subjectTemplate;
    const bodyTpl = mode === 'blank' ? blankBody : bodyTemplate;
    if (!subjectTpl.trim() || !bodyTpl.trim()) {
      toast.error('Subject and body are required.');
      return;
    }
    createMutation.mutate(
      {
        name: saveName.trim(),
        subject_template: subjectTpl,
        html_body_template: bodyTpl,
        use_brand_wrapper: applyBrandWrapper,
      },
      {
        onSuccess: () => {
          toast.success(`Template "${saveName}" saved.`);
          setShowSaveDialog(false);
        },
        onError: (err) => toast.error(`Save failed: ${err.message}`),
      },
    );
  };

  // ---- send handler ----
  const handleSend = () => {
    const recipientUserId = pickedRecipient?.id ?? null;
    const recipientEmail = pickedRecipient?.email ?? customRecipientEmail.trim() ?? null;
    const recipientName = pickedRecipient?.name ?? customRecipientName.trim() ?? null;

    if (!recipientUserId && !recipientEmail) {
      toast.error('Pick a recipient or type an email address.');
      return;
    }
    if (!renderedSubject.trim() || !renderedBody.trim()) {
      toast.error('Subject and body are required.');
      return;
    }

    const remainingVars = renderedBody.match(/\$\{?\w+\}?/g);
    if (remainingVars && remainingVars.length > 0) {
      toast.warning(`${remainingVars.length} variable(s) not filled: ${remainingVars.join(', ')}`);
    }

    const templateSource =
      mode === 'blank'
        ? 'blank'
        : mode === 'starter'
          ? `starter:${selectedStarterKey}`
          : `custom:${selectedCompositionId}`;

    sendMutation.mutate(
      {
        template_source: templateSource,
        subject: renderedSubject,
        html_body: renderedBody,
        recipient_user_id: recipientUserId,
        recipient_email: recipientUserId ? null : recipientEmail,
        recipient_name: recipientUserId ? null : recipientName,
        apply_brand_wrapper: applyBrandWrapper,
        reply_to_admin: replyToAdmin,
        eyebrow: selectedEyebrow,
        footer_note: selectedFooterNote,
      },
      {
        onSuccess: (data) => {
          if (data.status === 'sent') {
            toast.success(
              `Email sent to ${data.to_email}${data.message_id ? ` (${data.message_id.slice(0, 10)}…)` : ''}`,
            );
          } else {
            toast.error(`Send failed: ${data.error ?? 'unknown error'}`);
          }
        },
        onError: (err) => toast.error(`Send failed: ${err.message}`),
      },
    );
  };

  const handleBulkSend = async () => {
    if (bulkRecipients.length === 0) {
      toast.error('Add at least one recipient.');
      return;
    }
    if (!renderedSubject.trim() || !renderedBody.trim()) {
      toast.error('Subject and body are required.');
      return;
    }
    setBulkSending(true);
    try {
      const templateSource =
        mode === 'blank' ? 'blank'
          : mode === 'starter' ? `starter:${selectedStarterKey}`
            : `custom:${selectedCompositionId}`;
      const { apiFetch } = await import('@/portal/api/client');
      const result = await apiFetch<{ sent: number; failed: number; total: number }>('/admin/email-studio/send-bulk', {
        method: 'POST',
        body: {
          recipient_user_ids: bulkRecipients.map((r) => r.id),
          subject: renderedSubject,
          html_body: renderedBody,
          template_source: templateSource,
          apply_brand_wrapper: applyBrandWrapper,
          reply_to_admin: replyToAdmin,
          eyebrow: selectedEyebrow,
          footer_note: selectedFooterNote,
        },
      });
      toast.success(`Sent to ${result.sent} of ${result.total} recipients${result.failed > 0 ? ` (${result.failed} failed)` : ''}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bulk send failed');
    } finally {
      setBulkSending(false);
    }
  };

  const handleClear = () => {
    if (!window.confirm('Clear the compose form?')) return;
    handleBlankClick();
    clearRecipient();
  };

  // ---- loading / error states ----
  const startersError = startersQuery.error;
  const compositionsError = compositionsQuery.error;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Email Studio</h1>
          <p className="text-sm text-slate-500">
            Compose and send emails to users in the ecosystem. Pick a starter
            template, fill in the form, and hit Send.
          </p>
        </div>
      </div>

      {startersError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Failed to load starter templates</AlertTitle>
          <AlertDescription>{startersError.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* --------------- LEFT PANE: template picker --------------- */}
        <Card className="lg:sticky lg:top-4 lg:self-start">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Templates</CardTitle>
            <CardDescription>Pick a starting point.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[70vh]">
              {/* Blank option */}
              <div className="border-y">
                <button
                  type="button"
                  onClick={handleBlankClick}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                    mode === 'blank' ? 'bg-indigo-50' : ''
                  }`}
                >
                  <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Blank</p>
                    <p className="text-xs text-slate-500">
                      Write a normal email — brand header/footer auto-added.
                    </p>
                  </div>
                </button>
              </div>

              {/* Starters */}
              <div className="px-4 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Starters
              </div>
              {startersQuery.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              ) : (
                <ul className="divide-y">
                  {starters.map((s) => {
                    const isSelected =
                      mode === 'starter' && s.template_key === selectedStarterKey;
                    return (
                      <li key={s.template_key}>
                        <button
                          type="button"
                          onClick={() => loadStarter(s)}
                          className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                            isSelected ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <p className="truncate font-semibold text-slate-900">{s.label}</p>
                          <p className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-wide text-slate-500">
                            {s.template_key}
                          </p>
                          {!s.is_wired && (
                            <Badge className="mt-1.5 gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                              <AlertTriangle className="h-3 w-3" />
                              Not wired
                            </Badge>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* My Templates */}
              <div className="px-4 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                My Templates
              </div>
              {compositionsError && (
                <div className="px-4 py-2 text-xs text-red-600">
                  Failed to load saved templates
                </div>
              )}
              {compositionsQuery.isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              ) : compositions.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-500">
                  No saved templates yet.
                  <br />
                  Compose a blank email and click <strong>Save as Template</strong>.
                </div>
              ) : (
                <ul className="divide-y">
                  {compositions.map((c) => {
                    const isSelected =
                      mode === 'custom' && c.id === selectedCompositionId;
                    return (
                      <li key={c.id}>
                        <div
                          className={`group flex items-start gap-2 px-4 py-3 transition-colors hover:bg-slate-50 ${
                            isSelected ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => loadComposition(c)}
                            className="flex-1 min-w-0 text-left"
                          >
                            <p className="truncate font-semibold text-slate-900">{c.name}</p>
                            <p className="truncate text-xs text-slate-500">
                              by {c.created_by_name ?? 'unknown'}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteComposition(c.id)}
                            title="Delete"
                            className="opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* --------------- RIGHT PANE: compose form --------------- */}
        <div className="space-y-4">
          {/* Recipient */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {bulkMode ? `Recipients (${bulkRecipients.length})` : 'Recipient'}
                  </CardTitle>
                  <CardDescription>
                    {bulkMode ? 'Search and add multiple recipients.' : 'Search an ecosystem user or type a custom email address.'}
                  </CardDescription>
                </div>
                <button
                  type="button"
                  onClick={() => { setBulkMode(!bulkMode); setBulkRecipients([]); setPickedRecipient(null); }}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${bulkMode ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  {bulkMode ? 'Single' : 'Bulk'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {bulkMode ? (
                <>
                  {/* Bulk recipient search + chip list */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users to add…"
                      className="pl-10"
                    />
                  </div>
                  {recipientsQuery.data && recipientsQuery.data.length > 0 && (
                    <div className="max-h-36 overflow-y-auto rounded-md border bg-white shadow-sm">
                      {recipientsQuery.data
                        .filter((u) => !bulkRecipients.some((r) => r.id === u.id))
                        .map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => setBulkRecipients((prev) => [...prev, u])}
                            className="flex w-full items-center gap-2 border-b px-3 py-1.5 text-left text-sm hover:bg-slate-50 last:border-0"
                          >
                            <span className="font-medium text-slate-900">{u.name}</span>
                            <span className="text-xs text-slate-400">{u.email}</span>
                          </button>
                        ))}
                    </div>
                  )}
                  {bulkRecipients.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {bulkRecipients.map((r) => (
                        <span key={r.id} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                          {r.name}
                          <button type="button" onClick={() => setBulkRecipients((prev) => prev.filter((x) => x.id !== r.id))} className="hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : pickedRecipient ? (
                <div className="flex items-center justify-between rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="h-4 w-4 shrink-0 text-indigo-600" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {pickedRecipient.name}{' '}
                        <span className="font-normal text-slate-500">
                          &lt;{pickedRecipient.email}&gt;
                        </span>
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {pickedRecipient.tier} · {pickedRecipient.company_affiliation ?? '—'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearRecipient}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users by name or email…"
                      className="pl-10"
                    />
                  </div>
                  {recipientsQuery.data && recipientsQuery.data.length > 0 && (
                    <div className="max-h-48 overflow-y-auto rounded-md border bg-white shadow-sm">
                      {recipientsQuery.data.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => pickRecipient(u)}
                          className="flex w-full flex-col items-start gap-0.5 border-b px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50 last:border-0"
                        >
                          <span className="font-semibold text-slate-900">{u.name}</span>
                          <span className="text-xs text-slate-500">
                            {u.email} · {u.tier}
                            {u.company_affiliation ? ` · ${u.company_affiliation}` : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {debouncedQuery.length >= 2 &&
                    !recipientsQuery.isLoading &&
                    recipientsQuery.data &&
                    recipientsQuery.data.length === 0 && (
                      <p className="text-xs text-slate-500">No users match "{debouncedQuery}".</p>
                    )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span>or type a custom address</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Input
                      value={customRecipientEmail}
                      onChange={(e) => setCustomRecipientEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      type="email"
                    />
                    <Input
                      value={customRecipientName}
                      onChange={(e) => setCustomRecipientName(e.target.value)}
                      placeholder="Recipient name (optional)"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Compose form */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    {mode === 'blank' && 'Write your message'}
                    {mode === 'starter' && (
                      starters.find((s) => s.template_key === selectedStarterKey)?.label ??
                      'Starter template'
                    )}
                    {mode === 'custom' && (
                      compositions.find((c) => c.id === selectedCompositionId)?.name ??
                      'Saved template'
                    )}
                  </CardTitle>
                  {mode === 'starter' && (
                    <CardDescription>
                      {starters.find((s) => s.template_key === selectedStarterKey)?.description ?? ''}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {mode === 'blank' && 'Blank'}
                  {mode === 'starter' && 'Starter'}
                  {mode === 'custom' && 'Custom'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject */}
              <div className="space-y-1.5">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={mode === 'blank' ? subject : subjectTemplate}
                  onChange={(e) => {
                    if (mode === 'blank') {
                      setSubject(e.target.value);
                    } else {
                      setSubjectTemplate(e.target.value);
                    }
                  }}
                  placeholder="Enter subject line"
                />
                {mode !== 'blank' && (
                  <p className="text-xs text-slate-500">
                    Rendered: <span className="font-mono">{renderedSubject || '(empty)'}</span>
                  </p>
                )}
              </div>

              {/* Variables (starter/custom mode only) */}
              {mode !== 'blank' && bindings.length > 0 && (
                <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Dynamic content
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {bindings.map((b) => (
                      <div key={b.name} className="space-y-1">
                        <Label htmlFor={`var-${b.name}`} className="flex items-center gap-2">
                          {b.label}
                          <span className="font-mono text-[10px] text-slate-400">${b.name}</span>
                        </Label>
                        {b.multiline ? (
                          <Textarea
                            id={`var-${b.name}`}
                            value={b.value}
                            onChange={(e) => updateBinding(b.name, e.target.value)}
                            className="min-h-[80px] text-sm"
                            placeholder={b.hint ?? ''}
                          />
                        ) : (
                          <Input
                            id={`var-${b.name}`}
                            value={b.value}
                            onChange={(e) => updateBinding(b.name, e.target.value)}
                            placeholder={b.hint ?? ''}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Body editor */}
              <div className="space-y-1.5">
                <Label>Body</Label>
                {mode === 'blank' ? (
                  <RichTextEditor
                    value={blankBody}
                    onChange={setBlankBody}
                    placeholder="Write your message here…"
                    minHeight="260px"
                  />
                ) : (
                  <details className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                      Advanced: edit raw HTML template (with $placeholders)
                    </summary>
                    <Textarea
                      value={bodyTemplate}
                      onChange={(e) => setBodyTemplate(e.target.value)}
                      className="mt-3 min-h-[260px] font-mono text-xs"
                      spellCheck={false}
                    />
                  </details>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 rounded-md border border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="brand-wrapper"
                    checked={applyBrandWrapper}
                    onCheckedChange={(v) => setApplyBrandWrapper(v === true)}
                  />
                  <Label htmlFor="brand-wrapper" className="cursor-pointer text-sm font-normal">
                    Apply GCXO brand header &amp; footer
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="reply-to-admin"
                    checked={replyToAdmin}
                    onCheckedChange={(v) => setReplyToAdmin(v === true)}
                  />
                  <Label htmlFor="reply-to-admin" className="cursor-pointer text-sm font-normal">
                    Set Reply-To to my admin email
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Live preview</CardTitle>
              <CardDescription>
                What the recipient will see in their inbox. Updates as you type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <iframe
                sandbox=""
                srcDoc={previewHtml || '<p style="padding:20px;color:#94a3b8;font-family:sans-serif;font-size:13px;">Start writing to see the preview.</p>'}
                title="Email preview"
                className="h-[500px] w-full rounded border border-slate-200 bg-white"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button type="button" variant="outline" onClick={openSaveDialog}>
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </Button>
            {bulkMode ? (
              <Button
                type="button"
                onClick={() => void handleBulkSend()}
                disabled={bulkSending || bulkRecipients.length === 0}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {bulkSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send to {bulkRecipients.length} Recipient{bulkRecipients.length !== 1 ? 's' : ''}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSend}
                disabled={sendMutation.isPending}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Email
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Save dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as template</DialogTitle>
            <DialogDescription>
              Give this composition a name. It will appear under <strong>My Templates</strong>{' '}
              and be reusable across all admins.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="save-name">Template name</Label>
            <Input
              id="save-name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Monthly newsletter"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveComposition}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
