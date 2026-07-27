import official, { VARIANTS } from "./official";
import type { Template } from "./types";
import type { InstitutionType } from "@/lib/db";

/* পুরো প্ল্যাটফর্মে টেমপ্লেট দুটি:
     school   — স্কুল, কলেজ, কিন্ডারগার্টেন, ইংলিশ মিডিয়াম, কোচিং
     madrasah — মাদরাসা ও ইসলামিক প্রতিষ্ঠান
   দুটিই বাংলা ও ইংরেজি — ভাষা টেমপ্লেটের অংশ নয়, প্রতিষ্ঠানের সেটিং। */
export const templates: Record<string, Template> = official;

/** পুরোনো কী → নতুন দুটির একটিতে, যাতে আগের কোনো সাইট না ভাঙে */
const ALIASES: Record<string, string> = {
  official_govt: "school",
  official_bangla: "school",
  official_bangla_en: "school",
  official_english: "school",
  official_madrasah: "madrasah",
  traditional: "school",
  modern: "school",
  classic: "school",
  kids: "school",
  islamic: "madrasah",
};

export function getTemplate(key: string): Template {
  return templates[key] || templates[ALIASES[key]] || templates.school;
}

/** সুপার ও অ্যাডমিন প্যানেলে টেমপ্লেট নির্বাচনের তালিকা */
export const templateOptions = VARIANTS.map((v) => ({
  key: v.key, ...v.defaults, label: v.label, blurb: v.blurb,
}));

/** প্রতিষ্ঠানের ধরন অনুযায়ী ডিফল্ট টেমপ্লেট */
export function suggestTemplate(type: InstitutionType): string {
  return type === "madrasah" ? "madrasah" : "school";
}
