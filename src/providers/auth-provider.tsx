'use client';
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { onAuthStateChanged, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getOrCreateUser } from '@/lib/firestore';
import type { AppUser, AuthContextType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const signIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the user creation/retrieval
    } catch (error) {
      console.error('Error during sign-in:', error);
      toast({
        title: 'Sign-in failed',
        description: 'Could not sign you in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error during sign-out:', error);
      toast({
        title: 'Sign-out failed',
        description: 'Could not sign you out. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const appUser = await getOrCreateUser(fbUser);
          setUser(appUser);
        } catch (error) {
           console.error("Failed to get or create user profile:", error);
           toast({
             title: 'Profile Error',
             description: 'Could not load your user profile.',
             variant: 'destructive',
           });
           await signOut();
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast, signOut]);

  const value = { user, firebaseUser, loading, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
