import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { executeQuery, executeMutation } from '@/app/api/graphql/serverClient';

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      image?: string;
    }
  }
  
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
  }
}

// Check required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error('NEXTAUTH_SECRET is not set');
}

// GraphQL queries and mutations for user management
const GET_USER_BY_EMAIL = `
  query GetUserByEmail($email: String!) {
    real_estate_user(where: { email: { _eq: $email } }, limit: 1) {
      uuid
      firebase_uid
      display_name
      email
      photo_url
      auth_provider
    }
  }
`;

const INSERT_USER = `
  mutation InsertUser($user: real_estate_user_insert_input!) {
    insert_real_estate_user_one(object: $user) {
      uuid
      firebase_uid
      display_name
      email
      photo_url
      auth_provider
    }
  }
`;

export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug mode
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'boolean' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          console.log('Attempting Firebase authentication for:', credentials.email);
          
          // Check if Firebase is properly configured
          if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
            console.error('Firebase API key not configured');
            // Fallback to demo account for testing
            if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
              console.log('Using demo account fallback');
              return {
                id: 'demo-user-id',
                email: credentials.email,
                name: 'Demo User',
                role: 'tenant',
                image: undefined,
              };
            }
            return null;
          }
          
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          const user = userCredential.user;
          console.log('Firebase authentication successful:', user.uid);

          return {
            id: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || 'User',
            role: 'tenant', // Default role, can be fetched from Firestore
            image: user.photoURL || undefined,
          };
        } catch (error) {
          console.error('Firebase auth error:', error);
          return null;
        }
      }
    }),
    // Google OAuth Provider using existing NEXT_PUBLIC_ env vars
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_FIREBASE_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.NEXT_PUBLIC_FIREBASE_GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days (default)
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days (default)
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth account linking
      if (account?.provider === 'google') {
        const email = (user.email || profile?.email || '').toLowerCase();
        if (!email) {
          console.error('Google sign-in: No email provided');
          return false;
        }

        try {
          // 1) Try to find existing user by email
          const existing = await executeQuery(GET_USER_BY_EMAIL, { email }).catch(() => null);
          const existingUser = (existing as { real_estate_user?: Array<{ uuid: string; firebase_uid: string; display_name: string; email: string; photo_url?: string; auth_provider: string }> })?.real_estate_user?.[0];

          if (existingUser) {
            // 2) Reuse existing DB identity by setting a stable token id
            console.log('Google sign-in: Found existing user by email, linking accounts');
            user.id = existingUser.firebase_uid; // map token/session id to existing firebase_uid
            return true;
          }

          // 3) No existing email — BLOCK new user creation via Google OAuth
          console.log('Google sign-in: User does not exist. Google sign-up is disabled.');
          // Return false to prevent sign-in/sign-up for non-existing users
          return false;
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }

      // For credentials provider, continue as normal
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      try {
        if (user) {
          console.log('JWT callback - user data:', user);
          token.role = user.role;
          token.id = user.id;
          
          // Check if remember me is enabled from the credentials
          // We'll store this in the token to use in session callback
          if (session?.rememberMe) {
            token.rememberMe = true;
            // Set JWT expiration to 90 days if remember me is enabled
            token.exp = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);
          }
        }
        
        // Handle session update if remember me preference changes
        if (trigger === 'update' && session?.rememberMe !== undefined) {
          token.rememberMe = session.rememberMe;
          if (session.rememberMe) {
            // Extend JWT expiration to 90 days
            token.exp = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);
          } else {
            // Reset to default 30 days
            token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
          }
        }
        
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (token && session.user) {
          console.log('Session callback - token data:', token);
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          
          // Note: Session duration is controlled by the session.maxAge in the config
          // The remember me preference is stored in the token for future reference
          console.log('Session created with remember me:', token.rememberMe);
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  // Add cookie configuration for better session persistence
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
};