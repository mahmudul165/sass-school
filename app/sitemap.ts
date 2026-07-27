import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getTenantByHost } from "@/lib/tenant";
import { cachedContent } from "@/lib/dal";
import type { Notice } from "@/templates/types";

/* সাইটম্যাপ — একটিই ফাইল, কিন্তু প্রতিটি হোস্টে আলাদা উত্তর
   ------------------------------------------------------------------
   কেন একটিই: middleware ফাইল-সদৃশ পথ (এক্সটেনশনযুক্ত) কখনো রিরাইট করে না
   (দ্র. middleware.ts-এর IS_FILE)। তাই demo.amaderschool.com/sitemap.xml
   টেন্যান্ট রুটে যায় না — সরাসরি এখানেই আসে। ফলে হোস্ট দেখে সিদ্ধান্ত
   নেওয়াটাই একমাত্র সঠিক উপায়:

     amaderschool.com/sitemap.xml        → প্ল্যাটফর্মের বিক্রয়-পাতা
     demo-govt.amaderschool.com/…        → ওই প্রতিষ্ঠানের পাতাগুলো
     schoolname.edu.bd/…  (কাস্টম ডোমেইন) → একই, নিজের ডোমেইনে

   force-dynamic কারণ উত্তরটি হোস্ট-নির্ভর — বিল্ড টাইমে একটিমাত্র
   স্ট্যাটিক ফাইল বানিয়ে রাখলে সব প্রতিষ্ঠান একই তালিকা পেত। */
export const dynamic = "force-dynamic";

/** প্রতিটি প্রতিষ্ঠান ঠিক এই পাতাগুলোই পায় (লগইন ও পোর্টাল বাদ — সেগুলো
    প্রমাণীকরণের পিছনে, ইনডেক্স হওয়ার কথা নয়)। */
const TENANT_PATHS: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, freq: "daily" },
  { path: "/notice", priority: 0.9, freq: "daily" },
  { path: "/admission", priority: 0.9, freq: "weekly" },
  { path: "/results", priority: 0.8, freq: "weekly" },
  { path: "/about", priority: 0.7, freq: "monthly" },
  { path: "/teachers", priority: 0.7, freq: "monthly" },
  { path: "/academics", priority: 0.7, freq: "monthly" },
  { path: "/academics/departments", priority: 0.6, freq: "monthly" },
  { path: "/academics/routine", priority: 0.6, freq: "monthly" },
  { path: "/events", priority: 0.6, freq: "weekly" },
  { path: "/gallery", priority: 0.6, freq: "weekly" },
  { path: "/contact", priority: 0.6, freq: "yearly" },
  { path: "/facilities", priority: 0.5, freq: "monthly" },
  { path: "/chairman", priority: 0.4, freq: "yearly" },
  { path: "/principal", priority: 0.4, freq: "yearly" },
  { path: "/club", priority: 0.4, freq: "monthly" },
];

const PLATFORM_PATHS: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, freq: "weekly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const hostHeader = h.get("host") || "";
  const bareHost = hostHeader.split(":")[0];
  const proto =
    h.get("x-forwarded-proto") ||
    (/^(localhost|127\.0\.0\.1)$/.test(bareHost) || bareHost.endsWith(".localhost") ? "http" : "https");
  const origin = `${proto}://${hostHeader}`;
  const now = new Date();

  const tenant = await getTenantByHost(bareHost).catch(() => null);

  /* প্ল্যাটফর্মের নিজের ডোমেইন — অথবা হোস্টটি কোনো প্রতিষ্ঠানের নয়।
     স্থগিত/মেয়াদোত্তীর্ণ প্রতিষ্ঠানও এখানে পড়ে: সেগুলোর পাতা ইনডেক্স
     হওয়া উচিত নয় (layout.tsx-এর robots নিয়মের সাথে মিল রেখে)। */
  if (!tenant || tenant.status !== "active") {
    return PLATFORM_PATHS.map((p) => ({
      url: `${origin}${p.path}`,
      lastModified: now,
      changeFrequency: p.freq,
      priority: p.priority,
    }));
  }

  const pages: MetadataRoute.Sitemap = TENANT_PATHS.map((p) => ({
    url: `${origin}${p.path || "/"}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  /* একেকটি নোটিশের নিজস্ব পাতা আছে (/notice/[id]) — স্থানীয় অনুসন্ধানে
     অভিভাবকেরা ঠিক এগুলোই খোঁজেন ("অমুক স্কুল ভর্তি বিজ্ঞপ্তি")।
     ব্যর্থ হলে সাইটম্যাপ খালি না দিয়ে অন্তত স্থির পাতাগুলো ফেরত যায়। */
  try {
    const notices = await cachedContent(String(tenant._id)).notices(200);
    for (const n of notices as Notice[]) {
      pages.push({
        url: `${origin}/notice/${n._id}`,
        lastModified: n.createdAt ? new Date(n.createdAt) : now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  } catch {
    /* ডেটাবেস অগম্য — স্থির পাতাগুলোই যথেষ্ট, সাইটম্যাপ ভাঙার চেয়ে ভালো */
  }

  return pages;
}
