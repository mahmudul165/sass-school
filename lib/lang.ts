/* সাইটের ভাষা নির্ধারণ
   ------------------------------------------------------------------
   দুই স্তর:
   ১. প্রতিষ্ঠান অ্যাডমিন প্যানেল থেকে ডিফল্ট ভাষা ঠিক করেন (tenant.language)
   ২. দর্শক হেডারের বোতাম দিয়ে নিজের পছন্দে বদলাতে পারেন (কুকি)

   কুকি থাকলে সেটিই জেতে — কারণ যিনি নিজে "English" চেপেছেন, তাঁকে পরের পেজে
   আবার বাংলায় ফিরিয়ে দেওয়া বিরক্তিকর। কোনোটাই না থাকলে বাংলা, কারণ
   বাংলাদেশের প্রায় সব অভিভাবকের কাছে সেটিই স্বাভাবিক ভাষা। */
import { cookies } from "next/headers";
import type { Lang } from "./i18n";

export const LANG_COOKIE = "site-lang";

export async function resolveLang(tenantDefault?: string): Promise<Lang> {
  const c = await cookies();
  const chosen = c.get(LANG_COOKIE)?.value;
  if (chosen === "bn" || chosen === "en") return chosen;
  return tenantDefault === "en" ? "en" : "bn";
}
