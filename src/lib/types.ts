import type { User as FirebaseUser } from 'firebase/auth';

export type AppUser = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  following: string[];
  summary: string;
  isOnline: boolean;
};

export type AuthContextType = {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};
