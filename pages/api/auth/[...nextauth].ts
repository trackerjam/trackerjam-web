import NextAuth, {NextAuthOptions} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import {PrismaAdapter} from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';

import prisma from '../../../lib/prismadb';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session: async ({session, user}) => {
      if (session?.user) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - todo investigate why
        session.user.id = user.id;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
