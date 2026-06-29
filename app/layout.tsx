import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/lib/context/WalletContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { WalletBar } from "@/components/layout/WalletBar";

export const metadata: Metadata = {
  title: "Allot — Vault Court Allocation System",
  description: "Payable GEN allocation court. Sponsors escrow, GenLayer judges, recipients claim.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          <Sidebar />
          <div style={{ marginLeft: "192px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <header style={{
              position: "sticky", top: 0, zIndex: 30,
              background: "rgba(3,9,18,0.92)", backdropFilter: "blur(12px)",
              borderBottom: "1px solid var(--vault-border)",
              padding: "0 24px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: "var(--text-3)", fontFamily: "'JetBrains Mono', monospace" }}>
                GenLayer StudioNet · Chain 61999
              </div>
              <WalletBar />
            </header>
            <main style={{ flex: 1, padding: "28px 28px 48px" }}>{children}</main>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
