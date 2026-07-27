import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getTenantByHost } from "@/lib/tenant";

/* robots.txt — সাইটম্যাপের মতোই হোস্ট-নির্ভর
   ------------------------------------------------------------------
   middleware-এর matcher ইতিমধ্যেই robots.txt বাদ রাখে, তাই প্রতিটি
   হোস্টের অনুরোধ সরাসরি এখানে আসে।

   গুরুত্বপূর্ণ: স্থগিত (suspended) বা মুছে ফেলা প্রতিষ্ঠানের সাইট যেন
   কখনো ইনডেক্স না হয় — নবায়ন না হওয়া প্রতিষ্ঠানের পাতা Google-এ থেকে
   গেলে অভিভাবক পুরোনো তথ্য দেখতেন। s/[domain]/layout.tsx-এর
   generateMetadata একই নিয়ম মানে; দুটি জায়গা একমত রাখা হয়েছে। */
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const hostHeader = h.get("host") || "";
  const bareHost = hostHeader.split(":")[0];
  const proto =
    h.get("x-forwarded-proto") ||
    (/^(localhost|127\.0\.0\.1)$/.test(bareHost) || bareHost.endsWith(".localhost") ? "http" : "https");
  const origin = `${proto}://${hostHeader}`;

  const tenant = await getTenantByHost(bareHost).catch(() => null);

  // প্রতিষ্ঠানের সাইট, কিন্তু সক্রিয় নয় — কিছুই ইনডেক্স নয়
  if (tenant && tenant.status !== "active") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* প্রমাণীকরণের পিছনের ও ব্যক্তিগত পথ। /admin ও /super টেন্যান্ট
           হোস্টে middleware মূল ডোমেইনে পাঠায়, তবু স্পষ্ট করে লেখা থাকল —
           ক্রলার রিডাইরেক্ট অনুসরণ করে সময় নষ্ট করে না। */
        disallow: ["/admin", "/super", "/api/", "/portal", "/login"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
