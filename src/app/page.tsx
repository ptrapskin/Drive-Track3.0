
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, BarChart, Award, FileDown } from 'lucide-react';
import DriveTrackLogo from '@/components/drive-track-logo';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm">
        <Link href="/" className="flex items-center justify-center gap-2">
          <DriveTrackLogo />
          <span className="text-xl font-bold text-primary">Drive-Track</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Login
          </Link>
          <Button asChild>
             <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    The Simple Way to Log Your Driving Hours
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Drive-Track makes it simple for student drivers to log practice hours, learn essential skills, and generate reports for the DMV.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Start Tracking Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="/images/sample.png"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Get Your License</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our app is designed to make tracking and reporting hours easy while also providing a curriculum of skills for new drivers.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-2 text-center">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <BarChart className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Automatic & Manual Logging</h3>
                <p className="text-sm text-muted-foreground">
                    Use our live tracker to automatically log drives, or manually enter sessions later. We track hours, miles, road types, and weather.
                </p>
              </div>
               <div className="grid gap-2 text-center">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Skills Learning</h3>
                <p className="text-sm text-muted-foreground">
                    Work through a comprehensive list of 30 driving skills. Earn badges as you complete them and build your confidence.
                </p>
              </div>
              <div className="grid gap-2 text-center">
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileDown className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h3 className="text-xl font-bold">Printable PDF Reports</h3>
                <p className="text-sm text-muted-foreground">
                    Generate a detailed driving log with one click. Perfect for submitting to the DMV.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">How It Works</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Getting Started is as Easy as 1-2-3</h2>
              <p className="max-w-[600px] text-muted-foreground">
                Our intuitive interface makes it simple to start logging your hours and tracking your progress right away.
              </p>
              <ul className="grid gap-4">
                <li className="flex items-start">
                  <CheckCircle className="mr-4 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold">Create Your Account</h3>
                    <p className="text-sm text-muted-foreground">Sign up in seconds with your email or Google account.</p>
                  </div>
                </li>
                 <li className="flex items-start">
                  <CheckCircle className="mr-4 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold">Track Your Drives</h3>
                    <p className="text-sm text-muted-foreground">Use the live tracker or manually enter sessions from any device.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-4 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold">Monitor Your Progress</h3>
                    <p className="text-sm text-muted-foreground">Watch your hours add up, complete skills, and print your log when you're ready.</p>
                  </div>
                </li>
              </ul>
            </div>
             <Image
                src="https://placehold.co/600x550.png"
                width="600"
                height="550"
                alt="Product"
                data-ai-hint="app dashboard mobile view"
                className="mx-auto aspect-[1/1] overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Hit the Road?</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed mt-4">
              Take the hassle out of logging hours. Sign up now and start your journey towards getting your license.
            </p>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link href="/signup">
                  Sign Up Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Drive-Track. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
