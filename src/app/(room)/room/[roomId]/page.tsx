import { redirect } from "next/navigation";

import { createClient } from "@/lib/server";
import SyncedVideoPlayer from "@/components/SyncedVideoPlayer";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { RealtimeCursors } from "@/components/realtime-cursors";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Logo from "@/components/Logo";
import { AnimatePresence } from "motion/react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { NavUser } from "@/components/nav-user";
import { getUser } from "@/action/user/user.action";
import RoomUrlFacility from "@/components/room-url-facility";
import { RealtimeChat } from "@/components/realtime-chat";
import Link from "next/link";

export default async function RoomIdPage({
  params,
}: {
  params: { roomId: string };
  searchParams: { [key: string]: string };
}) {
  const { roomId } = params;
  const user = await getUser();

  return (
    <div className="flex  flex-1 max-h-svh h-svh p-2 items-center justify-center relative">
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] rounded-lg border md:min-w-[450px]"
      >
        <ResizablePanel defaultSize={80} minSize={60}>
          <div className="flex w-full  mx-auto flex-col max-h-svh   h-full  justify-center items-center  rounded-xl">
            <SyncedVideoPlayer
              roomName={roomId + "video"}
              userId={user.email!}
            />

            <RealtimeCursors
              roomName={roomId + "cursor"}
              username={user.email!}
            />
            <div className="absolute top-0 right-0 z-20 bg-background p-4">
              <Button size={"icon"}>
                <Settings />
              </Button>
            </div>
            <div className="absolute top-4 left-4 z-20 ">
              <Link href="/">
                <Logo className="size-12" />
              </Link>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={20} maxSize={40}>
          <div className="flex flex-col h-full items-center justify-center p-6">
            <NavUser />
            <div className="flex flex-col justify-between items-center">
              <RoomUrlFacility roomId={roomId} />
            </div>
            <div className="flex-1 ">
              <RealtimeChat
                roomName={roomId + "chat"}
                username={user.username!}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* <AppSidebar side="right" roomid={roomId} username={data.user.email!} /> */}
    </div>
  );
}
