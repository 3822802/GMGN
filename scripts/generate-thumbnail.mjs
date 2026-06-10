import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

/** Farcaster / Base app thumbnail — 1.91:1, max 1 MB */
const WIDTH = 1200;
const HEIGHT = Math.round(WIDTH / 1.91);

function buildBackgroundSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050508"/>
      <stop offset="55%" stop-color="#0c0c14"/>
      <stop offset="100%" stop-color="#12081f"/>
    </linearGradient>
    <radialGradient id="glowCyan" cx="18%" cy="35%" r="45%">
      <stop offset="0%" stop-color="#00f5ff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#00f5ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowMagenta" cx="88%" cy="78%" r="40%">
      <stop offset="0%" stop-color="#ff00aa" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ff00aa" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f5ff"/>
      <stop offset="50%" stop-color="#ff00aa"/>
      <stop offset="100%" stop-color="#fcee0a"/>
    </linearGradient>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowCyan)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowMagenta)"/>
  <g stroke="#00f5ff" stroke-opacity="0.06" stroke-width="1">
    ${Array.from({ length: Math.ceil(WIDTH / 48) }, (_, i) => `<line x1="${i * 48}" y1="0" x2="${i * 48}" y2="${HEIGHT}"/>`).join("")}
    ${Array.from({ length: Math.ceil(HEIGHT / 48) }, (_, i) => `<line x1="0" y1="${i * 48}" x2="${WIDTH}" y2="${i * 48}"/>`).join("")}
  </g>
  <rect x="48" y="48" width="${WIDTH - 96}" height="${HEIGHT - 96}" fill="none" stroke="#00f5ff" stroke-opacity="0.35" stroke-width="2"/>
  <text x="430" y="290" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="108" font-weight="800" fill="url(#neon)" filter="url(#textGlow)">GMGN</text>
  <text x="430" y="360" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="36" font-weight="600" fill="#e8f4ff" opacity="0.92">Daily GM on Base</text>
  <text x="430" y="410" font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size="28" font-weight="500" fill="#6b7a99">Tap GM · stack points · airdrop</text>
  <circle cx="1080" cy="120" r="6" fill="#00f5ff" opacity="0.8"/>
  <circle cx="1110" cy="120" r="6" fill="#ff00aa" opacity="0.8"/>
  <circle cx="1140" cy="120" r="6" fill="#fcee0a" opacity="0.8"/>
</svg>`);
}

async function pickLogoSource() {
  for (const name of ["logo-512.png", "logo.png", "icon.png"]) {
    const candidate = path.join(publicDir, name);
    try {
      await sharp(candidate).metadata();
      return candidate;
    } catch {
      /* next */
    }
  }
  return path.join(publicDir, "icon.svg");
}

const logoSource = await pickLogoSource();
const logo = await sharp(logoSource)
  .resize(260, 260, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const background = await sharp(buildBackgroundSvg()).png().toBuffer();

const thumbnail = await sharp(background)
  .composite([{ input: logo, left: 110, top: Math.round((HEIGHT - 260) / 2) }])
  .png({ compressionLevel: 9, palette: false })
  .toBuffer();

const thumbnailPath = path.join(publicDir, "thumbnail.png");
const imagePath = path.join(publicDir, "image.png");

await sharp(thumbnail).toFile(thumbnailPath);
await sharp(thumbnail).toFile(imagePath);

const { width, height, size } = await sharp(thumbnail).metadata();
const fileSize = (await sharp(thumbnail).toBuffer()).length;

console.log(`thumbnail.png: ${width}x${height} (${(fileSize / 1024).toFixed(1)} KB)`);
if (fileSize > 1024 * 1024) {
  throw new Error("Thumbnail exceeds 1 MB limit");
}
