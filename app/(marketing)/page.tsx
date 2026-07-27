import Link from "next/link";
import { headers } from "next/headers";

/* পরিচিতি পাতা — "গেজেট" ধাঁচ
   ------------------------------------------------------------------
   দর্শক কে: প্রধান শিক্ষক, মাদরাসার মুহতামিম, ম্যানেজিং কমিটির সদস্য।
   তাঁরা প্রযুক্তিপ্রেমী নন; তাঁদের কাছে "বিশ্বাসযোগ্য" চেহারা মানে
   সরকারি নথি — ক্রিম কাগজ, পিতলের রেখা, গাঢ় সবুজ সিলমোহর, সূচিপত্র।
   সেই চেনা ভাষাটিকেই আধুনিক প্রকাশনার যত্নে সাজানো হয়েছে।

   কেন ছবি নেই: পাতাটি খোলা হয় প্রায়ই ৩জি-তে, সস্তা ফোনে। পুরো নকশা
   টাইপোগ্রাফি ও CSS দিয়ে গড়া বলে বাইটের খরচ প্রায় শূন্য, আর কোনো
   ক্লায়েন্ট জাভাস্ক্রিপ্ট লাগে না। */

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

  return (
    <main className="min-h-screen bg-canvas paper-grain text-ink">
      {/* ── মাস্টহেড ─────────────────────────────────────── */}
      <header className="bg-canvas/90 backdrop-blur-sm sticky top-0 z-40 border-b border-rule">
        <div className="mx-auto max-w-6xl px-5 md:px-8 h-[68px] flex items-center justify-between gap-4">
          <p className="font-display text-[21px] md:text-[23px] font-extrabold tracking-tight leading-none">
            আমাদের<span className="text-brass">স্কুল</span>
          </p>
          <div className="flex items-center gap-2.5">
            <a href={wa}
              className="inline-flex items-center h-11 px-5 rounded-lg text-[14px] font-bold text-white bg-deep hover:bg-ink transition-colors">
              কথা বলুন
            </a>
          </div>
        </div>
      </header>

      {/* ── হিরো ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 md:px-8 pt-14 md:pt-20 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-12 lg:gap-16 items-start">
          <div>
            {/* সরকারি পরিপত্রের ছোট শিরোভাগ */}
            <p className="rise inline-flex items-center gap-2 text-[12.5px] font-bold tracking-wide text-margin
                          border border-margin/25 bg-margin/[0.06] rounded-full px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-margin shrink-0" />
              মাউশি নির্দেশনা, মে ২০২৬
            </p>

            <h1 className="rise font-display text-[38px] sm:text-[52px] lg:text-[60px] font-extrabold leading-[1.1] tracking-tight mt-5"
              style={{ ["--d" as string]: "70ms" }}>
              আপনার প্রতিষ্ঠানের<br />
              ওয়েবসাইট,{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-deep">৭ দিনে লাইভ</span>
                {/* হাতে টানা আন্ডারলাইনের মতো পিতলের রেখা */}
                <span aria-hidden="true"
                  className="absolute left-0 right-0 bottom-[0.12em] h-[0.22em] bg-brass/30 rounded-full" />
              </span>
            </h1>

            <p className="rise mt-6 text-[17px] md:text-[18.5px] leading-[1.85] text-ink-soft max-w-xl"
              style={{ ["--d" as string]: "140ms" }}>
              নোটিশ, ভর্তি, ফলাফল, শিক্ষক, ছবি — সব এক জায়গায়। মোবাইল থেকেই
              আপডেট করবেন, কম্পিউটারের জ্ঞান লাগবে না। পুরো প্যানেল বাংলায়,
              ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন।
            </p>

            <div className="rise mt-9 flex flex-wrap items-center gap-4" style={{ ["--d" as string]: "210ms" }}>
              <a href={wa}
                className="inline-flex items-center justify-center min-h-[54px] px-8 rounded-xl bg-deep text-white
                           font-bold text-[17px] shadow-[0_10px_30px_-12px_rgba(18,50,39,0.7)]
                           hover:bg-ink transition-colors">
                ফ্রি ডেমো দেখুন
              </a>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">
                সেটআপ <b className="text-ink">৳১২,০০০</b> থেকে
                <span className="mx-1.5 text-rule">·</span>
                বছরে <b className="text-ink">৳৫,০০০</b>
              </p>
            </div>

            <div className="rise mt-10 pt-7 border-t border-rule flex flex-wrap gap-x-9 gap-y-3"
              style={{ ["--d" as string]: "280ms" }}>
              {[["১১টি", "তৈরি পাতা"], ["২টি", "নকশা"], ["৭ দিনে", "হস্তান্তর"]].map(([n, l]) => (
                <p key={l} className="leading-tight">
                  <b className="font-display text-[24px] font-extrabold text-deep block">{n}</b>
                  <span className="text-[13.5px] text-ink-soft">{l}</span>
                </p>
              ))}
            </div>
          </div>

          {/* নথি-কার্ড: প্রতিষ্ঠান যা যা পাচ্ছে */}
          <aside className="rise relative" style={{ ["--d" as string]: "160ms" }}>
            <div className="rounded-2xl bg-paper border border-rule shadow-[0_24px_60px_-32px_rgba(18,50,39,0.5)] overflow-hidden">
              <div className="bg-deep px-6 py-4 flex items-center justify-between gap-3">
                <p className="font-display text-[16.5px] font-bold text-white">প্রতিষ্ঠান যা যা পাচ্ছে</p>
                {/* সিলমোহরের ইঙ্গিত */}
                <span aria-hidden="true"
                  className="h-9 w-9 shrink-0 rounded-full border-2 border-brass/60 grid place-items-center
                             text-brass text-[10px] font-bold rotate-[-8deg] leading-none text-center">
                  ২০২৬
                </span>
              </div>
              <ul className="divide-y divide-rule">
                {CAPABILITIES.map((c) => (
                  <li key={c.t} className="px-6 py-4 flex gap-3.5">
                    <span aria-hidden="true"
                      className="mt-[3px] h-5 w-5 shrink-0 rounded-full bg-brass-soft text-brass
                                 grid place-items-center text-[12px] font-bold">✓</span>
                    <span className="min-w-0">
                      <b className="block text-[15px] font-bold leading-snug">{c.t}</b>
                      <span className="block text-[13.5px] text-ink-soft leading-relaxed mt-0.5">{c.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* ── সূচিপত্র: ওয়েবসাইটের গঠন ───────────────────────
          বাংলা পাঠ্যবইয়ের সূচির ছন্দে — প্রতিষ্ঠান এক নজরেই বোঝেন
          কোন কোন পাতা তাঁরা পাচ্ছেন। */}
      <section className="bg-paper border-y border-rule">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-[12.5px] font-bold tracking-[0.14em] text-brass uppercase">সূচিপত্র</p>
            <h2 className="font-display text-[30px] md:text-[40px] font-extrabold leading-[1.18] tracking-tight mt-2.5">
              ওয়েবসাইটে যে পাতাগুলো থাকছে
            </h2>
            <p className="mt-4 text-[16px] md:text-[17px] text-ink-soft leading-[1.85]">
              প্রতিটি পাতার লেখা, ছবি ও তথ্য অ্যাডমিন প্যানেল থেকে নিজেরাই
              বদলাতে পারবেন — আমাদের বলতে হবে না।
            </p>
          </div>

          <div className="rule-double mt-10 pt-8">
            <ol className="grid md:grid-cols-2 gap-x-14 gap-y-0">
              {STRUCTURE.map((item, i) => (
                <li key={item.en} className="py-3.5 border-b border-rule/70">
                  <div className="toc-row">
                    <span className="font-display text-[13px] font-bold text-brass tabular-nums shrink-0">
                      {BN_NUM(i + 1)}
                    </span>
                    <span className="font-bold text-[16px] md:text-[16.5px] shrink-0">{item.bn}</span>
                    <span className="toc-dots" aria-hidden="true" />
                    <span className="font-latin text-[13px] text-ink-soft shrink-0">{item.en}</span>
                  </div>

                  {item.sub && (
                    <ul className="mt-2.5 ml-7 space-y-2">
                      {item.sub.map((s) => (
                        <li key={s.en} className="toc-row">
                          <span aria-hidden="true" className="text-brass/70 text-[13px] shrink-0">└</span>
                          <span className="text-[14.5px] text-ink shrink-0">{s.bn}</span>
                          <span className="toc-dots" aria-hidden="true" />
                          <span className="font-latin text-[12.5px] text-ink-soft shrink-0">{s.en}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-7 text-[14px] text-ink-soft">
            সঙ্গে থাকছে <b className="text-ink">লগইন</b> পাতা ও প্রতিষ্ঠানের নিজস্ব
            অ্যাডমিন প্যানেল — বাংলা ও ইংরেজি, দুই ভাষাতেই।
          </p>
        </div>
      </section>

      {/* ── দুটি নকশা ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-[12.5px] font-bold tracking-[0.14em] text-brass uppercase">নকশা</p>
          <h2 className="font-display text-[30px] md:text-[40px] font-extrabold leading-[1.18] tracking-tight mt-2.5">
            দুটি নকশা, নিজের মতো রং
          </h2>
          <p className="mt-4 text-[16px] md:text-[17px] text-ink-soft leading-[1.85]">
            প্রতিষ্ঠানের ধরন বেছে নিন — বাকিটা আপনার লোগো ও রঙে নিজে থেকেই সাজে।
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {[
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
          ].map((t) => (
            <article key={t.en}
              className="group rounded-2xl bg-paper border border-rule overflow-hidden
                         shadow-[0_18px_44px_-30px_rgba(18,50,39,0.55)]
                         hover:border-brass/50 transition-colors">
              <div className="h-2.5" style={{ background: t.bar }} />
              <div className="p-7">
                <p className="font-display text-[21px] font-extrabold leading-snug" style={{ color: t.tone }}>
                  {t.name}
                </p>
                <p className="font-latin text-[12.5px] text-ink-soft mt-1">{t.en}</p>
                <p className="mt-4 text-[15px] leading-[1.85] text-ink-soft">{t.desc}</p>
                <div className="mt-6 pt-5 border-t border-rule flex flex-wrap items-center gap-x-4 gap-y-3">
                  <a href={t.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 min-h-[46px] px-5 rounded-xl
                               bg-deep text-white font-bold text-[14.5px]
                               hover:bg-ink transition-colors">
                    ডেমো সাইট দেখুন
                    <span aria-hidden="true" className="text-[13px] opacity-80">↗</span>
                  </a>
                  <span className="text-[13.5px] text-ink-soft">বাংলা ও English</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── ডেমো ও প্রবেশ ───────────────────────────────
          দর্শক প্রায়ই "আগে দেখি কেমন" ভেবে আসেন — তাই দুটি চালু ডেমো
          সাইট ও অ্যাডমিন প্যানেলের প্রবেশপথ এক জায়গায় রাখা হলো। */}
      <section className="bg-paper border-y border-rule">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-14 md:py-16">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-14 items-center">
            <div>
              <p className="text-[12.5px] font-bold tracking-[0.14em] text-brass uppercase">ডেমো</p>
              <h2 className="font-display text-[26px] md:text-[33px] font-extrabold leading-[1.22] tracking-tight mt-2.5">
                নিজের চোখে দেখে নিন
              </h2>
              <p className="mt-3.5 text-[15.5px] md:text-[16.5px] text-ink-soft leading-[1.85] max-w-xl">
                দুটি ডেমো সাইট এখনই খোলা আছে — ঘুরে দেখুন, ভাষা বদলে দেখুন,
                মোবাইলেও খুলে দেখুন। কেমন লাগল, WhatsApp-এ জানান।
              </p>
            </div>

            {/* grid ব্যবহার — flex + shrink-0 দিলে ট্যাবলেট মাপে তিনটি চওড়া
                বোতাম এক সারিতে বসতে গিয়ে পাতা আড়াআড়ি সরে যেত */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3 w-full lg:w-auto">
              <a href={demoUrl("demo-govt")} target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center justify-between gap-5 min-h-[58px] px-6 rounded-xl
                           border border-rule bg-canvas hover:border-brass transition-colors">
                <span className="text-left leading-tight min-w-0">
                  <b className="block text-[15px] font-bold">বিদ্যালয়ের ডেমো</b>
                  <span className="block text-[12.5px] text-ink-soft mt-0.5">শহীদ স্মৃতি সরকারি উচ্চ বিদ্যালয়</span>
                </span>
                <span aria-hidden="true" className="text-brass text-[15px] group-hover:translate-x-0.5 transition-transform">↗</span>
              </a>

              <a href={demoUrl("demo-madrasah-official")} target="_blank" rel="noopener noreferrer"
                className="group inline-flex items-center justify-between gap-5 min-h-[58px] px-6 rounded-xl
                           border border-rule bg-canvas hover:border-brass transition-colors">
                <span className="text-left leading-tight min-w-0">
                  <b className="block text-[15px] font-bold">মাদরাসার ডেমো</b>
                  <span className="block text-[12.5px] text-ink-soft mt-0.5">দারুল হিকমাহ ইসলামিয়া মাদরাসা</span>
                </span>
                <span aria-hidden="true" className="text-brass text-[15px] group-hover:translate-x-0.5 transition-transform">↗</span>
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* ── কীভাবে কাজ করে ──────────────────────────────── */}
      <section className="bg-paper border-y border-rule">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20">
          <h2 className="font-display text-[30px] md:text-[40px] font-extrabold leading-[1.18] tracking-tight">
            কীভাবে শুরু করবেন
          </h2>
          <div className="mt-10 grid md:grid-cols-3 gap-8 md:gap-10">
            {[
              { n: "০১", t: "তথ্য পাঠান", d: "প্রতিষ্ঠানের নাম, ঠিকানা, লোগো ও কয়েকটি ছবি WhatsApp-এ পাঠালেই হবে।" },
              { n: "০২", t: "নকশা বেছে নিন", d: "দুটি নকশার যেকোনো একটি — আমরা আপনার রঙে সাজিয়ে দেখাব।" },
              { n: "০৩", t: "লাইভ ও হস্তান্তর", d: "সাত দিনের মধ্যে ডোমেইনসহ চালু, সঙ্গে অ্যাডমিন প্যানেলের প্রশিক্ষণ।" },
            ].map((s) => (
              <div key={s.n} className="relative pl-0">
                <p className="font-display text-[40px] font-extrabold text-brass/25 leading-none">{s.n}</p>
                <p className="font-display text-[19px] font-bold mt-2">{s.t}</p>
                <p className="mt-2.5 text-[15px] leading-[1.85] text-ink-soft">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── শেষ আহ্বান ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 md:px-8 py-16 md:py-20">
        <div className="rounded-2xl bg-deep text-white px-7 py-10 md:px-12 md:py-14
                        shadow-[0_28px_70px_-38px_rgba(18,50,39,0.9)]">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h2 className="font-display text-[27px] md:text-[36px] font-extrabold leading-[1.22] tracking-tight">
                প্রতিষ্ঠানের ওয়েবসাইট আর ফেলে রাখবেন না
              </h2>
              <p className="mt-3.5 text-[16px] md:text-[17px] leading-[1.85] text-white/70 max-w-xl">
                একবার কথা বলুন — ডেমো দেখে তারপর সিদ্ধান্ত নিন। কোনো অগ্রিম নেই।
              </p>
            </div>
            <a href={wa}
              className="inline-flex items-center justify-center min-h-[54px] px-8 rounded-xl
                         bg-brass text-white font-bold text-[17px] whitespace-nowrap
                         hover:brightness-110 transition">
              WhatsApp-এ কথা বলুন
            </a>
          </div>
        </div>
      </section>

      {/* ── ফুটার ───────────────────────────────────────── */}
      <footer className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13.5px] text-ink-soft">
            © {new Date().getFullYear()} আমাদেরস্কুল
            <span className="mx-1.5 text-rule">·</span>
            <span className="font-latin">{root}</span>
          </p>
          <Link href="/super/login" aria-label="সুপার প্যানেল"
            className="text-rule hover:text-brass transition-colors text-[13px]">•</Link>
        </div>
      </footer>
    </main>
  );
}
