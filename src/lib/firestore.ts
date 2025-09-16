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

      const userProfile: Omit<AppUser, 'createdAt'> = {
        uid,
        displayName,
        email,
        photoURL,
        following: [],
        username,
      };

      transaction.set(userRef, { ...userProfile, createdAt: serverTimestamp() });
      transaction.set(usernameRef, { uid });

      // We can't return the result of serverTimestamp() directly, so we'll create a new object.
      return {
        ...userProfile,
        createdAt: new Date().toISOString(),
      };
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
        const userData = userSnap.data();
        // Convert Firestore Timestamp to a serializable format (ISO string)
        const createdAt = (userData.createdAt as Timestamp)?.toDate().toISOString() || null;
        return {
          ...(userData as Omit<AppUser, 'createdAt'>),
          createdAt,
        };
    } else {
        return null;
    }
}


export async function getAllUsers(): Promise<AppUser[]> {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map((doc, i) => {
     const userData = doc.data();
     const createdAt = (userData.createdAt as Timestamp)?.toDate().toISOString() || null;
    return {
      ...(userData as Omit<AppUser, 'createdAt'>),
      uid: doc.id,
      createdAt,
    };
  });
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

export async function updateUserOnlineStatus(uid: string, isOnline: boolean): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isOnline: isOnline,
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
