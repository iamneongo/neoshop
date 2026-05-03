import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { siClaude, siGooglegemini, siMastercard, siVisa, siZalo } from "simple-icons";

const outDir = path.join(process.cwd(), "public", "assets");
const appDir = path.join(process.cwd(), "src", "app");
await mkdir(outDir, { recursive: true });
await mkdir(appDir, { recursive: true });

const blue = "#0f6fff";
const ink = "#0f172a";
const openAIPath =
  "M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z";
const grokPath =
  "M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815";

async function png(name, svg, width, height) {
  await sharp(Buffer.from(svg))
    .resize(width, height, { fit: "contain" })
    .png()
    .toFile(path.join(outDir, name));
}

async function appPng(name, source, width, height) {
  await sharp(Buffer.from(source))
    .resize(width, height, { fit: "contain" })
    .png()
    .toFile(path.join(appDir, name));
}

function svg(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <filter id="softShadow" x="-60%" y="-60%" width="220%" height="220%">
        <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="#0f4fb8" flood-opacity=".18"/>
      </filter>
      <filter id="tileShadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#24416f" flood-opacity=".16"/>
      </filter>
      <linearGradient id="bagGrad" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#42a5ff"/>
        <stop offset=".58" stop-color="#126cff"/>
        <stop offset="1" stop-color="#2545d8"/>
      </linearGradient>
      <linearGradient id="geminiGrad" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#7dc8ff"/>
        <stop offset=".5" stop-color="#326dff"/>
        <stop offset="1" stop-color="#8d4cff"/>
      </linearGradient>
    </defs>${body}</svg>`;
}

function brandBagSvg(width = 256, height = 256) {
  return svg(width, height, `<rect x="${width * 0.172}" y="${height * 0.242}" width="${width * 0.656}" height="${height * 0.602}" rx="${width * 0.133}" fill="url(#bagGrad)" filter="url(#softShadow)"/>
    <path d="M${width * 0.309} ${height * 0.32}c0-${height * 0.125} ${width * 0.078}-${height * 0.211} ${width * 0.191}-${height * 0.211}s${width * 0.191} ${height * 0.086} ${width * 0.191} ${height * 0.211}" fill="none" stroke="#7ec2ff" stroke-width="${width * 0.059}" stroke-linecap="round"/>
    <text x="${width / 2}" y="${height * 0.66}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${width * 0.41}" font-weight="900" font-style="italic" fill="#fff">N</text>`);
}

function qrPattern() {
  const size = 240;
  const modules = 29;
  const cell = 7;
  const offset = 18;
  const dots = [];
  const finder = (x, y) => `<rect x="${offset + x * cell}" y="${offset + y * cell}" width="${cell * 7}" height="${cell * 7}" rx="6" fill="${ink}"/>
    <rect x="${offset + (x + 1) * cell}" y="${offset + (y + 1) * cell}" width="${cell * 5}" height="${cell * 5}" rx="3" fill="#fff"/>
    <rect x="${offset + (x + 2) * cell}" y="${offset + (y + 2) * cell}" width="${cell * 3}" height="${cell * 3}" rx="2" fill="${blue}"/>`;

  for (let y = 0; y < modules; y += 1) {
    for (let x = 0; x < modules; x += 1) {
      const inFinder =
        (x < 8 && y < 8) ||
        (x > 20 && y < 8) ||
        (x < 8 && y > 20);
      if (inFinder) continue;
      const active = (x * 11 + y * 7 + x * y + 19) % 5 < 2 || (x + y) % 11 === 0;
      if (active) {
        dots.push(`<rect x="${offset + x * cell}" y="${offset + y * cell}" width="5" height="5" rx="1.4" fill="${(x + y) % 3 === 0 ? blue : ink}"/>`);
      }
    }
  }

  return svg(size, size, `<rect width="${size}" height="${size}" rx="28" fill="#fff"/>
    <rect x="6" y="6" width="${size - 12}" height="${size - 12}" rx="24" fill="none" stroke="#dbe8fb" stroke-width="2"/>
    ${finder(0, 0)}
    ${finder(22, 0)}
    ${finder(0, 22)}
    ${dots.join("")}
    <rect x="96" y="96" width="48" height="48" rx="14" fill="url(#bagGrad)"/>
    <text x="120" y="131" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="900" font-style="italic" fill="#fff">N</text>`);
}

function brandPath(pathData, fill, size = 160, scale = 5.2) {
  const tx = (size - 24 * scale) / 2;
  return svg(size, size, `<g transform="translate(${tx} ${tx}) scale(${scale})" fill="${fill}"><path d="${pathData}"/></g>`);
}

await png("icon-chatgpt.png", brandPath(openAIPath, "#10A37F"), 160, 160);
await png("product-chatgpt.png", brandPath(openAIPath, "#10A37F", 260, 8.1), 260, 260);
await png("icon-gemini.png", brandPath(siGooglegemini.path, "#4285F4"), 160, 160);
await png("icon-claude.png", brandPath(siClaude.path, "#D97757"), 160, 160);
await png("icon-grok.png", brandPath(grokPath, "#111827"), 160, 160);
await png(
  "icon-outlook.png",
  svg(160, 160, `<g filter="url(#tileShadow)">
    <rect x="28" y="44" width="80" height="70" rx="12" fill="#0F6FFF"/>
    <rect x="58" y="54" width="74" height="58" rx="10" fill="#198CFF"/>
    <path d="M58 60l37 30 37-30" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="68" y="93" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#fff">O</text>
  </g>`),
  160,
  160
);
await png(
  "icon-2fa.png",
  svg(160, 160, `<path d="M80 16l58 24v43c0 38-23 61-58 77-35-16-58-39-58-77V40l58-24z" fill="${blue}" filter="url(#tileShadow)"/>
    <text x="80" y="96" text-anchor="middle" font-family="Arial, sans-serif" font-size="41" font-weight="900" fill="#fff">2FA</text>`),
  160,
  160
);
await png(
  "icon-account.png",
  svg(160, 160, `<path d="M80 16l58 24v43c0 38-23 61-58 77-35-16-58-39-58-77V40l58-24z" fill="${blue}" filter="url(#tileShadow)"/>
    <circle cx="80" cy="68" r="20" fill="#fff"/>
    <path d="M42 124c6-26 23-39 38-39s32 13 38 39" fill="#fff"/>`),
  160,
  160
);
await png(
  "icon-tools.png",
  svg(160, 160, `<g fill="none" stroke="${blue}" stroke-width="10" stroke-linecap="round" filter="url(#tileShadow)">
    <path d="M80 30v26M80 104v26M30 80h26M104 80h26M45 45l18 18M97 97l18 18M115 45L97 63M63 97l-18 18"/>
    <circle cx="80" cy="80" r="21" fill="${blue}" stroke="none"/>
  </g>`),
  160,
  160
);
await png("brand-bag.png", brandBagSvg(), 256, 256);
await png(
  "hero-ai-shop.png",
  svg(760, 570, `<ellipse cx="380" cy="438" rx="210" ry="34" fill="#0F6FFF" opacity=".08"/>
    <ellipse cx="380" cy="405" rx="160" ry="42" fill="#EAF4FF"/>
    <ellipse cx="380" cy="396" rx="135" ry="28" fill="#fff"/>
    <g transform="translate(278 122) scale(1.05)">
      <rect x="44" y="62" width="168" height="154" rx="34" fill="url(#bagGrad)" filter="url(#softShadow)"/>
      <path d="M79 82c0-32 20-54 49-54s49 22 49 54" fill="none" stroke="#7ec2ff" stroke-width="15" stroke-linecap="round"/>
      <text x="128" y="169" text-anchor="middle" font-family="Arial, sans-serif" font-size="105" font-weight="900" font-style="italic" fill="#fff">N</text>
    </g>
    <g transform="translate(186 156) rotate(-10)" filter="url(#tileShadow)"><rect width="74" height="74" rx="18" fill="#E9FFF7"/><g transform="translate(14 14) scale(1.9)" fill="#10A37F"><path d="${openAIPath}"/></g></g>
    <g transform="translate(523 141) rotate(12)" filter="url(#tileShadow)"><rect width="76" height="76" rx="18" fill="#FFF4EC"/><g transform="translate(14 14) scale(2)" fill="#D97757"><path d="${siClaude.path}"/></g></g>
    <g transform="translate(552 262) rotate(10)" filter="url(#tileShadow)"><rect width="76" height="76" rx="18" fill="#F1F4FF"/><g transform="translate(14 14) scale(2)" fill="#111827"><path d="${grokPath}"/></g></g>
    <g transform="translate(158 296) rotate(-13)" filter="url(#tileShadow)"><rect width="76" height="76" rx="18" fill="#FFFFFF"/><g transform="translate(14 14) scale(2)" fill="#4285F4"><path d="${siGooglegemini.path}"/></g></g>
    <g transform="translate(568 221) rotate(9)" filter="url(#tileShadow)"><rect width="76" height="76" rx="18" fill="#7C4DFF"/><text x="38" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="#fff">AI</text></g>`),
  760,
  570
);
await png(
  "payment-strip.png",
  svg(520, 78, `<g transform="translate(4 14)">
    <rect width="46" height="46" rx="12" fill="#D82C8B"/><text x="23" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="900" fill="#fff">mo</text>
    <g transform="translate(73 9) scale(1.18)" fill="#0068FF"><path d="${siZalo.path}"/></g>
    <path d="M214 24l22-17 22 17-22 17z" fill="#E51B23"/><text x="266" y="32" font-family="Arial" font-size="23" font-weight="900" fill="#1D5BBB">VNPAY</text>
    <g transform="translate(366 11) scale(1.45)" fill="#1434CB"><path d="${siVisa.path}"/></g>
    <g transform="translate(456 9) scale(1.35)" fill="#EB001B"><path d="${siMastercard.path}"/></g>
  </g>`),
  520,
  78
);
await png(
  "payment-momo.png",
  svg(84, 84, `<rect x="4" y="4" width="76" height="76" rx="18" fill="#D82C8B"/>
    <text x="42" y="35" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#fff">mo</text>
    <text x="42" y="58" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#fff">mo</text>`),
  84,
  84
);
await png(
  "payment-zalopay.png",
  svg(190, 84, `<text x="6" y="55" font-family="Arial, sans-serif" font-size="43" font-weight="800" fill="#0A75FF">ZaloPay</text>`),
  190,
  84
);
await png(
  "payment-vnpay.png",
  svg(250, 84, `<path d="M8 42l38-30 38 30-38 30z" fill="#E51B23"/>
    <path d="M48 12l38 30-38 30 16-30z" fill="#1D5BBB" opacity=".9"/>
    <text x="96" y="55" font-family="Arial, sans-serif" font-size="39" font-weight="900" fill="#1D5BBB">VNPAY</text>`),
  250,
  84
);
await png(
  "payment-visa.png",
  svg(138, 84, `<text x="7" y="56" font-family="Arial Black, Arial, sans-serif" font-size="43" font-weight="900" font-style="italic" fill="#1434CB">VISA</text>`),
  138,
  84
);
await png(
  "payment-mastercard.png",
  svg(120, 84, `<circle cx="44" cy="42" r="28" fill="#EB001B"/>
    <circle cx="76" cy="42" r="28" fill="#F79E1B" opacity=".94"/>
    <path d="M60 20a28 28 0 010 44 28 28 0 010-44z" fill="#FF5F00" opacity=".96"/>`),
  120,
  84
);

await png("payment-qr.png", qrPattern(), 240, 240);

await appPng("icon.png", brandBagSvg(), 512, 512);
await appPng("apple-icon.png", brandBagSvg(), 180, 180);
await appPng(
  "opengraph-image.png",
  svg(1200, 630, `<rect width="1200" height="630" fill="#f6faff"/>
    <circle cx="930" cy="160" r="220" fill="#e8f2ff"/>
    <circle cx="1020" cy="430" r="160" fill="#eef7ff"/>
    <g transform="translate(760 166) scale(1.18)">${brandBagSvg().match(/<defs>[\s\S]*<\/defs>([\s\S]*)<\/svg>/)?.[1] ?? ""}</g>
    <text x="96" y="170" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="${blue}">NeoShop</text>
    <text x="96" y="270" font-family="Arial, sans-serif" font-size="78" font-weight="900" fill="${ink}">Tài khoản AI</text>
    <text x="96" y="356" font-family="Arial, sans-serif" font-size="78" font-weight="900" fill="${ink}">chính hãng</text>
    <text x="96" y="430" font-family="Arial, sans-serif" font-size="31" font-weight="700" fill="#52627b">ChatGPT, Gemini, Claude, Grok và dịch vụ AI uy tín.</text>
    <rect x="96" y="488" width="250" height="58" rx="16" fill="${blue}"/>
    <text x="221" y="526" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" font-weight="900" fill="#fff">Mua ngay</text>`),
  1200,
  630
);
await appPng(
  "twitter-image.png",
  svg(1200, 630, `<rect width="1200" height="630" fill="#ffffff"/>
    <circle cx="920" cy="320" r="250" fill="#edf5ff"/>
    <g transform="translate(760 166) scale(1.18)">${brandBagSvg().match(/<defs>[\s\S]*<\/defs>([\s\S]*)<\/svg>/)?.[1] ?? ""}</g>
    <text x="96" y="180" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="${blue}">NeoShop</text>
    <text x="96" y="292" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${ink}">Shop tài khoản AI</text>
    <text x="96" y="380" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${ink}">uy tín, giao nhanh</text>
    <text x="96" y="464" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#52627b">Chính hãng - Bảo hành - Hỗ trợ 24/7</text>`),
  1200,
  630
);
await writeFile(
  path.join(process.cwd(), "public", "favicon.svg"),
  brandBagSvg(64, 64),
  "utf8"
);

console.log("Generated transparent NeoShop PNG assets");
