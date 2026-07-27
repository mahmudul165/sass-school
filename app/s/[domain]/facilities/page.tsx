import { loadTenant, type Params } from "@/lib/page";
import { Section, SectionHead, Btn } from "@/components/site/ui";
import { Icon } from "@/components/site/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.secFacilities, description: t.secFacilitiesSub };
}

export default async function FacilitiesPage({ params }: Params) {
  const { T, content, lang, t } = await loadTenant(params);
  return (
    <>
      <T.PageHeader lang={lang} title={t.secFacilities} crumb={t.secFacilities} sub={t.secFacilitiesSub} />

      <Section tone="plain">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {content.facilities.map((f, i) => (
            <article key={i} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 60}ms` }}
              className="lift rounded-2xl bg-white hairline p-7">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand">
                <Icon name={f.icon} size={25} />
              </span>
              <h2 className="t-h3 text-n-900 mt-5">{f.title}</h2>
              {f.desc && <p className="mt-2.5 text-n-600 leading-relaxed text-[15.5px]">{f.desc}</p>}
            </article>
          ))}
          {!content.facilities.length && (
            <p className="col-span-full text-center text-n-500 py-10">
              {lang === "en" ? "Details will be added shortly." : "তথ্য শিগগিরই যুক্ত হবে।"}
            </p>
          )}
        </div>
      </Section>

      {content.campusLife.length > 0 && (
        <Section tone="soft">
          <SectionHead eyebrow={t.secCampusLife}
            title={lang === "en" ? "Much more than lessons" : "পড়ার বাইরেও অনেক কিছু"} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {content.campusLife.map((c, i) => (
              <article key={i} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 60}ms` }}
                className="rounded-2xl bg-white hairline p-6">
                <h3 className="font-bold text-n-900">{c.title}</h3>
                <p className="mt-2 text-[14.5px] text-n-500 leading-relaxed">{c.desc}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Btn href="/gallery" variant="outline" iconRight="arrowRight">
              {lang === "en" ? "See campus photos" : "ক্যাম্পাসের ছবি দেখুন"}
            </Btn>
          </div>
        </Section>
      )}
    </>
  );
}
