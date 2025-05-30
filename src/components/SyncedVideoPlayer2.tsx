"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtimeVideoSync } from "@/hooks/useRealtimeVideoSync";
import { Input } from "./ui/input";
import { useSearchParams } from "next/navigation";
import videojs, { VideoJsPlayer } from "video.js";
import "video.js/dist/video-js.css";
import VideoJS from "./VideoPlayer";

export default function SyncedVideoPlayer({
  roomName,
  userId,
}: {
  roomName: string;
  userId: string;
}) {
  const playerRef = useRef<videojs.Player | null>(null);
  const searchParams = useSearchParams();
  const [LocalFile, setLocalFile] = useState<File>();
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { sendPlay, sendPause, sendSeek, ignoreNext } = useRealtimeVideoSync({
    roomName,
    userId,
    playerRef,
  });

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    controlBar: {
      skipButtons: {
        forward: 5,
        backward: 5,
      },
    },
    spatialNavigation: {
      enabled: true,
      horizontalSeek: true,
    },
    responsive: true,
    enableSmoothSeeking: true,
    language: "en",
    html5: {
      nativeTextTracks: false,
    },
    textTrackSettings: true,
    fluid: true,
    sources: url
      ? [
          {
            src: url,
            type: "video/webm",
          },
        ]
      : [],
  };

  // 🛠 Update `url` whenever searchParams change
  useEffect(() => {
    const newUrl = searchParams.get("url");
    if (newUrl && newUrl !== url) {
      setLocalFile(undefined); // clear previous file reference
      setUrl(newUrl);
    }
  }, [searchParams, url]);

  useEffect(() => {
    return () => {
      if (url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  const handlePlayerReady = (player: VideoJsPlayer) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      console.log("player is waiting");
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
    // player.on("play", () => {
    //   console.log("local play");
    //   if (ignoreNext.current) return;
    //   const currentTime = playerRef.current?.currentTime?.() ?? 0;
    //   sendPlay(currentTime);
    //   setPlaying(true);
    // });
    // player.on("pause", () => {
    //   console.log("local pause");
    //   if (ignoreNext.current) return;
    //   const currentTime = playerRef.current?.currentTime?.() ?? 0;
    //   sendPause(currentTime);
    //   setPlaying(false);
    // });
    // player.on("seeked", () => {
    //   const currentTime = playerRef.current?.currentTime?.() ?? 0;
    //   console.log("local seek", currentTime);
    //   if (ignoreNext.current) return;
    //   sendSeek(currentTime);
    // });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected file:", file);
      setLocalFile(file);
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
          // accept="video/*"
          onChange={handleFileChange}
          className="border border-dashed rounded-lg p-8 w-full flex items-center justify-center cursor-pointer h-32"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full aspect-video rounded-xl overflow-hidden relative  flex justify-center items-center">
      <VideoJS
        options={videoJsOptions}
        onReady={handlePlayerReady}
        LocalFile={LocalFile}
      />
    </div>
  );
}
