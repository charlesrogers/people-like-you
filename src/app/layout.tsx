import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "./providers";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
      <body className={`${jost.variable} font-sans antialiased`}>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
