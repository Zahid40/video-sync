import { RealtimeChat } from "@/components/realtime-chat";
import { RealtimeCursors } from "@/components/realtime-cursors";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/server";
import SyncedVideoPlayer from "@/components/SyncedVideoPlayer";
import { Suspense } from "react";

export default async function RoomIdPage({
  params,
  searchParams,
}: {
  params: { roomId: string };
  searchParams: { [key: string]: string };
}) {
  const { roomId } = params;
  const { url } = searchParams;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex w-full max-w-3xl mx-auto flex-col h-full min-h-[90svh] justify-center items-center">
        <SyncedVideoPlayer
          roomName={roomId + "video"}
          userId={data.user.email!}
          url={url}
        />

        <RealtimeCursors
          roomName={roomId + "cursor"}
          username={data.user.email!}
        />
        <RealtimeChat
            roomName={roomId + "chat"}
            username={data.user.email!}
          />
      </div>
    </Suspense>
  );
}
