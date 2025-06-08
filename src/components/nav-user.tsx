"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Button } from "./ui/button";

export function NavUser({ user }: { user: User }) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          variant={"ghost"}
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
        >
          <Avatar className="size-8 rounded-full">
            {/* <AvatarImage src={user.avatar} alt={user.email} /> */}
            <AvatarFallback className="rounded-lg capitalize bg-primary-600 text-lg font-semibold">
              {user.email?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-xs">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex flex-col items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-16 rounded-full">
              {/* <AvatarImage src={user.avatar} alt={user.email} /> */}
              <AvatarFallback className="rounded-lg capitalize bg-primary-600 text-lg font-semibold">
                {user.email?.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className=" flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button onClick={logout} variant={"destructive"} className="w-full">
            <LogOut />
            Log out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
