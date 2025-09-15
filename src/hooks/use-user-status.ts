'use client';
import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import type { UserStatus } from '@/lib/types';

export function useUserStatus(userId: string) {
  const [status, setStatus] = useState<UserStatus | null>(null);

  useEffect(() => {
    if (!userId) {
        setStatus(null);
        return;
    };

    const userStatusRef = ref(rtdb, `/status/${userId}`);
    const unsubscribe = onValue(userStatusRef, (snapshot) => {
      const statusData = snapshot.val();
      setStatus(statusData);
    });

    return () => unsubscribe();
  }, [userId]);

  return status;
}
