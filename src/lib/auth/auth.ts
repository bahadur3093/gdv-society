import { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/utils/password';
import type { AuthUser } from '@/types';

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check if user has a password set
          if (!user.password) {
            throw new Error('Password not set. Please use password reset.');
          }

          // Verify password
          const isValidPassword = await verifyPassword(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            throw new Error('Invalid email or password');
          }

          // Return user object (without password) including emailVerified status
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            plotNumber: user.plotNumber,
            emailVerified: user.emailVerified,
          } as AuthUser;
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Add user info to token on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as AuthUser).role;
        token.plotNumber = (user as AuthUser).plotNumber;
        token.emailVerified = (user as AuthUser).emailVerified;
      }

      // On explicit session update (e.g. after "Refresh Status" is clicked),
      // re-fetch emailVerified from the DB so stale JWT data is replaced.
      if (trigger === 'update' && token.id) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { emailVerified: true },
          });
          if (freshUser) {
            token.emailVerified = freshUser.emailVerified;
          }
        } catch (err) {
          console.error('[auth] jwt update trigger – DB fetch failed:', err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add user info from token to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as 'RESIDENT' | 'ADMIN';
        session.user.plotNumber = token.plotNumber as string | undefined;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
