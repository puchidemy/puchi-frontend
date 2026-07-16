'use client';

import { signIn as zitadelSignIn, signOut as zitadelSignOut } from '@zitadel/next-auth/react';

export const signOut = () => zitadelSignOut();

export function initSupertokens() {
  // No-op: SessionProvider handles this
}
