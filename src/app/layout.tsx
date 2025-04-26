import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "../../const";
import { ThemeProvider } from "@/components/provider/theme-provider";

// If loading a variable font, you don't need to specify the font weight
const dm_sans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...APP_CONFIG,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      <meta name="apple-mobile-web-app-title" content="Letzplay" />
      </head>
      <body className={`${dm_sans.className}  antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
