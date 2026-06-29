import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/context/WalletContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { WalletBar } from "@/components/layout/WalletBar";

export const metadata: Metadata = {
  title: "Allot — Payable GEN Allocation Court",
  description: "Fair allocation, enforced by escrow. GenLayer-native allocation rounds with AI-consensus distribution.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <Sidebar />
          <div className="ml-52 min-h-screen flex flex-col">
            <header className="sticky top-0 z-30 bg-[#04080f]/80 backdrop-blur border-b border-[#0d1829] px-6 py-3 flex items-center justify-between">
              <div />
              <WalletBar />
            </header>
            <main className="flex-1 px-6 py-6">{children}</main>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
