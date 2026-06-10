import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const screenshotsDir = path.join(root, "scripts", "screenshots");
const publicDir = path.join(root, "public");

const WIDTH = 1284;
const HEIGHT = 2778;

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "google-chrome",
  "chromium",
];

async function pickChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await execFileAsync(candidate, ["--version"]);
      return candidate;
    } catch {
      /* next */
    }
  }
  throw new Error("Install Google Chrome for screenshot generation");
}

async function screenshotHtml(chrome, htmlFile, outputFile) {
  const fileUrl = `file://${htmlFile}`;
  await execFileAsync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${outputFile}`,
    fileUrl,
  ]);
}

const outputs = [
  {
    html: path.join(screenshotsDir, "gm.html"),
    file: path.join(publicDir, "screenshot-1284x2778-1.png"),
  },
  {
    html: path.join(screenshotsDir, "deploy.html"),
    file: path.join(publicDir, "screenshot-1284x2778-2.png"),
  },
];

const chrome = await pickChrome();

for (const { html, file } of outputs) {
  await screenshotHtml(chrome, html, file);

  const meta = await sharp(file).metadata();
  if (meta.width !== WIDTH || meta.height !== HEIGHT) {
    await sharp(file).resize(WIDTH, HEIGHT, { fit: "fill" }).png().toFile(file);
  }

  const { width, height } = await sharp(file).metadata();
  const sizeKb = (await sharp(file).toBuffer()).length / 1024;
  console.log(`${path.basename(file)}: ${width}x${height} (${sizeKb.toFixed(1)} KB)`);
}

await sharp(outputs[0].file).toFile(path.join(publicDir, "screenshot.png"));

console.log("Screenshots written to public/");
