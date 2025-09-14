'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';

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
          <CardDescription>Sign in to continue to Chat App</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button size="lg" className="w-full" onClick={signIn}>
              <Image src="/google.svg" alt="Google logo" width={20} height={20} className="mr-2" />
              Sign in with Google
            </Button>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Enter your username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" variant="secondary">Save & Continue</Button>
          <Button className="w-full">Manual Login</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
