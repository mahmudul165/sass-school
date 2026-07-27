/* অ্যাডমিন অনুমতি
   ------------------------------------------------------------------
   একটি প্রতিষ্ঠানে সাধারণত একাধিক মানুষ কাজ করেন — কেউ শুধু নোটিশ দেন,
   কেউ ফলাফল তোলেন, আর প্রধান শিক্ষক সব দেখেন। সবাইকে সব ক্ষমতা দিলে
   ভুলবশত থিম বা ডোমেইন বদলে যাওয়ার ঝুঁকি থাকে, তাই ফিচারভিত্তিক অনুমতি।

   পুরোনো অ্যাকাউন্টে permissions ফিল্ডই নেই — তাদের সব অনুমতি ধরা হয়,
   নইলে আপগ্রেডের দিনই সব প্রতিষ্ঠান নিজের প্যানেল থেকে ছিটকে যেত। */

export const FEATURES = [
  { key: "settings", label: "সেটিংস ও ডিজাইন", icon: "🏫", desc: "নাম, ছবি, রং, টেমপ্লেট, ভাষা, যোগাযোগ ও বাণী" },
  { key: "content", label: "একাডেমিক তথ্য", icon: "📚", desc: "বিভাগ, রুটিন, ক্লাব ও ফলাফলের চার্ট" },
  { key: "notices", label: "নোটিশ", icon: "📢", desc: "নোটিশ প্রকাশ ও মুছে ফেলা" },
  { key: "teachers", label: "শিক্ষক", icon: "👩‍🏫", desc: "শিক্ষক তালিকা হালনাগাদ" },
  { key: "results", label: "ফলাফল", icon: "🏆", desc: "পরীক্ষার ফল প্রকাশ" },
  { key: "gallery", label: "গ্যালারি", icon: "🖼️", desc: "ছবির অ্যালবাম যোগ ও মুছে ফেলা" },
  { key: "inquiries", label: "ভর্তি আবেদন", icon: "📬", desc: "আবেদনকারীদের তালিকা ও অবস্থা" },
] as const;

export type Feature = (typeof FEATURES)[number]["key"];
export const ALL_FEATURES: Feature[] = FEATURES.map((f) => f.key);

/** অনুমতি আছে কি না। তালিকা ফাঁকা/অনুপস্থিত মানে "সব অনুমতি" (পুরোনো অ্যাকাউন্ট)। */
export function can(permissions: string[] | undefined | null, feature: Feature) {
  if (!permissions || permissions.length === 0) return true;
  return permissions.includes(feature);
}

/** ফর্ম থেকে আসা অনুমতি — অজানা কী বাদ, কিছুই না দিলে সব */
export function parsePermissions(raw: FormDataEntryValue[] | string[]): Feature[] {
  const picked = raw.map(String).filter((k): k is Feature => (ALL_FEATURES as string[]).includes(k));
  return picked.length ? picked : [...ALL_FEATURES];
}
