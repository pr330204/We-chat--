import type { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export type AppUser = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  following: string[];
  summary: string;
  isOnline: boolean;
  username: string;
  createdAt: string | null;
};

export type AuthContextType = {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isNewUser: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  reloadUser: () => Promise<void>;
};

export type ChatMessage = {
  id: string;
  text: string;
  from: string;
  to: string;
  timestamp: Timestamp;
};
