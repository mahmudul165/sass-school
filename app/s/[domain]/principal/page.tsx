/* অধ্যক্ষের / প্রধান শিক্ষকের বাণী — প্ল্যাটফর্মের স্ট্যান্ডার্ড পেজ */
import { loadTenant, type Params } from "@/lib/page";
import { PersonMessage, PageCta } from "@/components/site/blocks";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navPrincipal, description: t.subPrincipal };
}

export default async function PrincipalPage({ params }: Params) {
  const { T, tenant, content, lang, t } = await loadTenant(params);
  // মাদরাসায় "মুহতামিমের বাণী", কলেজে "অধ্যক্ষের বাণী" — কনটেন্টে থাকা পদবিই সত্য
  const title = content.principal?.role
    ? (lang === "en" ? `${content.principal.role}'s Message` : `${content.principal.role}-এর বাণী`)
    : t.navPrincipal;

  return (
    <>
      <T.PageHeader lang={lang} title={title} crumb={t.navPrincipal} sub={t.subPrincipal} />
      <PersonMessage
        person={content.principal}
        lang={lang}
        institution={tenant.name}
        fallbackRole={lang === "en" ? "Principal" : tenant.type === "madrasah" ? "মুহতামিম" : "প্রধান শিক্ষক"}
      />
      <PageCta lang={lang} />
    </>
  );
}
