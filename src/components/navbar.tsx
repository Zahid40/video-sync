"use client";
import Logo from "./Logo";
import { APP_CONFIG } from "../../const";
import { NavUser } from "./nav-user";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export function Navbar({ user }: { user: User }) {
  return (
    <header className="flex sticky top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4 py-4">
        <Link href={"/"} className="flex gap-2 items-center  flex-1">
          <Logo className="size-10" />
          <div className="flex flex-col justify-center ">
            <p className="font-semibold leading-4">{APP_CONFIG.title}</p>
            <p className=" text-[9px]">fun with friends </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <NavUser user={user} />
        </div>
      </div>
    </header>
  );
}
