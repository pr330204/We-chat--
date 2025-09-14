'use client';
import { useState, useEffect, useMemo } from 'react';
import { AppUser } from '@/lib/types';
import { getAllUsers } from '@/lib/firestore';
import UserCard from './user-card';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export default function UserList({ currentUser }: { currentUser: AppUser }) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const allUsers = await getAllUsers();
      // Filter out the current user from the list
      const otherUsers = allUsers.filter(user => user.uid !== currentUser.uid);
      setUsers(otherUsers);
      setLoading(false);
    };
    fetchUsers();
  }, [currentUser.uid]);

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort users: followed users first, then by name
    return filtered.sort((a, b) => {
      const aIsFollowed = currentUser.following.includes(a.uid);
      const bIsFollowed = currentUser.following.includes(b.uid);
      if (aIsFollowed && !bIsFollowed) return -1;
      if (!aIsFollowed && bIsFollowed) return 1;
      return a.displayName.localeCompare(b.displayName);
    });
  }, [users, searchQuery, currentUser.following]);

  if (loading) {
    return (
       <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Find Connections</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for users..."
              className="pl-10 w-full max-w-sm"
              disabled
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg bg-card space-y-3">
              <div className="flex items-center gap-4">
                 <Skeleton className="h-12 w-12 rounded-full" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                 </div>
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome, {currentUser.displayName}!</h1>
        <p className="text-muted-foreground mb-4">Browse and search for other users on the platform.</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full max-w-sm"
          />
        </div>
      </div>
      {filteredAndSortedUsers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedUsers.map(user => (
            <UserCard
              key={user.uid}
              user={user}
              currentUserId={currentUser.uid}
              isFollowing={currentUser.following.includes(user.uid)}
            />
          ))}
        </div>
      ) : (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold">No users found</h2>
            <p className="text-muted-foreground mt-2">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
}
