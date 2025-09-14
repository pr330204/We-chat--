'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogIn } from 'lucide-react';

export default function LandingPage() {
  const { signIn } = useAuth();
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-16">
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-background 
        [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,hsl(var(--primary))_100%)]
        dark:[background:radial-gradient(125%_125%_at_50%_10%,hsl(var(--background))_40%,hsl(var(--primary))_100%)]"
      ></div>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Welcome!</CardTitle>
          <CardDescription>Sign in to continue to Nexus Connect</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" className="w-full" onClick={signIn}>
            <Image src="/google.svg" alt="Google logo" width={20} height={20} className="mr-2" />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
