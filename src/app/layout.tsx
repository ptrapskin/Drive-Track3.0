
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/auth-context';
import MainNav from '@/components/main-nav';
import { SessionsProvider } from '@/context/sessions-context';
import { SkillsProvider } from '@/context/skills-context';

export const metadata: Metadata = {
  title: 'Drive-Track',
  description: 'A simple app to track driving hours for student drivers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <SessionsProvider>
            <SkillsProvider>
              <div className="flex flex-col">
                <main className="flex-1">
                    <div className="pb-16">
                        {children}
                    </div>
                </main>
                <MainNav />
              </div>
            </SkillsProvider>
          </SessionsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
