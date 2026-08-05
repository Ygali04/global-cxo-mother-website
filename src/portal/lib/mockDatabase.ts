import { eventsData } from '@/portal/data/EventsData';
import {
  mockEventVisibility,
  mockRegistrations,
  mockStartups,
  mockUserStartupLinks,
  mockUsers,
  type MockDatabaseSnapshot,
} from '@/portal/data/mock';

const STORAGE_KEY = 'gcio_mock_database_v1';

function getSeedSnapshot(): MockDatabaseSnapshot {
  return {
    version: 1,
    currentUserId: null,
    events: eventsData,
    users: mockUsers,
    startups: mockStartups,
    userStartupLinks: mockUserStartupLinks,
    registrations: mockRegistrations,
    eventVisibility: mockEventVisibility,
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function loadMockDatabaseSnapshot(): MockDatabaseSnapshot {
  const fallback = getSeedSnapshot();
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<MockDatabaseSnapshot>;
    return {
      ...fallback,
      ...parsed,
      currentUserId: null,
      events: (parsed.events ?? fallback.events).filter((e) => e.slug !== 'gcio-demo-salon-2026'),
      users: parsed.users ?? fallback.users,
      startups: parsed.startups ?? fallback.startups,
      userStartupLinks: parsed.userStartupLinks ?? fallback.userStartupLinks,
      registrations: parsed.registrations ?? fallback.registrations,
      eventVisibility: parsed.eventVisibility ?? fallback.eventVisibility,
      version: 1,
    };
  } catch {
    return fallback;
  }
}

export async function persistMockDatabaseSnapshot(snapshot: MockDatabaseSnapshot): Promise<void> {
  if (!isBrowser()) {
    return;
  }

  await Promise.resolve();
  const { currentUserId: _sessionOmitted, ...rest } = snapshot;
  const persistable: MockDatabaseSnapshot = { ...rest, currentUserId: null };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch (err) {
    console.error('Failed to persist mock database snapshot to localStorage:', err);
    throw new Error(
      'Unable to save to browser storage (it may be full or disabled). Please use image URLs instead of uploading large files directly.'
    );
  }
}

export async function resetMockDatabaseSnapshot(): Promise<void> {
  if (!isBrowser()) {
    return;
  }

  await Promise.resolve();
  localStorage.removeItem(STORAGE_KEY);
}
