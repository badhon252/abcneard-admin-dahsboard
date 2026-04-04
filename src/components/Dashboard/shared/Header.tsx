"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Skeleton } from "@/components/ui/skeleton";
import { User2Icon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/lib/services/userService";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardHeader() {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const { data: profile, isLoading: loading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => userService.getMyProfile(),
  });

  const handleLogout = () => {
    signOut();
    setLogoutDialogOpen(false);
  };

  if (loading) {
    return (
      <header className="w-full h-[100px] bg-white shadow-sm border-b px-8 py-3 flex items-center justify-end">
        <div className="flex items-center space-x-4">
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="w-full h-[100px] bg-white shadow-sm border-b px-8 py-3 flex items-center justify-end">
      {/* Right: User Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#1F2937]">
                {profile?.name}
              </p>
              <p className="text-xs text-[#6B7280] capitalize">
                {profile?.role}
              </p>
            </div>

            {/* User Avatar */}
            <Avatar className="border-2 border-[#E5E7EB]">
              <AvatarImage
                src={profile?.profileImage?.secure_url || "/avatar.png"}
                alt="User Avatar"
              />
              <AvatarFallback className="bg-[#F3F4F6]">
                <User2Icon className="text-[#6B7280]" />
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-700 cursor-pointer"
            onClick={() => setLogoutDialogOpen(true)}
          >
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogTrigger asChild>
          <button style={{ display: "none" }}></button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
