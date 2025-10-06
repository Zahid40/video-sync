import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "../../const";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { UserProvider } from "@/components/provider/user-provider";
import { getUser } from "@/action/user/user.action";
import { Tooltip } from "@/components/ui/tooltip";

// If loading a variable font, you don't need to specify the font weight
const dm_sans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...APP_CONFIG,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Roomieo" />
      </head>
      <body className={`${dm_sans.className}  antialiased`}>
        <UserProvider initialUser={user}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
          </ThemeProvider>
        </UserProvider>
        <Toaster />
      </body>
    </html>
  );
}
