import { redirect } from "next/navigation";

import { createClient } from "@/lib/server";
import SyncedVideoPlayer from "@/components/SyncedVideoPlayer";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { RealtimeCursors } from "@/components/realtime-cursors";
import SyncedVideoPlayer2 from "@/components/SyncedVideoPlayer2";
import RoomUrlFacility from "@/components/room-url-facility";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { RealtimeChat } from "@/components/realtime-chat";

export default async function RoomIdPage({
  params,
}: {
  params: { roomId: string };
  searchParams: { [key: string]: string };
}) {
  const { roomId } = params;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex  flex-1">
      <div className="flex flex-1 flex-col gap-4 p-4 ">
        <div className="flex w-full  mx-auto flex-col  min-h-[90svh] max-h-[calc(90svh-var(--header-height))] justify-center items-center  border border-dashed rounded-xl relative">
          <div className="absolute top-0 right-0 bg-neutral-500 z-10">
            <div className="flex flex-col justify-between items-center">
              <RoomUrlFacility roomId={roomId} />
            </div>
          </div>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel>
              <SyncedVideoPlayer2
                roomName={roomId + "video"}
                userId={data.user.email!}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className="max-w-sm min-w-xs rounded-lg ">
            <RealtimeChat
                  roomName={roomId + "chat"}
                  username={data.user.email?.split("@")[0]!}
                />
            </ResizablePanel>
          </ResizablePanelGroup>
          {/* to do solve media support error and test syncing then design */}

          <RealtimeCursors
            roomName={roomId + "cursor"}
            username={data.user.email!}
          />
        </div>
      </div>
      {/* <AppSidebar side="right" roomid={roomId} username={data.user.email!} /> */}
    </div>
  );
}
