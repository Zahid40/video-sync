"use client";

import { ChevronsUpDown, LogOut, Mail } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { Button } from "./ui/button";
import Link from "next/link";
import { Calendar, Clock, Edit } from "iconsax-react";
import { Separator } from "./ui/separator";
import { FaQuestion } from "react-icons/fa";
import { format, formatDistance, subDays } from "date-fns";

export function NavUser({
  user,
}: {
  user: { username?: any; avatar_url?: any } & User;
}) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" className="rounded-full">
          <Avatar className="h-8 w-8 rounded-dull">
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback className=" bg-primary-700 capitalize text-center flex items-center justify-center">
              {user.username ? user.username.slice(0, 1) : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[525px] aspect-square"
        aria-describedby={"Profile Dialog"}
      >
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <Link
            href="/"
            className="text-sm text-muted-foreground flex items-center gap-2"
          >
            <FaQuestion className="h-4 w-4" />
            help
          </Link>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="size-44">
              <AvatarImage src={user?.avatar_url} alt="Profile picture" />
              <AvatarFallback>{user?.username.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <Button
              variant={"outline"}
              size={"sm"}
              className="absolute bottom-2 right-1  size-8 rounded-full "
            >
              <Edit size="32" />
            </Button>
          </div>

          <h2 className="text-2xl font-semibold tracking-wide">
            {user?.username}
          </h2>

          <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Email</span>
              </div>
              <span className="text-sm">{user?.email}</span>
            </div>

            {/* <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">
                    password
                  </span>
                </div>
                <span className="text-sm">{user?.password}</span>
              </div> */}

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  Created At
                </span>
              </div>
              <span className="text-sm">
                {format(new Date(user?.created_at!), "dd MMM yyyy")}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col justify-between items-center w-full gap-6">
            <div className="flex flex-row gap-4 w-full">
              <Button
                variant="default"
                className="flex items-center gap-2 w-full"
              >
                <Edit className="size-6" />
                Edit
              </Button>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={logout}
              >
                <LogOut className="size-6" />
                Logout
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
              <Clock className="size-3" />
              last updated{" "}
              {formatDistance(
                subDays(new Date(user?.updated_at!), 0),
                new Date(),
                { addSuffix: true }
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
