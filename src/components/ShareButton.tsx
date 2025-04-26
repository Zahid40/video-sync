"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowForward, ExportCircle } from "iconsax-react";
// import { usePathname } from "next/navigation";
import useWebShare from "react-use-web-share";
import { RWebShare } from "react-web-share";

const ShareButton = (props: {
  title: string;
  text: string;
  url: string;
  className?: string;
}) => {
  const { loading, isSupported, share } = useWebShare();
  return (
    <>
      {!loading && isSupported ? (
        <Button
          variant={"secondary"}
          size={"icon"}
          className={cn(" flex-row gap-2  ", props.className)}
          onClick={() => {
            share({ config: props });
          }}
        >
          <ArrowForward size="22" variant="Broken" />
        </Button>
      ) : (
        <RWebShare
          data={props}
          onClick={() => console.log("shared successfully!")}
        >
          <Button
            variant={"secondary"}
            size={"icon"}
            className={cn(" flex-row gap-2  ", props.className)}
          >
            <ArrowForward size="22" variant="Broken" />
          </Button>
        </RWebShare>
      )}
    </>
  );
};
export default ShareButton;
