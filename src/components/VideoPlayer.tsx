import React from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@/style/netflix-vjs.css";
import { format } from "date-fns";
import { Separator } from "./ui/separator";

export const VideoJS = (props: {
  options: any;
  onReady: any;
  LocalFile?: any;
}) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const { options, onReady, LocalFile } = props;

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered");
      videoElement.classList.add("vjs-default-skin");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        onReady && onReady(player);
      }));

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
      var tracks = player.textTracks();
      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];

        // Find the English captions track and mark it as "showing".
        if (track.kind === "captions" && track.language === "en") {
          track.mode = "showing";
        }
      }
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className="w-full relative group overflow-hidden">
      {LocalFile && (
        <div className="absolute -top-10 group-hover:top-0 transition-all duration-500 ease-in-out blur-lg group-hover:blur-0 opacity-0 group-hover:opacity-100 left-0 z-10 p-2 border-l-2 m-2 border-primary-500 bg-linear-to-r from-cyan-500 to-blue-500 ">
          <h2 className=" text-lg text-neutral-400 ">{LocalFile.name}</h2>
          <p className="text-[10px] text-neutral-300 flex">File size : {(LocalFile.size/ (1024 ** 3)).toFixed(2)}{" Gb"}<Separator orientation="vertical" className="h-4 w-px mx-2" />{"Last Updated : "}{format(LocalFile.lastModifiedDate , "EEE dd MMM yyyy")}</p>
        </div>
      )}
      <div ref={videoRef} />
    </div>
  );
};

export default VideoJS;
