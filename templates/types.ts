import type { Tenant } from "@/lib/db";
import type { SiteContent } from "@/lib/content";
import { dict, type Lang } from "@/lib/i18n";

/* ── কনটেন্ট ডকুমেন্ট ─────────────────────────────────── */
export type Notice = { _id: string; title: string; body?: string; attachmentUrl?: string; pinned?: boolean; category?: string; createdAt: string };
export type Teacher = { _id: string; name: string; designation?: string; subject?: string; photo?: string; qualification?: string; order?: number };
export type Result = { _id: string; examName: string; year?: string; summary?: string; pdfUrl?: string; createdAt: string };
export type Gallery = { _id: string; title: string; images: { url: string; caption?: string }[]; createdAt: string };
export type EventDoc = { _id: string; title: string; date: string; time?: string; venue?: string; desc?: string; image?: string; createdAt: string };

export type TenantX = Tenant & { _id: string };

/** হোমপেজে যা যা লাগে — এক জায়গায়, যাতে টেমপ্লেট শুধু রেন্ডার করে */
export type HomeData = {
  tenant: TenantX;
  content: SiteContent;
  notices: Notice[];
  teachers: Teacher[];
  results: Result[];
  galleries: Gallery[];
  events: EventDoc[];
  lang: Lang;
};

export type TenantProps = { tenant: TenantX };
/** প্রতিটি টেমপ্লেট-কম্পোনেন্ট ভাষা প্রপ হিসেবে পায় — ভাষা টেমপ্লেটের নয়,
    প্রতিষ্ঠানের ও দর্শকের সিদ্ধান্ত। দুটি টেমপ্লেটই বাংলা ও ইংরেজি দুটোতেই চলে। */
export type LangProps = { lang?: Lang };

export type Template = {
  key: string;
  label: string;
  /** টেমপ্লেটের নিজস্ব নিউট্রাল-টিন্ট ও ডিফল্ট রঙ (সুপার প্যানেলে প্রিভিউয়ের জন্য) */
  defaults: { primary: string; secondary: string };
  Header: React.FC<TenantProps & LangProps & { notices?: Notice[] }>;
  Footer: React.FC<TenantProps & LangProps>;
  Home: React.FC<HomeData>;
  PageHeader: React.FC<LangProps & { title: string; sub?: string; crumb?: string }>;
  NoticeList: React.FC<LangProps & { notices: Notice[]; full?: boolean }>;
  TeacherGrid: React.FC<LangProps & { teachers: Teacher[] }>;
  ResultList: React.FC<LangProps & { results: Result[]; note?: string }>;
  GallerySection: React.FC<LangProps & { galleries: Gallery[] }>;
  AdmissionBlock: React.FC<TenantProps & LangProps & { content: SiteContent }>;
  ContactBlock: React.FC<TenantProps & LangProps>;
};

/* ── নেভিগেশন — প্ল্যাটফর্মের অভিন্ন সাইট-কাঠামো ─────────────────
   প্রতিটি প্রতিষ্ঠানের সাইটে ঠিক এই মেনুগুলোই থাকে, একই ক্রমে:

     হোম · আমাদের সম্পর্কে · সভাপতির বাণী · অধ্যক্ষের বাণী · নোটিশ ·
     একাডেমিক তথ্য (বিভাগসমূহ / শিক্ষকবৃন্দ / রুটিন) · ক্লাব · ফলাফল ·
     ভর্তি · গ্যালারি · যোগাযোগ · লগইন

   কেন স্থির কাঠামো: অভিভাবক একটি স্কুলের সাইটে যা শিখলেন, পরের স্কুলেও
   ঠিক সেখানেই পান। সাপোর্টেও সুবিধা — প্রতিটি সাইটের মেনু অভিন্ন।
   টেমপ্লেট শুধু চেহারা বদলায়, কাঠামো নয়। */
export type NavChild = { href: string; label: string; desc?: string; icon?: string };
export type NavItem = {
  href: string; label: string; icon?: string; children?: NavChild[];
  /** ডেস্কটপ মেনু-বারের সংক্ষিপ্ত রূপ — এগারোটি আইটেম এক সারিতে ধরাতে।
      মোবাইল ড্রয়ার ও ফুটারে সবসময় পূর্ণ label দেখানো হয়। */
  short?: string;
  /** হেডারে আলাদা বোতাম হিসেবে (ভর্তি / লগইন) */
  feature?: boolean; cta?: boolean;
};

export function buildNav(tenant: TenantX, lang: Lang = "bn"): NavItem[] {
  const t = dict(lang);
  const en = lang === "en";
  const isMadrasah = tenant.type === "madrasah";
  const teachersLabel = isMadrasah && !en ? "উস্তাযবৃন্দ" : t.navTeachers;
  return [
    { href: "/", label: t.navHome, icon: "home" },
    { href: "/about", label: t.navAbout, short: en ? "About" : "পরিচিতি", icon: "building" },
    { href: "/chairman", label: t.navChairman, short: en ? "Chairman" : "সভাপতি", icon: "quote" },
    { href: "/principal", label: t.navPrincipal, short: en ? "Principal" : "অধ্যক্ষ", icon: "userCheck" },
    { href: "/notice", label: t.navNotice, icon: "bell" },
    {
      href: "/academics", label: t.navAcademic, short: en ? "Academics" : "একাডেমিক", icon: "graduation",
      children: [
        { href: "/academics/departments", label: t.navDepartments, desc: lang === "en" ? "Streams, subjects and department heads" : "শ্রেণি ও বিভাগভিত্তিক পাঠক্রম ও বিষয়", icon: "book" },
        { href: "/academics/routine", label: t.navRoutine, desc: lang === "en" ? "Class routine and exam schedule" : "ক্লাস রুটিন ও পরীক্ষার সময়সূচি", icon: "calendar" },
        { href: "/academics", label: t.secPrograms, desc: lang === "en" ? "Curriculum by stage" : "স্তরভিত্তিক পাঠক্রম", icon: "graduation" },
        { href: "/facilities", label: t.secFacilities, desc: lang === "en" ? "Library, labs, transport and more" : "পাঠাগার, ল্যাব, পরিবহন ও আরও", icon: "building" },
      ],
    },
    /* শিক্ষকবৃন্দ মেনুতে সরাসরি — আগে এটি "একাডেমিক"-এর ভেতরে ছিল, আর
       ডেস্কটপের মেনু-সারিতে সাব-মেনু দেখানো হয় না বলে পাতাটিতে পৌঁছানোই
       যেত না। short লেবেল রাখা হলো যাতে সারিটি এক লাইনেই থাকে। */
    {
      href: "/teachers", label: teachersLabel, icon: "users",
      short: en ? "Teachers" : isMadrasah ? "উস্তায" : "শিক্ষক",
    },
    { href: "/club", label: t.navClub, icon: "sparkles" },
    { href: "/results", label: t.navResults, icon: "trophy" },
    { href: "/admission", label: t.navAdmission, icon: "clipboard", feature: true },
    { href: "/gallery", label: t.navGallery, icon: "images" },
    { href: "/contact", label: t.navContact, icon: "phone" },
    { href: "/login", label: t.navLogin, icon: "userCheck", cta: true },
  ];
}

/** ফুটারের সংক্ষিপ্ত লিংক — মূল মেনুর সমতল রূপ + কিছু গৌণ পেজ */
export function footerLinks(lang: Lang = "bn") {
  const t = dict(lang);
  return [
    { href: "/about", label: t.navAbout },
    { href: "/chairman", label: t.navChairman },
    { href: "/principal", label: t.navPrincipal },
    { href: "/academics/departments", label: t.navDepartments },
    { href: "/teachers", label: t.navTeachers },
    { href: "/academics/routine", label: t.navRoutine },
    { href: "/notice", label: t.navNotice },
    { href: "/club", label: t.navClub },
    { href: "/results", label: t.navResults },
    { href: "/admission", label: t.navAdmission },
    { href: "/gallery", label: t.navGallery },
    { href: "/contact", label: t.navContact },
  ];
}

/** পুরোনো তিনটি টেমপ্লেট এখনো সরাসরি এই ধ্রুবকটি ব্যবহার করে (বাংলা) */
export const FOOTER_LINKS = footerLinks("bn");

/** সেকশন দেখাবে কি না — tenant.sections-এ স্পষ্ট false না থাকলে দেখাবে */
export const show = (t: TenantX, key: string) => t.sections?.[key] !== false;
