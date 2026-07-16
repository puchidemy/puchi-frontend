'use client';

import { SessionProvider } from '@zitadel/next-auth/react';

export function SupertokensProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
