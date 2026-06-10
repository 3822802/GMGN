import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const sourceCandidates = [
  path.join(publicDir, "logo.png"),
  path.join(publicDir, "icon.svg"),
];

async function pickSource() {
  for (const candidate of sourceCandidates) {
    try {
      await sharp(candidate).metadata();
      return candidate;
    } catch {
      /* next */
    }
  }
  throw new Error("Add public/logo.png or public/icon.svg first");
}

async function writePng(buffer, filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await sharp(buffer).png().toFile(filePath);
}

const source = await pickSource();
const base = await sharp(source).resize(1024, 1024, { fit: "contain" }).png().toBuffer();

await writePng(base, path.join(publicDir, "logo.png"));
await writePng(await sharp(base).resize(512, 512).toBuffer(), path.join(publicDir, "logo-512.png"));
await writePng(await sharp(base).resize(192, 192).toBuffer(), path.join(publicDir, "logo-192.png"));
await writePng(await sharp(base).resize(191, 191).toBuffer(), path.join(publicDir, "thumbnail-191.png"));
await writePng(await sharp(base).resize(512, 512).toBuffer(), path.join(publicDir, "logo-splash.png"));
await writePng(await sharp(base).resize(180, 180).toBuffer(), path.join(publicDir, "apple-touch-icon.png"));

// Farcaster / Base mini app assets
await writePng(await sharp(base).resize(512, 512).toBuffer(), path.join(publicDir, "icon.png"));
await writePng(await sharp(base).resize(512, 512).toBuffer(), path.join(publicDir, "splash.png"));
console.log("Icons written to public/");
console.log("Run: npm run thumbnail");
