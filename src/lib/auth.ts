import { NextAuth } from '@zitadel/next-auth';
import Zitadel from '@auth/core/providers/zitadel';

declare module '@zitadel/next-auth' {
  interface Session {
    accessToken?: string;
    idToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Zitadel({
      clientId: process.env.ZITADEL_CLIENT_ID!,
      clientSecret: '',
      issuer: process.env.ZITADEL_ISSUER || 'https://auth.puchi.io.vn',
    }),
  ],
  secret: process.env.AUTH_SECRET || process.env.SESSION_SECRET,
  trustHost: true,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;
      return session;
    },
  },
});
