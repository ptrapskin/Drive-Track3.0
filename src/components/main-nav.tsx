"use client";

import Link from 'next/link';
import { Home, BookOpen, User as UserIcon, LogOut, Hourglass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import DriveTrackIcon from './drive-track-icon';
import { Button } from './ui/button';

export default function MainNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/track', label: 'Track', icon: Hourglass },
    { href: '/reports/logs', label: 'Logs', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  if (!user) {
    return null;
  }
  
  // Hide on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <>
      {/* Mobile Footer */}
      <footer className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t print:hidden md:hidden">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
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

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 fixed inset-y-0 left-0 z-50 bg-muted/40 border-r">
          <div className="flex flex-col flex-grow">
              <div className="p-6 flex items-center gap-3">
                  <DriveTrackIcon className="w-8 h-8 text-primary" />
                  <h1 className="text-2xl font-bold font-headline tracking-tight text-primary">
                      Drive-Track
                  </h1>
              </div>
              <nav className="flex-1 px-4 pb-4">
                  <ul className="space-y-2">
                      {navItems.map((item) => (
                          <li key={item.href}>
                              <Link
                                  href={item.href}
                                  className={cn(
                                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                      pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                                  )}
                              >
                                  <item.icon className="h-5 w-5" />
                                  {item.label}
                              </Link>
                          </li>
                      ))}
                  </ul>
              </nav>
              <div className="mt-auto p-4 border-t">
                  <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-primary" />
                       </div>
                       <div>
                           <p className="text-sm font-medium">{user.email}</p>
                           <p className="text-xs text-muted-foreground">Student Driver</p>
                       </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                  </Button>
              </div>
          </div>
      </aside>
    </>
  );
}
