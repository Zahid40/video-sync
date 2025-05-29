"use client";

import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useRealtimeVideoSync } from "@/hooks/useRealtimeVideoSync";
import { Input } from "./ui/input";
import { useSearchParams } from "next/navigation";


export default function SyncedVideoPlayer({
  roomName,
  userId,
}: {
  roomName: string;
  userId: string;
}) {
  const playerRef = useRef<ReactPlayer>(null);
  const searchParams = useSearchParams();
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { sendPlay, sendPause, sendSeek, ignoreNext } = useRealtimeVideoSync({
    roomName,
    userId,
    playerRef,
  });

   // 🛠 Update `url` whenever searchParams change
   useEffect(() => {
    const newUrl = searchParams.get("url");
    if (newUrl !== url) {
      setUrl(newUrl);
    }
  }, [searchParams]); // 👈 react to changes

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
    }
  };

  if (!url) {
    return (
      <div className=" flex flex-col items-center justify-center gap-4 border rounded-xl p-6">
        <p className="text-center text-lg">
          No video URL provided. Choose a local file to play together:
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="border border-dashed rounded-lg p-8 w-full flex items-center justify-center cursor-pointer h-32"
        />
      </div>
    );
  }

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
