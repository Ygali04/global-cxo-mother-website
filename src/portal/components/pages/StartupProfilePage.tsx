import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, ExternalLink, Globe, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/portal/hooks/useAuth';
import { useCanEditStartupProfile } from '@/portal/hooks/useFinancialAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/portal/components/ui/card';
import { Button } from '@/portal/components/ui/button';
import { Badge } from '@/portal/components/ui/badge';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import { Textarea } from '@/portal/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/portal/components/ui/dialog';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function StartupProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    createStartupProfile,
    updateStartupProfile,
    getLinkedStartup,
    getStartupMembers,
  } = useAuth();

  const linkedStartup = getLinkedStartup();
  const startupMembers = linkedStartup ? getStartupMembers(linkedStartup.id) : [];
  const redirect = searchParams.get('redirect');
  // Only the startup manager (+ admin/dev) may edit profile details. All
  // other linked members see a read-only view — the edit button is hidden,
  // and the backend PATCH /startups/{id} also refuses their requests.
  const canEdit = useCanEditStartupProfile();

  const [form, setForm] = useState({
    companyName: user.companyAffiliation || '',
    companyWebsite: '',
    description: '',
  });
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (linkedStartup) {
      setForm({
        companyName: linkedStartup.companyName,
        companyWebsite: linkedStartup.companyWebsite,
        description: linkedStartup.description,
      });
    }
  }, [linkedStartup]);

  const handleCreate = (): void => {
    void (async () => {
      if (!form.companyName || !form.companyWebsite || !form.description) {
        toast.error('Please complete all startup profile fields.');
        return;
      }

      const created = await createStartupProfile(form);
      if (!created) {
        toast.error('Could not create startup profile.');
        return;
      }

      toast.success(`${created.companyName} startup profile created.`);
      if (redirect) {
        navigate(redirect);
        return;
      }
      navigate('/startup', { replace: true });
    })();
  };

  const handleUpdate = (): void => {
    if (!linkedStartup) return;
    if (!form.companyName || !form.companyWebsite || !form.description) {
      toast.error('Please complete all startup profile fields.');
      return;
    }

    updateStartupProfile(linkedStartup.id, form);
    toast.success('Startup page updated.');
    setEditOpen(false);
  };

  if (user.tier !== 'startup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-dark via-white to-bg-light pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Startup Profile</CardTitle>
              <CardDescription>
                This page is reserved for startup-tier accounts that need to create or manage a startup profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button asChild>
                <Link to="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-white to-bg-light pt-24 pb-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Button asChild size="sm" variant="outline">
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Startup Workspace</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-dark">
              {linkedStartup ? 'Startup Profile' : 'Create Startup Profile'}
            </h1>
            <p className="mt-2 text-gray-600">
              {linkedStartup
                ? 'Review the startup page tied to your GCXO account.'
                : 'Create the startup page that will be linked to your founder account and event registrations.'}
            </p>
          </div>
          {redirect && (
            <Button asChild variant="outline">
              <Link to={redirect}>Return to Registration Flow</Link>
            </Button>
          )}
        </div>

        {!linkedStartup ? (
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Once created, this startup page will be reusable across future GCXO events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="startup-company">Company Name</Label>
                  <Input
                    id="startup-company"
                    value={form.companyName}
                    onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                    placeholder="StealthGrid AI"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="startup-website">Company Website</Label>
                  <Input
                    id="startup-website"
                    value={form.companyWebsite}
                    onChange={(e) => setForm((prev) => ({ ...prev, companyWebsite: e.target.value }))}
                    placeholder="https://stealthgrid.ai"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startup-description">What does the company do?</Label>
                <Textarea
                  id="startup-description"
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the startup in a way that helps CxOs, VCs, and other founders understand the product and its value."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleCreate}>
                  <Building2 className="h-4 w-4" />
                  Create Startup Page
                </Button>
                <Button asChild variant="outline">
                  <Link to="/dashboard">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="text-2xl">{linkedStartup.companyName}</CardTitle>
                    {linkedStartup.isVerified ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        Pending verification
                      </Badge>
                    )}
                  </div>
                  {canEdit ? (
                    <Button variant="outline" onClick={() => setEditOpen(true)}>
                      Edit Startup Page
                    </Button>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
                      Read-only — manager access required
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Your startup profile page inside the GCXO demo environment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border bg-white/80 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <Globe className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Website</span>
                    </div>
                    <a
                      href={linkedStartup.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline break-all"
                    >
                      {linkedStartup.companyWebsite}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="rounded-xl border bg-white/80 p-4">
                    <div className="mb-2 flex items-center gap-2 text-slate-500">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wide">Domain</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{linkedStartup.companyDomain}</p>
                  </div>
                </div>

                <div className="rounded-xl border bg-white/80 p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Company Overview
                  </p>
                  <p className="text-sm leading-7 text-slate-700">{linkedStartup.description}</p>
                </div>

                <div className="rounded-xl border bg-white/80 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-900">
                      Startup Founders ({startupMembers.length})
                    </p>
                  </div>
                  <div className="space-y-3">
                    {startupMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-500">
                            {member.role} · {member.email}
                          </p>
                        </div>
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                          {member.tier.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profile Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <p>Created {formatDate(linkedStartup.createdAt)}</p>
                  <p>Registered by {user.name}</p>
                  <p>This startup profile can now be reused during GCXO event registrations.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/events">Register for an Event</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/dashboard">Return to Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Startup Page</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-startup-company">Company Name</Label>
              <Input
                id="edit-startup-company"
                value={form.companyName}
                onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-startup-website">Company Website</Label>
              <Input
                id="edit-startup-website"
                value={form.companyWebsite}
                onChange={(e) => setForm((prev) => ({ ...prev, companyWebsite: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-startup-description">Description</Label>
              <Textarea
                id="edit-startup-description"
                rows={6}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Startup Page</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
