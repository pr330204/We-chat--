'use client';
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { onAuthStateChanged, signInWithPopup, User as FirebaseUser, signInWithCustomToken } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getUser, checkUserExists, updateUserOnlineStatus } from '@/lib/firestore';
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
    } catch (error: any) {
      console.error('Error during sign-in:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast({
          title: 'Sign-in Cancelled',
          description: 'आपने साइन-इन पॉपअप बंद कर दिया। कृपया फिर से प्रयास करें।',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sign-in failed',
          description: 'Could not sign you in with Google. Please try again.',
          variant: 'destructive',
        });
      }
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      if (user) {
        await updateUserOnlineStatus(user.uid, false);
      }
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
  }, [toast, user]);

  const signInWithToken = useCallback(async (token: string) => {
    try {
      await signInWithCustomToken(auth, token);
    } catch (error) {
      console.error('Error signing in with custom token:', error);
      toast({
        title: 'Authentication Failed',
        description: 'Could not sign you in with the provided token.',
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
            await updateUserOnlineStatus(fbUser.uid, true);
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
        if(user) {
           updateUserOnlineStatus(user.uid, false);
        }
        setUser(null);
        setFirebaseUser(null);
        setIsNewUser(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast, signOut, user]);

  const value = { user, firebaseUser, loading, signIn, signOut, isNewUser, reloadUser, signInWithToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
