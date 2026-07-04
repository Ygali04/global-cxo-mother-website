import type { EventDetail, EventLifecycleStatus } from '@/portal/data/EventsData';

export function resolveEventLifecycle(event: EventDetail): EventLifecycleStatus {
  if (event.lifecycleStatus) {
    return event.lifecycleStatus;
  }

  return event.registrationOpen ? 'current' : 'past';
}

export function lifecycleBadgeClass(status: EventLifecycleStatus): string {
  if (status === 'current') {
    return 'bg-green-100 text-green-700 hover:bg-green-200';
  }

  if (status === 'archived') {
    return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
  }

  return 'bg-slate-100 text-slate-600 hover:bg-slate-200';
}

export function lifecycleBadgeClassDark(status: EventLifecycleStatus): string {
  if (status === 'current') {
    return 'bg-green-600 hover:bg-green-700 text-white';
  }

  if (status === 'archived') {
    return 'bg-amber-600 hover:bg-amber-700 text-white';
  }

  return 'bg-slate-600 hover:bg-slate-500 text-slate-200';
}
