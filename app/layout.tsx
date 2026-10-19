import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TenantProvider } from "@/lib/tenant-context";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InvoiceFlow | Multi-Tenant Freelancer Invoicing via Fastn",
  description:
    "Next.js invoicing platform empowering freelancers with Fastn connection namespaces for Gmail, Calendar, Sheets, Slack, and JazzCash.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-[#4A4A4A] font-sans">
        <TenantProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-neutral-200/80 py-8 text-center text-xs text-[#737373] bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1A1A1A]">InvoiceFlow</span>
                <span className="text-neutral-300">•</span>
                <span>Fastn 2.0 Multi-Tenant Engine</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                <span>Isolated Connection Namespaces</span>
                <span className="text-neutral-300">•</span>
                <span>JazzCash • Gmail • Google Calendar • Google Sheets • Slack</span>
              </div>
            </div>
          </footer>
        </TenantProvider>
      </body>
    </html>
  );
}
