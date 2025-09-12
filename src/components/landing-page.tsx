'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function LandingPage() {
  const { signIn } = useAuth();
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div
        className="absolute inset-0 -z-10 h-full w-full bg-background 
        [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,hsl(var(--primary))_100%)]
        dark:[background:radial-gradient(125%_125%_at_50%_10%,hsl(var(--background))_40%,hsl(var(--primary))_100%)]"
      ></div>
      
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
        Welcome to <span className="text-primary">Nexus Connect</span>
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
        Discover and connect with a vibrant community. Every user has a unique AI-generated profile summary.
      </p>
      <div className="mt-8">
        <Button size="lg" onClick={signIn}>
          <Image src="/google.svg" alt="Google logo" width={20} height={20} className="mr-2" />
          Sign in with Google to Get Started
        </Button>
      </div>
      <div className="mt-16 relative">
        <Image
          src="https://picsum.photos/seed/nexus/1200/600"
          alt="Community Showcase"
          width={1200}
          height={600}
          data-ai-hint="community people"
          className="rounded-xl shadow-2xl mx-auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      </div>
    </div>
  );
}
