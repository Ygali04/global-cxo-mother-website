import React from 'react';
import { MockUser } from '@/portal/data/mock/types';
import { useAuth } from '@/portal/hooks/useAuth';
import { Button } from '@/portal/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/portal/components/ui/select';
import { Badge } from '@/portal/components/ui/badge';
import { USE_API_AUTH } from '@/portal/api/config';

function tierLabel(user: MockUser): string {
  return user.tier.toUpperCase();
}

export function DevToolbar(): React.ReactElement | null {
  const { currentUser, switchUser, logout, isAuthenticated, users } = useAuth();

  if (process.env.NODE_ENV !== 'development') return null;
  if (USE_API_AUTH) return null;

  return (
    <div className="fixed bottom-20 right-4 z-9999 flex flex-wrap items-center gap-3 rounded-lg bg-gray-900/90 px-4 py-2 text-xs text-white shadow-lg backdrop-blur">
      {/* Sits above the FeedbackWidget's bottom-6-right-6 button (and clear of
          Next.js's own bottom-left dev indicator) so neither overlaps. */}
      {isAuthenticated && currentUser ? (
        <>
          <span className="font-medium">{currentUser.name}</span>
          <Badge variant="secondary" className="text-[10px]">
            {tierLabel(currentUser)}
          </Badge>
        </>
      ) : (
        <span className="text-gray-400">Not logged in</span>
      )}

      <Select
        value={currentUser?.id ?? ''}
        onValueChange={(id: string) => void switchUser(id)}
      >
        <SelectTrigger className="h-7 w-40 border-gray-700 bg-gray-800 text-xs text-white">
          <SelectValue placeholder="Switch user" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name} ({user.tier})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isAuthenticated && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-gray-300 hover:text-white"
          onClick={() => void logout()}
        >
          Log out
        </Button>
      )}
    </div>
  );
}
