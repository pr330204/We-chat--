import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db } from './firebase';
import type { AppUser } from './types';
import { generateProfileSummary } from '@/ai/flows/generate-profile-summary';


export async function checkUserExists(uid: string): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
}

export async function createUserProfile(firebaseUser: FirebaseUser): Promise<AppUser> {
  const { displayName, email, photoURL, uid } = firebaseUser;
  if (!displayName || !email || !photoURL) {
    throw new Error('User data is incomplete from auth provider.');
  }
  
  const [firstName, ...lastNameParts] = displayName.split(' ');
  const lastInitial = lastNameParts.length > 0 ? lastNameParts[lastNameParts.length - 1].charAt(0) : (firstName.length > 1 ? firstName.charAt(1) : '');

  const { summary } = await generateProfileSummary({
    firstName: firstName || '',
    lastInitial: lastInitial.toUpperCase(),
  });

  const newUser: AppUser = {
    uid,
    displayName,
    email,
    photoURL,
    following: [],
    summary: summary || `A fascinating individual.`,
    isOnline: true,
  };

  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { ...newUser, createdAt: serverTimestamp() });
  return newUser;
}


export async function getUser(uid: string): Promise<AppUser | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data() as AppUser;
        // Simulate online status for demo
        const allUsers = await getDocs(collection(db, 'users'));
        const userIndex = allUsers.docs.findIndex(doc => doc.id === uid);
        userData.isOnline = userIndex % 2 === 0;
        return userData;
    } else {
        return null;
    }
}


export async function getAllUsers(): Promise<AppUser[]> {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map((doc, i) => ({
    ...(doc.data() as AppUser),
    uid: doc.id,
    isOnline: i % 2 === 0, // Simulate online status for demo
  }));
  return userList;
}

export async function followUserInFirestore(currentUserId: string, targetUserId: string): Promise<void> {
  const userRef = doc(db, 'users', currentUserId);
  await updateDoc(userRef, {
    following: arrayUnion(targetUserId),
  });
}

export async function unfollowUserInFirestore(currentUserId: string, targetUserId: string): Promise<void> {
  const userRef = doc(db, 'users', currentUserId);
  await updateDoc(userRef, {
    following: arrayRemove(targetUserId),
  });
}
