/* সভাপতির বাণী — প্ল্যাটফর্মের স্ট্যান্ডার্ড পেজ */
import { loadTenant, type Params } from "@/lib/page";
import { PersonMessage, PageCta } from "@/components/site/blocks";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navChairman, description: t.subChairman };
}

export default async function ChairmanPage({ params }: Params) {
  const { T, tenant, content, lang, t } = await loadTenant(params);
  return (
    <>
      <T.PageHeader lang={lang} title={t.navChairman} crumb={t.navChairman} sub={t.subChairman} />
      <PersonMessage
        person={content.chairman}
        lang={lang}
        institution={tenant.name}
        fallbackRole={lang === "en" ? "Chairman" : "সভাপতি"}
      />
      <PageCta lang={lang} />
    </>
  );
}
