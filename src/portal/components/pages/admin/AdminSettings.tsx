import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/portal/components/ui/card';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import { Button } from '@/portal/components/ui/button';
import { Switch } from '@/portal/components/ui/switch';
import { Separator } from '@/portal/components/ui/separator';
import { apiFetch } from '@/portal/api/client';
import { patchUserApi } from '@/portal/api/users';
import { useAuth } from '@/portal/hooks/useAuth';
import { usePlatformConfig, useUpdatePlatformConfig } from '@/portal/hooks/useAdminConfig';
import type { PlatformConfig } from '@/portal/api/admin';
import { SettingsFormSkeleton, SkeletonBlock } from '@/portal/components/ui/admin-skeletons';
import {
  useFieldSchemas, useCreateFieldSchema, useDeleteFieldSchema, useReorderFieldSchemas,
} from '@/portal/hooks/useFieldSchemas';

function PreferenceFieldEditor() {
  const { data: fields, isLoading } = useFieldSchemas('preference');
  const createField = useCreateFieldSchema('preference');
  const deleteField = useDeleteFieldSchema('preference');
  const reorderFields = useReorderFieldSchemas('preference');
  const [addLabel, setAddLabel] = useState('');

  const handleAdd = () => {
    if (!addLabel.trim()) return;
    createField.mutate(
      { field_key: addLabel.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 128), field_label: addLabel.trim(), field_type: 'boolean', visible_on: ['onboarding'] },
      { onSuccess: () => { setAddLabel(''); toast.success('Preference added'); }, onError: () => toast.error('Could not add preference.') },
    );
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

  if (isLoading) return <SkeletonBlock className="h-40" />;

  return (
    <div className="space-y-4">
      {(fields ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No preferences configured yet. Add your first one below.</p>
      ) : (
        <div className="space-y-2">
          {(fields ?? []).map((f, i) => (
            <div key={f.field_key} className="flex items-center gap-2 rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={i === 0} onClick={() => handleMove(f.field_key, 'up')}>↑</Button>
                <Button variant="ghost" size="icon" className="h-5 w-5" disabled={i === (fields ?? []).length - 1} onClick={() => handleMove(f.field_key, 'down')}>↓</Button>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{f.field_label}</p>
                <p className="text-xs text-muted-foreground">{f.field_key}</p>
              </div>
              {!f.is_system && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => deleteField.mutate(f.field_key, { onError: () => toast.error('Cannot delete this preference.') })}>✕</Button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="border-t pt-4 flex gap-2">
        <Input placeholder="e.g. AI Cost Optimization" value={addLabel} onChange={(e) => setAddLabel(e.target.value)} className="flex-1" onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }} />
        <Button size="sm" onClick={handleAdd} disabled={!addLabel.trim() || createField.isPending}>+ Add</Button>
      </div>
    </div>
  );
}

export default function AdminSettings(): JSX.Element {
  const { user, refreshCatalog } = useAuth();
  const { data: config, isLoading } = usePlatformConfig();
  const updateConfig = useUpdatePlatformConfig();

  const [cors, setCors] = useState('');
  const [adminName, setAdminName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [showHeroToast, setShowHeroToast] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('gcio_show_hero_toast') !== 'false';
  });

  useEffect(() => {
    if (config) {
      setCors(config.cors_origins || '');
      if (config.show_hero_event_toast !== undefined) {
        setShowHeroToast(config.show_hero_event_toast);
        if (typeof window !== 'undefined') {
          localStorage.setItem('gcio_show_hero_toast', String(config.show_hero_event_toast));
          window.dispatchEvent(new Event('gcio_hero_toast_change'));
        }
      }
    }
  }, [config]);

  const handleToggleHeroToast = (v: boolean) => {
    setShowHeroToast(v);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gcio_show_hero_toast', String(v));
      window.dispatchEvent(new Event('gcio_hero_toast_change'));
    }
    updateConfig.mutate({ show_hero_event_toast: v } as Partial<PlatformConfig>, {
      onSuccess: () => toast.success(v ? 'Hero event toast enabled' : 'Hero event toast disabled'),
      onError: () => toast.error('Failed to update setting.'),
    });
  };

  useEffect(() => {
    setAdminName(user.name);
  }, [user.name]);

  const handleToggle = (key: string, value: boolean) => {
    updateConfig.mutate({ [key]: value }, {
      onSuccess: () => toast.success('Setting updated.'),
      onError: () => toast.error('Failed to update setting.'),
    });
  };

  const handleSaveName = async () => {
    if (!user?.id) return;
    setSavingName(true);
    try {
      await patchUserApi(user.id, { name: adminName });
      toast.success('Name updated');
    } catch {
      toast.error('Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveCors = () => {
    updateConfig.mutate({ cors_origins: cors }, {
      onSuccess: () => toast.success('CORS origins saved.'),
      onError: () => toast.error('Failed to save CORS origins.'),
    });
  };

  const handleResetDemo = async () => {
    if (!confirm('Are you sure? This will permanently delete ALL demo/test data including demo users, events, startups, and meetings. This cannot be undone.')) return;
    setResetBusy(true);
    try {
      const res = await apiFetch<{ message: string; deleted: Record<string, number> }>('/admin/reset-demo-data', { method: 'POST' });
      toast.success(res.message);
      localStorage.removeItem('gcio_mock_database_v1');
      void refreshCatalog();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset demo data';
      toast.error(msg);
    } finally {
      setResetBusy(false);
    }
  };

  if (isLoading) {
    // Shape-matched skeleton for the settings form — replaces the
    // center-screen spinner so the real fields land in place without
    // layout shift. Consistent with the skeleton-first pattern used
    // across the rest of the admin console.
    return <SettingsFormSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Platform configuration and administration. All changes persist to the database.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform</CardTitle>
          <CardDescription>Global platform settings that affect all users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">Public Registration</p>
              <p className="text-sm text-slate-500">Allow new users to sign up via the public signup page.</p>
            </div>
            <Switch
              checked={config?.public_registration_enabled ?? true}
              onCheckedChange={(v) => handleToggle('public_registration_enabled', v)}
              disabled={updateConfig.isPending}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">Demo Mode</p>
              <p className="text-sm text-slate-500">Enable demo persona switching and quick-access login.</p>
            </div>
            <Switch
              checked={config?.demo_mode_enabled ?? false}
              onCheckedChange={(v) => handleToggle('demo_mode_enabled', v)}
              disabled={updateConfig.isPending}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">Maintenance Mode</p>
              <p className="text-sm text-slate-500">Show a maintenance page to non-admin visitors.</p>
            </div>
            <Switch
              checked={config?.maintenance_mode ?? false}
              onCheckedChange={(v) => handleToggle('maintenance_mode', v)}
              disabled={updateConfig.isPending}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">Hero Section Event Toast</p>
              <p className="text-sm text-slate-500">Display the floating upcoming event promo card in the homepage hero section.</p>
            </div>
            <Switch
              checked={showHeroToast}
              onCheckedChange={(v) => handleToggleHeroToast(v)}
              disabled={updateConfig.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API & Integrations</CardTitle>
          <CardDescription>Backend configuration for the GCXO platform API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>CORS Allowed Origins</Label>
            <div className="flex gap-2">
              <Input value={cors} onChange={(e) => setCors(e.target.value)} placeholder="https://globalcxocircle.com" className="flex-1" />
              <Button size="sm" onClick={handleSaveCors} disabled={updateConfig.isPending}>
                {updateConfig.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
            <p className="text-xs text-slate-400">Comma-separated list of allowed origins for API requests.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Account</CardTitle>
          <CardDescription>Your admin profile: {user.name} ({user.email})</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Name</Label>
              <div className="flex gap-2">
                <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                <Button size="sm" onClick={handleSaveName} disabled={savingName}>
                  {savingName ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input defaultValue={user.email} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Onboarding Preferences</CardTitle>
          <CardDescription>
            Manage the AI interest checkboxes shown during onboarding. Add, remove, or reorder options.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferenceFieldEditor />
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-red-200 px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">Reset Demo Data</p>
              <p className="text-sm text-slate-500">Clear all demo/test data and reset to clean state.</p>
            </div>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              disabled={resetBusy}
              onClick={handleResetDemo}
            >
              {resetBusy ? 'Resetting...' : 'Reset Demo Data'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
