import Aurora from "@/components/Aurora";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function NotFoundPage() {
  return (
    <div className="relative min-h-svh h-full w-full">
      <div className="w-full h-full pointer-events-none absolute top-0 left-0 right-0">
        <Aurora
          colorStops={["#AB81F3", "#7936EC", "#450FA3"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
        <Image
          src={"/assets/error.svg"}
          alt="error_image"
          layout="fill"
          objectFit="cover"
        />
      <div className="relative min-h-svh w-full flex flex-col gap-4 items-center justify-center p-6 md:p-10  ">
        <h1 className="text-center text-5xl">404</h1>
        <h2 className="text-3xl">Something went wrong</h2>
        <Button asChild >
          <Link href="/">
            Go to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
