/* একাডেমিক তথ্য → রুটিন */
import { loadTenant, type Params } from "@/lib/page";
import { RoutineTables } from "@/components/site/blocks";
import { Section, Btn } from "@/components/site/ui";
import { Icon } from "@/components/site/icons";
import Link from "next/link";
import { fmtDate } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navRoutine, description: t.subRoutine };
}

export default async function RoutinePage({ params }: Params) {
  const { T, content, lang, t, dal } = await loadTenant(params);
  // রুটিন বদলালে নোটিশেই আগে জানানো হয় — তাই সংশ্লিষ্ট নোটিশগুলো পাশেই
  const notices = await dal.notices(30);
  const related = notices
    .filter((n) => /রুটিন|সময়সূচি|routine|schedule|পরীক্ষা|exam/i.test(n.title))
    .slice(0, 4);

  return (
    <>
      <T.PageHeader lang={lang} title={t.navRoutine} crumb={t.navAcademic} sub={t.subRoutine} />
      <RoutineTables routine={content.routine} lang={lang} />

      {related.length > 0 && (
        <Section tone="soft" size="sm">
          <h2 className="t-h3 text-n-900 mb-5 flex items-center gap-2.5">
            <Icon name="bell" size={20} className="text-brand" />
            {lang === "en" ? "Related notices" : "সংশ্লিষ্ট নোটিশ"}
          </h2>
          <div className="rounded-2xl bg-white hairline overflow-hidden max-w-3xl">
            {related.map((nt, i) => (
              <Link key={nt._id} href={`/notice/${nt._id}`}
                className={`flex items-start gap-3 p-5 hover:bg-brand-50/60 transition ${i ? "border-t border-n-100" : ""}`}>
                <Icon name="file" size={18} className="mt-1 shrink-0 text-brand" />
                <span>
                  <span className="block font-semibold text-n-900 leading-snug">{nt.title}</span>
                  <span className="block text-[13px] text-n-400 mt-0.5">{fmtDate(nt.createdAt, lang)}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Btn href="/notice" variant="outline" iconRight="arrowRight">{t.allNotices}</Btn>
          </div>
        </Section>
      )}
    </>
  );
}
