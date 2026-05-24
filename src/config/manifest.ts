import {
  CANONICAL_SITE_URL,
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

const MINIAPP_METADATA = {
  version: "1",
  name: "GMGN",
  homeUrl: CANONICAL_SITE_URL,
  iconUrl: getAppIconUrl(CANONICAL_SITE_URL),
  imageUrl: getAppImageUrl(CANONICAL_SITE_URL),
  heroImageUrl: getAppHeroUrl(CANONICAL_SITE_URL),
  buttonTitle: "Tap GM",
  splashImageUrl: getAppSplashUrl(CANONICAL_SITE_URL),
  splashBackgroundColor: "#eeccff",
  webhookUrl: `${CANONICAL_SITE_URL}/api/webhook`,
  description:
    "Tap GM on Base Mainnet. 3 free GMs per day, earn points for a future airdrop.",
  subtitle: "Daily GM · stack points",
  primaryCategory: "social",
  tags: ["gm", "base", "points", "airdrop", "daily"],
  noindex: true,
} as const;

export function buildFarcasterManifest() {
  return {
    accountAssociation: FARCASTER_ACCOUNT_ASSOCIATION,
    miniapp: MINIAPP_METADATA,
    frame: MINIAPP_METADATA,
  };
}
