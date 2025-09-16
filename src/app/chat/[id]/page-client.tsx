'use client';
import type { AppUser } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatInterface from '@/components/chat-interface';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStatus } from '@/hooks/use-user-status';

export default function ChatPageClient({ user }: { user: AppUser | null }) {
  const userStatus = useUserStatus(user?.uid || '');
  const isOnline = userStatus?.state === 'online';

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Button asChild>
          <Link href="/">Go back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 border-b bg-card">
        <Button variant="ghost" size="icon" className="mr-4" asChild>
          <Link href="/">
            <ArrowLeft />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <Avatar className="h-10 w-10 mr-4">
          <AvatarImage src={user.photoURL} alt={user.username} />
          <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <h2 className="font-semibold text-lg">{user.username}</h2>
          <div className="flex items-center text-sm text-muted-foreground">
             <span className={`h-2 w-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </header>
      <ChatInterface recipient={user} />
    </div>
  );
}
