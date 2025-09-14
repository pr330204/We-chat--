'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createUserProfile } from '@/lib/firestore';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ProfileForm() {
  const { firebaseUser, reloadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateProfile = async () => {
    if (!firebaseUser) {
      toast({
        title: 'Error',
        description: 'You are not logged in.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createUserProfile(firebaseUser);
      await reloadUser();
      toast({
        title: 'Success!',
        description: 'Your profile has been created.',
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: 'Could not create your profile. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Welcome! Let's get your profile set up. We've pre-filled some information from your Google account.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <p className="font-medium">Display Name:</p>
                <p className="text-muted-foreground">{firebaseUser?.displayName}</p>
            </div>
             <div className="space-y-2 mt-4">
                <p className="font-medium">Email:</p>
                <p className="text-muted-foreground">{firebaseUser?.email}</p>
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateProfile} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Profile & Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
