'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '../components/auth-provider';
import { DreamsProvider } from '@/components/dreams-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DreamsProvider>{children}</DreamsProvider>
    </AuthProvider>
  );
}
