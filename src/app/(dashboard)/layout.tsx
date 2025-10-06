import { getUser } from "@/action/user/user.action";
import Aurora from "@/components/Aurora";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function dashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const user = await getUser();

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
      <Navbar user={user} />
      <div className="relative">{children}</div>
    </div>
  );
}
