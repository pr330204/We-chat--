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
  runTransaction,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { db } from './firebase';
import type { AppUser, ChatMessage } from './types';
import { generateProfileSummary } from '@/ai/flows/generate-profile-summary';


export async function checkUserExists(uid: string): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists();
}

export async function createUserProfile(firebaseUser: FirebaseUser, username: string): Promise<AppUser> {
  const { displayName, email, photoURL, uid } = firebaseUser;
  if (!displayName || !email || !photoURL) {
    throw new Error('User data is incomplete from auth provider.');
  }

  const userRef = doc(db, 'users', uid);
  const usernameRef = doc(db, 'usernameMap', username.toLowerCase());

  try {
    const newUser = await runTransaction(db, async (transaction) => {
      const usernameDoc = await transaction.get(usernameRef);
      if (usernameDoc.exists()) {
        throw new Error(`Username "${username}" is already taken.`);
      }

      const [firstName, ...lastNameParts] = displayName.split(' ');
      const lastInitial = lastNameParts.length > 0 ? lastNameParts[lastNameParts.length - 1].charAt(0) : (firstName.length > 1 ? firstName.charAt(1) : '');

      const { summary } = await generateProfileSummary({
        firstName: firstName || '',
        lastInitial: lastInitial.toUpperCase(),
      });

      const userProfile: AppUser = {
        uid,
        displayName,
        email,
        photoURL,
        following: [],
        summary: summary || `A fascinating individual.`,
        isOnline: true,
        username,
      };

      transaction.set(userRef, { ...userProfile, createdAt: serverTimestamp() });
      transaction.set(usernameRef, { uid });

      return userProfile;
    });
    return newUser;
  } catch (e: any) {
    console.error("Transaction failed: ", e);
    // Re-throw the specific error message from the transaction
    throw new Error(e.message || "Failed to create user profile.");
  }
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

// CHAT FUNCTIONS

function getChatId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('-');
}

export async function sendMessage(fromId: string, toId: string, text: string) {
  const chatId = getChatId(fromId, toId);
  const messagesCol = collection(db, 'chats', chatId, 'messages');
  
  await addDoc(messagesCol, {
    from: fromId,
    to: toId,
    text,
    timestamp: serverTimestamp(),
  });
}

export function streamMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
  const messagesCol = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp,
      } as ChatMessage;
    });
    callback(messages);
  });

  return unsubscribe;
}
