/* ফলাফল — প্রকাশিত ফল, অনুসন্ধান ও বছরভিত্তিক ধারা (চার্ট) */
import { loadTenant, type Params } from "@/lib/page";
import { ResultCharts } from "@/components/site/chart";
import { Section, SectionHead, Avatar } from "@/components/site/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navResults, description: t.subResults };
}

export default async function ResultsPage({ params }: Params) {
  const { T, content, lang, t, dal } = await loadTenant(params);
  const results = await dal.results();

  return (
    <>
      <T.PageHeader lang={lang} title={t.navResults} crumb={t.navResults} sub={t.subResults} />

      {/* প্রকাশিত ফল ও রোল দিয়ে অনুসন্ধান — টেমপ্লেটের নিজস্ব চেহারায় */}
      <T.ResultList lang={lang} results={results} note={content.resultPortalNote} />

      {/* বছরভিত্তিক ধারা — অভিভাবক এক নজরে প্রতিষ্ঠানের মান বোঝেন */}
      {content.resultChart.length > 0 && (
        <Section tone="soft">
          <SectionHead eyebrow={t.secResultTrend} title={t.resultChartTitle}
            sub={lang === "en"
              ? "Pass rate and GPA-5 count over the last five years."
              : "গত পাঁচ বছরের পাসের হার ও জিপিএ-৫ প্রাপ্তির সংখ্যা।"} />
          <ResultCharts chart={content.resultChart} lang={lang} />
        </Section>
      )}

      {content.topStudents.length > 0 && (
        <Section tone="plain">
          <SectionHead eyebrow={t.secAchievements} title={t.secTopStudents} />
          <div className="snap-row md:grid md:grid-cols-4 md:gap-5">
            {content.topStudents.map((s, i) => (
              <figure key={i} className="w-[200px] md:w-auto rounded-2xl border border-n-200 bg-white overflow-hidden text-center">
                <div className="p-5 pb-0">
                  <Avatar src={s.photo} name={s.name} size={90} className="mx-auto ring-4 ring-brand-50" />
                </div>
                <figcaption className="p-5">
                  <p className="font-bold text-n-900">{s.name}</p>
                  <p className="mt-1.5 inline-block rounded px-3 py-1 text-[13px] font-bold text-white"
                    style={{ background: "var(--accent-600)" }}>{s.result}</p>
                  <p className="mt-2 text-[13px] text-n-500">{s.exam} {s.year}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
