import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/theme-provider";
import InlineScript from "@/components/theme/inline-script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://admin.eivver.com"),

  title: {
    default: "EIVVER Admin",
    template: "%s | EIVVER Admin",
  },

  description:
    "Admin dashboard for managing EIVVER customers, fixers, bookings, payments, withdrawals, analytics and platform operations.",

  keywords: [
    "EIVVER",
    "Admin",
    "Dashboard",
    "Marketplace",
    "Bookings",
    "Fixers",
    "Customers",
    "Payments",
    "Analytics",
  ],

  applicationName: "EIVVER Admin",

  authors: [
    {
      name: "EIVVER Engineering",
    },
  ],

  creator: "EIVVER",

  publisher: "EIVVER",

  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    title: "EIVVER Admin",
    description:
      "Secure administration dashboard for the EIVVER platform.",
    type: "website",
    siteName: "EIVVER Admin",
  },

  twitter: {
    card: "summary_large_image",
    title: "EIVVER Admin",
    description:
      "Secure administration dashboard for the EIVVER platform.",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        inter.variable,
        geistSans.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <head>
        <InlineScript
          html={`(function(){try{var t=localStorage.getItem("eivver-theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})();`}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
