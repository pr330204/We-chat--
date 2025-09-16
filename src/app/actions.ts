
'use server';

import { revalidatePath } from 'next/cache';
import { followUserInFirestore, unfollowUserInFirestore } from '@/lib/firestore';

export async function followUser(currentUserId: string, targetUserId: string) {
  try {
    await followUserInFirestore(currentUserId, targetUserId);
    // revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error: 'Failed to follow user.' };
  }
}

export async function unfollowUser(currentUserId: string, targetUserId: string) {
  try {
    await unfollowUserInFirestore(currentUserId, targetUserId);
    // revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error: 'Failed to unfollow user.' };
  }
}
