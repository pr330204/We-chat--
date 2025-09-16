'use client';
'use client';
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { onAuthStateChanged, signInWithPopup, User as FirebaseUser, signInWithCustomToken } from 'firebase/auth';
import { auth, googleProvider, rtdb } from '@/lib/firebase';
import { getUser, checkUserExists } from '@/lib/firestore';
import type { AppUser, AuthContextType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';


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
          description: 'You closed the sign-in popup. Please try again.',
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
      // The onDisconnect handler will automatically set the user to offline.
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

        // Realtime Database presence management
        const userStatusRef = ref(rtdb, `/status/${fbUser.uid}`);
        const connectedRef = ref(rtdb, '.info/connected');

        onValue(connectedRef, (snap) => {
          if (snap.val() === true) {
            set(userStatusRef, { state: 'online', last_changed: serverTimestamp() });
            onDisconnect(userStatusRef).set({ state: 'offline', last_changed: serverTimestamp() });
          }
        });

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

    return () => {
      unsubscribe();
    }
  }, [toast, signOut]);

  const value = { user, firebaseUser, loading, signIn, signOut, isNewUser, reloadUser, signInWithToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}￼Enter
