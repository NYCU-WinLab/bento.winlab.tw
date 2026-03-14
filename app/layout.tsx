import "@/app/globals.css";
import { Footer } from "@/components/footer";
import HeaderBar from "@/components/header-bar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { RealtimeNotifications } from "@/components/realtime-notifications";
import { AuthProvider } from "@/contexts/auth-context";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bento | Winlab",
  description: "Meeting food ordering system for NYCU Winlab",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bento",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <RealtimeNotifications />
            <div className="flex flex-col min-h-dvh">
              <HeaderBar />
              <Separator />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
