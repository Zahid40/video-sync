import Aurora from "@/components/Aurora";
import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <div className="relative">{children}</div>
    </div>
  );
}
