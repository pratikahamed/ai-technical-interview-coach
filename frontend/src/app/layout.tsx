import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/modules/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

function getMetadataBaseUrl(): URL {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!envUrl) {
    return new URL("https://ai-interview-coach.vercel.app");
  }
  try {
    const formatted =
      envUrl.startsWith("http://") || envUrl.startsWith("https://")
        ? envUrl
        : `https://${envUrl}`;
    return new URL(formatted);
  } catch {
    return new URL("https://ai-interview-coach.vercel.app");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: "AI Technical Interview Coach | Precision Mock Assessments",
  description:
    "Calibrated evaluations for DSA, System Design, LLD, Core Java, and Spring Framework. Immediate server-side rubric scoring with zero drift.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AI Technical Interview Coach",
    description: "Precision mock technical interviews with deterministic server-side evaluation.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
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
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${jetbrainsMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-[#060709] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
