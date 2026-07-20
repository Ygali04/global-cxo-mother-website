/**
 * AdminNewcomers — view and manage program intent requests.
 *
 * Shows all people who submitted the "Request to Join" form from
 * the Programs discovery page. Admins can approve (creates user +
 * sends onboarding email) or reject (sends waitlist email).
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/portal/api/client';
import {
  listMembershipRequestsApi,
  createMembershipRequestApi,
  updateMembershipRequestApi,
  type MembershipRequest,
} from '@/portal/api/membershipRequests';
import { Card, CardContent } from '@/portal/components/ui/card';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/portal/components/ui/dialog';
import {
  useFieldSchemas, useCreateFieldSchema, useUpdateFieldSchema,
  useDeleteFieldSchema, useReorderFieldSchemas,
} from '@/portal/hooks/useFieldSchemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/portal/components/ui/select';
import { Input } from '@/portal/components/ui/input';
import { CheckCircle, XCircle, Clock, UserPlus, Loader2, ExternalLink, Search, Settings2, Plus, Trash2, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

interface IntentRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  linkedin: string | null;
  message: string | null;
  interests: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
}

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', class: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700' },
  waitlisted: { label: 'Waitlisted', class: 'bg-slate-100 text-slate-700' },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AdminNewcomers() {
  const [requests, setRequests] = useState<IntentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('__all__');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingSearch, setPendingSearch] = useState('');
  const [reviewedSearch, setReviewedSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'gcio' | 'waitlist' | 'reviewed' | 'editor'>('pending');

  // Membership (GCXO) requests state
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>([]);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipActionLoading, setMembershipActionLoading] = useState<string | null>(null);
  const [membershipSearch, setMembershipSearch] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== '__all__' ? `?status_filter=${filter}` : '';
      const data = await apiFetch<IntentRequest[]>(`/admin/intent-requests${params}`);
      setRequests(data);
    } catch {
      toast.error('Failed to load intent requests');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void fetchRequests(); }, [fetchRequests]);

  const fetchMembershipRequests = useCallback(async () => {
    setMembershipLoading(true);
    try {
      const data = await listMembershipRequestsApi();
      setMembershipRequests(data);
    } catch {
      toast.error('Failed to load membership requests');
    } finally {
      setMembershipLoading(false);
    }
  }, []);

  useEffect(() => { void fetchMembershipRequests(); }, [fetchMembershipRequests]);

  const handleLumaImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      let created = 0;
      let skipped = 0;
      for (const row of rows) {
        const norm = (keys: string[]) => {
          for (const [k, v] of Object.entries(row)) {
            if (keys.includes(k.toLowerCase().replace(/[^a-z]/g, ''))) return String(v ?? '').trim();
          }
          return '';
        };
        const firstName = norm(['firstname', 'first', 'fname']);
        const lastName = norm(['lastname', 'last', 'lname']);
        const fullName = norm(['name', 'fullname']) || `${firstName} ${lastName}`.trim();
        const email = norm(['email', 'emailaddress', 'mail']);
        const linkedin = norm(['linkedin', 'linkedinurl', 'linkedinprofile', 'linkedinprofileurl']);
        const company = norm(['company', 'organization', 'companyname']);
        const role = norm(['role', 'title', 'jobtitle', 'position']);

        if (!fullName || !email) { skipped++; continue; }
        try {
          await createMembershipRequestApi({
            name: fullName,
            email,
            linkedin: linkedin || undefined,
            company: company || '',
            role: role || '',
            tier: 'cxo',
          });
          created++;
        } catch {
          skipped++; // duplicate or error
        }
      }
      toast.success(`Imported ${created} waitlist entries (${skipped} skipped)`);
      await fetchMembershipRequests();
    } catch (err: any) {
      toast.error(err.message || 'Failed to parse file');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }, [fetchMembershipRequests]);

  const handleMembershipAction = async (id: string, action: 'approved' | 'rejected' | 'waitlisted' | 'pending') => {
    setMembershipActionLoading(id);
    try {
      const result = await updateMembershipRequestApi(id, { status: action });
      toast.success(result.status ? `Request ${result.status}` : 'Done');
      await fetchMembershipRequests();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action}`);
    } finally {
      setMembershipActionLoading(null);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'waitlist') => {
    setActionLoading(id);
    try {
      const result = await apiFetch<{ status: string; message: string }>(`/admin/intent-requests/${id}`, {
        method: 'PATCH',
        body: { action },
      });
      toast.success(result.message);
      await fetchRequests();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const reviewed = requests.filter((r) => r.status !== 'pending');

  const filterBySearch = (list: IntentRequest[], q: string) => {
    if (!q.trim()) return list;
    const lower = q.trim().toLowerCase();
    return list.filter((r) =>
      r.name.toLowerCase().includes(lower) ||
      r.email.toLowerCase().includes(lower) ||
      r.company.toLowerCase().includes(lower) ||
      r.role.toLowerCase().includes(lower)
    );
  };

  const filteredPending = filterBySearch(pending, pendingSearch);
  const filteredReviewed = filterBySearch(reviewed, reviewedSearch);

  const pendingMembership = membershipRequests.filter((r) => r.status === 'pending');
  const waitlistedMembership = membershipRequests.filter((r) => r.status === 'waitlisted');
  const filterMembershipBySearch = (list: MembershipRequest[], q: string) => {
    if (!q.trim()) return list;
    const lower = q.trim().toLowerCase();
    return list.filter((r) =>
      r.name.toLowerCase().includes(lower) ||
      r.email.toLowerCase().includes(lower) ||
      r.company.toLowerCase().includes(lower) ||
      r.role.toLowerCase().includes(lower)
    );
  };
  const filteredMembership = filterMembershipBySearch(membershipRequests, membershipSearch);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserPlus className="h-6 w-6" />
          Memberships
          {pending.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 ml-2">{pending.length} pending</Badge>
          )}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          People who submitted interest in joining GCXO programs
        </p>
      </div>
      {/* Tab switcher */}
      <div className="inline-flex rounded-lg bg-slate-100 p-1 mb-6">
        {(['pending', 'gcio', 'waitlist', 'reviewed', 'editor'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'pending'
              ? `Program Requests${pending.length ? ` (${pending.length})` : ''}`
              : tab === 'gcio'
                ? `GCXO Requests${pendingMembership.length ? ` (${pendingMembership.length})` : ''}`
                : tab === 'waitlist'
                  ? `Waitlist${waitlistedMembership.length ? ` (${waitlistedMembership.length})` : ''}`
                  : tab === 'reviewed'
                    ? `Reviewed${reviewed.length ? ` (${reviewed.length})` : ''}`
                    : 'Editor'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20">
          <UserPlus className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500">No intent requests yet.</p>
          <p className="text-xs text-slate-400 mt-1">Requests appear here when someone fills the form on the Programs page.</p>
        </div>
      ) : (
        <div>

          {/* ── TAB: Pending ── */}
          {activeTab === 'pending' && (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Pending Review
                <Badge className="bg-amber-100 text-amber-700 ml-2">{pending.length}</Badge>
              </h2>
              {pending.length > 0 && (
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search pending..." value={pendingSearch}
                    onChange={(e) => setPendingSearch(e.target.value)} className="pl-8 h-8 text-xs" />
                </div>
              )}
            </div>
            {filteredPending.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                {pending.length === 0 ? 'No pending requests.' : 'No matches.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredPending.map((req) => {
                  const isActioning = actionLoading === req.id;
                  return (
                    <Card key={req.id}>
                      <CardContent className="py-4 px-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900">{req.name}</p>
                              <span className="text-xs text-slate-400">{relativeTime(req.created_at)}</span>
                            </div>
                            <p className="text-sm text-slate-600">{req.role} at {req.company}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{req.email}</p>
                            {req.linkedin && (
                              <a href={req.linkedin.startsWith('http') ? req.linkedin : `https://${req.linkedin}`}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                                LinkedIn <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {req.interests && <p className="text-xs text-slate-400 mt-1">{req.interests}</p>}
                            {req.message && <p className="text-xs text-slate-500 mt-1 italic">"{req.message}"</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                              disabled={isActioning} onClick={() => handleAction(req.id, 'approve')}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                              disabled={isActioning} onClick={() => handleAction(req.id, 'reject')}>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                            <Button size="sm" variant="ghost" className="text-slate-500"
                              disabled={isActioning} onClick={() => handleAction(req.id, 'waitlist')}>
                              <Clock className="h-3.5 w-3.5 mr-1" /> Waitlist
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* ── TAB: GCXO Requests ── */}
          {activeTab === 'gcio' && (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                GCXO Membership Requests
                <Badge className="bg-amber-100 text-amber-700 ml-2">{pendingMembership.length} pending</Badge>
              </h2>
              <div className="flex items-center gap-2">
                {membershipRequests.length > 0 && (
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search membership requests..." value={membershipSearch}
                      onChange={(e) => setMembershipSearch(e.target.value)} className="pl-8 h-8 text-xs" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => void handleLumaImport(e)} disabled={importing} />
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    {importing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                    {importing ? 'Importing...' : 'Import CSV'}
                  </span>
                </label>
              </div>
            </div>
            {membershipLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMembership.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                {membershipRequests.length === 0 ? 'No membership requests yet.' : 'No matches.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredMembership.map((req) => {
                  const isActioning = membershipActionLoading === req.id;
                  const badge = STATUS_BADGE[req.status] ?? STATUS_BADGE.pending;
                  return (
                    <Card key={req.id}>
                      <CardContent className="py-4 px-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900">{req.name}</p>
                              <Badge variant="outline" className={`text-[10px] ${badge.class}`}>{badge.label}</Badge>
                              <span className="text-xs text-slate-400">{relativeTime(req.created_at)}</span>
                            </div>
                            <p className="text-sm text-slate-600">{req.role} at {req.company}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{req.email}</p>
                            {req.phone && <p className="text-xs text-slate-400 mt-0.5">{req.phone}</p>}
                            {req.linkedin && (
                              <a href={req.linkedin.startsWith('http') ? req.linkedin : `https://${req.linkedin}`}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                                LinkedIn <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {req.about_me && <p className="text-xs text-slate-500 mt-1 italic">"{req.about_me}"</p>}
                            <Badge variant="outline" className="mt-1 text-[10px] capitalize">{req.tier}</Badge>
                            {req.linked_intent_request_id && (
                              <Badge variant="outline" className="ml-1 mt-1 text-[10px] bg-blue-50 text-blue-600">+ Program Request</Badge>
                            )}
                          </div>
                          {req.status === 'pending' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                                disabled={isActioning} onClick={() => handleMembershipAction(req.id, 'approved')}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                                disabled={isActioning} onClick={() => handleMembershipAction(req.id, 'rejected')}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                              <Button size="sm" variant="ghost" className="text-slate-500"
                                disabled={isActioning} onClick={() => handleMembershipAction(req.id, 'waitlisted')}>
                                <Clock className="h-3.5 w-3.5 mr-1" /> Waitlist
                              </Button>
                            </div>
                          )}
                          {req.status !== 'pending' && req.status !== 'approved' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <Button size="sm" variant="ghost" className="text-green-600 h-7 text-xs"
                                disabled={isActioning}
                                onClick={() => handleMembershipAction(req.id, 'approved')}>
                                Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* ── TAB: Waitlist ── */}
          {activeTab === 'waitlist' && (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Waitlist
                <Badge className="bg-blue-100 text-blue-700 ml-2">{waitlistedMembership.length}</Badge>
              </h2>
            </div>
            {waitlistedMembership.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No waitlisted entries.</p>
            ) : (
              <div className="space-y-3">
                {waitlistedMembership.map((req) => {
                  const isActioning = membershipActionLoading === req.id;
                  return (
                    <Card key={req.id}>
                      <CardContent className="py-4 px-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900">{req.name}</p>
                              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600">Waitlisted</Badge>
                              <Badge variant="outline" className="text-[10px] capitalize">{req.tier}</Badge>
                              <span className="text-xs text-slate-400">{relativeTime(req.created_at)}</span>
                            </div>
                            <p className="text-xs text-slate-500">{req.email}</p>
                            {req.linkedin && (
                              <a href={req.linkedin.startsWith('http') ? req.linkedin : `https://${req.linkedin}`}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                                LinkedIn <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                              disabled={isActioning} onClick={() => handleMembershipAction(req.id, 'approved')}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-slate-600 border-slate-300 hover:bg-slate-50 text-xs"
                              disabled={isActioning} onClick={() => handleMembershipAction(req.id, 'pending')}>
                              Move to GCXO
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                              disabled={isActioning} onClick={() => handleMembershipAction(req.id, 'rejected')}>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* ── TAB: Reviewed ── */}
          {activeTab === 'reviewed' && (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Reviewed
                <Badge variant="secondary" className="ml-2">{reviewed.length}</Badge>
              </h2>
              {reviewed.length > 0 && (
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search reviewed..." value={reviewedSearch}
                    onChange={(e) => setReviewedSearch(e.target.value)} className="pl-8 h-8 text-xs" />
                </div>
              )}
            </div>
            {filteredReviewed.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                {reviewed.length === 0 ? 'No reviewed requests yet.' : 'No matches.'}
              </p>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b text-left text-slate-500">
                      <th className="px-4 py-2.5 font-medium">Name</th>
                      <th className="px-4 py-2.5 font-medium">Company</th>
                      <th className="px-4 py-2.5 font-medium">Role</th>
                      <th className="px-4 py-2.5 font-medium">Email</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium">Submitted</th>
                      <th className="px-4 py-2.5 font-medium">Action</th>
                    </tr></thead>
                    <tbody>
                      {filteredReviewed.map((req) => {
                        const badge = STATUS_BADGE[req.status] ?? STATUS_BADGE.pending;
                        return (
                          <tr key={req.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-slate-900">{req.name}</td>
                            <td className="px-4 py-2.5 text-slate-600">{req.company}</td>
                            <td className="px-4 py-2.5 text-slate-600">{req.role}</td>
                            <td className="px-4 py-2.5 text-slate-500 text-xs">{req.email}</td>
                            <td className="px-4 py-2.5">
                              <Badge variant="outline" className={`text-[10px] ${badge.class}`}>{badge.label}</Badge>
                            </td>
                            <td className="px-4 py-2.5 text-slate-400 text-xs">{relativeTime(req.created_at)}</td>
                            <td className="px-4 py-2.5 flex gap-1">
                              {req.status !== 'approved' && (
                                <Button size="sm" variant="ghost" className="text-green-600 h-7 text-xs"
                                  disabled={actionLoading === req.id}
                                  onClick={() => handleAction(req.id, 'approve')}>
                                  Approve
                                </Button>
                              )}
                              {req.status !== 'rejected' && (
                                <Button size="sm" variant="ghost" className="text-red-600 h-7 text-xs"
                                  disabled={actionLoading === req.id}
                                  onClick={() => handleAction(req.id, 'reject')}>
                                  Deny
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
          )}

          {/* ── TAB: Editor ── */}
          {activeTab === 'editor' && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Customize Intent Request Form</h2>
              <p className="text-sm text-slate-500 mb-6">
                Add, edit, or remove fields on the public "Request to Join" form.
                Changes appear on the website within minutes.
              </p>
              <IntentFieldEditor />
            </div>
          )}

        </div>
      )}
    </div>
  );
}


/** Inline field editor for entity_type=intent_request, same pattern as AdminStartupFieldEditor. */
function IntentFieldEditor() {
  const { data: fields, isLoading } = useFieldSchemas('intent_request');
  const createField = useCreateFieldSchema('intent_request');
  const updateField = useUpdateFieldSchema('intent_request');
  const deleteField = useDeleteFieldSchema('intent_request');
  const reorderFields = useReorderFieldSchemas('intent_request');

  const [addLabel, setAddLabel] = useState('');
  const [addType, setAddType] = useState('text');
  const [addRequired, setAddRequired] = useState(false);

  const handleAdd = () => {
    if (!addLabel.trim()) return;
    const key = addLabel.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 128);
    createField.mutate({
      field_key: key,
      field_label: addLabel.trim(),
      field_type: addType,
      required: addRequired,
      visible_on: ['onboarding', 'profile', 'admin'],
    }, {
      onSuccess: () => { setAddLabel(''); setAddType('text'); setAddRequired(false); toast.success('Field added'); },
      onError: () => toast.error('Failed to add field'),
    });
  };

  const handleDelete = (key: string) => {
    deleteField.mutate(key, {
      onError: () => toast.error('Cannot delete (may be a system field)'),
    });
  };

  const handleMove = (key: string, dir: 'up' | 'down') => {
    if (!fields) return;
    const keys = fields.map((f) => f.field_key);
    const idx = keys.indexOf(key);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= keys.length) return;
    [keys[idx], keys[swapIdx]] = [keys[swapIdx], keys[idx]];
    reorderFields.mutate(keys);
  };

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading fields...</div>;

  return (
    <div className="space-y-4">
      {/* Existing fields */}
      {(fields ?? []).length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">No custom fields yet. The form uses default fields (name, email, company, role).</p>
      ) : (
        <div className="space-y-2">
          {(fields ?? []).map((f, i) => (
            <div key={f.field_key} className="flex items-center gap-2 rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={i === 0} onClick={() => handleMove(f.field_key, 'up')}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={i === (fields ?? []).length - 1} onClick={() => handleMove(f.field_key, 'down')}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{f.field_label}</p>
                <p className="text-xs text-slate-400">{f.field_type}{f.required ? ' · required' : ''}</p>
              </div>
              {!f.is_system && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(f.field_key)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new field */}
      <div className="border-t pt-4 space-y-3">
        <p className="text-xs font-medium text-slate-700">Add a field</p>
        <div className="flex gap-2">
          <input
            placeholder="Field label"
            value={addLabel}
            onChange={(e) => setAddLabel(e.target.value)}
            className="flex-1 rounded-md border px-3 py-1.5 text-sm"
          />
          <select value={addType} onChange={(e) => setAddType(e.target.value)}
            className="rounded-md border px-2 py-1.5 text-sm">
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="select">Select</option>
            <option value="url">URL</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
          </select>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={addRequired} onChange={(e) => setAddRequired(e.target.checked)} />
            Req
          </label>
          <Button size="sm" onClick={handleAdd} disabled={!addLabel.trim()}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
