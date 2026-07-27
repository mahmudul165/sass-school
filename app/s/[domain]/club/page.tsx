/* ক্লাব ও সহশিক্ষা কার্যক্রম */
import { loadTenant, type Params } from "@/lib/page";
import { ClubGrid } from "@/components/site/blocks";
import { Section, SectionHead } from "@/components/site/ui";
import { Icon } from "@/components/site/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navClub, description: t.subClub };
}

export default async function ClubPage({ params }: Params) {
  const { T, content, lang, t } = await loadTenant(params);
  return (
    <>
      <T.PageHeader lang={lang} title={t.navClub} crumb={t.navClub} sub={t.subClub} />
      <ClubGrid clubs={content.clubs} lang={lang} />

      {content.campusLife.length > 0 && (
        <Section tone="soft">
          <SectionHead eyebrow={t.secCampusLife} title={t.secCampusLife} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.campusLife.map((c, i) => (
              <div key={i} data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
                className="rounded-2xl bg-white hairline p-6">
                <Icon name="sparkles" size={22} className="text-accent-600" />
                <h3 className="mt-3 font-bold text-n-900">{c.title}</h3>
                <p className="mt-1.5 text-[14.5px] text-n-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
