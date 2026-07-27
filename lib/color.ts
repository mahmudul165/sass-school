/* ব্র্যান্ড কালার ইঞ্জিন
   tenant.theme-তে থাকে মাত্র দুটি হেক্স (primary + secondary)। প্রিমিয়াম ডিজাইনের জন্য
   দরকার পূর্ণ স্কেল — tint, shade, ring, glass, gradient stop। সেটা এখানে সার্ভারেই
   হিসাব করে CSS variable হিসেবে পাঠানো হয়।

   কেন JS-এ, CSS color-mix() নয়?  বাংলাদেশের বড় অংশ ব্যবহারকারী পুরোনো Android
   WebView / Chrome ব্যবহার করেন যেখানে color-mix() নেই — রঙ ভেঙে গেলে গোটা সাইট
   সস্তা দেখাবে। সার্ভারে হিসাব করলে আউটপুট নিরেট hex, সব ডিভাইসে অভিন্ন, রানটাইম খরচ শূন্য। */

export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };

const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));

export function hexToRgb(hex: string): Rgb {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) h = "172b4d"; // ভুল ইনপুটে নিরাপদ ফলব্যাক
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: Rgb) {
  const to = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === R) h = ((G - B) / d + (G < B ? 6 : 0));
  else if (max === G) h = (B - R) / d + 2;
  else h = (R - G) / d + 4;
  return { h: h * 60, s, l };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const H = ((h % 360) + 360) % 360 / 360;
  if (s === 0) { const v = l * 255; return { r: v, g: v, b: v }; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    let T = t; if (T < 0) T += 1; if (T > 1) T -= 1;
    if (T < 1 / 6) return p + (q - p) * 6 * T;
    if (T < 1 / 2) return q;
    if (T < 2 / 3) return p + (q - p) * (2 / 3 - T) * 6;
    return p;
  };
  return { r: hue(H + 1 / 3) * 255, g: hue(H) * 255, b: hue(H - 1 / 3) * 255 };
}

export const hexToHsl = (hex: string) => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl: Hsl) => rgbToHex(hslToRgb(hsl));

/** আপেক্ষিক উজ্জ্বলতা — WCAG 2.1 */
export function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const ch = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/** দুই রঙের কনট্রাস্ট রেশিও (১–২১) */
export function contrast(a: string, b: string) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** ব্যাকগ্রাউন্ডের উপর পড়ার মতো টেক্সট রঙ — AA নিশ্চিত করে */
export function readableOn(bg: string, light = "#ffffff", dark = "#0b1220") {
  return contrast(bg, light) >= contrast(bg, dark) ? light : dark;
}

export const mix = (a: string, b: string, amount: number) => {
  const A = hexToRgb(a), B = hexToRgb(b), t = clamp(amount);
  return rgbToHex({ r: A.r + (B.r - A.r) * t, g: A.g + (B.g - A.g) * t, b: A.b + (B.b - A.b) * t });
};
export const tint = (hex: string, amount: number) => mix(hex, "#ffffff", amount);
export const shade = (hex: string, amount: number) => mix(hex, "#0a0f1a", amount);

/** স্বরবৃত্ত স্কেল — Tailwind-ধাঁচের ৫০…৯৫০ */
export function scale(hex: string): Record<string, string> {
  const steps: [string, number][] = [
    ["50", 0.95], ["100", 0.88], ["200", 0.75], ["300", 0.6], ["400", 0.38], ["500", 0.16],
  ];
  const out: Record<string, string> = {};
  for (const [k, amt] of steps) out[k] = tint(hex, amt);
  out["600"] = hex;
  out["700"] = shade(hex, 0.16);
  out["800"] = shade(hex, 0.32);
  out["900"] = shade(hex, 0.48);
  out["950"] = shade(hex, 0.66);
  return out;
}

export type Palette = ReturnType<typeof buildPalette>;

/**
 * টেন্যান্টের দুটি ব্র্যান্ড রঙ থেকে সম্পূর্ণ ডিজাইন-টোকেন সেট।
 * প্রতিটি টেমপ্লেট এই একই টোকেনগুলোই ব্যবহার করে — তাই টেমপ্লেটে হার্ডকোডেড রঙ থাকে না,
 * আর প্রতিটি স্কুলের সাইট সত্যিকারের "কাস্টম" দেখায়।
 */
export function buildPalette(primary: string, secondary: string, opts?: { neutralTintStrength?: number }) {
  const p = scale(primary);
  const s = scale(secondary);
  const nt = opts?.neutralTintStrength ?? 0.04;
  // ব্র্যান্ড-ঘেঁষা নিউট্রাল — ধূসর একদম নিরপেক্ষ না রেখে সামান্য ব্র্যান্ড আভা দিলে
  // পুরো পেজ একটি পরিবারের মনে হয় (প্রিমিয়াম সাইটের সাধারণ কৌশল)।
  const neutral = {
    "0": "#ffffff",
    "50": mix("#f8fafc", primary, nt),
    "100": mix("#f1f5f9", primary, nt),
    "200": mix("#e2e8f0", primary, nt),
    "300": mix("#cbd5e1", primary, nt),
    "400": mix("#94a3b8", primary, nt),
    "500": mix("#64748b", primary, nt),
    "600": mix("#475569", primary, nt),
    "700": mix("#334155", primary, nt),
    "800": mix("#1e293b", primary, nt),
    "900": mix("#0f172a", primary, nt),
  };
  return {
    primary: p, secondary: s, neutral,
    onPrimary: readableOn(primary),
    onSecondary: readableOn(secondary),
    /** হিরো গ্রেডিয়েন্টের জন্য নিরাপদ গাঢ় প্রান্ত */
    heroFrom: shade(primary, 0.28),
    heroTo: mix(shade(primary, 0.05), secondary, 0.28),
  };
}

/** পালেট → inline CSS variable object (সার্ভার কম্পোনেন্টে style={} হিসেবে বসে) */
export function paletteVars(primary: string, secondary: string): React.CSSProperties {
  const t = buildPalette(primary, secondary);
  const vars: Record<string, string> = {
    "--brand": t.primary["600"], "--brand-on": t.onPrimary,
    "--accent": t.secondary["600"], "--accent-on": t.onSecondary,
    "--hero-from": t.heroFrom, "--hero-to": t.heroTo,
  };
  for (const [k, v] of Object.entries(t.primary)) vars[`--brand-${k}`] = v;
  for (const [k, v] of Object.entries(t.secondary)) vars[`--accent-${k}`] = v;
  for (const [k, v] of Object.entries(t.neutral)) vars[`--n-${k}`] = v;
  return vars as React.CSSProperties;
}
