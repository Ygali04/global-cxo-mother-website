import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  Award,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/portal/components/ui/card';
import { Badge } from '@/portal/components/ui/badge';
import { apiFetch } from '@/portal/api/client';
import { useAuth } from '@/portal/hooks/useAuth';
import { cn } from '@/portal/lib/utils';

interface AlertItem {
  id: string;
  type: 'membership' | 'intent' | 'feedback';
  title: string;
  subtitle: string;
  time: string;
  link: string;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const typeConfig = {
  membership: { icon: UserPlus, color: 'text-blue-600 bg-blue-50', badge: 'bg-blue-100 text-blue-700', label: 'GCXO Request' },
  intent: { icon: Award, color: 'text-purple-600 bg-purple-50', badge: 'bg-purple-100 text-purple-700', label: 'Program Request' },
  feedback: { icon: MessageSquare, color: 'text-amber-600 bg-amber-50', badge: 'bg-amber-100 text-amber-700', label: 'Feedback' },
};

export default function AdminAlerts() {
  const { useApiAuth } = useAuth();

  const { data: membershipRequests = [] } = useQuery({
    queryKey: ['admin', 'alerts', 'membership-requests'],
    queryFn: () => apiFetch<any[]>('/admin/membership-requests?status_filter=pending'),
    staleTime: 30_000,
    enabled: useApiAuth,
  });

  const { data: intentRequests = [] } = useQuery({
    queryKey: ['admin', 'alerts', 'intent-requests'],
    queryFn: () => apiFetch<any[]>('/admin/intent-requests?status_filter=pending'),
    staleTime: 30_000,
    enabled: useApiAuth,
  });

  const { data: feedbackItems = [] } = useQuery({
    queryKey: ['admin', 'alerts', 'feedback'],
    queryFn: () => apiFetch<any[]>('/admin/feedback?status_filter=new'),
    staleTime: 30_000,
    enabled: useApiAuth,
  });

  const alerts = useMemo<AlertItem[]>(() => {
    const items: AlertItem[] = [];

    for (const r of membershipRequests) {
      items.push({
        id: `m-${r.id}`,
        type: 'membership',
        title: `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() || r.email,
        subtitle: r.company ?? 'No company',
        time: r.created_at,
        link: '/admin/newcomers',
      });
    }

    for (const r of intentRequests) {
      items.push({
        id: `i-${r.id}`,
        type: 'intent',
        title: r.full_name ?? r.email ?? 'Unknown',
        subtitle: r.program_name ?? 'Program interest',
        time: r.created_at,
        link: '/admin/newcomers',
      });
    }

    for (const f of feedbackItems) {
      items.push({
        id: `f-${f.id}`,
        type: 'feedback',
        title: f.category ?? 'General',
        subtitle: f.message?.slice(0, 80) ?? '',
        time: f.created_at,
        link: '/admin/settings',
      });
    }

    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return items;
  }, [membershipRequests, intentRequests, feedbackItems]);

  const counts = {
    membership: membershipRequests.length,
    intent: intentRequests.length,
    feedback: feedbackItems.length,
    total: membershipRequests.length + intentRequests.length + feedbackItems.length,
  };

  const summaryCards = [
    { label: 'GCXO Requests', count: counts.membership, icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/newcomers' },
    { label: 'Program Requests', count: counts.intent, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/newcomers' },
    { label: 'New Feedback', count: counts.feedback, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/settings' },
    { label: 'Total', count: counts.total, icon: Bell, color: 'text-red-600', bg: 'bg-red-50', link: '' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Alerts</h1>
        <p className="text-sm text-gray-500 mt-1">Items requiring your attention</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className={cn('rounded-lg p-2', card.bg)}>
                  <Icon className={cn('h-5 w-5', card.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.count}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          );
          return card.link ? (
            <Link key={card.label} to={card.link}>{inner}</Link>
          ) : (
            <div key={card.label}>{inner}</div>
          );
        })}
      </div>

      {/* Alert list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Items</CardTitle>
          <CardDescription>Sorted by most recent</CardDescription>
        </CardHeader>
        <CardContent>
          {counts.total === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <CheckCircle2 className="h-12 w-12 mb-3 text-green-400" />
              <p className="text-lg font-medium text-gray-600">All clear</p>
              <p className="text-sm">No pending items right now</p>
            </div>
          ) : (
            <div className="divide-y">
              {alerts.map((alert) => {
                const cfg = typeConfig[alert.type];
                const Icon = cfg.icon;
                return (
                  <Link
                    key={alert.id}
                    to={alert.link}
                    className="flex items-center gap-4 py-3 px-2 rounded-md hover:bg-gray-50 transition-colors -mx-2"
                  >
                    <div className={cn('rounded-lg p-2 shrink-0', cfg.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 truncate">{alert.title}</span>
                        <Badge variant="secondary" className={cn('text-[10px] px-1.5 shrink-0', cfg.badge)}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{alert.subtitle}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{relativeTime(alert.time)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
