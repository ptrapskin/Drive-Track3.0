
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Users, ArrowLeft } from 'lucide-react';
import DriveTrackLogo from './drive-track-logo';
import { useAuth } from '@/context/auth-context';

interface DashboardHeaderProps {
  userEmail: string | null;
  onLogout: () => void;
  isViewingSharedAccount: boolean;
}

export default function DashboardHeader({ userEmail, onLogout, isViewingSharedAccount }: DashboardHeaderProps) {
  const { shares, setActiveProfile, resetActiveProfile, user } = useAuth();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 mb-8">
       <div className="flex items-center gap-3">
            <DriveTrackLogo />
            <h1 className="text-2xl font-bold font-headline tracking-tight text-primary">
                Drive-Track
            </h1>
        </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                 <UserIcon className="h-4 w-4" />
                <span className="flex items-center gap-2">
                  {isViewingSharedAccount && <Users className="h-3 w-3 text-blue-600" />}
                  {userEmail}
                  {isViewingSharedAccount && <span className="text-xs text-blue-600">(viewing)</span>}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Show return to own account if viewing shared account */}
              {isViewingSharedAccount && (
                <>
                  <DropdownMenuItem onClick={resetActiveProfile}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span>Back to My Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {/* Show shared accounts if guardian has any */}
              {shares.length > 0 && !isViewingSharedAccount && (
                <>
                  <DropdownMenuLabel>Student Accounts</DropdownMenuLabel>
                  {shares.map((share) => (
                    <DropdownMenuItem 
                      key={share.id}
                      onClick={() => setActiveProfile(share.studentUid, share.studentEmail)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span>{share.studentEmail}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem asChild disabled={isViewingSharedAccount}>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
