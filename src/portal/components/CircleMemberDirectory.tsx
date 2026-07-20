/**
 * CircleMemberDirectory — circle detail view split into Advisors (CxOs) and
 * Team Members (startup_admin + startup_member, max 3 view-only).
 *
 * Usage:
 *   <CircleMemberDirectory programId="..." circleId="..." />
 */

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/portal/components/ui/card';
import { Input } from '@/portal/components/ui/input';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import { Label } from '@/portal/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/portal/components/ui/avatar';
import { Search, Users, ExternalLink, Loader2, UserPlus, Trash2, Mail, Check, Shield, Crown } from 'lucide-react';
import { listCircleMembersApi, listEnrollmentsApi, enrollUserInCohortApi, deleteCohortEnrollmentApi, type CircleMemberProfile } from '@/portal/api/programs';
import type { EnrollmentResponse } from '@/portal/api/types';

interface CircleMemberDirectoryProps {
  programId: string;
  circleId: string;
  circleName?: string;
  className?: string;
  isAdmin?: boolean;
  maxTeamMembers?: number;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function roleBadgeColor(role: string) {
  const colors: Record<string, string> = {
    cxo: 'bg-amber-100 text-amber-700',
    startup_admin: 'bg-blue-100 text-blue-700',
    startup_member: 'bg-gray-100 text-gray-600',
    startup: 'bg-cyan-100 text-cyan-700',
    vc: 'bg-emerald-100 text-emerald-700',
  };
  return colors[role] ?? 'bg-gray-100 text-gray-700';
}

function roleLabelMap(role: string) {
  const labels: Record<string, string> = {
    startup_admin: 'Admin',
    startup_member: 'Team',
    cxo: 'CxO',
  };
  return labels[role] ?? role;
}

function MemberCard({
  member,
  isAdmin,
  removingId,
  onRemove,
}: {
  member: CircleMemberProfile;
  isAdmin: boolean;
  removingId: string | null;
  onRemove: (m: CircleMemberProfile) => void;
}) {
  return (
    <div className="flex gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10 shrink-0">
        {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.name} />}
        <AvatarFallback className="text-xs">{initials(member.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{member.name}</p>
          {member.enrollment_role === 'startup_admin' && (
            <Crown className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          )}
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${roleBadgeColor(member.enrollment_role)}`}>
            {roleLabelMap(member.enrollment_role)}
          </Badge>
          {isAdmin && member.enrollment_role !== 'startup_admin' && (
            <button
              type="button"
              title={`Remove ${member.name}`}
              disabled={removingId === member.enrollment_id}
              onClick={() => onRemove(member)}
              className="ml-auto shrink-0 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {member.role && <p className="text-xs text-muted-foreground truncate">{member.role}</p>}
        {member.company && <p className="text-xs text-muted-foreground truncate">{member.company}</p>}
        {member.about_me && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{member.about_me}</p>}
        {member.linkedin && (
          <a
            href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
          >
            LinkedIn <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export function CircleMemberDirectory({
  programId,
  circleId,
  circleName = 'Circle',
  className,
  isAdmin = false,
  maxTeamMembers = 3,
}: CircleMemberDirectoryProps) {
  const [search, setSearch] = useState('');
  const [addDialogType, setAddDialogType] = useState<'advisor' | 'team' | null>(null);
  const [addMode, setAddMode] = useState<'pick' | 'email'>('pick');
  const [addEmail, setAddEmail] = useState('');
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addLinkedin, setAddLinkedin] = useState('');
  const [addRoleTitle, setAddRoleTitle] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [pickSearch, setPickSearch] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ['circle-members', programId, circleId],
    queryFn: () => listCircleMembersApi(programId, circleId),
  });

  const { data: programEnrollments } = useQuery({
    queryKey: ['enrollments', programId],
    queryFn: () => listEnrollmentsApi(programId),
    enabled: addDialogType !== null,
  });

  const advisors = useMemo(
    () => (members ?? []).filter((m) => m.enrollment_role === 'cxo'),
    [members],
  );

  const teamMembers = useMemo(
    () => (members ?? []).filter((m) => m.enrollment_role === 'startup_admin' || m.enrollment_role === 'startup_member' || m.enrollment_role === 'startup'),
    [members],
  );

  const teamMemberCount = useMemo(
    () => teamMembers.filter((m) => m.enrollment_role === 'startup_member').length,
    [teamMembers],
  );

  const pickableEnrollments = useMemo(() => {
    if (!programEnrollments) return [];
    const circleUserIds = new Set((members ?? []).map((m) => m.user_id));
    const targetRole = addDialogType === 'advisor' ? 'cxo' : null;
    const active = programEnrollments.filter((e) => {
      if (circleUserIds.has(e.user_id)) return false;
      if (e.status === 'withdrawn' || e.status === 'rejected') return false;
      if (targetRole && e.role !== targetRole) return false;
      return true;
    });
    if (!pickSearch.trim()) return active;
    const q = pickSearch.trim().toLowerCase();
    return active.filter(
      (e) =>
        (e.user_name ?? '').toLowerCase().includes(q) ||
        (e.user_email ?? '').toLowerCase().includes(q),
    );
  }, [programEnrollments, members, pickSearch, addDialogType]);

  const filtered = useMemo(() => {
    if (!members) return { advisors: [], team: [] };
    const q = search.trim().toLowerCase();
    const matchFn = (m: CircleMemberProfile) =>
      !q ||
      m.name.toLowerCase().includes(q) ||
      (m.company ?? '').toLowerCase().includes(q) ||
      (m.role ?? '').toLowerCase().includes(q);
    return {
      advisors: advisors.filter(matchFn),
      team: teamMembers.filter(matchFn),
    };
  }, [members, advisors, teamMembers, search]);

  const handleRemoveMember = async (member: CircleMemberProfile) => {
    setRemovingId(member.enrollment_id);
    try {
      await deleteCohortEnrollmentApi(programId, circleId, member.enrollment_id);
      toast.success(`${member.name} removed from circle`);
      queryClient.invalidateQueries({ queryKey: ['circle-members', programId, circleId] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setRemovingId(null);
    }
  };

  const closeDialog = () => {
    setAddDialogType(null);
    setAddMode('pick');
    setSelectedEnrollment(null);
    setPickSearch('');
    setAddEmail('');
    setAddName('');
    setAddPhone('');
    setAddLinkedin('');
    setAddRoleTitle('');
  };

  const handleAdd = async () => {
    setAddLoading(true);
    const email = addMode === 'pick' ? selectedEnrollment!.user_email! : addEmail.trim();
    const role = addDialogType === 'advisor' ? 'cxo' : 'startup_member';
    const payload: Parameters<typeof enrollUserInCohortApi>[2] = { user_email: email, role };
    if (addMode === 'email') {
      if (addName.trim()) payload.user_name = addName.trim();
      if (addPhone.trim()) payload.user_phone = addPhone.trim();
      if (addLinkedin.trim()) payload.user_linkedin = addLinkedin.trim();
      if (addRoleTitle.trim()) payload.user_role_title = addRoleTitle.trim();
    }
    try {
      await enrollUserInCohortApi(programId, circleId, payload);
      toast.success(`Added ${addMode === 'pick' ? selectedEnrollment!.user_name : addName.trim() || email} to ${circleName}`);
      closeDialog();
      void queryClient.invalidateQueries({ queryKey: ['circle-members', programId, circleId] });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to add member');
    } finally {
      setAddLoading(false);
    }
  };

  const dialogTitle = addDialogType === 'advisor' ? `Add Advisor to ${circleName}` : `Add Team Member to ${circleName}`;
  const dialogCta = addDialogType === 'advisor' ? 'Add Advisor' : 'Add Team Member';

  return (
    <div className={className}>
      {/* Search across both sections */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Advisors (CxOs) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-amber-600" />
                  Advisory CxOs
                  <Badge variant="secondary" className="ml-1 text-xs">{advisors.length}</Badge>
                </CardTitle>
                {isAdmin && (
                  <Button size="sm" variant="outline" onClick={() => setAddDialogType('advisor')}>
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Add Advisor
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filtered.advisors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {search ? 'No advisors match your search.' : 'No advisors added yet.'}
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered.advisors.map((m) => (
                    <MemberCard key={m.user_id} member={m} isAdmin={isAdmin} removingId={removingId} onRemove={handleRemoveMember} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Members (startup admin + members) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-blue-600" />
                  Startup Team
                  <Badge variant="secondary" className="ml-1 text-xs">{teamMembers.length}</Badge>
                </CardTitle>
                {isAdmin && teamMemberCount < maxTeamMembers && (
                  <Button size="sm" variant="outline" onClick={() => setAddDialogType('team')}>
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Add Team Member
                  </Button>
                )}
                {isAdmin && teamMemberCount >= maxTeamMembers && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">Max {maxTeamMembers} team members</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Team members have view-only access. The admin can schedule sessions.
              </p>
            </CardHeader>
            <CardContent>
              {filtered.team.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {search ? 'No team members match your search.' : 'No team members yet.'}
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered.team.map((m) => (
                    <MemberCard key={m.user_id} member={m} isAdmin={isAdmin} removingId={removingId} onRemove={handleRemoveMember} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Advisor / Add Team Member Dialog */}
      {addDialogType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDialog}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{dialogTitle}</h3>

            {/* Mode toggle */}
            <div className="flex gap-1 mb-4 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => { setAddMode('pick'); setAddEmail(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${addMode === 'pick' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Users className="h-3.5 w-3.5" /> Program Members
              </button>
              <button
                type="button"
                onClick={() => { setAddMode('email'); setSelectedEnrollment(null); setPickSearch(''); }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${addMode === 'email' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Mail className="h-3.5 w-3.5" /> Invite by Email
              </button>
            </div>

            <div className="space-y-4">
              {addMode === 'pick' ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={pickSearch}
                      onChange={(e) => setPickSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto rounded-md border divide-y">
                    {pickableEnrollments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        {pickSearch ? 'No matching members.' : 'No eligible members found.'}
                      </p>
                    ) : (
                      pickableEnrollments.map((enrollment) => (
                        <button
                          key={enrollment.id}
                          type="button"
                          onClick={() => setSelectedEnrollment(selectedEnrollment?.id === enrollment.id ? null : enrollment)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 ${selectedEnrollment?.id === enrollment.id ? 'bg-blue-50' : ''}`}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs">{initials(enrollment.user_name ?? '?')}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{enrollment.user_name ?? 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground truncate">{enrollment.user_email}</p>
                          </div>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${roleBadgeColor(enrollment.role)}`}>
                            {enrollment.role}
                          </Badge>
                          {selectedEnrollment?.id === enrollment.id && (
                            <Check className="h-4 w-4 text-blue-600 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="add-member-name">Name *</Label>
                      <Input id="add-member-name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Jane Smith" />
                    </div>
                    <div>
                      <Label htmlFor="add-member-email">Email *</Label>
                      <Input id="add-member-email" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="jane@company.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="add-member-phone">Phone</Label>
                      <Input id="add-member-phone" type="tel" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="+1 555-0123" />
                    </div>
                    <div>
                      <Label htmlFor="add-member-role-title">Role</Label>
                      <Input id="add-member-role-title" value={addRoleTitle} onChange={(e) => setAddRoleTitle(e.target.value)} placeholder="e.g. Product Manager" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="add-member-linkedin">LinkedIn</Label>
                    <Input id="add-member-linkedin" value={addLinkedin} onChange={(e) => setAddLinkedin(e.target.value)} placeholder="linkedin.com/in/janesmith" />
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button
                  disabled={addLoading || (addMode === 'pick' ? !selectedEnrollment : !addEmail.trim())}
                  onClick={handleAdd}
                >
                  {addLoading ? 'Adding...' : dialogCta}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
