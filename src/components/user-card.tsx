'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AppUser } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { UserPlus, UserMinus, MessageCircle } from 'lucide-react';
import { followUser, unfollowUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type UserCardProps = {
  user: AppUser;
  currentUserId: string;
  isFollowing: boolean;
};

export default function UserCard({ user, currentUserId, isFollowing }: UserCardProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event from firing
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

  const handleCardClick = () => {
    router.push(`/chat/${user.uid}`);
  };

  return (
    <Card 
      className={cn(
        "flex flex-col transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1",
        isPending && "opacity-50 cursor-not-allowed"
      )}
      onClick={handleCardClick}
    >
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
      <CardFooter>
        <Button
          variant={isFollowing ? 'outline' : 'secondary'}
          className="w-full"
          onClick={handleFollowToggle}
          disabled={isPending}
          aria-label={isFollowing ? `Unfollow ${user.displayName}` : `Follow ${user.displayName}`}
        >
          {isFollowing ? <UserMinus /> : <UserPlus />}
          {isFollowing ? 'Unfollow' : 'Follow'}
        </Button>
      </CardFooter>
    </Card>
  );
}
