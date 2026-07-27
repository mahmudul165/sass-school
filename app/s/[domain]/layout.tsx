import { notFound } from "next/navigation";
import { getTenantByHost } from "@/lib/tenant";
import { resolveLang } from "@/lib/lang";
import { cachedContent } from "@/lib/dal";
import { getTemplate } from "@/templates/registry";
import { paletteVars } from "@/lib/color";
import { FloatingActions } from "@/components/site/interactive";
import { tenantBase } from "@/lib/base";
import { ServiceWorker } from "@/components/site/sw-register";
import { NavProgress } from "@/components/site/nav-progress";
import { NavRecovery } from "@/components/site/nav-recovery";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ domain: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { domain } = await params;
  const t = await getTenantByHost(domain);
  if (!t) return {};
  const isEn = (await resolveLang((t as { language?: string }).language)) === "en";
  const desc = (t.about || t.tagline || `${t.name} — ${t.contact.address || ""}`).slice(0, 158);
  const url = `https://${t.customDomain || domain}`;
  return {
    metadataBase: new URL(url),
    title: { default: `${t.name}${t.tagline ? ` — ${t.tagline}` : ""}`, template: `%s | ${t.name}` },
    description: desc,
    keywords: [t.name, t.nameEn, t.contact.address,
      ...(isEn ? ["admission", "notice", "results", "school website"] : ["ভর্তি", "নোটিশ", "ফলাফল", "স্কুল ওয়েবসাইট"])]
      .filter(Boolean) as string[],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website", locale: isEn ? "en_GB" : "bn_BD", url, siteName: t.name, title: t.name, description: desc,
      images: t.heroImage ? [{ url: t.heroImage, width: 1200, height: 630, alt: t.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: t.name, description: desc },
    robots: t.status === "active" ? { index: true, follow: true } : { index: false, follow: false },
    icons: t.logo ? { icon: t.logo, apple: t.logo } : undefined,
  };
}

export default async function TenantLayout({ children, params }: P & { children: React.ReactNode }) {
  const { domain } = await params;
  const tenant = await getTenantByHost(domain);
  if (!tenant) notFound();

  const T = getTemplate(tenant.template);
  const lang = await resolveLang((tenant as { language?: string }).language);
  const isEn = lang === "en";

  if (tenant.status === "suspended") {
    return (
      <main className="min-h-screen grid place-items-center p-6 text-center bg-n-50" lang={lang}>
        <div>
          <h1 className="t-h2 text-n-900">
            {isEn ? "This site is temporarily unavailable" : "সাইটটি সাময়িকভাবে বন্ধ আছে"}
          </h1>
          <p className="mt-3 text-n-600">
            {isEn
              ? "Renewal is in progress. Please contact the institution office."
              : "নবায়ন প্রক্রিয়াধীন। প্রতিষ্ঠান কর্তৃপক্ষের সাথে যোগাযোগ করুন।"}
          </p>
        </div>
      </main>
    );
  }

  const notices = await cachedContent(String(tenant._id)).notices(6);
  const c = tenant.contact;

  // অনুসন্ধান ইঞ্জিনের জন্য কাঠামোবদ্ধ তথ্য — লোকাল SEO-তে এটিই সবচেয়ে বেশি কাজে দেয়
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": tenant.type === "college" ? "CollegeOrUniversity" : "School",
    name: tenant.name,
    alternateName: tenant.nameEn || undefined,
    description: (tenant.about || tenant.tagline || "").slice(0, 300) || undefined,
    url: `https://${tenant.customDomain || domain}`,
    logo: tenant.logo || undefined,
    image: tenant.heroImage || undefined,
    foundingDate: tenant.established || undefined,
    telephone: c.phone || undefined,
    email: c.email || undefined,
    address: c.address ? { "@type": "PostalAddress", streetAddress: c.address, addressCountry: "BD" } : undefined,
    sameAs: [c.facebook, c.youtube].filter(Boolean),
  };

  return (
    // lang এখানে বসানো হয় (root layout-এ নয়), কারণ একই অ্যাপে বাংলা ও ইংরেজি —
    // দুই ভাষার সাইটই চলে। স্ক্রিনরিডার ও অনুবাদক নিকটতম lang মানে।
    <div lang={lang} className="min-h-screen bg-white flex flex-col"
      style={paletteVars(tenant.theme.primary, tenant.theme.secondary)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <T.Header tenant={tenant as never} notices={notices} lang={lang} />
      <main id="main" className="flex-1">{children}</main>
      <T.Footer tenant={tenant as never} lang={lang} />

      {tenant.status === "grace" && (
        <p className="no-print bg-amber-100 text-amber-900 text-center text-sm py-2 px-4">
          {isEn
            ? "It is time to renew this service — the institution is requested to renew."
            : "সেবা নবায়নের সময় হয়েছে — প্রতিষ্ঠান কর্তৃপক্ষ অনুগ্রহ করে নবায়ন করুন।"}
        </p>
      )}

      <ServiceWorker />
      <NavProgress />
      <NavRecovery />
      <FloatingActions
        phone={c.phone} whatsapp={c.whatsapp} messenger={c.messenger}
        base={await tenantBase()}
        labels={isEn ? { call: "Call now", admission: "Admission" } : undefined}
        waText={isEn
          ? `Hello, I would like to know more about ${tenant.name}.`
          : `আসসালামু আলাইকুম। ${tenant.name} সম্পর্কে জানতে চাই।`}
      />
    </div>
  );
}
