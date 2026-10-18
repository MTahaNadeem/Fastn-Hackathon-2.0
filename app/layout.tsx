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
    "Next.js invoicing platform empowering freelancers with Fastn connection namespaces for QuickBooks, Stripe, Xero, PayPal, and Slack.",
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
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
        <TenantProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 bg-white dark:bg-zinc-900">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">InvoiceFlow</span>
                <span>•</span>
                <span>Fastn Hackathon 2.0 Tenant Integration</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <span>Fastn Connection Namespaces</span>
                <span>•</span>
                <span>Stripe • QuickBooks • Xero • Slack</span>
              </div>
            </div>
          </footer>
        </TenantProvider>
      </body>
    </html>
  );
}
