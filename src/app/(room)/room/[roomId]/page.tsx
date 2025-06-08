import { redirect } from "next/navigation";

import { createClient } from "@/lib/server";
import SyncedVideoPlayer from "@/components/SyncedVideoPlayer";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { RealtimeCursors } from "@/components/realtime-cursors";

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
    <div className="flex  flex-1 max-h-svh h-svh p-2 items-center justify-center">
      <div className="flex w-full  mx-auto flex-col max-h-svh   h-full  justify-center items-center  border border-dashed rounded-xl">
        <SyncedVideoPlayer
          roomName={roomId + "video"}
          userId={data.user.email!}
        />

        <RealtimeCursors
          roomName={roomId + "cursor"}
          username={data.user.email!}
        />
      </div>

      {/* <AppSidebar side="right" roomid={roomId} username={data.user.email!} /> */}
    </div>
  );
}
