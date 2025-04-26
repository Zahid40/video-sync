import { redirect } from "next/navigation";

import { createClient } from "@/lib/server";
import SyncedVideoPlayer from "@/components/SyncedVideoPlayer";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

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
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 ">
          <div className="flex w-full  mx-auto flex-col  min-h-[90svh] max-h-[calc(90svh-var(--header-height))] justify-center items-center  border border-dashed rounded-xl">
            <SyncedVideoPlayer
              roomName={roomId + "video"}
              userId={data.user.email!}
            />

           
          </div>
        </div>
      </SidebarInset>
      <AppSidebar side="right" roomid={roomId} username={data.user.email!} />
    </div>
  );
}
