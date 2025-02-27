import NextAuth, {NextAuthOptions} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import {PrismaAdapter} from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';

import {User} from '@prisma/client';
import prisma from '../../../../lib/prismadb';
import {initUserFirstTime, shouldInitUser} from '../../../../utils/database/init-user';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    session: async ({session, user}) => {
      if (session?.user) {
        // To have .id field in API endpoints
        // https://next-auth.js.org/configuration/callbacks#session-callback
        session.user.id = user.id;

        // Create default records when user signs in first time
        if (await shouldInitUser(user as User)) {
          session.user.isNewUser = true; // To make the redirect in the page.tsx
          await initUserFirstTime(user as User);
        }
      }
      return session;
    },
  },
  theme: {
    colorScheme: 'light',
    logo: '/logo-small.png',
    brandColor: '#6E6DA9',
  },
};

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};
