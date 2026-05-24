import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { APP_ICON_PATH, APP_IMAGE_PATH, CANONICAL_SITE_URL } from "@/config/appAssets";
import { buildFcMiniAppEmbed, FARCASTER_APP_NAME } from "@/config/farcaster";
import { getConfig } from "@/config/wagmi";
import { ProvidersShell } from "./providers-loader";
import "./globals.css";

const siteUrl = CANONICAL_SITE_URL;

const cyberDisplay = Orbitron({
  variable: "--font-cyber-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const cyberMono = Share_Tech_Mono({
  variable: "--font-cyber-mono",
  subsets: ["latin"],
  weight: "400",
});

const fcMiniAppEmbed = JSON.stringify(buildFcMiniAppEmbed(siteUrl));

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: FARCASTER_APP_NAME,
  description:
    "Tap GM on Base. 3 free per day, then paid GMs. Earn points for airdrop.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: APP_ICON_PATH, type: "image/svg+xml" }],
  },
  openGraph: {
    title: FARCASTER_APP_NAME,
    description: "Tap GM onchain on Base. Stack points for airdrop.",
    images: [{ url: APP_IMAGE_PATH, width: 1200, height: 628 }],
  },
  other: {
    "fc:miniapp": fcMiniAppEmbed,
    "fc:frame": fcMiniAppEmbed,
    "base:app_id": "6a11ed0a355ac57b9a9b644a",
    "talentapp:project_verification":
      "8709675ffb7a5343acce1760e018ee0761dec6a23c4c27928281958c00e7193431d81bb1085132b2f0bfc1a7508ecc2fe24e156130f3ab47f246875c0444237d",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const initialState = cookieToInitialState(getConfig(), cookieHeader);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href={APP_ICON_PATH} type="image/svg+xml" />
      </head>
      <body
        className={`${cyberDisplay.variable} ${cyberMono.variable} antialiased`}
      >
        <ProvidersShell initialState={initialState}>{children}</ProvidersShell>
      </body>
    </html>
  );
}
