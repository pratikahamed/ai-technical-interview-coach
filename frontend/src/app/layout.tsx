import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "AI Technical Interview Coach | Precision Mock Assessments",
  description:
    "Calibrated evaluations for DSA, System Design, LLD, Core Java, and Spring Framework. Immediate server-side rubric scoring with zero drift.",
  icons: {
    icon: "/logo.svg",
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
      className={`${geistSans.variable} ${jetbrainsMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-surface-container-lowest text-on-surface font-sans selection:bg-primary selection:text-on-primary">
        {children}
      </body>
    </html>
  );
}
