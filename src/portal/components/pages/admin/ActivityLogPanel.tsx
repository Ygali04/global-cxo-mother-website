/**
 * ActivityLogPanel — recent audit log entries for the admin dashboard (Spec 04).
 *
 * Shows the last 50 entries with filter chips for action type, date range,
 * and sandbox toggle. Auto-refreshes every 60 seconds.
 */

import { useState, useMemo, useCallback } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/portal/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/portal/components/ui/card';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/portal/components/ui/select';
import { Checkbox } from '@/portal/components/ui/checkbox';
import { Label } from '@/portal/components/ui/label';
import { Activity, ChevronDown, ChevronUp, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useAuditLogs, useAuditActions } from '@/portal/hooks/useAuditLog';
import type { AuditLogFilters } from '@/portal/api/auditLog';

const ACTION_LABELS: Record<string, string> = {
  'user.create': 'created user',
  'user.update': 'updated user',
  'user.delete': 'deleted user',
  'program.create': 'created program',
  'program.update': 'updated program',
  'program_enrollment.create': 'enrolled in program',
  'program_assignment.create': 'assigned CxO to startup',
  'event.create': 'created event',
  'event.cancel': 'cancelled event',
  'time_share_request.create': 'submitted request',
  'time_share_request.update': 'updated request',
  'field_schema.update': 'updated field schema',
  'user_profile_link.create': 'linked profiles',
  'user_profile_link.delete': 'unlinked profiles',
};

function humanize(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/[_.]/g, ' ');
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const ALL_SENTINEL = '__all__';

const DATE_PRESETS = [
  { label: 'All time', value: ALL_SENTINEL },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
] as const;

function getDateRange(preset: string): { since?: string } {
  if (!preset || preset === ALL_SENTINEL) return {};
  const now = new Date();
  if (preset === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { since: start.toISOString() };
  }
  if (preset === '7d') return { since: new Date(now.getTime() - 7 * 86_400_000).toISOString() };
  if (preset === '30d') return { since: new Date(now.getTime() - 30 * 86_400_000).toISOString() };
  return {};
}

export function ActivityLogPanel() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [actionFilter, setActionFilter] = useState(ALL_SENTINEL);
  const [datePreset, setDatePreset] = useState(ALL_SENTINEL);
  const [includeSandbox, setIncludeSandbox] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroup((prev) => (prev === key ? null : key));
  }, []);

  const filters: AuditLogFilters = useMemo(() => {
    const f: AuditLogFilters = { limit: 50, include_sandbox: includeSandbox };
    if (actionFilter && actionFilter !== ALL_SENTINEL) f.action = actionFilter;
    const range = getDateRange(datePreset);
    if (range.since) f.since = range.since;
    return f;
  }, [actionFilter, datePreset, includeSandbox]);

  const { data: entries, isLoading } = useAuditLogs(filters);
  const { data: allActions } = useAuditActions();

  return (
    <Collapsible open={panelOpen} onOpenChange={setPanelOpen}>
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CollapsibleTrigger asChild>
            <button type="button" className="flex items-center gap-2 text-lg font-semibold hover:text-foreground/80 transition-colors">
              <Activity className="h-5 w-5" />
              Recent Activity
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              {!panelOpen && entries && (
                <Badge variant="secondary" className="text-[10px] ml-1">{entries.length}</Badge>
              )}
            </button>
          </CollapsibleTrigger>

          {panelOpen && <div className="flex flex-wrap items-center gap-2">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SENTINEL}>All actions</SelectItem>
                {(allActions ?? []).map((a) => (
                  <SelectItem key={a} value={a} className="text-xs">
                    {humanize(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={datePreset} onValueChange={setDatePreset}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="text-xs">
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5">
              <Checkbox
                id="sandbox-filter"
                checked={includeSandbox}
                onCheckedChange={(v) => setIncludeSandbox(v === true)}
              />
              <Label htmlFor="sandbox-filter" className="text-xs cursor-pointer">
                Sandbox
              </Label>
            </div>
          </div>}
        </div>
      </CardHeader>

      <CollapsibleContent>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !entries || entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity in this range.
          </p>
        ) : (
          <div className="space-y-0.5">
            {(() => {
              // Group consecutive entries by action into envelopes.
              const groups: { key: string; action: string; target_type: string; entries: typeof entries }[] = [];
              for (const entry of entries) {
                const last = groups[groups.length - 1];
                if (last && last.action === entry.action) {
                  last.entries.push(entry);
                } else {
                  groups.push({
                    key: `${entry.action}-${entry.id}`,
                    action: entry.action,
                    target_type: entry.target_type,
                    entries: [entry],
                  });
                }
              }

              return groups.map((group) => {
                const isSingle = group.entries.length === 1;
                const isGroupOpen = expandedGroup === group.key;
                const firstEntry = group.entries[0];
                const lastEntry = group.entries[group.entries.length - 1];

                if (isSingle) {
                  // Single entry — render flat (no envelope).
                  const entry = firstEntry;
                  const isEntryExpanded = expandedEntry === entry.id;
                  const hasChanges = entry.changes && Object.keys(entry.changes).length > 0
                    && !('sandbox' in entry.changes && Object.keys(entry.changes).length === 1);

                  return (
                    <div key={entry.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                      <Badge variant="secondary" className="shrink-0 text-[10px] mt-0.5">
                        {entry.target_type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{entry.summary ?? humanize(entry.action)}</p>
                        {Boolean(entry.changes?.sandbox) && (
                          <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300 mt-0.5">SANDBOX</Badge>
                        )}
                        {isEntryExpanded && hasChanges && (
                          <pre className="mt-2 text-xs bg-muted rounded p-2 overflow-x-auto max-h-40">
                            {JSON.stringify(entry.changes, null, 2)}
                          </pre>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground" title={new Date(entry.created_at).toLocaleString()}>
                          {relativeTime(entry.created_at)}
                        </span>
                        {hasChanges && (
                          <Button variant="ghost" size="icon" className="h-5 w-5"
                            onClick={() => setExpandedEntry(isEntryExpanded ? null : entry.id)}>
                            {isEntryExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                }

                // Multi-entry envelope — collapsible group.
                return (
                  <div key={group.key} className="border-b last:border-0">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      className="flex items-start gap-3 py-2 w-full text-left hover:bg-muted/50 transition-colors rounded-sm px-1 -mx-1"
                    >
                      <Badge variant="secondary" className="shrink-0 text-[10px] mt-0.5">
                        {group.target_type}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {group.entries[0].summary ?? humanize(group.action)}
                          <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
                            {group.entries.length}
                          </Badge>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground" title={new Date(lastEntry.created_at).toLocaleString()}>
                          {relativeTime(lastEntry.created_at)}
                        </span>
                        {isGroupOpen
                          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                    </button>

                    {isGroupOpen && (
                      <div className="ml-6 pl-3 border-l-2 border-muted mb-2 space-y-0.5">
                        {group.entries.map((entry) => {
                          const isEntryExpanded = expandedEntry === entry.id;
                          const hasChanges = entry.changes && Object.keys(entry.changes).length > 0
                            && !('sandbox' in entry.changes && Object.keys(entry.changes).length === 1);

                          return (
                            <div key={entry.id} className="flex items-start gap-3 py-1.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">
                                  {entry.summary ?? humanize(entry.action)}
                                </p>
                                {isEntryExpanded && hasChanges && (
                                  <pre className="mt-1 text-xs bg-muted rounded p-2 overflow-x-auto max-h-32">
                                    {JSON.stringify(entry.changes, null, 2)}
                                  </pre>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-muted-foreground">
                                  {relativeTime(entry.created_at)}
                                </span>
                                {hasChanges && (
                                  <Button variant="ghost" size="icon" className="h-4 w-4"
                                    onClick={(e) => { e.stopPropagation(); setExpandedEntry(isEntryExpanded ? null : entry.id); }}>
                                    {isEntryExpanded ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        )}
      </CardContent>
      </CollapsibleContent>
    </Card>
    </Collapsible>
  );
}
