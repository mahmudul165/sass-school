/* একাডেমিক তথ্য → বিভাগসমূহ */
import { loadTenant, type Params } from "@/lib/page";
import { DepartmentGrid, PageCta } from "@/components/site/blocks";
import { Section, SectionHead, FeeTable } from "@/components/site/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navDepartments, description: t.subDepartments };
}

export default async function DepartmentsPage({ params }: Params) {
  const { T, tenant, content, lang, t } = await loadTenant(params);
  return (
    <>
      <T.PageHeader lang={lang}
        title={t.navDepartments}
        crumb={t.navAcademic}
        sub={tenant.admission?.classes
          ? `${t.classes}: ${tenant.admission.classes}`
          : t.subDepartments}
      />
      <DepartmentGrid departments={content.departments} lang={lang} />

      {content.fees.length > 0 && (
        <Section tone="soft">
          <SectionHead
            eyebrow={t.feeInfo} title={t.feeInfo}
            sub={lang === "en"
              ? "Every cost is published openly — there are no hidden fees."
              : "সব খরচ স্বচ্ছভাবে প্রকাশ করা হয় — কোনো গোপন ফি নেই।"}
          />
          <FeeTable rows={content.fees} note={content.feeNote}
            labels={{ head: t.feeClass, admission: t.feeAdmission, monthly: t.feeMonthly }} />
        </Section>
      )}

      <PageCta lang={lang} />
    </>
  );
}
