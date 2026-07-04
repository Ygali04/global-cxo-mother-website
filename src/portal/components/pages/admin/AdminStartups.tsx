import type { JSX } from 'react';
import { useMemo, useState, useCallback, useRef } from 'react';
import {
  Globe,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Users,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Plus,
  Settings2,
  Search,
  GraduationCap,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/portal/components/ui/card';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import { Separator } from '@/portal/components/ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/portal/components/ui/dialog';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import { Textarea } from '@/portal/components/ui/textarea';
import { Switch } from '@/portal/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/portal/components/ui/select';
import { useAuth } from '@/portal/hooks/useAuth';
import type { MockStartupProfile } from '@/portal/data/mock';
import { toast } from 'sonner';
import {
  createStartupLinkApi,
  deleteStartupMemberApi,
  deleteStartupProfileApi,
  updateStartupMemberRoleApi,
} from '@/portal/api/startups';
import { StartupListSkeleton } from '@/portal/components/ui/admin-skeletons';
import AdminStartupFieldEditor from './AdminStartupFieldEditor';
import { usePrograms, useEnrollUser, useCohorts } from '@/portal/hooks/usePrograms';
import { enrollUserInCohortApi } from '@/portal/api/programs';
import { useQueries } from '@tanstack/react-query';
import { listEnrollmentsApi } from '@/portal/api/programs';
import type { ProgramResponse, EnrollmentResponse } from '@/portal/api/types';

// ---------------------------------------------------------------------------
// StartupProgramSection — shows current enrollments + enroll-in-program UI
// ---------------------------------------------------------------------------

function StartupProgramSection({
  memberUserIds,
  membersByUserId,
}: {
  memberUserIds: string[];
  membersByUserId: Map<string, { name: string; email: string }>;
}): JSX.Element {
  const { data: programs = [], isLoading: programsLoading } = usePrograms();
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [enrollBusy, setEnrollBusy] = useState(false);

  const activeProgramId = selectedProgramId || '';
  const { data: circles = [] } = useCohorts(activeProgramId || null);

  // Fetch enrollments for every program via useQueries (stable hook count)
  const enrollmentQueries = useQueries({
    queries: programs.map((p) => ({
      queryKey: ['programs', p.id, 'enrollments'] as const,
      queryFn: () => listEnrollmentsApi(p.id),
      enabled: !!p.id,
      staleTime: 5 * 60 * 1000,
    })),
  });

  // Build a list of enrollments that belong to this startup's members
  const memberEnrollments = useMemo(() => {
    const idSet = new Set(memberUserIds);
    const result: Array<{ enrollment: EnrollmentResponse; programName: string }> = [];
    programs.forEach((p, idx) => {
      const enrollments = enrollmentQueries[idx]?.data ?? [];
      for (const e of enrollments) {
        if (idSet.has(e.user_id)) {
          result.push({ enrollment: e, programName: p.name });
        }
      }
    });
    return result;
  }, [memberUserIds, programs, enrollmentQueries]);

  const enrollMutation = useEnrollUser(activeProgramId);

  // Enroll ALL members of the startup into the selected program + circle
  const handleEnrollAll = async () => {
    if (!activeProgramId || memberUserIds.length === 0) return;
    setEnrollBusy(true);
    let successCount = 0;
    let failCount = 0;
    for (const uid of memberUserIds) {
      const member = membersByUserId.get(uid);
      if (!member) continue;
      try {
        await enrollMutation.mutateAsync({
          user_email: member.email,
          user_name: member.name,
          role: 'startup',
        });
        // If a circle is selected, also enroll in the circle
        if (selectedCircleId && selectedCircleId !== '__none__') {
          await enrollUserInCohortApi(activeProgramId, selectedCircleId, {
            user_email: member.email,
            role: 'startup',
          });
        }
        successCount++;
      } catch {
        failCount++;
      }
    }
    setEnrollBusy(false);
    if (successCount > 0) toast.success(`${successCount} member${successCount > 1 ? 's' : ''} enrolled`);
    if (failCount > 0) toast.error(`${failCount} enrollment${failCount > 1 ? 's' : ''} failed (may already be enrolled)`);
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="mb-2 flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-slate-500" />
        <h4 className="text-xs font-semibold uppercase text-slate-400">Program Enrollment</h4>
      </div>

      {/* Current enrollments */}
      {memberEnrollments.length > 0 ? (
        <div className="mb-3 space-y-1">
          {memberEnrollments.map(({ enrollment, programName }) => {
            const member = membersByUserId.get(enrollment.user_id);
            return (
              <div key={enrollment.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <span className="font-medium">{member?.name ?? enrollment.user_email ?? 'Unknown'}</span>
                <span className="text-slate-400">in</span>
                <Badge className="bg-indigo-100 text-indigo-700 text-[10px]">{programName}</Badge>
                <Badge className={`text-[10px] ${enrollment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  {enrollment.status}
                </Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mb-3 text-xs text-slate-400">Not enrolled in any program.</p>
      )}

      {/* Enroll entire startup */}
      {programs.length > 0 && memberUserIds.length > 0 && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1">
            <Label className="text-xs text-slate-500">Program</Label>
            <Select value={activeProgramId} onValueChange={(v) => { setSelectedProgramId(v); setSelectedCircleId(''); }}>
              <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Select program" /></SelectTrigger>
              <SelectContent>
                {programs.map((p: ProgramResponse) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {activeProgramId && circles.length > 0 && (
            <div className="grid gap-1">
              <Label className="text-xs text-slate-500">Circle</Label>
              <Select value={selectedCircleId} onValueChange={setSelectedCircleId}>
                <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Optional circle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No circle</SelectItem>
                  {circles.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            size="sm"
            className="h-8"
            disabled={enrollBusy || !activeProgramId}
            onClick={() => void handleEnrollAll()}
          >
            {enrollBusy ? 'Enrolling...' : `Enroll Startup (${memberUserIds.length} members)`}
          </Button>
        </div>
      )}
      {programsLoading && <p className="text-xs text-slate-400">Loading programs...</p>}
    </div>
  );
}

export default function AdminStartups(): JSX.Element {
  const { startups, userStartupLinks, users, updateStartupProfile, createStartupProfile, catalogHydrated } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<MockStartupProfile | null>(null);
  const [form, setForm] = useState({
    companyName: '',
    companyWebsite: '',
    companyDomain: '',
    description: '',
    isVerified: false,
  });

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    companyName: '',
    companyWebsite: '',
    companyDomain: '',
    description: '',
  });
  const [createBusy, setCreateBusy] = useState(false);

  // Delete — optimistic removal with tombstone to prevent resurrection
  // on concurrent refreshCatalog, same pattern as event deletion.
  const deletedStartupIdsRef = useRef<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<MockStartupProfile | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // Add member dialog
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberStartupId, setAddMemberStartupId] = useState<string>('');
  const [addMemberUserId, setAddMemberUserId] = useState('');
  const [addMemberRole, setAddMemberRole] = useState<'member' | 'manager'>('member');
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [addMemberBusy, setAddMemberBusy] = useState(false);

  const [fieldsOpen, setFieldsOpen] = useState(false);

  // Search + filter
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  const filteredStartups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const tombstoned = deletedStartupIdsRef.current;
    return startups.filter((s) => {
      if (tombstoned.has(s.id)) return false;
      if (verifiedFilter === 'verified' && !s.isVerified) return false;
      if (verifiedFilter === 'unverified' && s.isVerified) return false;
      if (q.length === 0) return true;
      return (
        s.companyName.toLowerCase().includes(q) ||
        s.companyDomain.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.companyWebsite ?? '').toLowerCase().includes(q)
      );
    });
  }, [startups, searchQuery, verifiedFilter]);

  const openAddMember = (startupId: string): void => {
    setAddMemberStartupId(startupId);
    setAddMemberUserId('');
    setAddMemberRole('member');
    setAddMemberSearch('');
    setAddMemberOpen(true);
  };

  const submitAddMember = async (): Promise<void> => {
    if (!addMemberUserId) { toast.error('Select a user'); return; }
    setAddMemberBusy(true);
    try {
      await createStartupLinkApi({
        user_id: addMemberUserId,
        startup_id: addMemberStartupId,
        link_role: addMemberRole,
      });
      toast.success('Member added');
      setAddMemberOpen(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to add member');
    } finally {
      setAddMemberBusy(false);
    }
  };

  // Track optimistically removed member links for instant UI feedback
  const [removedLinkKeys, setRemovedLinkKeys] = useState<Set<string>>(new Set());

  const handleRemoveMember = async (
    startupId: string,
    userId: string,
    memberName: string,
  ): Promise<void> => {
    if (!confirm(`Remove ${memberName} from this startup?`)) return;
    // Optimistic: remove from UI immediately
    const linkKey = `${startupId}:${userId}`;
    setRemovedLinkKeys((prev) => new Set(prev).add(linkKey));
    toast.success(`${memberName} removed`);
    try {
      await deleteStartupMemberApi(startupId, userId);
    } catch (e: unknown) {
      // Rollback: restore to UI on failure
      setRemovedLinkKeys((prev) => { const next = new Set(prev); next.delete(linkKey); return next; });
      toast.error(e instanceof Error ? e.message : 'Failed to remove member — restored');
    }
  };

  // Optimistic role overrides — tracks role changes before API confirms
  const [roleOverrides, setRoleOverrides] = useState<Map<string, string>>(new Map());

  const handleRoleChange = async (
    startupId: string,
    userId: string,
    memberName: string,
    newRole: 'manager' | 'member',
  ): Promise<void> => {
    const key = `${startupId}:${userId}`;
    // Optimistic: update UI immediately
    setRoleOverrides((prev) => new Map(prev).set(key, newRole));
    toast.success(`${memberName} ${newRole === 'manager' ? 'promoted to manager' : 'set to member'}`);
    try {
      await updateStartupMemberRoleApi(startupId, userId, newRole);
    } catch {
      // Rollback on failure
      setRoleOverrides((prev) => { const next = new Map(prev); next.delete(key); return next; });
      toast.error(`Failed to update role for ${memberName}`);
    }
  };

  const toggle = (id: string): void => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const openEdit = (startup: MockStartupProfile): void => {
    setSelectedStartup(startup);
    setForm({
      companyName: startup.companyName,
      companyWebsite: startup.companyWebsite,
      companyDomain: startup.companyDomain,
      description: startup.description,
      isVerified: startup.isVerified,
    });
    setEditOpen(true);
  };

  const openCreate = (): void => {
    setCreateForm({ companyName: '', companyWebsite: '', companyDomain: '', description: '' });
    setCreateOpen(true);
  };

  const submitCreate = async (): Promise<void> => {
    if (!createForm.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    setCreateBusy(true);
    try {
      const result = await createStartupProfile({
        companyName: createForm.companyName.trim(),
        companyWebsite: createForm.companyWebsite.trim(),
        description: createForm.description.trim() || 'GCXO member startup',
      });
      if (result) {
        toast.success('Startup created');
        setCreateOpen(false);
      } else {
        toast.error('Failed to create startup');
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create startup');
    } finally {
      setCreateBusy(false);
    }
  };

  const openDelete = (startup: MockStartupProfile): void => {
    setDeleteTarget(startup);
    setDeleteOpen(true);
  };

  const submitDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    const targetName = deleteTarget.companyName;

    // Optimistic: tombstone + close dialog + remove from UI immediately.
    deletedStartupIdsRef.current.add(targetId);
    setDeleteOpen(false);
    setExpandedId(null);
    toast.success(`${targetName} deleted`);

    // Fire API in background — rollback the tombstone on failure so the
    // startup reappears on the next refreshCatalog.
    try {
      await deleteStartupProfileApi(targetId);
    } catch {
      deletedStartupIdsRef.current.delete(targetId);
      toast.error(`Failed to delete ${targetName} from the server — it will reappear on refresh`);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Startups</h1>
          <p className="text-sm text-slate-500">
            {startups.length} startup profiles registered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setFieldsOpen(true)}>
            <Settings2 className="mr-1 h-4 w-4" />
            Profile Fields
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            New Startup
          </Button>
        </div>
      </div>

      {/* Search + filter controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, domain, website, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={verifiedFilter} onValueChange={(v) => setVerifiedFilter(v as typeof verifiedFilter)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All startups</SelectItem>
            <SelectItem value="verified">Verified only</SelectItem>
            <SelectItem value="unverified">Unverified only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredStartups.length !== startups.length && (
        <p className="mb-3 text-xs text-slate-500">
          Showing {filteredStartups.length} of {startups.length} startups
        </p>
      )}

      {!catalogHydrated && startups.length === 0 ? (
        <StartupListSkeleton count={5} />
      ) : (
      <div className="space-y-4">
        {filteredStartups.map((startup) => {
          const links = userStartupLinks.filter(
            (l) => l.startupId === startup.id && !removedLinkKeys.has(`${startup.id}:${l.userId}`),
          );
          const members = links
            .map((l) => {
              const user = users.find((u) => u.id === l.userId);
              // Apply optimistic role override if one exists
              const effectiveRole = roleOverrides.get(`${startup.id}:${l.userId}`) ?? l.role;
              return user ? { ...user, startupRole: effectiveRole } : null;
            })
            .filter(Boolean) as Array<{ id: string; name: string; role: string; startupRole: string }>;

          const registeredByUser = users.find(
            (u) => u.id === startup.registeredBy,
          );
          const isExpanded = expandedId === startup.id;

          return (
            <Card key={startup.id}>
              <CardHeader className="cursor-pointer" onClick={() => toggle(startup.id)}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                      {startup.companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex items-center gap-2 text-base break-words">
                        {startup.companyName}
                        {startup.isVerified && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                        )}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {startup.companyDomain}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {links.length} member{links.length !== 1 ? 's' : ''}
                        </span>
                        {startup.isVerified && (
                          <Badge className="bg-green-100 text-green-700 text-[10px]">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    {registeredByUser && (
                      <span className="text-xs text-slate-400 text-left sm:text-right">
                        Registered by {registeredByUser.name}
                      </span>
                    )}
                    <Button variant="ghost" size="sm" className="shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4">
                  <Separator />

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                      Description
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {startup.description}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                      Website
                    </p>
                    <a
                      href={startup.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {startup.companyWebsite}
                    </a>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Startup Founders ({members.length})
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => openAddMember(startup.id)}
                      >
                        <Plus className="h-3 w-3" />
                        Add Member
                      </Button>
                    </div>
                    {members.length > 0 ? (
                      <div className="space-y-2">
                        {members.map((m) => (
                          <div
                            key={(m as { linkId?: string }).linkId ?? m.id}
                            className="flex items-center gap-3 rounded-md border p-3"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {m.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{m.name}</p>
                              <p className="text-xs text-slate-500 truncate">{m.role}</p>
                            </div>
                            <Badge className={`shrink-0 text-[10px] capitalize ${
                              m.startupRole === 'manager' || m.startupRole === 'founder'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {m.startupRole}
                            </Badge>
                            {m.startupRole === 'member' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 shrink-0 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleRoleChange(startup.id, m.id, m.name, 'manager')}
                                title="Promote to manager"
                              >
                                Promote
                              </Button>
                            )}
                            {m.startupRole === 'manager' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 shrink-0 px-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                onClick={() => handleRoleChange(startup.id, m.id, m.name, 'member')}
                                title="Demote to member"
                              >
                                Demote
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 shrink-0 p-0 text-slate-400 hover:text-red-600"
                              onClick={() => handleRemoveMember(startup.id, m.id, m.name)}
                              title={`Remove ${m.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-xs text-slate-400">
                        No members linked yet. Click "Add Member" to assign users.
                      </p>
                    )}
                  </div>

                  {/* Program Enrollment Section */}
                  <StartupProgramSection
                    memberUserIds={members.map((m) => m.id)}
                    membersByUserId={
                      new Map(
                        members.map((m) => [
                          m.id,
                          { name: m.name, email: (users.find((u) => u.id === m.id)?.email ?? '') },
                        ]),
                      )
                    }
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => openDelete(startup)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(startup)}>
                      <Pencil className="h-4 w-4" />
                      Edit Startup Page
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Hydrating skeleton — auth context hasn't loaded any startups
            or users yet (most likely a fresh page load). Once data
            arrives, this collapses and the real list takes over. */}
        {catalogHydrated && startups.length === 0 && (
          <p className="py-12 text-center text-slate-400">
            No startup profiles found.
          </p>
        )}
        {startups.length > 0 && filteredStartups.length === 0 && (
          <p className="py-12 text-center text-slate-400">
            No startups match your search or filter.
          </p>
        )}
      </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Startup Page</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="admin-startup-name">Company Name</Label>
              <Input
                id="admin-startup-name"
                value={form.companyName}
                onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-startup-site">Website</Label>
              <Input
                id="admin-startup-site"
                value={form.companyWebsite}
                onChange={(e) => setForm((prev) => ({ ...prev, companyWebsite: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-startup-domain">Company Domain</Label>
              <Input
                id="admin-startup-domain"
                placeholder="e.g. acme.com"
                value={form.companyDomain}
                onChange={(e) => setForm((prev) => ({ ...prev, companyDomain: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-startup-description">Description</Label>
              <Textarea
                id="admin-startup-description"
                rows={6}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="admin-startup-verified"
                checked={form.isVerified}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isVerified: checked }))}
              />
              <Label htmlFor="admin-startup-verified">Verified startup</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedStartup) return;
                updateStartupProfile(selectedStartup.id, {
                  companyName: form.companyName,
                  companyWebsite: form.companyWebsite,
                  description: form.description,
                  isVerified: form.isVerified,
                });
                toast.success('Startup page updated.');
                setEditOpen(false);
              }}
            >
              Save Startup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Startup Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Startup</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="create-startup-name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-startup-name"
                placeholder="Acme Corp"
                value={createForm.companyName}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, companyName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-startup-site">Company Website</Label>
              <Input
                id="create-startup-site"
                placeholder="https://acme.com"
                value={createForm.companyWebsite}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, companyWebsite: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-startup-domain">Company Domain</Label>
              <Input
                id="create-startup-domain"
                placeholder="acme.com"
                value={createForm.companyDomain}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, companyDomain: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create-startup-description">Description</Label>
              <Textarea
                id="create-startup-description"
                rows={4}
                placeholder="Brief description of the startup"
                value={createForm.description}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled={createBusy} onClick={() => void submitCreate()}>
              {createBusy ? 'Creating…' : 'Create Startup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Fields Editor Dialog */}
      <Dialog open={fieldsOpen} onOpenChange={setFieldsOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Startup Profile Fields</DialogTitle>
          </DialogHeader>
          <AdminStartupFieldEditor />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Startup</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{deleteTarget?.companyName}</span>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteBusy}
              onClick={() => void submitDelete()}
            >
              {deleteBusy ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member dialog — inline search + list + role segmented control.
          We deliberately avoid Radix Select here because its portal-based
          SelectContent was rendering behind the dialog overlay. An inline
          list lives inside the dialog DOM tree, so its stacking order is
          predictable and it can be searched as the user types. */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member to Startup</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="add-member-search">Search users</Label>
              <Input
                id="add-member-search"
                placeholder="Search by name, email, or company…"
                value={addMemberSearch}
                onChange={(e) => setAddMemberSearch(e.target.value)}
                autoFocus
              />
              <div className="max-h-60 overflow-y-auto rounded-md border bg-white">
                {(() => {
                  const q = addMemberSearch.trim().toLowerCase();
                  const candidates = users
                    .filter(
                      (u) =>
                        !userStartupLinks.some(
                          (l) =>
                            l.startupId === addMemberStartupId && l.userId === u.id,
                        ),
                    )
                    .filter((u) => {
                      if (q.length === 0) return true;
                      return (
                        u.name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        (u.companyAffiliation ?? '').toLowerCase().includes(q)
                      );
                    })
                    .slice(0, 50);
                  if (candidates.length === 0) {
                    return (
                      <p className="px-3 py-6 text-center text-xs text-slate-400">
                        {q.length > 0
                          ? 'No matching users'
                          : 'All users are already linked to this startup'}
                      </p>
                    );
                  }
                  return (
                    <ul className="divide-y divide-slate-100">
                      {candidates.map((u) => {
                        const selected = u.id === addMemberUserId;
                        return (
                          <li key={u.id}>
                            <button
                              type="button"
                              onClick={() => setAddMemberUserId(u.id)}
                              className={`flex w-full items-start justify-between gap-2 px-3 py-2 text-left transition-colors ${
                                selected
                                  ? 'bg-indigo-50 hover:bg-indigo-50'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">
                                  {u.name}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                  {u.email}
                                  {u.companyAffiliation
                                    ? ` · ${u.companyAffiliation}`
                                    : ''}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className={`shrink-0 text-[10px] uppercase ${
                                  selected
                                    ? 'border-indigo-300 text-indigo-700'
                                    : ''
                                }`}
                              >
                                {u.tier}
                              </Badge>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={addMemberRole === 'member' ? 'default' : 'outline'}
                  onClick={() => setAddMemberRole('member')}
                  className="w-full"
                >
                  Member
                </Button>
                <Button
                  type="button"
                  variant={addMemberRole === 'manager' ? 'default' : 'outline'}
                  onClick={() => setAddMemberRole('manager')}
                  className="w-full"
                >
                  Manager
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Managers can view pricing, edit the startup profile, and enroll
                the company in programs. Members only view the company page.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void submitAddMember()}
              disabled={addMemberBusy || !addMemberUserId}
            >
              {addMemberBusy ? 'Adding…' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
