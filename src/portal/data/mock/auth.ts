import type { MockUser } from './types';
import { mockUsers } from './users';

export const MOCK_DEMO_PASSWORD = (process.env.NEXT_PUBLIC_DEMO_PASSWORD as string) || '';

export const mockCurrentUser: MockUser = mockUsers.find(
  (u) => u.tier === 'admin',
)!;

export function getMockUserByEmail(email: string): MockUser | undefined {
  return mockUsers.find((u) => u.email === email);
}

export function getMockUserById(id: string): MockUser | undefined {
  return mockUsers.find((u) => u.id === id);
}
