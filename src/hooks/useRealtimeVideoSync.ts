import { createClient } from "@/lib/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useRef } from "react";

type SyncPayload = {
  userId: string;
  action: "play" | "pause" | "seek";
  time: number;
};

const EVENT_NAME = "realtime-video-sync";

export function useRealtimeVideoSync({
  roomName,
  userId,
  playerRef,
}: {
  roomName: string;
  userId: string;
  playerRef: React.MutableRefObject<any>;
}) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const ignoreNext = useRef(false); // 👈 Shared across effects and return

  useEffect(() => {
    const channel = supabase.channel(roomName);
    channelRef.current = channel;

    const handleBroadcast = (data: { payload: SyncPayload }) => {
      const { userId: sender, action, time } = data.payload;

      if (sender === userId) return;

      const player = playerRef.current;
      if (!player) return;

      ignoreNext.current = true; // 👈 Mark next local event to ignore

      switch (action) {
        case "play":
          player.seekTo(time, "seconds");
          player.getInternalPlayer()?.play?.();
          player.getInternalPlayer()?.playVideo?.(); // for YouTube
          break;
        case "pause":
          player.seekTo(time, "seconds");
          player.getInternalPlayer()?.pause?.();
          player.getInternalPlayer()?.pauseVideo?.(); // for YouTube
          break;
        case "seek":
          player.seekTo(time, "seconds");
          break;
      }

      // Reset ignore after short time
      setTimeout(() => {
        ignoreNext.current = false;
      }, 300);
    };

    channel.on("broadcast", { event: EVENT_NAME }, handleBroadcast).subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [roomName, userId, playerRef]);

  const sendEvent = (payload: SyncPayload) => {
    channelRef.current?.send({
      type: "broadcast",
      event: EVENT_NAME,
      payload,
    });
  };

  return {
    sendPlay: (time: number) =>
      sendEvent({ userId, action: "play", time }),
    sendPause: (time: number) =>
      sendEvent({ userId, action: "pause", time }),
    sendSeek: (time: number) =>
      sendEvent({ userId, action: "seek", time }),
    ignoreNext, // 👈 used in your component to skip local broadcast
  };
}
