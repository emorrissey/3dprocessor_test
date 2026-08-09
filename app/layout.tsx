import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Intel Core Ultra Series 3 | Interactive Processor Anatomy";
const description =
  "A Three.js feature tour of Intel Core Ultra Series 3 processors, built around performance, AI, graphics, mobility, connectivity, and edge benefits.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title,
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Intel Core Ultra Series 3 silicon anatomy preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
