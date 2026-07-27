/* ═══════════════════════════════════════════════════════════════
   OFFICIAL TEMPLATE পরিবার — পাঁচটি প্রাতিষ্ঠানিক টেমপ্লেট

     ১. official_govt      🇧🇩 সরকারি ও MPO স্কুল (বাংলা, মাউশি-অনুপ্রাণিত)
     ২. official_bangla    🏫 বেসরকারি বাংলা মাধ্যম স্কুল/কলেজ (বাংলা)
     ৩. official_bangla_en 🏫 বেসরকারি বাংলা মাধ্যম স্কুল/কলেজ (English)
     ৪. official_madrasah  🕌 মাদ্রাসা ও ইসলামিক প্রতিষ্ঠান (বাংলা)
     ৫. official_english   🌍 English Medium / English Version / International

   কেন এক ফাইলে পাঁচটি: পাঁচটিরই সাইট-কাঠামো অভিন্ন (হোম → পরিচিতি →
   সভাপতির বাণী → অধ্যক্ষের বাণী → নোটিশ → একাডেমিক → ক্লাব → ফলাফল →
   ভর্তি → গ্যালারি → যোগাযোগ → লগইন)। আলাদা হয় শুধু "চেহারা": হেডারের গড়ন,
   হিরোর বিন্যাস, কোণের গোলাই, শিরোনামের ফন্ট, অলংকরণ ও ভাষা। পাঁচবার একই
   এক হাজার লাইন লিখলে একটিতে বাগ ঠিক করে বাকি চারটিতে ভুলে যাওয়া নিশ্চিত —
   তাই একটিই ভিত্তি, উপরে পাঁচটি ভিন্ন কনফিগ।
   ═══════════════════════════════════════════════════════════════ */
import Image from "next/image";
import { TLink } from "@/components/site/tlink";
import type { Template, HomeData, NavItem, TenantX, Notice } from "./types";
import { buildNav, footerLinks, show } from "./types";
import { tenantBase, withBase } from "@/lib/base";
import { Icon, WhatsAppIcon, FacebookIcon, YouTubeIcon, MessengerIcon } from "@/components/site/icons";
import {
  Section, Btn, Pill, NoticeTicker, FAQ, Stars, MapEmbed, Figure, Avatar, CheckList, FeeTable,
} from "@/components/site/ui";
import {
  MobileNav, StickyHeader, CountUp, Lightbox, VideoEmbed, ResultSearch, InquiryForm, HeroSlides, LangSwitch,
} from "@/components/site/interactive";
import { ResultChart } from "@/components/site/chart";
import { submitInquiry } from "@/actions/site";
import { waLink } from "@/lib/utils";
import { dict, fmtDate, messageOf, type Lang } from "@/lib/i18n";
import { toBnDigits } from "@/lib/digits";
import type { SiteContent } from "@/lib/content";

/* ── ভ্যারিয়েন্ট কনফিগ ──────────────────────────────────── */
type Chrome = "govt" | "institute" | "modern" | "islamic";
type HeroKind = "board" | "banner" | "split";

type Variant = {
  key: string;
  label: string;
  blurb: string;
  defaults: { primary: string; secondary: string };
  chrome: Chrome;
  hero: HeroKind;
  /** শিরোনামের ফন্ট ক্লাস */
  display: "font-display" | "font-latin";
  /** কার্ড ও বোতামের কোণ — সরকারি নথি কম গোল, ইন্টারন্যাশনাল বেশি গোল */
  r: string;
  girih?: boolean;
  bismillah?: boolean;
  govtLinks?: boolean;
};

/* ── ছোট সহায়ক ─────────────────────────────────────────── */
const num = (v: string | number, lang: Lang) => (lang === "bn" ? toBnDigits(String(v)) : String(v));

function formLabels(lang: Lang) {
  const t = dict(lang);
  return lang === "en"
    ? {
        name: t.formName, phone: t.formPhone, selectClass: t.formClass, message: t.formMessage,
        sending: t.formSending, thanks: t.formThanks, privacy: t.formPrivacy,
      }
    : undefined;
}
function searchLabels(lang: Lang) {
  const t = dict(lang);
  return lang === "en"
    ? {
        exam: t.selectExam, roll: t.rollNo, view: t.viewResult,
        empty: "No examination added yet", needRoll: "Please enter a roll number.",
        notPublished: "The result sheet for this examination has not been published yet.",
      }
    : undefined;
}

/* সেকশন শিরোনাম — চেহারা ভ্যারিয়েন্ট অনুযায়ী */
function Head({ v, title, sub, align = "center", light = false }: {
  v: Variant; title: string; sub?: string; align?: "center" | "left"; light?: boolean;
}) {
  const center = align === "center";
  return (
    <div data-reveal className={`mb-9 md:mb-12 ${center ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}`}>
      <h2 className={`${v.display} t-h2 ${light ? "text-white" : "text-n-900"} inline-block relative pb-3`}>
        {title}
        {v.chrome === "islamic" ? (
          <span className={`rule-gold-thick absolute bottom-0 w-24 ${center ? "left-1/2 -translate-x-1/2" : "left-0"}`} />
        ) : (
          <span className={`absolute bottom-0 h-[3px] w-16 rounded-full bg-accent ${center ? "left-1/2 -translate-x-1/2" : "left-0"}`} />
        )}
      </h2>
      {sub && <p className={`t-lead mt-4 ${light ? "text-white/75" : "text-n-600"}`}>{sub}</p>}
    </div>
  );
}

const cardCls = (v: Variant, extra = "") =>
  `${v.r} border border-n-200 bg-white ${extra}`;

/* ═══════════════ হেডার ═══════════════ */
function makeHeader(v: Variant): Template["Header"] {
  return async function Header({ tenant, notices = [], lang = "bn" }) {
    const t = dict(lang);
    /* মোবাইল মেনু একটি ক্লায়েন্ট কম্পোনেন্ট, তাই সেখানে TLink চলে না
       (TLink সার্ভারে ভিত্তি-পথ পড়ে)। তাই লিংকগুলো এখানেই তৈরি করে
       পাঠানো হয়। পথ-ভিত্তিক না হলে base ফাঁকা, কিছুই বদলায় না। */
    const base = await tenantBase();
    const nav = buildNav(tenant, lang).map((n) => ({
      ...n,
      href: withBase(base, n.href),
      children: n.children?.map((c) => ({ ...c, href: withBase(base, c.href) })),
    }));
    const main = nav.filter((n) => !n.cta);
    const login = nav.find((n) => n.cta);
    const c = tenant.contact;

    return (
      <>
        <a href="#main" className="skip-link">{t.skipToContent}</a>

        {/* উপরের তথ্য-পট্টি — সরকারি ভ্যারিয়েন্টে জাতীয় রঙের রেখা */}
        <div className="text-white text-[13px] no-print" style={{ background: "var(--brand-900)" }}>
          {v.chrome === "govt" && (
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, var(--brand-600) 60%, var(--accent-600) 60%)` }} />
          )}
          <div className="container-x flex flex-wrap items-center justify-between gap-2 py-2">
            <p className="flex items-center gap-2 opacity-90">
              <Icon name="landmark" size={14} className="shrink-0" />
              {tenant.eiin
                ? <>{t.eiin}: <span className="tnum font-semibold">{tenant.eiin}</span> · {t.government}</>
                : t.approved}
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              {c.phone && (
                <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 hover:underline">
                  <Icon name="phone" size={13} /> <span className="tnum">{c.phone}</span>
                </a>
              )}
              {c.email && <a href={`mailto:${c.email}`} className="hidden md:inline-flex items-center gap-1.5 hover:underline">
                <Icon name="mail" size={13} /> {c.email}
              </a>}
              {c.facebook && (
                <a href={c.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hidden sm:inline-flex"><FacebookIcon width={15} height={15} /></a>
              )}
              {/* ভাষা — বাংলা ডিফল্ট, দর্শক চাইলে ইংরেজি */}
              <LangSwitch lang={lang} />
            </div>
          </div>
        </div>

        {/* প্রতিষ্ঠানের সাইনবোর্ড */}
        <div className={`bg-white border-b border-n-200 ${v.girih ? "relative overflow-hidden" : ""}`}>
          {v.girih && <span className="tex-girih absolute inset-0 opacity-[0.35] pointer-events-none" aria-hidden="true" />}
          <div className="container-x relative flex items-center gap-4 md:gap-6 py-4 md:py-5">
            {tenant.logo
              /* সাইনবোর্ডের লোগো প্রায়ই পাতার LCP উপাদান — priority দিলে
                 এটি lazy সারিতে না দাঁড়িয়ে সঙ্গে সঙ্গে নামে। মাপ ৮০px
                 (md-এর সর্বোচ্চ), ছোট পর্দায় CSS নামিয়ে আনে। */
              ? <Image src={tenant.logo} alt="" width={80} height={80} priority
                  className={`h-16 w-16 md:h-20 md:w-20 object-contain shrink-0 ${v.chrome === "govt" ? "rounded-full ring-2 ring-brand-200 p-1" : ""}`} />
              : <span className={`h-16 w-16 md:h-20 md:w-20 shrink-0 grid place-items-center text-white text-2xl md:text-3xl font-extrabold
                  ${v.chrome === "modern" ? "rounded-2xl" : "rounded-full"}`}
                  style={{ background: "linear-gradient(140deg, var(--brand-600), var(--brand-800))" }}>
                  {tenant.name[0]}
                </span>}
            <div className="min-w-0 flex-1">
              {v.bismillah && (
                <p className="font-arabic text-[15px] md:text-[17px] text-accent-700 leading-none mb-1.5" dir="rtl">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              )}
              {/* প্রতিষ্ঠানের নাম <p>, <h1> নয় — প্রতিটি পেজে একটিই h1 থাকা উচিত,
                  আর সেটি ওই পেজের নিজস্ব শিরোনাম (হোমে হিরোর বার্তা)। */}
              {/* প্রতিষ্ঠানের নাম কাটা যাবে না — সরু পর্দায় দুই লাইনে যাক।
                  truncate দিলে লম্বা নাম ("দারুল হিকমাহ ইসলামিয়া মাদরাসা")
                  মোবাইলে অর্ধেক হয়ে যেত, অথচ এটিই পাতার সবচেয়ে জরুরি লেখা। */}
              <p className={`${v.display} text-[20px] md:text-[30px] font-extrabold leading-tight text-brand-900 line-clamp-2`}>
                {tenant.name}
              </p>
              {tenant.nameEn && <p className="font-latin text-[12.5px] md:text-[14px] text-n-500 truncate">{tenant.nameEn}</p>}
              <p className="text-[13px] md:text-[14.5px] text-n-600 mt-0.5 truncate">
                {c.address}
                {tenant.established && <span className="hidden sm:inline"> · {t.established} {num(tenant.established, lang)}</span>}
              </p>
            </div>
            {/* কাজের বোতামগুলো এখানেই — মেনুর সারিতে নয়। আগে "লগইন" মেনুর
                পাশে বসত, ফলে সরু ডেস্কটপে শেষ মেনু-আইটেমটি ("যোগাযোগ") অর্ধেক
                কেটে যেত এবং বানান ভুলের মতো দেখাত। */}
            <div className="hidden lg:flex items-center gap-2.5 shrink-0">
              {login && (
                <Btn href={login.href} variant="outline"
                  className={`!min-h-[46px] !px-4 !text-[14.5px] !${v.r}`} icon="userCheck">
                  {login.label}
                </Btn>
              )}
              <Btn href="/results" variant="outline" className={`!min-h-[46px] !px-4 !text-[14.5px] !${v.r}`} icon="trophy">{t.navResults}</Btn>
              <Btn href="/admission#apply" variant="accent" className={`!min-h-[46px] !px-5 !text-[15px] !${v.r}`}>{t.applyOnline}</Btn>
            </div>
          </div>
        </div>

        {/* প্রধান নেভিগেশন */}
        <StickyHeader transparentTop={false} className="text-white shadow-e2 no-print">
          <div style={{ background: v.chrome === "modern" ? "var(--brand-800)" : "var(--brand-700)" }}>
            <div className="container-x flex items-center">
              {/* এক সারি, কখনো দুই লাইন নয়। ড্রপডাউন ইচ্ছাকৃতভাবে বাদ:
                  বারোটি আইটেমের সারি স্ক্রলযোগ্য রাখতে হলে overflow দরকার,
                  আর overflow ড্রপডাউনকে কেটে ফেলে। "একাডেমিক তথ্য" পেজেই তার
                  উপ-পেজগুলো বড় করে দেওয়া আছে, আর মোবাইল মেনুতে তো আছেই। */}
              <nav className="hidden lg:flex nav-row flex-1" aria-label={t.mainMenu}>
                {main.map((nItem) => (
                  <TLink key={nItem.href + nItem.label} href={nItem.href} title={nItem.label}
                    className={`inline-flex items-center px-1.5 xl:px-3 py-3.5 text-[12.5px] xl:text-[14.5px] font-bold transition
                      ${nItem.feature ? "text-accent-200" : ""} hover:bg-black/20`}>
                    {nItem.short || nItem.label}
                  </TLink>
                ))}
              </nav>

              <div className="lg:hidden flex-1 py-2 font-bold">{t.menu}</div>

              <div className="py-2 lg:py-0 lg:ml-2">
                <MobileNav nav={nav as NavItem[]} name={tenant.name} logo={tenant.logo}
                  phone={c.phone} whatsapp={c.whatsapp}
                  labels={lang === "en"
                    ? { open: "Open menu", close: "Close", menu: t.mainMenu, call: t.callNow }
                    : undefined} />
              </div>
            </div>
          </div>
        </StickyHeader>

        {notices.length > 0 && (
          <NoticeTicker notices={notices.slice(0, 6)} label={t.secLatestNotice}
            className="bg-white border-b border-n-200 text-n-700 h-11 no-print" />
        )}
      </>
    );
  };
}

/* ═══════════════ হিরো ═══════════════ */
function Hero({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const { tenant, content, notices } = d;
  const t = dict(lang);
  const images = tenant.heroImages?.length ? tenant.heroImages : tenant.heroImage ? [tenant.heroImage] : [];

  const ctas = (
    <div className="mt-6 flex flex-wrap gap-3">
      <Btn href="/admission#apply" variant="accent" iconRight="arrowRight" className={`!${v.r}`}>{t.applyNow}</Btn>
      {tenant.contact.whatsapp && (
        <Btn href={waLink(tenant.contact.whatsapp, lang === "en"
          ? `Hello, I would like to know about admission at ${tenant.name}.`
          : `আসসালামু আলাইকুম। ${tenant.name}-এ ভর্তি সংক্রান্ত তথ্য জানতে চাই।`)}
          variant="whatsapp" className={`!${v.r}`}>
          <WhatsAppIcon width={19} height={19} /> WhatsApp
        </Btn>
      )}
    </div>
  );

  /* ক. সরকারি ধাঁচ — ছবির পাশে নোটিশ বোর্ড (মাউশি/স্কুল সাইটের চিরচেনা বিন্যাস) */
  if (v.hero === "board") {
    return (
      <section className="bg-n-50 border-b border-n-200">
        <div className="container-x py-7 md:py-10 grid lg:grid-cols-[1.6fr_1fr] gap-6 items-stretch">
          <div data-reveal className={`relative overflow-hidden ${v.r} min-h-[360px] md:min-h-[440px] flex`}>
            {images.length
              ? <HeroSlides images={images} alt={tenant.name} />
              : <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--hero-from), var(--hero-to))" }} />}
            <div className="absolute inset-0 scrim" />
            <div className="relative mt-auto p-6 md:p-9">
              {tenant.admission?.open && <Pill tone="accent" dot className="mb-4 !text-[13.5px]">{content.heroKicker}</Pill>}
              <h1 className={`${v.display} text-[26px] md:text-[40px] font-extrabold text-white leading-[1.2]`}>{content.heroTitle}</h1>
              <p className="mt-3 text-white/85 max-w-lg text-[15.5px] md:text-[17px] leading-relaxed">{content.heroSub}</p>
              {ctas}
            </div>
          </div>

          <aside data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}
            className={`${v.r} border border-n-200 bg-white overflow-hidden flex flex-col`}>
            <div className="flex items-center gap-2.5 px-5 py-4 text-white" style={{ background: "var(--brand-700)" }}>
              <Icon name="bell" size={19} />
              <h2 className={`${v.display} font-bold text-[17px]`}>{t.secNoticeBoard}</h2>
              <TLink href="/notice" className="ml-auto text-[13px] opacity-85 hover:opacity-100 hover:underline">{t.seeAll}</TLink>
            </div>
            <div className="khata khata-margin flex-1 px-3 py-2">
              <ul className="pl-9 pr-2">
                {notices.slice(0, 7).map((nt) => (
                  <li key={nt._id} className="leading-8">
                    <TLink href={`/notice/${nt._id}`} className="block hover:text-brand transition">
                      <span className="text-[14.5px] text-n-800 line-clamp-1">
                        {nt.pinned && <span className="text-accent-600 font-bold">★ </span>}{nt.title}
                      </span>
                    </TLink>
                  </li>
                ))}
                {!notices.length && <li className="leading-8 text-n-400 text-[14.5px]">{t.emptyNotice}</li>}
              </ul>
            </div>
            <div className="border-t border-n-200 p-3">
              <Btn href="/notice" variant="outline" className={`w-full !min-h-[46px] !text-[14.5px] !${v.r}`} iconRight="arrowRight">
                {t.allNotices}
              </Btn>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  /* খ. বিভাজিত — বাঁয়ে বার্তা, ডানে ছবি (বেসরকারি প্রতিষ্ঠান ও ইন্টারন্যাশনাল) */
  if (v.hero === "split") {
    return (
      <section className="relative overflow-hidden bg-white border-b border-n-200">
        <span className="tex-grid tex-grid-fade absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="container-x relative py-10 md:py-16 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div data-reveal>
            {tenant.admission?.open && <Pill tone="accent" dot className="mb-5">{content.heroKicker}</Pill>}
            <h1 className={`${v.display} t-display text-n-900`}>{content.heroTitle}</h1>
            <p className="mt-5 t-lead text-n-600 max-w-xl">{content.heroSub}</p>
            {ctas}
            {content.trust.length > 0 && (
              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3">
                {content.trust.slice(0, 3).map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-2.5 text-[14px]">
                    <Icon name={b.icon} size={19} className="text-brand" />
                    <span><b className="block text-n-800 leading-tight">{b.label}</b>
                      {b.sub && <span className="text-[12.5px] text-n-500">{b.sub}</span>}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div data-reveal style={{ ["--reveal-delay" as string]: "120ms" }}
            className={`relative ${v.r} overflow-hidden min-h-[340px] md:min-h-[460px]`}>
            {images.length
              ? <HeroSlides images={images} alt={tenant.name} />
              : <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--hero-from), var(--hero-to))" }} />}
            {notices[0] && (
              <TLink href={`/notice/${notices[0]._id}`}
                className={`absolute inset-x-4 bottom-4 ${v.r} glass p-4 flex items-start gap-3 hover:shadow-e3 transition`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-on">
                  <Icon name="bell" size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11.5px] font-bold text-brand uppercase tracking-wide">{t.secLatestNotice}</span>
                  <span className="block text-[14.5px] font-semibold text-n-900 line-clamp-2 leading-snug">{notices[0].title}</span>
                </span>
              </TLink>
            )}
          </div>
        </div>
      </section>
    );
  }

  /* গ. ব্যানার — পুরো প্রস্থে ছবি, উপরে বার্তা (ঐতিহ্যবাহী ও ইসলামিক) */
  return (
    <section className="relative">
      <div className="relative min-h-[440px] md:min-h-[560px] flex">
        {images.length
          ? <HeroSlides images={images} alt={tenant.name} />
          : <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--hero-from), var(--hero-to))" }} />}
        <div className="absolute inset-0 scrim" />
        {v.girih && <span className="tex-girih absolute inset-0 opacity-25 pointer-events-none" aria-hidden="true" />}
        <div className="container-x relative flex flex-col justify-end py-12 md:py-16">
          <div data-reveal className="max-w-2xl">
            {tenant.admission?.open && <Pill tone="accent" dot className="mb-5">{content.heroKicker}</Pill>}
            {v.chrome === "islamic" && <div className="rule-gold-thick w-28 mb-5" />}
            <h1 className={`${v.display} t-display text-white`}>{content.heroTitle}</h1>
            <p className="mt-4 t-lead text-white/85">{content.heroSub}</p>
            {ctas}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ দ্রুত সেবা টাইল ═══════════════ */
function QuickTiles({ v, lang }: { v: Variant; lang: Lang }) {
  const t = dict(lang);
  const tiles = [
    { href: "/admission", icon: "clipboard", label: t.navAdmission, sub: lang === "en" ? "Circular & form" : "বিজ্ঞপ্তি ও ফরম" },
    { href: "/results", icon: "trophy", label: t.navResults, sub: lang === "en" ? "Search by roll" : "রোল দিয়ে খুঁজুন" },
    { href: "/academics/routine", icon: "calendar", label: t.navRoutine, sub: lang === "en" ? "Class & exam" : "ক্লাস ও পরীক্ষা" },
    { href: "/notice", icon: "bell", label: t.navNotice, sub: lang === "en" ? "All announcements" : "সব বিজ্ঞপ্তি" },
  ];
  return (
    <div className="bg-white border-b border-n-200">
      <div className="container-x py-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {tiles.map((tile, i) => (
            <TLink key={tile.href} href={tile.href} data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
              className={`lift group ${v.r} border border-n-200 bg-white p-4 md:p-5 flex items-center gap-3 md:gap-4`}>
              <span className={`grid h-11 w-11 md:h-12 md:w-12 shrink-0 place-items-center ${v.r} text-white transition group-hover:scale-105`}
                style={{ background: i % 2 ? "var(--accent-600)" : "var(--brand-600)" }}>
                <Icon name={tile.icon} size={22} />
              </span>
              {/* শিরোনাম কখনো কাটা যাবে না — "ফলাফল" যেন "ফলা…" না হয়।
                  আগে দুটি লাইনেই truncate ছিল; আইকন ও প্যাডিংয়ের পর জায়গা
                  কম পড়ায় ছোট বাংলা শব্দও কেটে যেত। এখন শিরোনাম প্রয়োজনে
                  পরের লাইনে যাবে, আর বিবরণ দুই লাইন পর্যন্ত দেখা যাবে। */}
              {/* flex-1 না দিলে লেখার কলামটি নিজের সংকুচিত মাপে বসে যেত
                  (২৬০px কার্ডে মাত্র ৫০px), ফলে "ফলাফল"-ও আঁটত না। */}
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-n-900 text-[15px] md:text-[15.5px] leading-snug">{tile.label}</span>
                <span className="block text-[12.5px] md:text-[13px] text-n-500 leading-snug mt-0.5 line-clamp-2">{tile.sub}</span>
              </span>
            </TLink>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ পরিচিতি ═══════════════ */
function About({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const { tenant, content } = d;
  const t = dict(lang);
  return (
    <Section id="about" tone="plain">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-14">
        <div>
          <Head v={v} align="left" title={content.aboutTitle} />
          <p data-reveal className="text-n-700 leading-[1.95]">{content.aboutBody}</p>
          {content.aboutPoints.length > 0 && (
            <div data-reveal className="mt-7 grid sm:grid-cols-2 gap-x-8">
              <CheckList items={content.aboutPoints} />
            </div>
          )}
          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            <Btn href="/about" variant="outline" className={`!${v.r}`} iconRight="arrowRight">{t.navAbout}</Btn>
            <Btn href="/academics/departments" variant="ghost" className={`!${v.r}`}>{t.navDepartments}</Btn>
          </div>
        </div>

        {content.trust.length > 0 && (
          <aside data-reveal className={`${v.r} border border-n-200 bg-n-50 p-6 self-start`}>
            <p className={`${v.display} font-bold text-n-900 mb-5`}>{t.secStats}</p>
            <ul className="space-y-4">
              {content.trust.map((b, i) => (
                <li key={i} className="flex gap-3.5">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center ${v.r} bg-white text-brand hairline`}>
                    <Icon name={b.icon} size={20} />
                  </span>
                  <span>
                    <b className="block text-[15px] text-n-900 leading-tight">{b.label}</b>
                    {b.sub && <span className="text-[13px] text-n-500">{b.sub}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </Section>
  );
}

/* ═══════════════ সভাপতি ও অধ্যক্ষের বাণী (হোমে সংক্ষিপ্ত) ═══════════════ */
function Leaders({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const { content } = d;
  const t = dict(lang);
  const people = [
    { p: content.chairman, href: "/chairman" },
    { p: content.principal, href: "/principal" },
  ].filter((x) => x.p?.name) as { p: NonNullable<SiteContent["chairman"]>; href: string }[];
  if (!people.length) return null;

  return (
    <Section id="leaders" tone="soft">
      <Head v={v} title={t.secLeadership} />
      <div className={`grid gap-6 ${people.length > 1 ? "lg:grid-cols-2" : "max-w-3xl mx-auto"}`}>
        {people.map(({ p, href }) => (
          <article key={href} data-reveal className={`${v.r} border border-n-200 bg-white overflow-hidden`}>
            <p className={`px-6 py-3.5 text-white ${v.display} font-bold text-[16px]`} style={{ background: "var(--brand-700)" }}>
              {messageOf(p.role, lang)}
            </p>
            <div className="p-6 md:p-7">
              <div className="flex items-center gap-4 pb-5 mb-5 border-b border-n-200">
                <Avatar src={p.photo} name={p.name} size={64} rounded={v.chrome === "modern" ? "rounded-2xl" : "rounded-lg"} />
                <div className="min-w-0">
                  {/* মানুষের নাম কাটা অসম্মানজনক — প্রয়োজনে দুই লাইনে যাক */}
                  <p className={`${v.display} font-bold text-[18px] text-n-900 leading-snug line-clamp-2`}>{p.name}</p>
                  <p className="text-[14px] text-brand font-semibold">{p.role}</p>
                </div>
              </div>
              <blockquote className="text-n-600 leading-[1.95] line-clamp-5">“{p.message}”</blockquote>
              <TLink href={href} className="mt-5 inline-flex items-center gap-1.5 text-brand font-bold text-[14.5px] hover:gap-2.5 transition-all">
                {t.readMore} <Icon name="arrowRight" size={15} />
              </TLink>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ পরিসংখ্যান ═══════════════ */
function Stats({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  if (!d.content.stats.length) return null;
  const tints = ["var(--brand-600)", "var(--accent-700)", "var(--brand-800)", "var(--accent-600)"];
  return (
    <Section tone="plain" size="sm">
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {d.content.stats.map((s, i) => (
          <div key={i} data-reveal style={{ ["--reveal-delay" as string]: `${i * 70}ms`, background: tints[i % 4] }}
            className={`${v.r} p-6 text-white text-center`}>
            <Icon name={s.icon} size={26} className="mx-auto opacity-85" />
            <dd className="mt-3 text-[34px] font-extrabold leading-none tnum"><CountUp value={s.value} /></dd>
            <dt className="mt-1.5 text-[14px] opacity-85">{s.label}</dt>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/* ═══════════════ বিভাগসমূহ (হোমে ঝলক) ═══════════════ */
function Departments({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const t = dict(lang);
  const items = d.content.departments.slice(0, 4);
  if (!items.length) return null;
  return (
    <Section id="departments" tone="soft">
      <Head v={v} title={t.navDepartments} sub={t.subDepartments} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((dep, i) => (
          <article key={dep.name + i} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 70}ms` }}
            className={`lift ${v.r} border border-n-200 bg-white p-6 flex flex-col`}>
            <span className={`grid h-12 w-12 place-items-center ${v.r} bg-brand-50 text-brand`}>
              <Icon name={dep.icon || "book"} size={23} />
            </span>
            <h3 className={`${v.display} font-bold text-[17px] text-n-900 mt-4 leading-snug`}>{dep.name}</h3>
            {dep.level && <p className="mt-1 text-[13px] font-semibold text-brand">{dep.level}</p>}
            {dep.desc && <p className="mt-2.5 text-[14.5px] text-n-600 leading-relaxed line-clamp-3 flex-1">{dep.desc}</p>}
            {dep.subjects?.length ? (
              <p className="mt-4 pt-3 border-t border-n-100 text-[13px] text-n-500 line-clamp-2">
                {dep.subjects.slice(0, 3).join(" · ")}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <div className="mt-9 text-center">
        <Btn href="/academics/departments" variant="outline" className={`!${v.r}`} iconRight="arrowRight">{t.viewAll}</Btn>
      </div>
    </Section>
  );
}

/* ═══════════════ কেন আমরা ═══════════════ */
function WhyUs({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const t = dict(lang);
  if (!d.content.why.length) return null;
  return (
    <Section id="why" tone="plain">
      <Head v={v} title={t.secWhyUs} sub={t.secWhyUsSub} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {d.content.why.map((w, i) => (
          <div key={i} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 70}ms` }}
            className={`relative overflow-hidden ${v.r} border border-n-200 bg-white p-6 pt-7 lift`}>
            <span className="absolute inset-x-0 top-0 h-1" style={{ background: i % 2 ? "var(--accent-600)" : "var(--brand-600)" }} />
            <span className={`grid h-12 w-12 place-items-center ${v.r} bg-brand-50 text-brand`}>
              <Icon name={w.icon} size={23} />
            </span>
            <h3 className={`${v.display} font-bold text-[18px] text-n-900 mt-4`}>{w.title}</h3>
            <p className="mt-2 text-n-600 leading-relaxed text-[15px]">{w.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ শিক্ষকবৃন্দ ═══════════════ */
function Teachers({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const t = dict(lang);
  if (!d.teachers.length) return null;
  const label = d.tenant.type === "madrasah" && lang === "bn" ? "উস্তাযবৃন্দ" : t.navTeachers;
  return (
    <Section id="teachers" tone="soft">
      <Head v={v} title={label} sub={t.subTeachers} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {d.teachers.slice(0, 4).map((tc, i) => (
          <figure key={tc._id} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 4) * 70}ms` }}
            className={`lift ${v.r} border border-n-200 bg-white overflow-hidden text-center`}>
            <div className="p-5 pb-0">
              <Figure src={tc.photo} alt={tc.name} ratio="aspect-[3/4]" rounded={v.r} icon="users" />
            </div>
            <figcaption className="p-5">
              <p className="font-bold text-n-900 leading-tight">{tc.name}</p>
              <p className="mt-1 text-[13.5px] text-brand font-semibold">{tc.designation}</p>
              {tc.subject && <p className="mt-0.5 text-[13px] text-n-500">{tc.subject}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Btn href="/teachers" variant="outline" className={`!${v.r}`} iconRight="arrowRight">{t.allTeachers}</Btn>
      </div>
    </Section>
  );
}

/* ═══════════════ ফলাফল — অনুসন্ধান + চার্ট ═══════════════ */
function Results({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const t = dict(lang);
  const chart = d.content.resultChart?.[0];
  return (
    <Section id="results" tone="plain">
      <Head v={v} title={t.navResults} sub={t.subResults} />
      <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 items-start">
        <div data-reveal className={`${v.r} p-6 md:p-7 text-white`} style={{ background: "var(--brand-800)" }}>
          <h3 className={`${v.display} t-h3`}>{t.secResultSearch}</h3>
          <p className="mt-2.5 text-white/75 text-[15px]">{d.content.resultPortalNote}</p>
          <div className={`mt-6 ${v.r} bg-white p-4 md:p-5`}>
            <ResultSearch exams={d.results} labels={searchLabels(lang)}
              note={d.results.length ? undefined : t.emptyResults} />
          </div>
          <Btn href="/results" variant="white" className={`mt-5 !${v.r}`} iconRight="arrowRight">{t.viewAll}</Btn>
        </div>

        {chart && <div data-reveal style={{ ["--reveal-delay" as string]: "110ms" }}><ResultChart series={chart} lang={lang} /></div>}
      </div>
    </Section>
  );
}

/* ═══════════════ ক্লাব ═══════════════ */
function Clubs({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const t = dict(lang);
  const items = d.content.clubs.slice(0, 6);
  if (!items.length) return null;
  return (
    <Section id="clubs" tone="soft">
      <Head v={v} title={t.navClub} sub={t.subClub} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c, i) => (
          <div key={c.name + i} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 60}ms` }}
            className={`${v.r} border border-n-200 bg-white p-5 flex gap-4 lift`}>
            <span className={`grid h-11 w-11 shrink-0 place-items-center ${v.r} text-white`}
              style={{ background: i % 2 ? "var(--accent-600)" : "var(--brand-600)" }}>
              <Icon name={c.icon || "sparkles"} size={20} />
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-n-900">{c.name}</span>
              {c.desc && <span className="mt-1 block text-[14px] text-n-500 leading-relaxed line-clamp-2">{c.desc}</span>}
              {c.day && <span className="mt-1.5 block text-[12.5px] text-brand font-semibold">{c.day}</span>}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-9 text-center">
        <Btn href="/club" variant="outline" className={`!${v.r}`} iconRight="arrowRight">{t.viewAll}</Btn>
      </div>
    </Section>
  );
}

/* ═══════════════ অনুষ্ঠান ও ক্যাম্পাস জীবন ═══════════════ */
function Events({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const t = dict(lang);
  const loc = lang === "en" ? "en-GB" : "bn-BD";
  return (
    <Section id="events" tone="plain">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        <div>
          <Head v={v} align="left" title={t.secEvents} />
          <div className="space-y-3">
            {d.events.slice(0, 4).map((e) => (
              <article key={e._id} className={`flex gap-4 ${v.r} border border-n-200 bg-white p-5`}>
                <span className={`grid h-16 w-16 shrink-0 place-items-center ${v.r} border-2 text-center`}
                  style={{ borderColor: "var(--brand-600)", color: "var(--brand-700)" }}>
                  <span>
                    <span className="block text-[21px] font-extrabold leading-none tnum">
                      {num(new Date(e.date).getDate(), lang)}
                    </span>
                    <span className="block text-[11px] mt-1">{new Date(e.date).toLocaleDateString(loc, { month: "short" })}</span>
                  </span>
                </span>
                <span className="min-w-0">
                  <h3 className="font-bold text-n-900">{e.title}</h3>
                  <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-n-500">
                    {e.time && <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={13} />{e.time}</span>}
                    {e.venue && <span className="inline-flex items-center gap-1.5"><Icon name="mapPin" size={13} />{e.venue}</span>}
                  </span>
                  {e.desc && <p className="mt-1.5 text-[14px] text-n-500 line-clamp-2">{e.desc}</p>}
                </span>
              </article>
            ))}
            {!d.events.length && (
              <div className={`${v.r} border border-n-200 bg-white p-8 text-center text-n-500`}>
                <Icon name="calendar" size={30} className="mx-auto mb-3 text-n-300" />
                {t.emptyEvents}
              </div>
            )}
          </div>
        </div>

        <div>
          <Head v={v} align="left" title={t.secCampusLife} />
          <div className="grid sm:grid-cols-2 gap-4">
            {d.content.campusLife.map((c, i) => (
              <div key={i} data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
                className={`${v.r} border border-n-200 bg-white p-5`}>
                <span className={`${v.display} text-[26px] font-extrabold text-brand-200 leading-none tnum`}>
                  {num(String(i + 1).padStart(2, "0"), lang)}
                </span>
                <h3 className="mt-2 font-bold text-n-900 text-[15.5px]">{c.title}</h3>
                <p className="mt-1.5 text-[14px] text-n-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════ গ্যালারি ═══════════════ */
function GalleryBand({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const t = dict(lang);
  const images = d.galleries.flatMap((g) => g.images.map((im) => ({ ...im, album: g.title }))).slice(0, 8);
  if (!images.length && !d.content.videos.length) return null;
  return (
    <Section id="gallery" tone="soft">
      <Head v={v} title={t.secGallery} sub={t.subGallery} />
      {images.length > 0 && (
        <Lightbox images={images}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {images.map((im, i) => (
              <button key={i} data-lb={i} className={`group relative aspect-[4/3] overflow-hidden ${v.r} border border-n-200`}
                aria-label={`${t.navGallery}: ${im.caption || im.album}`}>
                {/* গ্রিড ২ কলাম (মোবাইল) → ৪ কলাম (md) — sizes সেটিই বলে,
                    তাই ফোনে অর্ধেক প্রস্থের ছবিই নামে, পূর্ণ প্রস্থের নয় */}
                <Image src={im.url} alt={im.caption || im.album} fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/25 transition" />
              </button>
            ))}
          </div>
        </Lightbox>
      )}
      {d.content.videos.length > 0 && (
        <div id="video" className="mt-10 grid md:grid-cols-3 gap-5">
          {d.content.videos.slice(0, 3).map((vid) => (
            <div key={vid.youtubeId}>
              <div className={`relative aspect-video overflow-hidden ${v.r} border border-n-200 bg-n-100`}>
                <VideoEmbed youtubeId={vid.youtubeId} title={vid.title} />
              </div>
              <p className="mt-2.5 font-semibold text-n-800 text-[15px]">{vid.title}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-9 text-center">
        <Btn href="/gallery" variant="outline" className={`!${v.r}`} iconRight="arrowRight">{t.fullGallery}</Btn>
      </div>
    </Section>
  );
}

/* ═══════════════ অভিভাবকের মতামত ═══════════════ */
function Testimonials({ v, d }: { v: Variant; d: HomeData }) {
  const lang = d.lang;
  const t = dict(lang);
  if (!d.content.testimonials.length) return null;
  return (
    <Section id="reviews" tone="plain">
      <Head v={v} title={t.secTestimonials} />
      <div className="snap-row -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible">
        {d.content.testimonials.slice(0, 4).map((tm, i) => (
          <figure key={i} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 2) * 80}ms` }}
            className={`w-[86vw] sm:w-[420px] md:w-auto ${v.r} border border-n-200 bg-white p-6 flex gap-4`}>
            <Avatar src={tm.photo} name={tm.name} size={54} rounded={v.r} />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-n-900">{tm.name}</p>
                  <p className="text-[13px] text-n-500">{tm.relation}</p>
                </div>
                <Stars n={tm.rating || 5} size={15} />
              </div>
              <blockquote className="mt-3 text-n-600 leading-[1.9] text-[15px]">“{tm.text}”</blockquote>
            </div>
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ ভর্তি ═══════════════ */
function Admission({ v, tenant, content, lang }: { v: Variant; tenant: TenantX; content: SiteContent; lang: Lang }) {
  const t = dict(lang);
  return (
    <Section id="admission" tone="soft">
      <Head v={v}
        title={tenant.admission?.open
          ? (lang === "en" ? "Admission is open" : "ভর্তি কার্যক্রম চলছে")
          : t.admissionInfo}
        sub={tenant.admission?.classes ? `${t.classes}: ${tenant.admission.classes}` : undefined} />

      <div id="process" className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-14">
        {content.admissionSteps.map((s, i) => (
          <div key={i} data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
            className={`${v.r} border border-n-200 bg-white p-5 text-center`}>
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full text-white font-extrabold tnum"
              style={{ background: "var(--brand-600)" }}>{num(i + 1, lang)}</span>
            <h3 className="mt-3.5 font-bold text-n-900 text-[15.5px]">{s.title}</h3>
            <p className="mt-1.5 text-[13.5px] text-n-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div id="timeline">
          <h3 className={`${v.display} t-h3 text-n-900 mb-6`}>{t.admissionTimeline}</h3>
          <div className={`${v.r} border border-n-200 overflow-hidden bg-white`}>
            {content.admissionTimeline.map((tl, i) => (
              <div key={i} className={`flex gap-4 p-5 ${i ? "border-t border-n-100" : ""}`}>
                <span className="shrink-0 w-28 font-bold text-brand text-[14px]">{tl.date}</span>
                <span>
                  <span className="block font-bold text-n-900">{tl.title}</span>
                  {tl.desc && <span className="block text-[14px] text-n-500 mt-0.5">{tl.desc}</span>}
                </span>
              </div>
            ))}
          </div>
          {(content.prospectusUrl || tenant.admission?.formUrl) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {content.prospectusUrl && <Btn href={content.prospectusUrl} variant="outline" icon="download" external className={`!${v.r}`}>{t.prospectus}</Btn>}
              {tenant.admission?.formUrl && <Btn href={tenant.admission.formUrl} variant="outline" icon="file" external className={`!${v.r}`}>{t.admissionForm}</Btn>}
            </div>
          )}
        </div>

        <div id="apply" className={`${v.r} border-2 bg-white p-7`} style={{ borderColor: "var(--brand-600)" }}>
          <h3 className={`${v.display} t-h3 text-n-900`}>{t.applyTitle}</h3>
          <p className="mt-2 text-n-600 text-[15px]">{t.applyDesc}</p>
          <div className="mt-6">
            <InquiryForm action={submitInquiry} classes={tenant.admission?.classes} kind="admission"
              submitLabel={lang === "en" ? "Submit application" : "আবেদন জমা দিন"} labels={formLabels(lang)} />
          </div>
        </div>
      </div>

      {content.fees.length > 0 && (
        <div id="fees" className="mt-14">
          <h3 className={`${v.display} t-h3 text-n-900 mb-6`}>{t.feeInfo}</h3>
          <FeeTable rows={content.fees} note={content.feeNote}
            labels={{ head: t.feeClass, admission: t.feeAdmission, monthly: t.feeMonthly }} />
        </div>
      )}
    </Section>
  );
}

/* ═══════════════ গুরুত্বপূর্ণ লিংক (সরকারি ভ্যারিয়েন্ট) ═══════════════ */
const GOVT_LINKS = [
  { label: "মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর", href: "https://www.dshe.gov.bd/" },
  { label: "শিক্ষা মন্ত্রণালয়", href: "https://moedu.gov.bd/" },
  { label: "শিক্ষা বোর্ড (ফলাফল)", href: "http://www.educationboardresults.gov.bd/" },
  { label: "জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড", href: "http://nctb.gov.bd/" },
  { label: "ব্যানবেইস", href: "https://banbeis.gov.bd/" },
  { label: "শিক্ষক বাতায়ন", href: "https://www.teachers.gov.bd/" },
  { label: "বাংলাদেশ জাতীয় তথ্য বাতায়ন", href: "https://bangladesh.gov.bd/" },
  { label: "মুজিব ১০০ / জাতীয় ই-সেবা", href: "https://www.mygov.bd/" },
];

function GovtLinks({ v, lang }: { v: Variant; lang: Lang }) {
  const t = dict(lang);
  return (
    <Section id="links" tone="plain" size="sm">
      <Head v={v} title={t.secImportantLinks} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {GOVT_LINKS.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
            className={`group flex items-center gap-3 ${v.r} border border-n-200 bg-white px-4 py-3.5 hover:border-brand transition`}>
            <Icon name="external" size={16} className="text-brand shrink-0" />
            <span className="text-[14px] font-semibold text-n-700 group-hover:text-brand leading-snug">{l.label}</span>
          </a>
        ))}
      </div>
    </Section>
  );
}

/* ═══════════════ FAQ + যোগাযোগ ═══════════════ */
function FaqContact({ v, tenant, content, lang }: { v: Variant; tenant: TenantX; content: SiteContent; lang: Lang }) {
  const t = dict(lang);
  const c = tenant.contact;
  return (
    <>
      <Section id="faq" tone="soft">
        <Head v={v} title={t.secFaq} sub={t.secFaqSub} />
        <div className="max-w-3xl mx-auto"><FAQ items={content.faq} /></div>
      </Section>

      <Section id="contact" tone="plain">
        <Head v={v} title={t.navContact} />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              c.address && { icon: "mapPin", label: t.address, value: c.address },
              c.phone && { icon: "phone", label: t.phone, value: c.phone, href: `tel:${c.phone}` },
              c.email && { icon: "mail", label: t.email, value: c.email, href: `mailto:${c.email}` },
              c.officeHours && { icon: "clock", label: t.officeHours, value: c.officeHours },
            ].filter(Boolean).map((r, i) => {
              const row = r as { icon: string; label: string; value: string; href?: string };
              return (
                <div key={i} className={`flex gap-4 ${v.r} border border-n-200 bg-white p-5`}>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center ${v.r} bg-brand-50 text-brand`}>
                    <Icon name={row.icon} size={19} />
                  </span>
                  <span>
                    <b className="block text-n-900">{row.label}</b>
                    {row.href
                      ? <a href={row.href} className="text-n-600 hover:text-brand tnum break-all">{row.value}</a>
                      : <span className="text-n-600">{row.value}</span>}
                  </span>
                </div>
              );
            })}
            <div className={`${v.r} border-2 bg-white p-6`} style={{ borderColor: "var(--accent-500)" }}>
              <p className="font-bold text-n-900">{t.formCallbackTitle}</p>
              <p className="mt-1 text-[14.5px] text-n-500 mb-4">{t.formCallbackDesc}</p>
              <InquiryForm action={submitInquiry} kind="callback" compact
                submitLabel={t.formCallback} labels={formLabels(lang)} />
            </div>
          </div>
          <div className={`${v.r} overflow-hidden border border-n-200 min-h-[420px]`}>
            <MapEmbed src={c.mapEmbed} address={c.address} height="h-full min-h-[420px]" />
          </div>
        </div>
      </Section>
    </>
  );
}

/* ═══════════════ ফুটার ═══════════════ */
function makeFooter(v: Variant): Template["Footer"] {
  return function Footer({ tenant, lang = "bn" }) {
    const t = dict(lang);
    const links = footerLinks(lang);
    const c = tenant.contact;
    const social = [
      c.facebook && { href: c.facebook, label: "Facebook", El: FacebookIcon },
      c.youtube && { href: c.youtube, label: "YouTube", El: YouTubeIcon },
      c.whatsapp && { href: waLink(c.whatsapp), label: "WhatsApp", El: WhatsAppIcon },
      c.messenger && { href: c.messenger, label: "Messenger", El: MessengerIcon },
    ].filter(Boolean) as { href: string; label: string; El: typeof FacebookIcon }[];

    return (
      <footer className="text-white/75 relative overflow-hidden" style={{ background: "var(--brand-900)" }}>
        {v.girih && <span className="tex-girih absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />}
        {v.chrome === "islamic" && <div className="rule-gold" />}

        <div className="container-x relative py-12 grid gap-9 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              {tenant.logo
                ? <Image src={tenant.logo} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
                : <span className="h-14 w-14 rounded-full grid place-items-center bg-white/10 text-white text-xl font-extrabold">{tenant.name[0]}</span>}
              <span className="min-w-0">
                <span className={`block ${v.display} text-white font-bold text-[18px] leading-tight`}>{tenant.name}</span>
                {tenant.eiin && <span className="block text-[12.5px] text-white/50 tnum">{t.eiin} {tenant.eiin}</span>}
              </span>
            </div>
            <p className="mt-4 text-[14.5px] leading-relaxed max-w-sm">{tenant.tagline}</p>
            {social.length > 0 && (
              <div className="mt-5 flex gap-2.5">
                {social.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="grid h-10 w-10 place-items-center rounded bg-white/10 hover:bg-white/20 text-white transition">
                    <s.El width={18} height={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-label={t.secQuickLinks}>
            <p className={`text-white font-bold mb-4 ${v.display}`}>{t.secQuickLinks}</p>
            <ul className="space-y-2.5 text-[14.5px]">
              {links.slice(0, 6).map((l) => (
                <li key={l.href}><TLink href={l.href} className="hover:text-white transition">{l.label}</TLink></li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t.more}>
            <p className={`text-white font-bold mb-4 ${v.display}`}>{t.more}</p>
            <ul className="space-y-2.5 text-[14.5px]">
              {links.slice(6).map((l) => (
                <li key={l.href}><TLink href={l.href} className="hover:text-white transition">{l.label}</TLink></li>
              ))}
              <li><TLink href="/login" className="hover:text-white transition">{t.navLogin}</TLink></li>
            </ul>
          </nav>

          <div>
            <p className={`text-white font-bold mb-4 ${v.display}`}>{t.navContact}</p>
            <ul className="space-y-3 text-[14.5px]">
              {c.address && <li className="flex gap-3"><Icon name="mapPin" size={17} className="mt-0.5 shrink-0 text-accent-400" />{c.address}</li>}
              {c.phone && <li className="flex gap-3"><Icon name="phone" size={17} className="mt-0.5 shrink-0 text-accent-400" />
                <a href={`tel:${c.phone}`} className="hover:text-white tnum">{c.phone}</a></li>}
              {c.email && <li className="flex gap-3"><Icon name="mail" size={17} className="mt-0.5 shrink-0 text-accent-400" />
                <a href={`mailto:${c.email}`} className="hover:text-white break-all">{c.email}</a></li>}
            </ul>
            <Btn href="/admission#apply" variant="accent" className={`mt-5 w-full !min-h-[48px] !${v.r}`}>{t.applyNow}</Btn>
          </div>
        </div>

        <div className="border-t border-white/10 relative">
          <div className="container-x py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13.5px] text-white/45">
            <p>© {num(new Date().getFullYear(), lang)} {tenant.name} — {t.rights}</p>
            <p>{t.poweredBy}: <span className="text-white/70">আমাদের স্কুল</span></p>
          </div>
        </div>
        <div className="h-[68px] md:hidden" aria-hidden="true" />
      </footer>
    );
  };
}

/* ═══════════════ উপ-পেজ ব্লক ═══════════════ */
function makePageHeader(v: Variant): Template["PageHeader"] {
  return function PageHeader({ title, sub, crumb, lang = "bn" }) {
    const t = dict(lang);
    return (
      <div className="border-b border-n-200 relative overflow-hidden" style={{ background: "var(--brand-50)" }}>
        {v.girih && <span className="tex-girih absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true" />}
        <div className="container-x relative py-10 md:py-14">
          <nav aria-label={t.breadcrumb} className="text-[13.5px] text-n-500 mb-2.5">
            <TLink href="/" className="hover:text-brand">{t.navHome}</TLink><span className="mx-2">/</span>
            <span className="text-n-700">{crumb || title}</span>
          </nav>
          <h1 className={`${v.display} t-h1 text-brand-900 relative inline-block pb-3`}>
            {title}
            {v.chrome === "islamic"
              ? <span className="rule-gold-thick absolute bottom-0 left-0 w-24" />
              : <span className="absolute bottom-0 left-0 h-[3px] w-16 rounded-full bg-accent" />}
          </h1>
          {sub && <p className="mt-3 t-lead text-n-600 max-w-2xl">{sub}</p>}
        </div>
      </div>
    );
  };
}

function makeNoticeList(v: Variant): Template["NoticeList"] {
  return function NoticeList({ notices, lang = "bn" }) {
    const t = dict(lang);
    const loc = lang === "en" ? "en-GB" : "bn-BD";
    return (
      <Section tone="plain">
        {notices.length === 0 && <p className="text-center text-n-500 py-10">{t.emptyNotice}</p>}
        <div className={`max-w-4xl mx-auto ${v.r} border border-n-200 bg-white overflow-hidden`}>
          {notices.map((nt, i) => (
            <TLink key={nt._id} href={`/notice/${nt._id}`}
              className={`flex gap-4 p-5 hover:bg-brand-50/60 transition ${i ? "border-t border-n-100" : ""}`}>
              <span className={`grid h-14 w-14 shrink-0 place-items-center ${v.r} border-2 text-center`}
                style={{ borderColor: "var(--brand-600)", color: "var(--brand-700)" }}>
                <span>
                  <span className="block text-[19px] font-extrabold leading-none tnum">
                    {num(new Date(nt.createdAt).getDate(), lang)}
                  </span>
                  <span className="block text-[11px] mt-0.5">{new Date(nt.createdAt).toLocaleDateString(loc, { month: "short" })}</span>
                </span>
              </span>
              <span className="min-w-0">
                {nt.pinned && <Pill tone="accent" className="!py-0.5 !px-2 !text-[11.5px] mb-1">{t.important}</Pill>}
                <span className="block font-bold text-n-900 leading-snug">{nt.title}</span>
                {nt.body && <span className="mt-1 block text-[14.5px] text-n-500 line-clamp-2">{nt.body}</span>}
                <span className="mt-1.5 block text-[12.5px] text-n-400">{fmtDate(nt.createdAt, lang)}</span>
              </span>
            </TLink>
          ))}
        </div>
      </Section>
    );
  };
}

function makeTeacherGrid(v: Variant): Template["TeacherGrid"] {
  return function TeacherGrid({ teachers, lang = "bn" }) {
    const t = dict(lang);
    return (
      <Section tone="plain">
        {teachers.length === 0 && <p className="text-center text-n-500 py-10">{t.emptyTeachers}</p>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {teachers.map((tc) => (
            <figure key={tc._id} className={`lift ${v.r} border border-n-200 bg-white overflow-hidden text-center`}>
              <div className="p-5 pb-0"><Figure src={tc.photo} alt={tc.name} ratio="aspect-[3/4]" rounded={v.r} icon="users" /></div>
              <figcaption className="p-5">
                <p className="font-bold text-n-900 leading-tight">{tc.name}</p>
                <p className="mt-1 text-[13.5px] text-brand font-semibold">{tc.designation}</p>
                {tc.subject && <p className="mt-0.5 text-[13px] text-n-500">{tc.subject}</p>}
                {tc.qualification && <p className="mt-1 text-[13px] text-n-400">{tc.qualification}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    );
  };
}

function makeResultList(v: Variant): Template["ResultList"] {
  return function ResultList({ results, note, lang = "bn" }) {
    const t = dict(lang);
    return (
      <Section tone="plain">
        <div className="max-w-3xl mx-auto">
          <div className={`${v.r} border-2 bg-white p-6 mb-8`} style={{ borderColor: "var(--brand-600)" }}>
            <ResultSearch exams={results} note={note} labels={searchLabels(lang)} />
          </div>
          <div className={`${v.r} border border-n-200 bg-white overflow-hidden`}>
            {results.length === 0 && <p className="p-8 text-center text-n-500">{t.emptyResults}</p>}
            {results.map((r, i) => (
              <div key={r._id} className={`flex items-center gap-4 p-5 ${i ? "border-t border-n-100" : ""}`}>
                <Icon name="trophy" size={22} className="text-accent-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-n-900">{r.examName} {r.year && <span className="text-n-400 font-medium">— {r.year}</span>}</p>
                  {r.summary && <p className="text-[14.5px] text-n-500 mt-0.5">{r.summary}</p>}
                </div>
                {r.pdfUrl && <Btn href={r.pdfUrl} variant="outline" icon="download" external className={`!min-h-[42px] !px-4 !text-[14px] !${v.r}`}>PDF</Btn>}
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  };
}

function makeGallerySection(v: Variant): Template["GallerySection"] {
  return function GallerySection({ galleries, lang = "bn" }) {
    const t = dict(lang);
    return (
      <Section tone="plain">
        {galleries.length === 0 && <p className="text-center text-n-500 py-10">{t.emptyGallery}</p>}
        <div className="space-y-12">
          {galleries.map((g) => (
            <section key={g._id}>
              <h2 className={`${v.display} t-h3 text-n-900 mb-5 pb-2 border-b-2 inline-block`} style={{ borderColor: "var(--accent-500)" }}>
                {g.title}
              </h2>
              <Lightbox images={g.images}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {g.images.map((im, i) => (
                    <button key={i} data-lb={i} className={`group relative aspect-[4/3] overflow-hidden ${v.r} border border-n-200`}
                      aria-label={`${t.navGallery} — ${g.title}`}>
                      <Image src={im.url} alt={im.caption || g.title} fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover transition duration-500 group-hover:scale-105" />
                    </button>
                  ))}
                </div>
              </Lightbox>
            </section>
          ))}
        </div>
      </Section>
    );
  };
}

/* ═══════════════ টেমপ্লেট নির্মাতা ═══════════════ */
export function makeOfficial(v: Variant): Template {
  const Home: Template["Home"] = (d) => (
    <>
      <Hero v={v} d={d} />
      <QuickTiles v={v} lang={d.lang} />
      {show(d.tenant, "about") && <About v={v} d={d} />}
      {show(d.tenant, "stats") && <Stats v={v} d={d} />}
      {show(d.tenant, "leaders") && <Leaders v={v} d={d} />}
      {show(d.tenant, "departments") && <Departments v={v} d={d} />}
      {show(d.tenant, "why") && <WhyUs v={v} d={d} />}
      {show(d.tenant, "teachers") && <Teachers v={v} d={d} />}
      {show(d.tenant, "results") && <Results v={v} d={d} />}
      {show(d.tenant, "clubs") && <Clubs v={v} d={d} />}
      {show(d.tenant, "events") && <Events v={v} d={d} />}
      {show(d.tenant, "gallery") && <GalleryBand v={v} d={d} />}
      {show(d.tenant, "reviews") && <Testimonials v={v} d={d} />}
      {show(d.tenant, "admission") && <Admission v={v} tenant={d.tenant} content={d.content} lang={d.lang} />}
      {v.govtLinks && show(d.tenant, "links") && <GovtLinks v={v} lang={d.lang} />}
      {show(d.tenant, "contact") && <FaqContact v={v} tenant={d.tenant} content={d.content} lang={d.lang} />}
    </>
  );

  const AdmissionBlock: Template["AdmissionBlock"] = ({ tenant, content, lang = "bn" }) => (
    <Admission v={v} tenant={tenant} content={content} lang={lang} />
  );

  const ContactBlock: Template["ContactBlock"] = ({ tenant, lang = "bn" }) => {
    const t = dict(lang);
    const c = tenant.contact;
    return (
      <Section tone="plain">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              c.address && { icon: "mapPin", label: t.address, value: c.address },
              c.phone && { icon: "phone", label: t.phone, value: c.phone, href: `tel:${c.phone}` },
              c.email && { icon: "mail", label: t.email, value: c.email, href: `mailto:${c.email}` },
              c.officeHours && { icon: "clock", label: t.officeHours, value: c.officeHours },
            ].filter(Boolean).map((r, i) => {
              const row = r as { icon: string; label: string; value: string; href?: string };
              return (
                <div key={i} className={`flex gap-4 ${v.r} border border-n-200 bg-white p-5`}>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center ${v.r} bg-brand-50 text-brand`}>
                    <Icon name={row.icon} size={19} />
                  </span>
                  <span>
                    <b className="block text-n-900">{row.label}</b>
                    {row.href
                      ? <a href={row.href} className="text-n-600 hover:text-brand tnum break-all">{row.value}</a>
                      : <span className="text-n-600">{row.value}</span>}
                  </span>
                </div>
              );
            })}
            <div className={`${v.r} border-2 bg-white p-6`} style={{ borderColor: "var(--accent-500)" }}>
              <p className="font-bold text-n-900 mb-3">{t.sendMessage}</p>
              <InquiryForm action={submitInquiry} kind="contact" submitLabel={t.sendMessage} labels={formLabels(lang)} />
            </div>
          </div>
          <div className={`${v.r} overflow-hidden border border-n-200 min-h-[420px]`}>
            <MapEmbed src={c.mapEmbed} address={c.address} height="h-full min-h-[420px]" />
          </div>
        </div>
      </Section>
    );
  };

  return {
    key: v.key,
    label: v.label,
    defaults: v.defaults,
    Header: makeHeader(v),
    Footer: makeFooter(v),
    Home,
    PageHeader: makePageHeader(v),
    NoticeList: makeNoticeList(v),
    TeacherGrid: makeTeacherGrid(v),
    ResultList: makeResultList(v),
    GallerySection: makeGallerySection(v),
    AdmissionBlock,
    ContactBlock,
  };
}

/* ═══════════════ দুটি টেমপ্লেট ═══════════════
   পুরো প্ল্যাটফর্মে টেমপ্লেট মাত্র দুটি — এবং দুটিই বাংলা ও ইংরেজি দুই ভাষায় চলে
   (ডিফল্ট বাংলা)। আগে ভাষাভেদে আলাদা টেমপ্লেট ছিল; তাতে একই ডিজাইন দুবার
   রক্ষণাবেক্ষণ করতে হতো, আর ইংরেজি চাইলে প্রতিষ্ঠানকে টেমপ্লেটই বদলাতে হতো।
   এখন ভাষা শুধু একটি সেটিং — চেহারা বদলায় না। */
export const VARIANTS: Variant[] = [
  {
    key: "school",
    label: "🏫 স্কুল, কলেজ ও কিন্ডারগার্টেন",
    blurb:
      "সরকারি-ধাঁচের প্রাতিষ্ঠানিক বিন্যাস — হিরোর পাশেই নোটিশ বোর্ড, EIIN ব্যাজ ও গুরুত্বপূর্ণ শিক্ষা-লিংক। " +
      "সরকারি ও বেসরকারি স্কুল, কলেজ, কিন্ডারগার্টেন এবং ইংলিশ মিডিয়াম — সবার জন্য।",
    defaults: { primary: "#00674B", secondary: "#B01C24" },
    chrome: "govt", hero: "board", display: "font-display", r: "rounded-lg", govtLinks: true,
  },
  {
    key: "madrasah",
    label: "🕌 মাদরাসা ও ইসলামিক প্রতিষ্ঠান",
    blurb:
      "গাঢ় সবুজ-সোনালি, গিরিহ জালি ও বিসমিল্লাহ পঙ্‌ক্তি। মাদরাসা, হিফজখানা ও ইসলামিক প্রতিষ্ঠানের জন্য।",
    defaults: { primary: "#0B5D3B", secondary: "#C9A227" },
    chrome: "islamic", hero: "banner", display: "font-display", r: "rounded-xl",
    girih: true, bismillah: true,
  },
];

const official = Object.fromEntries(VARIANTS.map((v) => [v.key, makeOfficial(v)])) as Record<string, Template>;
export default official;
