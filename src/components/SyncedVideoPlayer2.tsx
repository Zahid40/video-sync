"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtimeVideoSync } from "@/hooks/useRealtimeVideoSync";
import { Input } from "./ui/input";
import { useSearchParams } from "next/navigation";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import VideoJS from "./VideoPlayer";

export default function SyncedVideoPlayer({
  roomName,
  userId,
}: {
  roomName: string;
  userId: string;
}) {
  const playerRef = useRef(null);
  const searchParams = useSearchParams();
  const [LocalFile, setLocalFile] = useState();
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
    userActions: {
      hotkeys: function (event) {
        // `this` is the player in this context

        // `x` key = pause
        if (event.which === 88) {
          this.pause();
        }
        // `y` key = play
        if (event.which === 89) {
          this.play();
        }
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
          type: LocalFile?.type || undefined,
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
  
  

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
    player.on("play", () => {
      console.log("local play");
      handlePlay();
    });
    player.on("pause", () => {
      console.log("local pause");
      handlePause();
    });
    player.on("seeked", () => {
      const time = player.currentTime();
      console.log("local seek", time);
      handleSeek(time);
    });
    
  };

  const handlePlay = () => {
    if (ignoreNext.current) return;
    const currentTime = playerRef.current?.currentTime?.() ?? 0;
    sendPlay(currentTime);
    setPlaying(true);
  };

  const handlePause = () => {
    if (ignoreNext.current) return;
    const currentTime = playerRef.current?.currentTime?.() ?? 0;
    sendPause(currentTime);
    setPlaying(false);
  };

  let lastSeek = 0;
const handleSeek = (time: number) => {
  const now = Date.now();
  if (ignoreNext.current || now - lastSeek < 500) return;
  lastSeek = now;
  sendSeek(time);
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
