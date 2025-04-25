"use client";

import { useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useRealtimeVideoSync } from "@/hooks/useRealtimeVideoSync";

export default function SyncedVideoPlayer({
  roomName,
  userId,
  url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}: {
  roomName: string;
  userId: string;
  url?:string ;
}) {
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);

  const {
    sendPlay,
    sendPause,
    sendSeek,
    ignoreNext,
  } = useRealtimeVideoSync({ roomName, userId, playerRef });
  
  const handlePlay = () => {
    if (ignoreNext.current) return;
    const currentTime = playerRef.current?.getCurrentTime?.() ?? 0;
    sendPlay(currentTime);
    setPlaying(true);
  };
  
  const handlePause = () => {
    if (ignoreNext.current) return;
    const currentTime = playerRef.current?.getCurrentTime?.() ?? 0;
    sendPause(currentTime);
    setPlaying(false);
  };
  
  const handleSeek = (time: number) => {
    if (ignoreNext.current) return;
    sendSeek(time);
  };

  return (
    <div className="w-full h-full aspect-video rounded-xl overflow-hidden">
      <ReactPlayer
        ref={playerRef}
        url={url}
        controls
        playing={playing}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        width="100%"
        height="100%"
      />
    </div>
  );
}
