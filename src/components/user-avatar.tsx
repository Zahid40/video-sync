"use client";
import { UserType } from "@/types/type";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Edit } from "iconsax-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { updateUser } from "@/action/user/user.action";
import { toast } from "sonner";
import Image from "next/image";

export default function UserAvatar(props: {
  className?: string;
  user: UserType;
  isEditable?: boolean;
}) {
  const { user, className, isEditable } = props;
  // Track avatar locally for instant re-render
  const [avatarUrl, setAvatarUrl] = React.useState(user.avatar_url);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const handleSelect = async (url: string, e: any) => {
    e.stopPropagation();
    console.log("Selected avatar URL:", url);
    setAvatarUrl(url); // Update local avatar immediately
    await updateUser({ avatar_url: url });
    toast.success("Avatar updated");
    setPopoverOpen(false); // Close popover after selection
    // Optionally refresh user context/provider here if main profile must update everywhere
  };

  React.useEffect(() => {
    setAvatarUrl(user.avatar_url); // Sync local state if parent changes
  }, [user.avatar_url]);

  return (
    <div>
      {isEditable ? (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger>
            <Avatar className={cn("size-12 rounded-full", className)}>
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={user.username ?? "user"} />
              ) : (
                <AvatarFallback className="text-secondary-foreground rounded-full bg-primary-400 dark:bg-primary-700">
                  {user.username ? user.username?.slice(0, 1) : "U"}
                </AvatarFallback>
              )}
            </Avatar>
          </PopoverTrigger>
          <PopoverContent onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-6 gap-2">
              {[...Array(60)].map((_, i) => {
                const url = `https://avatar.iran.liara.run/public/${i + 1}`;
                return (
                  <Button
                    key={url}
                    onClick={(e) => handleSelect(url, e)}
                    variant={avatarUrl === url ? "default" : "outline"}
                    size="icon"
                  >
                    <Image
                      src={url}
                      width={28}
                      height={28}
                      alt={`Avatar ${i + 1}`}
                    />
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <Avatar className={cn("size-12 rounded-full", className)}>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={user.username ?? "user"} />
          ) : (
            <AvatarFallback className="text-secondary-foreground rounded-full bg-primary-400 dark:bg-primary-700">
              {user.username ? user.username.slice(0, 1) : "U"}
            </AvatarFallback>
          )}
        </Avatar>
      )}
    </div>
  );
}
