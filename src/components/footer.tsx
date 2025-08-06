"use client";

import Link from 'next/link';
import { Home, BookOpen, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/reports/logs', label: 'Logs', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Footer() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) {
    return null;
  }
  
  // Hide on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t print:hidden md:hidden">
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
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
