/* ── তারিখ — সার্ভার ও ব্রাউজারে হুবহু এক ──────────────────────────
   আগে এখানে toLocaleDateString("bn-BD", …) ছিল, যার দুটি সমস্যা:

   ১. সময় অঞ্চল বলা ছিল না, তাই তারিখটি যেখানে যে যন্ত্র চালাচ্ছে তার
      অঞ্চল অনুযায়ী হতো। সার্ভার সাধারণত UTC-তে চলে, আর দর্শকের ফোন
      ঢাকায় (UTC+৬)। ২৫ জুলাই রাত ৯টায় (ঢাকা) দেওয়া নোটিশ সার্ভারে
      "২৫ জুলাই", ব্রাউজারে "২৬ জুলাই" — হাইড্রেশন ভেঙে পড়ত, আর
      অভিভাবক ভুল তারিখ দেখতেন।
   ২. "bn-BD" লোকেলের ফল রানটাইমের ICU তথ্যের উপর নির্ভরশীল; সার্ভার ও
      ব্রাউজারে ভিন্ন হতে পারে।

   তাই এখন সময় অঞ্চল স্পষ্টভাবে ঢাকা ধরে অঙ্কগুলো বের করা হয় (en-US
   সংখ্যা সব পরিবেশেই একরকম), আর মাসের নাম ও সংখ্যা নিজেরা বসাই। */
const BN_MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const BN_D = "০১২৩৪৫৬৭৮৯";
const bnNum = (n: number | string) => String(n).replace(/\d/g, (c) => BN_D[Number(c)]);

/** ঢাকার সময় ধরে দিন/মাস/বছর — যে যন্ত্রেই চলুক, ফল একই */
export function dhakaParts(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (!date || Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka", year: "numeric", month: "numeric", day: "numeric",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const y = Number(get("year")), m = Number(get("month")), day = Number(get("day"));
  if (!y || !m || !day) return null;
  return { y, m, d: day };
}

export function bnDate(d: string | Date) {
  const p = dhakaParts(d);
  if (!p) return "";
  return `${bnNum(p.d)} ${BN_MONTHS[p.m - 1]}, ${bnNum(p.y)}`;
}

/** ইংরেজি রূপ — "25 July 2026" */
export function enDate(d: string | Date) {
  const p = dhakaParts(d);
  if (!p) return "";
  return `${p.d} ${EN_MONTHS[p.m - 1]} ${p.y}`;
}

/* বাংলা সংক্ষিপ্ত মাস আলাদা করে লেখা — কেটে নেওয়া যায় না।
   slice() বাংলা যুক্তাক্ষর ভেঙে দেয়: "আগস্ট".slice(0,4) → "আগস্",
   শেষে ঝুলন্ত হসন্ত, যা ভুল বানান। */
const BN_MONTHS_SHORT = ["জানু", "ফেব্রু", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];

/** সংক্ষিপ্ত মাস — ইভেন্ট কার্ডের ছোট ঘরে */
export function monthShort(d: string | Date, lang: "bn" | "en" = "bn") {
  const p = dhakaParts(d);
  if (!p) return "";
  return lang === "en" ? EN_MONTHS[p.m - 1].slice(0, 3) : BN_MONTHS_SHORT[p.m - 1];
}
/* WhatsApp লিংক — "01712345678" → "https://wa.me/8801712345678?text=…"
   এটি lib-এ (কোনো "use client" ফাইলে নয়) রাখার কারণ: হেডার, ফুটার ও ভাসমান
   বোতাম — তিন জায়গাতেই লাগে, যার দুটি সার্ভার কম্পোনেন্ট। "use client" ফাইল
   থেকে সাধারণ ফাংশন রপ্তানি করলে Next সেটিকে ক্লায়েন্ট রেফারেন্স বানায়,
   ফলে সার্ভারে ডাকলে রানটাইমে ভেঙে পড়ে। */
export function waLink(num: string, text?: string) {
  const digits = String(num).replace(/[^0-9]/g, "");
  const intl = digits.startsWith("880") ? digits : "88" + digits.replace(/^0?/, "0");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${intl}${q}`;
}

/** "০১৭…", "+8801712345678", "01712-345678" → "01712345678"; ভুল হলে null */
export function normalizePhone(raw: string) {
  let p = String(raw || "").replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))).replace(/[^0-9]/g, "");
  if (p.startsWith("880")) p = p.slice(3);
  if (p.startsWith("0")) p = p.slice(1);
  if (!/^1[0-9]{9}$/.test(p)) return null;
  return "0" + p;
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
