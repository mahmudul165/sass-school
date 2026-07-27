/* পাসওয়ার্ড হ্যাশিং — Node-এর নিজস্ব scrypt দিয়ে
   ------------------------------------------------------------------
   bcrypt/argon2 প্যাকেজ যোগ করলে নেটিভ বিল্ড লাগে, যা Windows-এ ইনস্টল ও
   Vercel-এ ডেপ্লয় — দুই জায়গাতেই ঝামেলা করে। Node-এর ভেতরেই থাকা scrypt
   পাসওয়ার্ডের জন্য উপযুক্ত (ইচ্ছাকৃতভাবে ধীর ও মেমরি-নির্ভর), তাই বাড়তি
   নির্ভরতা ছাড়াই নিরাপদ।

   সংরক্ষিত রূপ:  scrypt$<salt>$<hash>
   মিলিয়ে দেখা হয় timingSafeEqual দিয়ে — সময় মেপে পাসওয়ার্ড অনুমান করা যায় না। */
import crypto from "crypto";

const KEYLEN = 64;

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, KEYLEN).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored?: string | null) {
  if (!stored) return false;
  const [alg, salt, hash] = String(stored).split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = crypto.scryptSync(password, salt, KEYLEN);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

/** ব্যবহারকারীর নাম — ছোট হাতের অক্ষর, ফাঁকা ছাড়া */
export function normalizeUsername(raw: string) {
  const u = String(raw || "").trim().toLowerCase().replace(/\s+/g, "");
  return /^[a-z0-9._-]{3,32}$/.test(u) ? u : null;
}

/** নতুন প্রতিষ্ঠানের জন্য সহজে বলা যায় এমন পাসওয়ার্ড (সেলস ডেমোতে ফোনে বলে দেওয়া যায়) */
export function suggestPassword() {
  const n = crypto.randomInt(1000, 9999);
  return `school${n}`;
}
