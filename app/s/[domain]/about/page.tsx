import { loadTenant, type Params } from "@/lib/page";
import { Section, SectionHead, CheckList, Figure, Avatar, Btn } from "@/components/site/ui";
import { Icon } from "@/components/site/icons";
import { CountUp } from "@/components/site/interactive";
import { toBnDigits } from "@/lib/digits";
import { PageCta } from "@/components/site/blocks";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navAbout, description: t.subAbout };
}

export default async function AboutPage({ params }: Params) {
  const { T, tenant, content, lang, t, dal } = await loadTenant(params);
  const galleries = await dal.galleries();
  const pic = galleries.flatMap((g: { images: { url: string }[] }) => g.images)[0]?.url || tenant.heroImage;
  const people = [content.chairman, content.principal].filter(Boolean) as NonNullable<typeof content.chairman>[];

  return (
    <>
      <T.PageHeader lang={lang} title={t.navAbout} crumb={t.navAboutAlt} sub={tenant.tagline || t.subAbout} />

      <Section tone="plain">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 items-center">
          <div data-reveal><Figure src={pic} alt={tenant.name} ratio="aspect-[4/5]" rounded="rounded-3xl" /></div>
          <div>
            <SectionHead align="left" eyebrow={t.navAboutAlt} title={content.aboutTitle} className="!mb-5" />
            <p data-reveal className="text-n-700 leading-[2]">{content.aboutBody}</p>
            {content.aboutPoints.length > 0 && (
              <div data-reveal className="mt-8"><CheckList items={content.aboutPoints} /></div>
            )}
          </div>
        </div>
      </Section>

      {content.stats.length > 0 && (
        <Section tone="soft" size="sm">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {content.stats.map((s, i) => (
              <div key={i} data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
                className="rounded-2xl bg-white hairline p-6 text-center">
                <Icon name={s.icon} size={24} className="mx-auto text-brand" />
                <dd className="mt-3 text-[34px] font-extrabold text-n-900 leading-none tnum"><CountUp value={s.value} /></dd>
                <dt className="mt-1.5 text-[14px] text-n-500">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {people.length > 0 && (
        <Section tone="plain">
          <SectionHead eyebrow={lang === "en" ? "Leadership" : "নেতৃত্ব"} title={t.secLeadership} />
          <div className={`grid gap-6 ${people.length > 1 ? "lg:grid-cols-2" : "max-w-3xl mx-auto"}`}>
            {people.map((p, i) => (
              <figure key={i} data-reveal className="rounded-2xl bg-n-50 p-8">
                <div className="flex items-center gap-4 pb-5 mb-5 border-b border-n-200">
                  <Avatar src={p.photo} name={p.name} size={64} />
                  <div>
                    <p className="font-bold text-n-900 text-[18px]">{p.name}</p>
                    <p className="text-[14px] text-brand font-semibold">{p.role}</p>
                  </div>
                </div>
                <blockquote className="text-n-600 leading-[2]">“{p.message}”</blockquote>
              </figure>
            ))}
          </div>
        </Section>
      )}

      {content.why.length > 0 && (
        <Section tone="soft">
          <SectionHead eyebrow={t.secWhyUs}
            title={lang === "en" ? "Why parents trust us" : "যে কারণে অভিভাবকেরা আস্থা রাখেন"} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.why.map((w, i) => (
              <article key={i} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 70}ms` }}
                className="lift rounded-2xl bg-white hairline p-7">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand"><Icon name={w.icon} size={23} /></span>
                <h3 className="t-h3 text-n-900 mt-4">{w.title}</h3>
                <p className="mt-2 text-n-600 text-[15px] leading-relaxed">{w.desc}</p>
              </article>
            ))}
          </div>
        </Section>
      )}

      {content.achievements.length > 0 && (
        <Section tone="plain">
          <SectionHead eyebrow="অর্জন" title="আমাদের গর্বের মুহূর্তগুলো" />
          <ol className="max-w-3xl mx-auto relative border-l-2 border-n-200 ml-3 space-y-8">
            {content.achievements.map((a, i) => (
              <li key={i} data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms` }} className="pl-8">
                <span className="absolute -left-[13px] grid h-6 w-6 place-items-center rounded-full bg-brand text-brand-on">
                  <Icon name={a.icon || "trophy"} size={13} />
                </span>
                {a.year && <p className="text-[13px] font-extrabold text-brand tnum">{a.year}</p>}
                <p className="mt-0.5 font-bold text-n-900 text-[17px]">{a.title}</p>
                {a.desc && <p className="mt-1 text-n-500">{a.desc}</p>}
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section tone="soft" size="sm">
        <div className="text-center">
          <h2 className="t-h2 text-n-900">আমাদের ক্যাম্পাস ঘুরে দেখতে চান?</h2>
          <p className="mt-3 text-n-600">
            যেকোনো কর্মদিবসে সরাসরি আসুন, অথবা ফোন করে সময় ঠিক করে নিন।
            {tenant.established && ` ${toBnDigits(tenant.established)} সাল থেকে আমরা এখানেই আছি।`}
          </p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <Btn href="/admission#apply" variant="primary" size="lg" iconRight="arrowRight">ভর্তির আবেদন</Btn>
            <Btn href="/contact" variant="outline" size="lg">যোগাযোগ করুন</Btn>
          </div>
        </div>
      </Section>
    </>
  );
}
