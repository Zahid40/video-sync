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

  const { data, error: UserError } = await supabase.auth.getUser();

  if (UserError || !data?.user) {
    redirect("/auth/login");
  }

  const userData = data.user;
  const { data: profile, error: ProfileError } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("user_id", data?.user?.id);

  const user = {
    ...userData,
    ...profile?.[0], // Assuming profile is an array and you want the first element
  };
  console.log("user", user);

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
