"use client";

import { SidebarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import Logo from "./Logo";
import { APP_CONFIG } from "../../const";
import { NavUser } from "./nav-user";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export function SiteHeader({ user }: { user: User }) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4 py-4">
        <Link href={"/"} className="flex gap-2 items-center w-full flex-1">
          <Logo className="size-10" />
          <div className="flex flex-col justify-center ">
            <p className="font-semibold leading-4">{APP_CONFIG.title}</p>
            <p className=" text-[9px]">fun with friends </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>

          <Separator orientation="vertical" className="mr-2 h-4" />
          <NavUser user={user} />
        </div>
      </div>
    </header>
  );
}
