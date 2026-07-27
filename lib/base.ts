/* টেন্যান্ট সাইটের ভিত্তি-পথ (base path)
   ------------------------------------------------------------------
   প্রতিষ্ঠানের সাইটে পৌঁছানোর দুটি পথ আছে:

   ১. সাবডোমেইন — demo-govt.amaderschool.com/about
      এখানে পুরো হোস্টটাই প্রতিষ্ঠানের, তাই ভিতরের লিংক "/about" লিখলেই চলে।
      ভিত্তি-পথ ফাঁকা ("")।

   ২. পথ — localhost:3000/demo-govt/about
      উন্নয়নে ও Vercel-এর প্রিভিউ ঠিকানায় (*.vercel.app) ইচ্ছেমতো সাবডোমেইনের
      DNS নেই, তাই প্রতিষ্ঠানকে চেনানো হয় পথের প্রথম অংশ দিয়ে। তখন ভিতরের
      সব লিংকের আগে "/demo-govt" বসাতে হয়, নইলে "/about" ক্লিক করলে
      মূল ডোমেইনের /about-এ চলে যেত।

   middleware রিরাইট করার সময় x-tenant-base হেডারে ভিত্তি-পথটি বসিয়ে দেয়;
   এখানে শুধু পড়া হয়। cache() থাকায় এক রিকোয়েস্টে একবারই পড়া হয়। */
import { headers } from "next/headers";
import { cache } from "react";

export const tenantBase = cache(async (): Promise<string> => {
  try {
    return (await headers()).get("x-tenant-base") || "";
  } catch {
    /* headers() কোনো কারণে না পাওয়া গেলে সাবডোমেইন ধরে নেওয়াই নিরাপদ */
    return "";
  }
});

/** ভিত্তি-পথ যোগ করা। বাইরের ঠিকানা (tel:, mailto:, https:) ও
    ইতিমধ্যে যুক্ত পথ অক্ষত থাকে — দুবার বসে যাওয়ার ঝুঁকি নেই। */
export function withBase(base: string, href: string): string {
  if (!base || !href.startsWith("/")) return href;
  if (href === base || href.startsWith(`${base}/`) || href.startsWith(`${base}?`) || href.startsWith(`${base}#`)) return href;
  return `${base}${href}`;
}
