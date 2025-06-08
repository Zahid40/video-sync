"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { RealtimeChat } from "./realtime-chat";
import ShareButton from "./ShareButton";
import { usePathname } from "next/navigation";
import { RealtimeAvatarStack } from "./realtime-avatar-stack";
import RoomUrlFacility from "./room-url-facility";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  roomid: string;
  username: string;
};

export function AppSidebar(props: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <div className="flex flex-col justify-between items-center">
          <RoomUrlFacility roomId={props.roomid}  />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex-1 ">

        <RealtimeChat
          roomName={props.roomid + "chat"}
          username={props.username}
        />
        </div>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
