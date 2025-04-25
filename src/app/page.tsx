import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import JoinRoomForm from "@/components/join-room-form";
export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col justify-center items-center h-full min-h-[90dvh] w-full gap-2">
      <JoinRoomForm />
      <p className="text-sm">
        If want to join a room get direct url from your friend 🤌
      </p>
      <p className="text-sm">
        Or create a room and share the link with your friends
      </p>
    </div>
  );
}
