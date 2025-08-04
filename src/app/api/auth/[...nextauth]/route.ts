import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import connectMongoDB from '@/lib/mongodb';
import { User } from '@/app/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectMongoDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        if (!user.isEmailVerified) {
          throw new Error('Please verify your email before signing in');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // If OAuth login
        if (account?.provider === 'google') {
          await connectMongoDB();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create a new user if not found
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              password: null, // No password for Google users
              role: 'User',
              isEmailVerified: true, // Auto-verify Google users
            });
            token.id = newUser._id.toString();
            token.role = newUser.role;
          } else {
            token.id = existingUser._id.toString();
            token.role = existingUser.role;
          }
        } else {
          // Credentials login
          token.id = user.id;
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'User' | 'Admin';
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };