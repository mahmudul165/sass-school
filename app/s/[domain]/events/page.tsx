import { loadTenant, type Params } from "@/lib/page";
import { Section, Figure } from "@/components/site/ui";
import { Icon } from "@/components/site/icons";
import { toBnDigits } from "@/lib/content";
import { bnDate, dhakaParts, monthShort } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "অনুষ্ঠান" };

export default async function EventsPage({ params }: Params) {
  const { T, lang, dal } = await loadTenant(params);
  const events = await dal.events(50);
  const now = Date.now();
  const upcoming = events.filter((e: { date: string }) => new Date(e.date).getTime() >= now - 864e5);
  const past = events.filter((e: { date: string }) => new Date(e.date).getTime() < now - 864e5).reverse();

  const Card = ({ e, dim }: { e: typeof events[number]; dim?: boolean }) => (
    <article className={`lift rounded-2xl bg-white hairline overflow-hidden ${dim ? "opacity-75" : ""}`}>
      {e.image && <Figure src={e.image} alt={e.title} ratio="aspect-[16/9]" rounded="rounded-none" icon="calendar" />}
      <div className="p-6 flex gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand text-center">
          <span>
            {/* getDate()/toLocaleDateString যন্ত্রের সময় অঞ্চল ধরে — সার্ভার UTC,
                ফোন UTC+৬ হলে দুই জায়গায় দুই তারিখ, হাইড্রেশন ভেঙে যেত */}
            <span className="block text-[21px] font-extrabold leading-none tnum">{toBnDigits(String(dhakaParts(e.date)?.d ?? ""))}</span>
            <span className="block text-[11px] mt-1">{monthShort(e.date)}</span>
          </span>
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-n-900 text-[17px] leading-snug">{e.title}</h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] text-n-500">
            <span className="inline-flex items-center gap-1.5"><Icon name="calendar" size={14} />{bnDate(e.date)}</span>
            {e.time && <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={14} />{e.time}</span>}
            {e.venue && <span className="inline-flex items-center gap-1.5"><Icon name="mapPin" size={14} />{e.venue}</span>}
          </div>
          {e.desc && <p className="mt-3 text-[15px] text-n-600 leading-relaxed">{e.desc}</p>}
        </div>
      </div>
    </article>
  );

  return (
    <>
      <T.PageHeader lang={lang} title="অনুষ্ঠান ও কার্যক্রম" crumb="অনুষ্ঠান"
        sub="ক্রীড়া, সাংস্কৃতিক আয়োজন, শিক্ষা সফর ও অভিভাবক সমাবেশের সময়সূচি।" />

      <Section tone="plain">
        <h2 className="t-h2 text-n-900 mb-7">আসন্ন অনুষ্ঠান</h2>
        {upcoming.length ? (
          <div className="grid md:grid-cols-2 gap-6">{upcoming.map((e) => <Card key={e._id} e={e} />)}</div>
        ) : (
          <div className="rounded-2xl bg-n-50 p-12 text-center text-n-500">
            <Icon name="calendar" size={36} className="mx-auto mb-4 text-n-300" />
            এই মুহূর্তে কোনো আসন্ন অনুষ্ঠান নেই। নতুন কর্মসূচি ঘোষণা হলে এখানে দেখা যাবে।
          </div>
        )}
      </Section>

      {past.length > 0 && (
        <Section tone="soft">
          <h2 className="t-h2 text-n-900 mb-7">সম্পন্ন অনুষ্ঠান</h2>
          <div className="grid md:grid-cols-2 gap-6">{past.slice(0, 8).map((e) => <Card key={e._id} e={e} dim />)}</div>
        </Section>
      )}
    </>
  );
}
