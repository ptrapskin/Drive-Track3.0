
"use client";

import Link from 'next/link';
import { Home, BookOpen, User as UserIcon, LogOut, Gauge, Award, CircleUser } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import DriveTrackLogo from './drive-track-logo';
import { useRouter } from 'next/navigation';

export default function MainNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/track', label: 'Track', icon: Gauge },
    { href: '/reports/logs', label: 'Logs', icon: BookOpen },
    { href: '/skills', label: 'Skills', icon: Award },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  if (!user) {
    return null;
  }
  
  // Hide on auth pages and landing page
  const hiddenPaths = ['/login', '/signup', '/'];
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full bg-background border-t print:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="grid h-16 max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex flex-col items-center justify-center px-5 hover:bg-muted',
              pathname === item.href ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </div>
    </footer>
  );
}
