import { loadTenant, type Params } from "@/lib/page";
import { Section, SectionHead, CheckList, Btn, Pill, FeeTable } from "@/components/site/ui";
import { Icon } from "@/components/site/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.secPrograms, description: t.secProgramsSub };
}

export default async function AcademicsPage({ params }: Params) {
  const { T, tenant, content, lang, t } = await loadTenant(params);

  return (
    <>
      <T.PageHeader lang={lang}
        title={t.secPrograms}
        crumb={t.navAcademic}
        sub={tenant.admission?.classes
          ? `${t.classes}: ${tenant.admission.classes}`
          : lang === "en"
            ? "A distinct goal and a distinct method for every stage."
            : "প্রতিটি স্তরের জন্য আলাদা লক্ষ্য, আলাদা পাঠপদ্ধতি।"}
      />

      <Section tone="plain">
        <div className="space-y-6">
          {content.programs.map((p, i) => (
            <article key={i} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 60}ms` }}
              className="grid lg:grid-cols-[1.35fr_1fr] gap-8 rounded-2xl bg-white hairline p-7 md:p-9">
              <div>
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-brand-on">
                    <Icon name={p.icon} size={25} />
                  </span>
                  <div>
                    <h2 className="t-h3 text-n-900">{p.title}</h2>
                    {p.level && <Pill tone="accent" className="mt-1.5">{p.level}</Pill>}
                  </div>
                </div>
                <p className="mt-5 text-n-600 leading-[1.95]">{p.desc}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Btn href="/admission#apply" variant="primary">
                    {lang === "en" ? "Apply to this section" : "এই শাখায় ভর্তি হন"}
                  </Btn>
                  <Btn href="/teachers" variant="outline">{t.navTeachers}</Btn>
                </div>
              </div>
              {p.points?.length ? (
                <div className="rounded-xl bg-brand-50 p-6">
                  <p className="t-eyebrow text-brand mb-4">{lang === "en" ? "What's included" : "যা যা থাকছে"}</p>
                  <CheckList items={p.points} />
                </div>
              ) : null}
            </article>
          ))}
          {!content.programs.length && (
            <p className="text-center text-n-500 py-10">{t.emptyDepartments}</p>
          )}
        </div>
      </Section>

      {content.fees.length > 0 && (
        <Section tone="soft">
          <SectionHead eyebrow={t.feeInfo} title={t.feeInfo}
            sub={lang === "en"
              ? "Every cost is published openly — there are no hidden fees."
              : "সব খরচ স্বচ্ছভাবে প্রকাশ করা হয় — কোনো গোপন ফি নেই।"} />
          <FeeTable rows={content.fees} note={content.feeNote}
            labels={{ head: t.feeClass, admission: t.feeAdmission, monthly: t.feeMonthly }} />
        </Section>
      )}
    </>
  );
}
