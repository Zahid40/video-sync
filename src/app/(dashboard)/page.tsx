import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import JoinRoomForm from "@/components/join-room-form";
import PwaInstallButton from "@/components/pwa-install-button";
export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col justify-center items-center h-full min-h-[90dvh] w-full gap-2">
      <div className="max-w-xl  p-4 flex flex-col gap-3">
        <JoinRoomForm />
        <p className="text-xs text-neutral-500 text-balance text-center">
          If want to join a room get direct url from your friend 🤌 Or create a
          room and share the link with your friends
        </p>
        <PwaInstallButton />
      </div>
    </div>
  );
}
