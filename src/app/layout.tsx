import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "./providers";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "People Like You — Your Perfect Matchmaker",
  description:
    "We learn who you are through your stories, then introduce you to compatible people in a way that sparks real chemistry. No swiping. No small talk.",
  openGraph: {
    title: "People Like You",
    description: "Your perfect matchmaker, finally possible.",
    siteName: "People Like You",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "People Like You",
    description: "Your perfect matchmaker, finally possible.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
