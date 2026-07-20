/**
 * AdminUserUnifiedView — aggregated profile view across linked accounts (Spec 03).
 *
 * Route: /admin/users/:userId/unified
 * Shows combined sessions, programs, events, and activity for a user
 * and all their transitively linked profiles.
 */

import { useParams, Link } from 'react-router-dom';
import { Card } from '@/portal/components/ui/card';
import { Badge } from '@/portal/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/portal/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/portal/components/ui/avatar';
import { Button } from '@/portal/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUnifiedProfile } from '@/portal/hooks/useProfileLinks';

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function RelativeTime({ iso }: { iso: string | null }) {
  if (!iso) return <span className="text-muted-foreground">—</span>;
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return <span>{mins}m ago</span>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <span>{hrs}h ago</span>;
  return <span>{d.toLocaleDateString()}</span>;
}

export default function AdminUserUnifiedView() {
  const { userId } = useParams<{ userId: string }>();
  const { data, isLoading, isError } = useUnifiedProfile(userId ?? null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return <div className="py-10 text-center text-muted-foreground">Failed to load unified profile.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/users">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Members</Button>
        </Link>
        <h1 className="text-xl font-semibold">Unified Profile</h1>
        <Badge variant="outline">{data.user_ids.length} linked accounts</Badge>
      </div>

      {/* Linked accounts chips */}
      <div className="flex flex-wrap gap-3">
        {data.users.map((u) => (
          <Card key={u.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials(u.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{u.name}</div>
              <div className="text-xs text-muted-foreground">{u.email} · {u.tier}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions ({data.sessions.length})</TabsTrigger>
          <TabsTrigger value="programs">Programs ({data.program_enrollments.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({data.event_registrations.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity ({data.audit_log.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          {data.sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No sessions found across linked profiles.</p>
          ) : (
            <div className="space-y-2">
              {data.sessions.map((s) => (
                <Card key={s.id} className="px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Session {s.id.slice(0, 8)}</span>
                    <Badge variant="outline">{s.session_status ?? 'unknown'}</Badge>
                    <RelativeTime iso={s.scheduled_for} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="programs" className="mt-4">
          {data.program_enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No program enrollments.</p>
          ) : (
            <div className="space-y-2">
              {data.program_enrollments.map((e) => (
                <Card key={e.id} className="px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Program {e.program_id.slice(0, 8)} — {e.role}</span>
                    <Badge variant="outline">{e.status}</Badge>
                    <RelativeTime iso={e.created_at} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="mt-4">
          {data.event_registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No event registrations.</p>
          ) : (
            <div className="space-y-2">
              {data.event_registrations.map((r) => (
                <Card key={r.id} className="px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{r.email}</span>
                    <RelativeTime iso={r.registered_at} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          {data.audit_log.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No activity.</p>
          ) : (
            <div className="space-y-1">
              {data.audit_log.map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-sm py-1.5 border-b last:border-0">
                  <Badge variant="secondary" className="text-[10px]">{a.target_type}</Badge>
                  <span className="flex-1">{a.action}</span>
                  <RelativeTime iso={a.created_at} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
