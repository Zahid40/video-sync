import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
interface LogoProps {
  className?: string; // Optional className
}
const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "aspect-square size-12 relative border-2 rounded-full border-primary-500/50 overflow-hidden p-2",
        className
      )}
    >
      <Image
        src="/icon/logo.svg" // Path to your SVG
        alt="Logo"
        layout="fill"
        objectFit="cover"
        priority
      />
    </div>
  );
};
export default Logo;
