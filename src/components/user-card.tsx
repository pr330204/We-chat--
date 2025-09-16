'use client';
import { useTransition } from 'react';
import { AppUser } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { followUser, unfollowUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useUserStatus } from '@/hooks/use-user-status';

type UserCardProps = {
  user: AppUser;
  currentUserId: string;
  isFollowing: boolean;
};

export default function UserCard({ user, currentUserId, isFollowing }: UserCardProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const userStatus = useUserStatus(user.uid);
  const isOnline = userStatus?.state === 'online';

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent Link from navigating
    e.preventDefault();
    startTransition(async () => {
      const action = isFollowing ? unfollowUser : followUser;
      const result = await action(currentUserId, user.uid);
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
    <Card 
      className={cn(
        "flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        isPending && "opacity-50"
      )}
    >
      <Link href={`/chat/${user.uid}`} className="flex flex-col flex-grow h-full">
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.photoURL} alt={user.username} />
            <AvatarFallback>{(user.username || 'U').charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{user.username}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
               <span className={`h-2 w-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
        </CardContent>
      </Link>
      <CardFooter>
        <Button
          variant={isFollowing ? 'outline' : 'secondary'}
          className="w-full"
          onClick={handleFollowToggle}
          disabled={isPending}
          aria-label={isFollowing ? `Unfollow ${user.username}` : `Follow ${user.username}`}
        >
          {isFollowing ? <UserMinus /> : <UserPlus />}
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      </CardFooter>
    </Card>
  );
}
