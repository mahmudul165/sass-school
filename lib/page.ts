/* পাবলিক পেজের সাধারণ লোডার — প্রতিটি পেজে একই পাঁচ লাইন লেখা এড়াতে।
   ------------------------------------------------------------------
   পারফরম্যান্স নোট: একটি পেজ রেন্ডার হতে গিয়ে এই কাজটি তিনবার লাগে —
   layout, generateMetadata এবং পেজ নিজে। React-এর cache() একই রিকোয়েস্টের
   ভেতরে ফলাফল ধরে রাখে, তাই ডিফল্ট কনটেন্ট তৈরির ভারী কাজটি (কয়েকশ
   অবজেক্ট) তিনবারের বদলে একবারই হয়। সস্তা ফোনে নয়, সস্তা সার্ভারে —
   এটি TTFB-তে সরাসরি প্রভাব ফেলে। */
import { cache } from "react";
import { getTenantByHost } from "./tenant";
import { cachedContent } from "./dal";
import { getTemplate } from "@/templates/registry";
import { resolveContent } from "./content";
import { resolveLang } from "./lang";
import { dict } from "./i18n";
import { notFound } from "next/navigation";
import type { HomeData } from "@/templates/types";

export type Params = { params: Promise<{ domain: string }> };

/** হোস্ট + ভাষা → রেন্ডার-রেডি সবকিছু; প্রতি রিকোয়েস্টে একবারই গণনা হয় */
const build = cache(async (domain: string) => {
  const tenant = await getTenantByHost(domain);
  if (!tenant) notFound();
  const lang = await resolveLang((tenant as { language?: string }).language);
  return {
    tenant: tenant as never as HomeData["tenant"],
    T: getTemplate(tenant.template),
    lang,
    t: dict(lang),
    content: resolveContent(tenant as never, lang),
    dal: cachedContent(String(tenant._id)),
  };
});

export async function loadTenant(params: Params["params"]) {
  const { domain } = await params;
  return build(domain);
}

/** হোমপেজের জন্য সব কনটেন্ট — সমান্তরালে, একবারে */
export async function loadHome(params: Params["params"]): Promise<HomeData & { T: ReturnType<typeof getTemplate> }> {
  const { tenant, T, content, lang, dal } = await loadTenant(params);
  const [notices, teachers, results, galleries, events] = await Promise.all([
    dal.notices(8), dal.teachers(), dal.results(), dal.galleries(), dal.events(6),
  ]);
  return { tenant, T, content, lang, notices, teachers, results, galleries, events };
}
