import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/portal/contexts/AuthContext';
import type { MockUser } from '@/portal/data/mock/types';

export interface UseAuthReturn extends AuthContextType {
  user: MockUser;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const user = context.currentUser ?? ({
    id: '',
    name: 'Guest',
    email: '',
    phone: '',
    linkedin: '',
    companyAffiliation: '',
    role: '',
    aboutMe: '',
    tier: 'startup' as const,
    createdAt: '',
    updatedAt: '',
  } satisfies MockUser);

  return { ...context, user };
}

export default useAuth;
