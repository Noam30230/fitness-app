import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ProfileProvider } from "@/components/ProfileContext";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "FitTrack",
  description: "Suivi fitness & nutrition premium",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitTrack",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-[#0A0A0A] text-white">
        <ProfileProvider>
          <ServiceWorkerRegister />
          <main className="min-h-screen pb-24">{children}</main>
          <BottomNav />
        </ProfileProvider>
      </body>
    </html>
  );
}
