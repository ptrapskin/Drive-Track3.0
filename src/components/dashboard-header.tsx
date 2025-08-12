

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
import { LogOut, User as UserIcon, Users } from 'lucide-react';
import DriveTrackLogo from './drive-track-logo';
import { useAuth } from '@/context/auth-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface DashboardHeaderProps {
  userEmail: string | null;
  onLogout: () => void;
}

export default function DashboardHeader({ userEmail, onLogout }: DashboardHeaderProps) {
  const { shares, activeProfileUid, setActiveProfileUid, user } = useAuth();
  
  const handleProfileChange = (studentUid: string) => {
    if (studentUid === user?.uid) {
      setActiveProfileUid(null); // Passing null/user.uid will default to own profile
    } else {
      setActiveProfileUid(studentUid);
    }
  };
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 mb-8">
       <div className="flex items-center gap-3">
            <DriveTrackLogo />
            <h1 className="text-2xl font-bold font-headline tracking-tight text-primary">
                Drive-Track
            </h1>
        </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {shares.length > 0 && user && (
            <div className="ml-auto flex items-center gap-4">
                 <Select onValueChange={handleProfileChange} value={activeProfileUid || user.uid}>
                    <SelectTrigger className="w-[200px] sm:w-[250px] md:w-[300px]">
                        <div className='flex items-center gap-2'>
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select an account" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={user.uid}>My Account (Guardian)</SelectItem>
                        {shares.map(share => (
                            <SelectItem key={share.studentUid} value={share.studentUid}>
                                {share.studentName || share.studentEmail}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}
        <div className="ml-auto flex-1 sm:flex-initial">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                 <UserIcon className="h-4 w-4" />
                <span className='hidden sm:inline'>{userEmail}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
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
