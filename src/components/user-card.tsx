'use client';
import { useTransition } from 'react';
import Link from 'next/link';
import { AppUser } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { UserPlus, UserMinus, MessageCircle } from 'lucide-react';
import { followUser, unfollowUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

type UserCardProps = {
  user: AppUser;
  currentUserId: string;
  isFollowing: boolean;
};

export default function UserCard({ user, currentUserId, isFollowing }: UserCardProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFollow = () => {
    startTransition(async () => {
      const result = await followUser(currentUserId, user.uid);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  const handleUnfollow = () => {
    startTransition(async () => {
      const result = await unfollowUser(currentUserId, user.uid);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card className={cn("flex flex-col transition-all duration-300", isPending && "opacity-50")}>
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.photoURL} alt={user.displayName} />
          <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-lg">{user.displayName}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
             <span className={`h-2 w-2 rounded-full mr-2 ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {user.isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground italic">"{user.summary}"</p>
      </CardContent>
      <CardFooter className="flex flex-col md:flex-row gap-2">
        {isFollowing ? (
          <Button variant="outline" className="w-full" onClick={handleUnfollow} disabled={isPending}>
            <UserMinus /> Unfollow
          </Button>
        ) : (
          <Button className="w-full" variant="secondary" onClick={handleFollow} disabled={isPending}>
            <UserPlus /> Follow
          </Button>
        )}
        <Button asChild variant="ghost" className="w-full">
            <Link href={`/chat/${user.uid}`}>
                <MessageCircle /> Chat
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
