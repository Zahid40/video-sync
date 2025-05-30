"use client";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Copy, Edit2, TickCircle } from "iconsax-react";
import ShareButton from "./ShareButton";
import { RealtimeAvatarStack } from "./realtime-avatar-stack";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type RoomUrlFacilityProps = {
  roomId: string;
};

export default function RoomUrlFacility({ roomId }: RoomUrlFacilityProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url");
  const [newUrl, setNewUrl] = useState(urlParam ?? "");

  const [isCopied, setIsCopied] = useState(false);

  const sharableUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }${pathname}${newUrl ? `?url=${encodeURIComponent(newUrl)}` : ""}`;

  const copyClickHandler = () => {
    navigator.clipboard.writeText(sharableUrl);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleEditUrl = () => {
    if (typeof window !== "undefined" && newUrl) {
      const newUrlWithParams = new URL(window.location.href);
      newUrlWithParams.searchParams.set("url", newUrl);
      window.history.pushState({}, "", newUrlWithParams.toString());
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"secondary"}
          size={"icon"}
          className="aspect-square"
          aria-label="Room URL Facility"
        >
          <Edit2 size="24" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-primary-500 text-center">
              {roomId}
            </p>
            <RealtimeAvatarStack roomName={roomId} />
          </div>

          <div className="flex items-center gap-1">
            {urlParam === "" ? (
              <p className="text-xs">Playing video from local file</p>
            ) : (
              <div className="flex gap-1 w-full">
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full"
                />
                <Button
                  variant={"secondary"}
                  size={"icon"}
                  className="aspect-square"
                  onClick={handleEditUrl}
                >
                  <Edit2 size="24" />
                </Button>
              </div>
            )}
            <Button
              variant={"secondary"}
              size={"icon"}
              onClick={copyClickHandler}
              className="aspect-square"
            >
              {isCopied ? <TickCircle /> : <Copy />}
            </Button>
            <ShareButton
              title={sharableUrl}
              text={sharableUrl}
              url={sharableUrl}
              className="aspect-square"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
