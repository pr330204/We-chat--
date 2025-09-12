"use client";

import { useAuth } from "@/hooks/use-auth";
import LandingPage from "@/components/landing-page";
import UserList from "@/components/user-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg bg-card">
              <div className="flex items-center gap-4">
                 <Skeleton className="h-12 w-12 rounded-full" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                 </div>
              </div>
              <Skeleton className="h-3 w-full mt-4" />
              <Skeleton className="h-3 w-5/6 mt-2" />
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return user ? <UserList currentUser={user} /> : <LandingPage />;
}
