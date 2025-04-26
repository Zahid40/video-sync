"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { RealtimeChat } from "./realtime-chat";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  roomid: string;
  username: string;
};

export function AppSidebar(props: AppSidebarProps) {
  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          
        </SidebarMenu>
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
