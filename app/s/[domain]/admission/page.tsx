import { loadTenant, type Params } from "@/lib/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navAdmission, description: t.subAdmission };
}

export default async function AdmissionPage({ params }: Params) {
  const { T, tenant, content, lang, t } = await loadTenant(params);
  return (
    <>
      <T.PageHeader lang={lang}
        title={t.admissionInfo}
        crumb={t.navAdmission}
        sub={tenant.admission?.open
          ? lang === "en"
            ? "Admission is open — the process, schedule and all fee details are below."
            : "ভর্তি কার্যক্রম চলছে — প্রক্রিয়া, সময়সূচি ও ফি সংক্রান্ত সব তথ্য নিচে দেওয়া আছে।"
          : t.subAdmission}
      />
      <T.AdmissionBlock lang={lang} tenant={tenant} content={content} />
    </>
  );
}
