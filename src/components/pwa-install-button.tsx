"use client"
import { useEffect, useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent default install banner
      setDeferredPrompt(e);
      setCanInstall(true); // Show button
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt && "prompt" in deferredPrompt) {
      // @ts-ignore
      deferredPrompt.prompt();
      // const choiceResult = await deferredPrompt.userChoice;
      // if (choiceResult.outcome === "accepted") {
      //   console.log("User accepted the install prompt");
      // } else {
      //   console.log("User dismissed the install prompt");
      // }
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  if (!canInstall) return null;

  return (
    <Button variant="outline" className="gap-2 text-xs" onClick={installApp}>
      Install App
      <ArrowDownToLine size={18} />
    </Button>
  );
}