'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { createUserProfile } from '@/lib/firestore';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from './ui/input';

const ProfileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }).max(20, {
    message: "Username must not be longer than 20 characters.",
  }).regex(/^[a-zA-Z0-9_]+$/, {
    message: "Username can only contain letters, numbers, and underscores.",
  }),
});

export default function ProfileForm() {
  const { firebaseUser, reloadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      username: firebaseUser?.displayName?.split(' ')[0].toLowerCase() || '',
    },
  });

  async function onSubmit(data: z.infer<typeof ProfileFormSchema>) {
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
      await createUserProfile(firebaseUser, data.username);
      await reloadUser();
      toast({
        title: 'Success!',
        description: 'Your profile has been created.',
      });
    } catch (error: any) {
      console.error('Error creating profile:', error);
      if (error.message?.includes('is already taken')) {
        form.setError('username', {
          type: 'manual',
          message: error.message,
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Could not create your profile. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Choose a unique username to get started.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <p className="font-medium">Email:</p>
                      <p className="text-muted-foreground">{firebaseUser?.email}</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. john_doe" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be your unique identifier on the platform.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Profile & Continue
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
