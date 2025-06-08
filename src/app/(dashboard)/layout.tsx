import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";

export default async function dashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  const userData = data.user;
  return (
    <div className="">
      <Navbar user={userData} />
      {children}
    </div>
  );
}
