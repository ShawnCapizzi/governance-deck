import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "../lib/store";
import { ParticleField } from "../components/ParticleField";

export const metadata: Metadata = {
  title: "Capizzi Governance Deck",
  description: "Define the spine, diagnose reality against it, and walk the road to success met.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ground text-ink antialiased">
        <ParticleField />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
