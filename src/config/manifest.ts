import {
  CANONICAL_SITE_URL,
  getAppHeroUrl,
  getAppIconUrl,
  getAppImageUrl,
  getAppSplashUrl,
} from "@/config/appAssets";

/** Add accountAssociation after Farcaster domain verification */
export const FARCASTER_ACCOUNT_ASSOCIATION = {
  header: "",
  payload: "",
  signature: "",
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
  splashBackgroundColor: "#050508",
  webhookUrl: `${CANONICAL_SITE_URL}/api/webhook`,
  description:
    "Tap GM on Base Mainnet. 3 free GMs per day, earn points for a future airdrop.",
  subtitle: "Daily GM · stack points",
  primaryCategory: "social",
  tags: ["gm", "base", "points", "airdrop", "daily"],
  noindex: true,
} as const;

export function buildFarcasterManifest() {
  const manifest: Record<string, unknown> = {
    miniapp: MINIAPP_METADATA,
    frame: MINIAPP_METADATA,
  };

  const { header, payload, signature } = FARCASTER_ACCOUNT_ASSOCIATION;
  if (header && payload && signature) {
    manifest.accountAssociation = FARCASTER_ACCOUNT_ASSOCIATION;
  }

  return manifest;
}
