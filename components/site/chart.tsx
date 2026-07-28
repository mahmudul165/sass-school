/* ফলাফল চার্ট — সার্ভারে রেন্ডার করা SVG, শূন্য জাভাস্ক্রিপ্ট
   ------------------------------------------------------------------
   কেন লাইব্রেরি নয়: Recharts/Chart.js মানে ব্রাউজারে ১০০–৩০০kB বাড়তি এবং
   ছবি আসার আগে ফাঁকা বাক্স। বাংলাদেশে বড় অংশ দর্শক ২জি/৩জি-তে — এখানে
   চার্ট HTML-এর সাথেই আসে, প্রিন্টেও ঠিক থাকে, স্ক্রিনরিডারেও পড়া যায়।

   ডিজাইন সিদ্ধান্ত
   • দুটি পরিমাপ (পাসের হার % এবং জিপিএ-৫ সংখ্যা) কখনো এক অক্ষে নয় —
     দুটি আলাদা চার্ট। এক চার্টে দুই স্কেল বসালে তুলনা মিথ্যা দেখায়।
   • প্রতি চার্টে একটিই সিরিজ, তাই লেজেন্ড লাগে না — শিরোনামই পরিচয়।
   • দণ্ডের মাথায় ৪px গোলাই, ভিত্তিরেখায় আটকানো; গ্রিড রেখা ম্লান।
   • সংখ্যা টেক্সট-রঙে (ব্র্যান্ড রঙে নয়) — রঙ শুধু দণ্ডের পরিচয় বহন করে।
   • নিচে <details> টেবিল — রঙ না দেখেও পুরো তথ্য পাওয়া যায় (WCAG)। */
import type { ResultSeries } from "@/lib/content";
import { dict, type Lang } from "@/lib/i18n";
import { toBnDigits } from "@/lib/digits";
import { Icon } from "./icons";

/* জ্যামিতি দুই রকম — এবং সেটাই এই চার্টের মূল কৌশল।
   SVG-র ভেতরের লেখা viewBox-এর সাথে মাপ বদলায়। মোবাইলে চার্টের প্রস্থ ~২৭০px,
   অর্থাৎ ৫৬০ চওড়া viewBox অর্ধেকে সঙ্কুচিত হয় — ১২.৫ ফন্ট বাস্তবে ৬px, অপাঠ্য।
   তাই মোবাইলের জন্য আলাদা, সরু ও অপেক্ষাকৃত লম্বা viewBox, বড় ফন্টসহ।
   দুটি <svg> রেন্ডার হয়, CSS একটিকে লুকিয়ে রাখে — কোনো জাভাস্ক্রিপ্ট ছাড়াই। */
type Geo = { W: number; H: number; pad: { t: number; r: number; b: number; l: number }; fs: number; fsVal: number; barMax: number };
const DESKTOP: Geo = { W: 560, H: 250, pad: { t: 28, r: 10, b: 34, l: 44 }, fs: 12.5, fsVal: 12.5, barMax: 64 };
const MOBILE: Geo = { W: 340, H: 260, pad: { t: 30, r: 6, b: 38, l: 40 }, fs: 14, fsVal: 14.5, barMax: 46 };

const n = (v: string | number, lang: Lang) => (lang === "bn" ? toBnDigits(String(v)) : String(v));

/** "সুন্দর" সর্বোচ্চ মান — ২৫০ → ৩০০, যাতে গ্রিড রেখা গোল সংখ্যায় পড়ে */
function niceMax(max: number) {
  if (max <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const step = [1, 2, 2.5, 5, 10].find((s) => max <= s * pow) ?? 10;
  return step * pow;
}

/** ভিত্তিরেখায় আটকানো, মাথায় গোলাই — rect rx দিলে নিচের কোণও গোল হয়ে ফাঁক দেখায় */
function barPath(x: number, y: number, w: number, base: number, r = 4) {
  const h = base - y;
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${base} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${base} Z`;
}

function BarSvg({
  geo, data, color, lang, suffix, label, className,
}: {
  geo: Geo; data: { label: string; value: number }[]; color: string; lang: Lang;
  suffix: string; label: string; className: string;
}) {
  const { W, H, pad } = geo;
  const max = niceMax(Math.max(...data.map((d) => d.value), 1));
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const base = pad.t + plotH;
  const band = plotW / Math.max(data.length, 1);
  const barW = Math.min(geo.barMax, band * 0.54);
  /* একই মান দুবার এলে বাদ। max ছোট হলে (যেমন ১ বা ২) গোল করার পর
     [0, 0, 1, 1, 1]-এর মতো পুনরাবৃত্তি হতো — একই জায়গায় দাগ ও লেখা
     চাপাচাপি করে বসত, আর React-এ "duplicate key" ত্রুটি আসত। */
  const ticks = [...new Set([0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f)))];
  /* max শূন্য হলে ভাগ করলে NaN — তখন সব দাগ নিচেই থাকুক */
  const y = (v: number) => pad.t + plotH - (max > 0 ? (v / max) * plotH : 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`w-full h-auto ${className}`} role="img" aria-label={label}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)}
            stroke="var(--n-200)" strokeWidth={1} shapeRendering="crispEdges" />
          <text x={pad.l - 8} y={y(v) + geo.fs * 0.34} textAnchor="end" fontSize={geo.fs} fill="var(--n-500)">
            {n(v, lang)}
          </text>
        </g>
      ))}

      {data.map((d, i) => {
        const x = pad.l + band * i + (band - barW) / 2;
        const top = y(d.value);
        return (
          <g key={d.label} className="chart-bar">
            <title>{`${d.label} — ${n(d.value, lang)}${suffix}`}</title>
            {/* হোভার/ট্যাপের জন্য পুরো ব্যান্ডজুড়ে অদৃশ্য লক্ষ্যক্ষেত্র — আঙুলের নিরাপদ মাপ */}
            <rect x={pad.l + band * i} y={pad.t} width={band} height={plotH} fill="transparent" />
            <path d={barPath(x, top, barW, base)} fill={color} />
            <text x={x + barW / 2} y={top - geo.fsVal * 0.7} textAnchor="middle"
              fontSize={geo.fsVal} fontWeight={700} fill="var(--n-700)">
              {n(d.value, lang)}{suffix}
            </text>
            <text x={x + barW / 2} y={base + geo.fs * 1.6} textAnchor="middle" fontSize={geo.fs} fill="var(--n-500)">
              {d.label}
            </text>
          </g>
        );
      })}
      <line x1={pad.l} x2={W - pad.r} y1={base} y2={base} stroke="var(--n-300)" strokeWidth={1.5} shapeRendering="crispEdges" />
    </svg>
  );
}

function BarChart({
  title, unit, data, color, lang, suffix = "",
}: {
  title: string; unit: string; color: string; lang: Lang; suffix?: string;
  data: { label: string; value: number }[];
}) {
  const t = dict(lang);
  const label = `${title} — ${data.map((d) => `${d.label}: ${n(d.value, lang)}${suffix}`).join(", ")}`;
  const common = { data, color, lang, suffix, label };

  return (
    <figure className="rounded-xl border border-n-200 bg-white p-4 md:p-5">
      {/* flex-wrap ছাড়া সরু কলামে একক-লেখাটি ("(শিক্ষার্থী)") ডান পাশ ছাড়িয়ে
          পুরো পেজে অনুভূমিক স্ক্রলবার এনে দিত */}
      <figcaption className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
        <span className="h-3 w-3 rounded-[3px] shrink-0 self-center" style={{ background: color }} aria-hidden="true" />
        <span className="font-bold text-n-900 text-[15.5px]">{title}</span>
        <span className="text-[12.5px] text-n-500">{unit}</span>
      </figcaption>

      {/* মোবাইল ও ডেস্কটপে আলাদা জ্যামিতি। display:none এলিমেন্টকে
          অ্যাক্সেসিবিলিটি ট্রি থেকেও সরায়, তাই স্ক্রিনরিডার একটিই পড়ে —
          aria-hidden দেওয়ার দরকার নেই (দিলে বরং ডেস্কটপে লেবেল হারাত)। */}
      <BarSvg {...common} geo={MOBILE} className="sm:hidden" />
      <BarSvg {...common} geo={DESKTOP} className="hidden sm:block" />
      <span className="sr-only">{t.year}: {data.map((d) => d.label).join(", ")}</span>
    </figure>
  );
}

/** এক পরীক্ষার পূর্ণ ব্লক — দুটি চার্ট + তালিকা */
export function ResultChart({ series, lang = "bn" }: { series: ResultSeries; lang?: Lang }) {
  const t = dict(lang);
  const rows = series.rows || [];
  if (!rows.length) return null;
  const hasGpa = rows.some((r) => (r.gpa5 ?? 0) > 0);

  return (
    <section className="rounded-2xl border border-n-200 bg-n-50 p-4 md:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display t-h3 text-n-900">{series.exam}</h3>
        <span className="text-[13px] text-n-500">{series.note || t.chartNote}</span>
      </header>

      <div className={`grid gap-4 ${hasGpa ? "lg:grid-cols-2" : ""}`}>
        <BarChart
          title={t.passRate} unit="(%)" suffix="%" lang={lang} color="var(--brand-600)"
          data={rows.map((r) => ({ label: r.year, value: r.passRate }))}
        />
        {hasGpa && (
          <BarChart
            title={t.gpa5} unit={`(${t.students})`} lang={lang} color="var(--accent-700)"
            data={rows.map((r) => ({ label: r.year, value: r.gpa5 || 0 }))}
          />
        )}
      </div>

      {/* তালিকা রূপ — রঙ ছাড়াই সম্পূর্ণ তথ্য, প্রিন্টেও কাজে লাগে */}
      <details className="mt-4 group">
        <summary className="inline-flex items-center gap-2 cursor-pointer list-none marker:hidden text-[14px] font-semibold text-brand hover:underline">
          <Icon name="chevronDown" size={16} className="transition-transform group-open:rotate-180" />
          {t.showTable}
        </summary>
        {/* ঘরের প্যাডিং ফোনে ১৬px, ছিল ৩২px (--spacing দ্বিগুণ) — পাঁচটি
            কলামে সেটি একাই ৩২০px খেয়ে নিত, অর্থাৎ সংখ্যার জন্য কিছুই
            বাকি থাকত না। overflow-x-auto রেখে দেওয়া হলো ইচ্ছাকৃতভাবে:
            এটি চার্টেরই বিকল্প পাঠ্যরূপ, details-এর ভিতরে ডিফল্টে বন্ধ,
            আর পাঁচ কলামের সংখ্যা-ছক ৩৬০px-এ সৎভাবে ভাঁজ করার উপায় নেই —
            কলাম লুকালে তথ্যই হারিয়ে যায়। উপরের চার্টটিই প্রধান রূপ। */}
        <div className="mt-3 overflow-x-auto rounded-xl border border-n-200 bg-white">
          <table className="w-full text-left text-[13px] sm:text-[14.5px] [&_th]:px-2 [&_td]:px-2 sm:[&_th]:px-4 sm:[&_td]:px-4">
            <caption className="sr-only">{series.exam} — {t.resultChartTitle}</caption>
            <thead>
              <tr className="bg-n-50 text-[13.5px] text-n-600">
                <th scope="col" className="px-4 py-3 font-bold">{t.year}</th>
                <th scope="col" className="px-4 py-3 font-bold">{t.appeared}</th>
                <th scope="col" className="px-4 py-3 font-bold">{t.passed}</th>
                <th scope="col" className="px-4 py-3 font-bold">{t.passRate}</th>
                <th scope="col" className="px-4 py-3 font-bold">{t.gpa5}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year} className="border-t border-n-100">
                  <th scope="row" className="px-4 py-2.5 font-semibold text-n-900 tnum">{n(r.year, lang)}</th>
                  <td className="px-4 py-2.5 text-n-600 tnum">{r.appeared ? n(r.appeared, lang) : "—"}</td>
                  <td className="px-4 py-2.5 text-n-600 tnum">{r.passed ? n(r.passed, lang) : "—"}</td>
                  <td className="px-4 py-2.5 font-bold text-brand tnum">{n(r.passRate, lang)}%</td>
                  <td className="px-4 py-2.5 text-n-700 tnum">{r.gpa5 ? n(r.gpa5, lang) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

/** সব পরীক্ষার চার্ট একসাথে */
export function ResultCharts({ chart, lang = "bn" }: { chart: ResultSeries[]; lang?: Lang }) {
  if (!chart?.length) return null;
  return (
    <div className="space-y-6">
      {chart.map((s) => <ResultChart key={s.exam} series={s} lang={lang} />)}
    </div>
  );
}
