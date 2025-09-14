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
import { getUser, checkUserExists } from '@/lib/firestore';
import type { AppUser, AuthContextType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();

  const reloadUser = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const appUser = await getUser(auth.currentUser.uid);
        setUser(appUser);
        setIsNewUser(false);
      } catch (error) {
        console.error("Failed to reload user profile:", error);
        toast({
          title: 'Profile Error',
          description: 'Could not load your user profile.',
          variant: 'destructive',
        });
      }
    }
  }, [toast]);

  const signIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
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
      setIsNewUser(false);
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
          const userExists = await checkUserExists(fbUser.uid);
          if (userExists) {
            const appUser = await getUser(fbUser.uid);
            setUser(appUser);
            setIsNewUser(false);
          } else {
            setUser(null);
            setIsNewUser(true);
          }
        } catch (error) {
           console.error("Failed to check user profile:", error);
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
        setIsNewUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast, signOut]);

  const value = { user, firebaseUser, loading, signIn, signOut, isNewUser, reloadUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
