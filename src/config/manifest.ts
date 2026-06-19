import {
  FARCASTER_MANIFEST_ORIGIN,
  getAppHeroUrl,
  getAppIconUrl,
  getAppImageUrl,
  getAppSplashUrl,
} from "@/config/appAssets";

/** Farcaster domain verification (gmgn-bice.vercel.app) */
export const FARCASTER_ACCOUNT_ASSOCIATION = {
  header:
    "eyJmaWQiOjc3MjY1MiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDlFZEZiZGE3ZDY5ZjViYTc4MmQ0QThBNzJjZDVkQzY3NmMxYTQxYmMifQ",
  payload: "eyJkb21haW4iOiJnbWduLWJpY2UudmVyY2VsLmFwcCJ9",
  signature:
    "henmc0uOalJgE+gaVl0S11TuV6ePPSsDd0Tgf8m9KJtd9x/GHxgnMFPygVTtkTzMhZvHbzquwJ/4gUJENsrtMBw=",
} as const;

function buildMiniappMetadata(origin: string) {
  return {
    version: "1",
    name: "GMGN",
    homeUrl: origin,
    iconUrl: getAppIconUrl(origin),
    imageUrl: getAppImageUrl(origin),
    heroImageUrl: getAppHeroUrl(origin),
    buttonTitle: "Tap GM",
    splashImageUrl: getAppSplashUrl(origin),
    splashBackgroundColor: "#eeccff",
    webhookUrl: `${origin}/api/webhook`,
    description:
      "Tap GM on Base Mainnet. 3 free GMs per day, earn points for a future airdrop.",
    subtitle: "Daily GM · stack points",
    primaryCategory: "social",
    tags: ["gm", "base", "points", "airdrop", "daily"],
  } as const;
}

export function buildFarcasterManifest() {
  const metadata = buildMiniappMetadata(FARCASTER_MANIFEST_ORIGIN);

  return {
    accountAssociation: FARCASTER_ACCOUNT_ASSOCIATION,
    miniapp: metadata,
    frame: metadata,
  };
}
