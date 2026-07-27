import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";

/* প্ল্যাটফর্মের নিজের ঠিকানা — অনুরোধ থেকেই গড়া।
   ROOT_DOMAIN না থাকলে বা ভুল থাকলেও যেন canonical/og:url ভুল না হয়,
   সেই একই নিয়ম এখানে (দ্র. commit 8695f6c)। */
async function platformOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") || process.env.ROOT_DOMAIN || "amaderschool.com";
  const proto = h.get("x-forwarded-proto") || (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

/* প্ল্যাটফর্মের বিক্রয়-পাতা — প্রতিটি টেন্যান্ট সাইটের নিজস্ব metadata আছে,
   কিন্তু এই পাতাটির ছিল না; শুধু root layout-এর সাধারণ শিরোনাম যেত।
   ফলে শেয়ার করলে কোনো og: কার্ড উঠত না, canonical-ও ছিল না। */
export async function generateMetadata(): Promise<Metadata> {
  const url = await platformOrigin();
  const title = "আমাদের স্কুল — প্রতিষ্ঠানের নিজস্ব ওয়েবসাইট";
  const description =
    "স্কুল, কলেজ, মাদরাসা ও কোচিং সেন্টারের জন্য সম্পূর্ণ বাংলা ওয়েবসাইট — " +
    "নোটিশ, ভর্তি, ফলাফল, শিক্ষক পরিচিতি ও গ্যালারিসহ। নিজস্ব ডোমেইনে সাত দিনে চালু।";
  return {
    metadataBase: new URL(url),
    title,
    description,
    keywords: [
      "স্কুল ওয়েবসাইট", "মাদরাসা ওয়েবসাইট", "কলেজ ওয়েবসাইট",
      "প্রতিষ্ঠানের ওয়েবসাইট", "নোটিশ বোর্ড", "অনলাইন ভর্তি", "ফলাফল প্রকাশ",
      "school website Bangladesh", "madrasah website",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website", locale: "bn_BD", url,
      siteName: "আমাদের স্কুল", title, description,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

/* পরিচিতি পাতা — "গেজেট" ধাঁচ
   ------------------------------------------------------------------
   দর্শক কে: প্রধান শিক্ষক, মাদরাসার মুহতামিম, ম্যানেজিং কমিটির সদস্য।
   তাঁরা প্রযুক্তিপ্রেমী নন; তাঁদের কাছে "বিশ্বাসযোগ্য" চেহারা মানে
   সরকারি নথি — ক্রিম কাগজ, পিতলের রেখা, গাঢ় সবুজ সিলমোহর, সূচিপত্র।
   সেই চেনা ভাষাটিকেই আধুনিক প্রকাশনার যত্নে সাজানো হয়েছে।

   কেন ছবি নেই: পাতাটি খোলা হয় প্রায়ই ৩জি-তে, সস্তা ফোনে। পুরো নকশা
   টাইপোগ্রাফি ও CSS দিয়ে গড়া বলে বাইটের খরচ প্রায় শূন্য, আর কোনো
   ক্লায়েন্ট জাভাস্ক্রিপ্ট লাগে না।

   কেন Tailwind-এর spacing ইউটিলিটি এখানে নেই: globals.css-এর @theme-এ
   `--spacing: 0.5rem` বসানো, ফলে px-5 মানে ৪০px আর py-16 মানে ১২৮px।
   ৩৬০px ফোনে সেটি লেখার জায়গা ২৮০px-এ নামিয়ে আনত। তাই কাঠামোর সব
   গুটি, ছন্দ ও টাইপ-স্কেল আসে globals.css-এর .gz-* ক্লাস থেকে —
   সবগুলোই clamp(), ব্রেকপয়েন্টে লাফ নেই। */

/* ওয়েবসাইটের গঠন — প্রতিটি প্রতিষ্ঠান ঠিক এই পাতাগুলোই পায় */
const STRUCTURE: { bn: string; en: string; sub?: { bn: string; en: string }[] }[] = [
  { bn: "হোম", en: "Home" },
  { bn: "আমাদের সম্পর্কে", en: "About" },
  { bn: "সভাপতির বাণী", en: "Chairman" },
  { bn: "অধ্যক্ষের বাণী", en: "Principal" },
  { bn: "নোটিশ", en: "Notice" },
  {
    bn: "একাডেমিক তথ্য", en: "Academic Information",
    sub: [
      { bn: "বিভাগসমূহ", en: "Departments" },
      { bn: "শিক্ষকবৃন্দ", en: "Teachers" },
      { bn: "রুটিন", en: "Routine" },
    ],
  },
  { bn: "ক্লাব", en: "Club" },
  { bn: "ফলাফল", en: "Results" },
  { bn: "ভর্তি", en: "Admission" },
  { bn: "গ্যালারি", en: "Gallery" },
  { bn: "যোগাযোগ", en: "Contact" },
];

const BN_NUM = (n: number) => String(n).padStart(2, "0").replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

const CAPABILITIES = [
  { t: "নোটিশ প্রকাশ", d: "মোবাইল থেকে এক মিনিটে — ওয়েবসাইটে সঙ্গে সঙ্গে।" },
  { t: "ভর্তি আবেদন", d: "অনলাইন ফরম, সরাসরি WhatsApp-এ অভিভাবকের প্রশ্ন।" },
  { t: "ফলাফল ও চার্ট", d: "রোল দিয়ে খোঁজা যায়, বছরভিত্তিক পাসের হার চার্টে।" },
  { t: "শিক্ষক পরিচিতি", d: "ছবি, পদবি ও বিভাগসহ পূর্ণ তালিকা।" },
  { t: "ছবির গ্যালারি", d: "অনুষ্ঠান ও ক্যাম্পাসের ছবি, নিজেই আপলোড করুন।" },
  { t: "নিজস্ব ডোমেইন", d: "school.edu.bd — Google-এ খুঁজে পাওয়ার SEO সহ।" },
];

const STEPS = [
  { n: "০১", t: "তথ্য পাঠান", d: "প্রতিষ্ঠানের নাম, ঠিকানা, লোগো ও কয়েকটি ছবি WhatsApp-এ পাঠালেই হবে।" },
  { n: "০২", t: "নকশা বেছে নিন", d: "দুটি নকশার যেকোনো একটি — আমরা আপনার রঙে সাজিয়ে দেখাব।" },
  { n: "০৩", t: "লাইভ ও হস্তান্তর", d: "সাত দিনের মধ্যে ডোমেইনসহ চালু, সঙ্গে অ্যাডমিন প্যানেলের প্রশিক্ষণ।" },
];

export default async function Landing() {
  const root = process.env.ROOT_DOMAIN || "amaderschool.com";
  const wa = "https://wa.me/8801XXXXXXXXX";

  /* ডেমো সাইটের ঠিকানা অনুরোধের host থেকেই গড়া হয় — তাই স্থানীয়ভাবে
     পোর্টসহ (demo-govt.localhost:3000) আর লাইভে আসল ডোমেইনে
     (demo-govt.amaderschool.com) দুই জায়গাতেই ঠিকঠাক কাজ করে।

     ব্যতিক্রম *.vercel.app: ওখানে ইচ্ছেমতো সাবডোমেইনের DNS নেই, তাই
     demo-govt.<project>.vercel.app কখনো খোলে না (ERR_CONNECTION_CLOSED)।
     সেক্ষেত্রে /demo/<slug> পথে পাঠানো হয় — কুকি বসিয়ে middleware পুরো
     সাইটটিকে মূল ডোমেইনেই দেখায়। কাস্টম ডোমেইনে ওয়াইল্ডকার্ড যোগ করলে
     আপনা-আপনি আবার সাবডোমেইন ব্যবহার হবে। */
  const h = await headers();
  const host = h.get("host") || root;
  const proto = h.get("x-forwarded-proto") || (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? "http" : "https");
  const wildcardOk = !/\.vercel\.app$/i.test(host);
  const demoUrl = (slug: string) => (wildcardOk ? `${proto}://${slug}.${host}` : `/${slug}`);

  const DESIGNS = [
    {
      name: "বিদ্যালয় ও কিন্ডারগার্টেন",
      en: "School / Kindergarten",
      desc: "পরীক্ষার খাতার লাল মার্জিন-রেখা, ভরসার নেভি-সাদা বিন্যাস। স্কুল, কলেজ ও কিন্ডারগার্টেন — সবের জন্যই মানানসই।",
      bar: "linear-gradient(90deg,#172b4d,#2f5da8)",
      tone: "#172b4d",
      href: demoUrl("demo-govt"),
    },
    {
      name: "মাদরাসা",
      en: "Madrasah",
      desc: "গভীর সবুজ, পিতল-সোনালি রেখা ও মিহরাব-খিলান ফ্রেম। হিফজ, কিতাব বিভাগ ও দানের আলাদা জায়গা।",
      bar: "linear-gradient(90deg,#0b3d2e,#a9761e)",
      tone: "#0b3d2e",
      href: demoUrl("demo-madrasah-official"),
    },
  ];

  return (
    <main className="gz-page min-h-screen bg-canvas paper-grain text-ink">
      {/* ── মাস্টহেড ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-canvas/92 backdrop-blur-sm border-b-[3px] border-double border-brass/45">
        <div className="gz-wrap flex items-center justify-between gap-3 h-[62px] sm:h-[70px]">
          <p className="gz-display text-[19px] sm:text-[22px] font-extrabold tracking-tight leading-none">
            আমাদের<span className="text-brass">স্কুল</span>
          </p>
          <a href={wa} className="gz-btn gz-btn-sm gz-btn-deep">কথা বলুন</a>
        </div>
      </header>

      {/* ── হিরো ────────────────────────────────────────── */}
      <section className="gz-wrap gz-hero">
        <div className="grid lg:grid-cols-[1.05fr_.95fr] items-start"
          style={{ gap: "clamp(2.25rem, 5vw, 4rem)" }}>
          <div>
            {/* সরকারি পরিপত্রের ছোট শিরোভাগ */}
            <p className="rise inline-flex items-center gap-2 gz-note font-bold tracking-wide text-margin
                          border border-margin/25 bg-margin/[0.06] rounded-full px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-margin shrink-0" />
              মাউশি নির্দেশনা, মে ২০২৬
            </p>

            <h1 className="rise gz-h1 mt-4" style={{ ["--d" as string]: "70ms" }}>
              আপনার প্রতিষ্ঠানের<br />
              ওয়েবসাইট,{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-deep">৭ দিনে লাইভ</span>
                {/* হাতে টানা আন্ডারলাইনের মতো পিতলের রেখা */}
                <span aria-hidden="true"
                  className="absolute left-0 right-0 bottom-[0.1em] h-[0.2em] bg-brass/30 rounded-full" />
              </span>
            </h1>

            <p className="rise gz-lead mt-5 max-w-xl" style={{ ["--d" as string]: "140ms" }}>
              নোটিশ, ভর্তি, ফলাফল, শিক্ষক, ছবি — সব এক জায়গায়। মোবাইল থেকেই
              আপডেট করবেন, কম্পিউটারের জ্ঞান লাগবে না। পুরো প্যানেল বাংলায়,
              ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন।
            </p>

            {/* ফোনে বোতামটি পুরো চওড়া — এক আঙুলে ধরা অবস্থায়ও লক্ষ্যভ্রষ্ট হয় না */}
            <div className="rise mt-7 flex flex-col sm:flex-row sm:items-center sm:gap-5 gap-3.5"
              style={{ ["--d" as string]: "210ms" }}>
              <a href={wa} className="gz-btn gz-btn-deep w-full sm:w-auto">ফ্রি ডেমো দেখুন</a>
              <p className="gz-note text-ink-soft">
                সেটআপ <b className="text-ink">৳১২,০০০</b> থেকে
                <span className="mx-1.5 text-rule">·</span>
                বছরে <b className="text-ink">৳৫,০০০</b>
              </p>
            </div>

            <div className="rise gz-stats" style={{ ["--d" as string]: "280ms" }}>
              {[["১১টি", "তৈরি পাতা"], ["২টি", "নকশা"], ["৭ দিনে", "হস্তান্তর"]].map(([n, l]) => (
                <p key={l}>
                  <b className="gz-stat-n">{n}</b>
                  <span className="gz-stat-l">{l}</span>
                </p>
              ))}
            </div>
          </div>

          {/* নথি-কার্ড: প্রতিষ্ঠান যা যা পাচ্ছে */}
          <aside className="rise gz-card" style={{ ["--d" as string]: "160ms" }}>
            <div className="gz-card-head">
              <p className="gz-display text-[15.5px] sm:text-[16.5px] font-bold leading-snug">
                প্রতিষ্ঠান যা যা পাচ্ছে
              </p>
              <span aria-hidden="true" className="gz-seal">২০২৬</span>
            </div>
            <ul>
              {CAPABILITIES.map((c) => (
                <li key={c.t} className="gz-row flex gap-3">
                  <span aria-hidden="true"
                    className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-brass-soft text-brass
                               grid place-items-center text-[12px] font-bold">✓</span>
                  <span className="min-w-0">
                    <b className="block text-[15px] font-bold leading-snug">{c.t}</b>
                    <span className="block gz-note text-ink-soft mt-0.5">{c.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* ── সূচিপত্র: ওয়েবসাইটের গঠন ───────────────────────
          বাংলা পাঠ্যবইয়ের সূচির ছন্দে — প্রতিষ্ঠান এক নজরেই বোঝেন
          কোন কোন পাতা তাঁরা পাচ্ছেন। */}
      <section className="bg-paper border-y border-rule">
        <div className="gz-wrap gz-band">
          <div className="max-w-2xl">
            <p className="gz-eyebrow">সূচিপত্র</p>
            <h2 className="gz-h2 mt-3">ওয়েবসাইটে যে পাতাগুলো থাকছে</h2>
            <p className="gz-lead mt-3.5">
              প্রতিটি পাতার লেখা, ছবি ও তথ্য অ্যাডমিন প্যানেল থেকে নিজেরাই
              বদলাতে পারবেন — আমাদের বলতে হবে না।
            </p>
          </div>

          <div className="rule-double mt-8 pt-6">
            <ol className="gz-toc">
              {STRUCTURE.map((item, i) => (
                <li key={item.en} className="py-3 border-b border-rule/70">
                  <div className="toc-row">
                    <span className="gz-display text-[12.5px] font-bold text-brass tabular-nums shrink-0">
                      {BN_NUM(i + 1)}
                    </span>
                    <span className="font-bold text-[15.5px] md:text-[16.5px] shrink-0">{item.bn}</span>
                    <span className="toc-dots" aria-hidden="true" />
                    <span className="font-latin text-[12px] md:text-[13px] text-ink-soft shrink-0">{item.en}</span>
                  </div>

                  {item.sub && (
                    <ul className="mt-2 ml-5 space-y-1.5">
                      {item.sub.map((s) => (
                        <li key={s.en} className="toc-row">
                          <span aria-hidden="true" className="text-brass/70 text-[12.5px] shrink-0">└</span>
                          <span className="text-[14px] text-ink shrink-0">{s.bn}</span>
                          <span className="toc-dots" aria-hidden="true" />
                          <span className="font-latin text-[11.5px] md:text-[12.5px] text-ink-soft shrink-0">{s.en}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-6 gz-note text-ink-soft">
            সঙ্গে থাকছে <b className="text-ink">লগইন</b> পাতা ও প্রতিষ্ঠানের নিজস্ব
            অ্যাডমিন প্যানেল — বাংলা ও ইংরেজি, দুই ভাষাতেই।
          </p>
        </div>
      </section>

      {/* ── দুটি নকশা ───────────────────────────────────── */}
      <section className="gz-wrap gz-band">
        <div className="max-w-2xl">
          <p className="gz-eyebrow">নকশা</p>
          <h2 className="gz-h2 mt-3">দুটি নকশা, নিজের মতো রং</h2>
          <p className="gz-lead mt-3.5">
            প্রতিষ্ঠানের ধরন বেছে নিন — বাকিটা আপনার লোগো ও রঙে নিজে থেকেই সাজে।
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-2" style={{ gap: "clamp(1.25rem, 3vw, 1.75rem)" }}>
          {DESIGNS.map((t) => (
            <article key={t.en} className="gz-card hover:border-brass/50 transition-colors">
              <div className="h-2.5" style={{ background: t.bar }} />
              <div style={{ padding: "clamp(1.25rem, 4vw, 1.75rem)" }}>
                <p className="gz-h3 font-extrabold" style={{ color: t.tone }}>{t.name}</p>
                <p className="font-latin text-[12.5px] text-ink-soft mt-1">{t.en}</p>
                <p className="gz-body mt-3.5">{t.desc}</p>
                <div className="mt-5 pt-4 border-t border-rule flex flex-wrap items-center gap-x-4 gap-y-3">
                  <a href={t.href} target="_blank" rel="noopener noreferrer"
                    className="gz-btn gz-btn-sm gz-btn-deep">
                    ডেমো সাইট দেখুন
                    <span aria-hidden="true" className="text-[13px] opacity-80">↗</span>
                  </a>
                  <span className="gz-note text-ink-soft">বাংলা ও English</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── ডেমো ও প্রবেশ ───────────────────────────────
          দর্শক প্রায়ই "আগে দেখি কেমন" ভেবে আসেন। উপরের কার্ডে ডেমো আছেই,
          তাই এই পট্টিটি ইচ্ছাকৃতভাবে হালকা — পুনরাবৃত্তি নয়, শর্টকাট। */}
      <section className="bg-paper border-y border-rule">
        <div className="gz-wrap gz-band-tight">
          <div className="grid lg:grid-cols-[1fr_auto] items-center"
            style={{ gap: "clamp(1.75rem, 4vw, 3.5rem)" }}>
            <div>
              <p className="gz-eyebrow">ডেমো</p>
              <h2 className="gz-h2 mt-3">নিজের চোখে দেখে নিন</h2>
              <p className="gz-lead mt-3 max-w-xl">
                দুটি ডেমো সাইট এখনই খোলা আছে — ঘুরে দেখুন, ভাষা বদলে দেখুন,
                মোবাইলেও খুলে দেখুন। কেমন লাগল, WhatsApp-এ জানান।
              </p>
            </div>

            {/* grid ব্যবহার — flex + shrink-0 দিলে ট্যাবলেট মাপে দুটি চওড়া
                বোতাম এক সারিতে বসতে গিয়ে পাতা আড়াআড়ি সরে যেত */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-2.5 w-full lg:w-auto">
              {[
                { t: "বিদ্যালয়ের ডেমো", s: "শহীদ স্মৃতি সরকারি উচ্চ বিদ্যালয়", href: demoUrl("demo-govt") },
                { t: "মাদরাসার ডেমো", s: "দারুল হিকমাহ ইসলামিয়া মাদরাসা", href: demoUrl("demo-madrasah-official") },
              ].map((d) => (
                <a key={d.t} href={d.href} target="_blank" rel="noopener noreferrer"
                  className="group gz-btn gz-btn-quiet justify-between !px-5 min-h-[60px] w-full text-left">
                  <span className="leading-tight min-w-0">
                    <b className="block text-[14.5px] font-bold">{d.t}</b>
                    <span className="block text-[12px] font-normal text-ink-soft mt-0.5 truncate">{d.s}</span>
                  </span>
                  <span aria-hidden="true"
                    className="text-brass text-[15px] shrink-0 group-hover:translate-x-0.5 transition-transform">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── কীভাবে কাজ করে ────────────────────────────────
          এখানে ০১/০২/০৩ সত্যিকারের ক্রম — তিনটি ধাপ পরপরই ঘটে,
          তাই সংখ্যাগুলো সাজসজ্জা নয়, তথ্য। */}
      <section className="gz-wrap gz-band">
        <p className="gz-eyebrow">পদ্ধতি</p>
        <h2 className="gz-h2 mt-3">কীভাবে শুরু করবেন</h2>

        <ol className="mt-8 grid md:grid-cols-3" style={{ gap: "clamp(1.5rem, 3.5vw, 2.5rem)" }}>
          {STEPS.map((s) => (
            <li key={s.n} className="pt-4 border-t-2 border-brass/30">
              <p className="gz-display text-[15px] font-extrabold text-brass tabular-nums">{s.n}</p>
              <p className="gz-h3 mt-1.5 text-ink">{s.t}</p>
              <p className="gz-body mt-2">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── শেষ আহ্বান ──────────────────────────────────── */}
      <section className="gz-wrap gz-band-tight">
        <div className="rounded-[18px] bg-deep text-white shadow-[0_28px_70px_-40px_rgba(18,50,39,0.95)]"
          style={{ padding: "clamp(1.75rem, 5.5vw, 3.5rem)" }}>
          <div className="grid lg:grid-cols-[1fr_auto] items-center"
            style={{ gap: "clamp(1.5rem, 3.5vw, 2.5rem)" }}>
            <div>
              <h2 className="gz-h2">প্রতিষ্ঠানের ওয়েবসাইট আর ফেলে রাখবেন না</h2>
              <p className="gz-lead mt-3 max-w-xl !text-white/70">
                একবার কথা বলুন — ডেমো দেখে তারপর সিদ্ধান্ত নিন। কোনো অগ্রিম নেই।
              </p>
            </div>
            <a href={wa} className="gz-btn gz-btn-brass w-full lg:w-auto whitespace-nowrap">
              WhatsApp-এ কথা বলুন
            </a>
          </div>
        </div>
      </section>

      {/* ── ফুটার ───────────────────────────────────────── */}
      <footer className="border-t border-rule">
        <div className="gz-wrap py-6 flex flex-wrap items-center justify-between gap-3">
          <p className="gz-note text-ink-soft">
            © {new Date().getFullYear()} আমাদেরস্কুল
            <span className="mx-1.5 text-rule">·</span>
            <span className="font-latin">{root}</span>
          </p>
          <Link href="/super/login" aria-label="সুপার প্যানেল"
            className="text-rule hover:text-brass transition-colors text-[13px]">•</Link>
        </div>
      </footer>

      {/* ── মোবাইলের নিচের পট্টি ─────────────────────────── */}
      <div className="gz-dock">
        <p className="gz-note leading-tight min-w-0">
          <b className="block text-ink font-bold">৳১২,০০০ থেকে</b>
          <span className="block text-ink-soft">বছরে ৳৫,০০০ নবায়ন</span>
        </p>
        {/* ৩২০px পর্দায় পুরো লেবেলটি দাম-লাইনটিকে তিন সারিতে ঠেলে দিত,
            আর পট্টি ১০৯px লম্বা হয়ে পর্দার এক-ষষ্ঠাংশ খেয়ে ফেলত */}
        <a href={wa} className="gz-btn gz-btn-sm gz-btn-brass ml-auto shrink-0">
          <span className="hidden min-[360px]:inline">WhatsApp-এ&nbsp;</span>কথা বলুন
        </a>
      </div>
    </main>
  );
}
