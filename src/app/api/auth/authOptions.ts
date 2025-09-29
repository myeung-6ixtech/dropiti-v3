import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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