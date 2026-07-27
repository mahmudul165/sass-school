/* সাইট কনটেন্ট মডেল + বাংলা ডিফল্ট
   ------------------------------------------------------------------
   সমস্যা: নতুন প্রতিষ্ঠান সাইট নিলে প্রথম দিনেই পেজ ফাঁকা — তখন ডিজাইন যত ভালোই হোক
   "খালি" দেখায়, আর সেলস ডেমোতেই ক্লায়েন্ট হারায়।
   সমাধান: প্রতিষ্ঠানের ধরন বুঝে সম্পূর্ণ, মানসম্মত বাংলা কনটেন্ট আগেই বসানো থাকে।
   প্রতিষ্ঠান যা যা এডিট করে সেটাই ডিফল্টের উপরে বসে (deep merge)।
   ফল: "সাইট তৈরি করুন" চাপার ৩০ সেকেন্ডের মধ্যে একটি পূর্ণাঙ্গ, বিক্রয়যোগ্য সাইট। */

import type { Tenant } from "./db";
import type { Lang } from "./i18n";
import { toBnDigits, toEnDigits } from "./digits";
import { englishDefaults } from "./content.en";

export type Person = { name: string; role: string; photo?: string; message?: string; since?: string };
export type Program = { title: string; desc?: string; level?: string; icon?: string; points?: string[] };
export type Facility = { icon: string; title: string; desc?: string; image?: string };
export type Achievement = { title: string; year?: string; desc?: string; icon?: string };
export type TopStudent = { name: string; result: string; exam?: string; year?: string; photo?: string };
export type Testimonial = { name: string; relation: string; text: string; rating?: number; photo?: string };
export type Faq = { q: string; a: string };
export type Step = { title: string; desc?: string };
export type TimelineItem = { date: string; title: string; desc?: string };
export type FeeRow = { label: string; admission?: string; monthly?: string; note?: string };
export type Stat = { value: string; label: string; icon?: string };
export type TrustBadge = { label: string; sub?: string; icon?: string };
export type VideoItem = { title: string; youtubeId: string };
export type WhyItem = { icon: string; title: string; desc: string };

/* ── স্ট্যান্ডার্ড সাইট-কাঠামোর নতুন অংশ ─────────────────────────
   বিভাগ, রুটিন, ক্লাব ও ফলাফল-চার্ট — বাংলাদেশের প্রতিটি প্রতিষ্ঠানের
   ওয়েবসাইটে অভিভাবক ঠিক এগুলোই খোঁজেন, কিন্তু বেশিরভাগ সাইটে থাকে না। */
export type Department = {
  name: string; level?: string; head?: string; desc?: string;
  subjects?: string[]; icon?: string; students?: string;
};
export type RoutineTable = {
  title: string; note?: string; pdfUrl?: string;
  /** কলাম শিরোনাম — পিরিয়ড ও সময় */
  periods: string[];
  /** প্রতিটি সারি এক দিন; cells.length === periods.length */
  rows: { day: string; cells: string[] }[];
};
export type Club = { name: string; icon?: string; desc?: string; moderator?: string; day?: string; members?: string };
/** এক পরীক্ষার বছরভিত্তিক ফল — চার্টের উৎস */
export type ResultSeries = {
  exam: string; note?: string;
  rows: { year: string; passRate: number; gpa5?: number; appeared?: number; passed?: number }[];
};

export type SiteContent = {
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  heroCta: string;
  aboutTitle: string;
  aboutBody: string;
  aboutPoints: string[];
  why: WhyItem[];
  chairman?: Person;
  principal?: Person;
  stats: Stat[];
  trust: TrustBadge[];
  programs: Program[];
  facilities: Facility[];
  campusLife: { title: string; desc: string; image?: string }[];
  achievements: Achievement[];
  topStudents: TopStudent[];
  testimonials: Testimonial[];
  faq: Faq[];
  admissionSteps: Step[];
  admissionTimeline: TimelineItem[];
  fees: FeeRow[];
  feeNote?: string;
  videos: VideoItem[];
  prospectusUrl?: string;
  onlineAdmissionUrl?: string;
  resultPortalNote?: string;
  departments: Department[];
  routine: RoutineTable[];
  clubs: Club[];
  resultChart: ResultSeries[];
};

/* ── প্রতিষ্ঠানের ধরন ────────────────────────────────────────────── */
export type InstitutionType = "school" | "english_medium" | "college" | "madrasah" | "kindergarten" | "coaching";

export const TYPE_LABEL: Record<InstitutionType, string> = {
  school: "বিদ্যালয়",
  english_medium: "ইংলিশ মিডিয়াম স্কুল",
  college: "কলেজ",
  madrasah: "মাদ্রাসা",
  kindergarten: "কিন্ডারগার্টেন",
  coaching: "কোচিং সেন্টার",
};

/* ── সাধারণ ভিত্তি (সব ধরনের জন্য) ──────────────────────────────── */
const baseFaq: Faq[] = [
  { q: "ভর্তির জন্য কী কী কাগজপত্র লাগবে?", a: "শিক্ষার্থীর জন্ম নিবন্ধন সনদের ফটোকপি, পূর্ববর্তী প্রতিষ্ঠানের ছাড়পত্র ও প্রগতিপত্র, পিতা-মাতার জাতীয় পরিচয়পত্রের ফটোকপি এবং সদ্য তোলা ৪ কপি পাসপোর্ট সাইজ ছবি।" },
  { q: "ভর্তি ফরম কোথায় পাওয়া যাবে?", a: "প্রতিষ্ঠানের অফিস থেকে অফিস চলাকালীন সময়ে ফরম সংগ্রহ করা যাবে। এছাড়া এই ওয়েবসাইটের ‘অনলাইন ভর্তি’ বাটন থেকে ঘরে বসেই আবেদন করা যায়।" },
  { q: "ক্লাস কখন শুরু ও শেষ হয়?", a: "সকাল ৮টা থেকে দুপুর ১টা ৩০ মিনিট পর্যন্ত নিয়মিত ক্লাস চলে। শুক্রবার ও সরকারি ছুটির দিন প্রতিষ্ঠান বন্ধ থাকে।" },
  { q: "মাসিক বেতন কত এবং কীভাবে পরিশোধ করব?", a: "শ্রেণিভেদে বেতন ভিন্ন — বিস্তারিত ‘ফি সংক্রান্ত তথ্য’ অংশে দেওয়া আছে। প্রতি মাসের ১০ তারিখের মধ্যে অফিসে অথবা বিকাশ/নগদে পরিশোধ করা যায়।" },
  { q: "অভিভাবকরা কীভাবে সন্তানের অগ্রগতি জানতে পারবেন?", a: "প্রতি মাসে শ্রেণি শিক্ষকের সাথে অভিভাবক সভা হয়, পরীক্ষার ফল ওয়েবসাইটে প্রকাশ করা হয় এবং জরুরি বার্তা এসএমএসে পাঠানো হয়।" },
  { q: "প্রতিষ্ঠান কি সরকার অনুমোদিত?", a: "হ্যাঁ। প্রতিষ্ঠানটি যথাযথ কর্তৃপক্ষের অনুমোদনপ্রাপ্ত এবং নিয়মিত পাঠদানের অনুমতি রয়েছে। EIIN নম্বর ওয়েবসাইটের উপরে উল্লেখ আছে।" },
];

const baseAdmissionSteps: Step[] = [
  { title: "ফরম সংগ্রহ", desc: "অফিস থেকে অথবা ওয়েবসাইট থেকে অনলাইনে ভর্তি ফরম সংগ্রহ করুন।" },
  { title: "ফরম পূরণ ও জমা", desc: "প্রয়োজনীয় কাগজপত্রসহ পূরণকৃত ফরম নির্ধারিত তারিখের মধ্যে জমা দিন।" },
  { title: "ভর্তি পরীক্ষা / মৌখিক", desc: "নির্ধারিত দিনে শিক্ষার্থীর সাথে সংক্ষিপ্ত মৌখিক ও লিখিত মূল্যায়ন নেওয়া হয়।" },
  { title: "ফল প্রকাশ", desc: "নির্বাচিত শিক্ষার্থীদের তালিকা নোটিশ বোর্ড ও ওয়েবসাইটে প্রকাশ করা হয়।" },
  { title: "ভর্তি সম্পন্ন", desc: "ভর্তি ফি জমা দিয়ে আসন নিশ্চিত করুন এবং শ্রেণি নির্ধারণ বুঝে নিন।" },
];

const baseTimeline: TimelineItem[] = [
  { date: "১ ডিসেম্বর", title: "ভর্তি বিজ্ঞপ্তি প্রকাশ", desc: "ওয়েবসাইট ও নোটিশ বোর্ডে বিস্তারিত বিজ্ঞপ্তি" },
  { date: "১–২০ ডিসেম্বর", title: "ফরম বিতরণ ও গ্রহণ", desc: "অফিস চলাকালীন এবং অনলাইনে" },
  { date: "২৭ ডিসেম্বর", title: "ভর্তি পরীক্ষা", desc: "সকাল ১০টা, নিজ প্রতিষ্ঠান কেন্দ্রে" },
  { date: "৩০ ডিসেম্বর", title: "ফলাফল প্রকাশ", desc: "বিকাল ৪টায় ওয়েবসাইটে" },
  { date: "১–১০ জানুয়ারি", title: "ভর্তি কার্যক্রম", desc: "নির্বাচিতদের ফি জমা ও আসন নিশ্চিতকরণ" },
];

const commonFacilities: Record<string, Facility> = {
  library: { icon: "library", title: "সমৃদ্ধ পাঠাগার", desc: "পাঠ্যবইয়ের পাশাপাশি সাহিত্য, বিজ্ঞান ও রেফারেন্স বইয়ের বিশাল সংগ্রহ, নিরিবিলি পড়ার কক্ষ।" },
  lab: { icon: "flask", title: "বিজ্ঞান গবেষণাগার", desc: "পদার্থ, রসায়ন ও জীববিজ্ঞানের আলাদা ল্যাব — শিক্ষার্থীরা নিজ হাতে পরীক্ষা করে শেখে।" },
  computer: { icon: "monitor", title: "কম্পিউটার ল্যাব", desc: "ব্রডব্যান্ড সংযোগসহ আধুনিক কম্পিউটার ল্যাব, প্রতিটি শিক্ষার্থীর জন্য আলাদা ডেস্ক।" },
  smart: { icon: "presentation", title: "স্মার্ট ক্লাসরুম", desc: "মাল্টিমিডিয়া প্রজেক্টর ও ডিজিটাল কনটেন্টে পাঠদান — কঠিন বিষয়ও সহজে বোধগম্য।" },
  transport: { icon: "bus", title: "পরিবহন সুবিধা", desc: "নির্ধারিত রুটে নিজস্ব বাস সার্ভিস, প্রতিটি বাসে তত্ত্বাবধায়ক শিক্ষক।" },
  hostel: { icon: "home", title: "আবাসিক হোস্টেল", desc: "ছাত্র ও ছাত্রীদের জন্য পৃথক আবাসিক ব্যবস্থা, তত্ত্বাবধানে রাতের পাঠচক্র।" },
  prayer: { icon: "moon", title: "নামাজের ব্যবস্থা", desc: "প্রশস্ত নামাজ কক্ষ ও ওজুখানা, জামাতে নামাজ আদায়ের সুযোগ।" },
  playground: { icon: "trophy", title: "খেলার মাঠ", desc: "প্রশস্ত মাঠে নিয়মিত ক্রীড়া ও শারীরিক শিক্ষা কার্যক্রম।" },
  cctv: { icon: "shield", title: "সিসিটিভি নিরাপত্তা", desc: "পুরো ক্যাম্পাস ২৪ ঘণ্টা সিসিটিভি নজরদারিতে, নিরাপদ প্রবেশ-প্রস্থান।" },
  medical: { icon: "heart", title: "প্রাথমিক চিকিৎসা", desc: "প্রশিক্ষিত সেবিকাসহ মেডিকেল কর্নার, জরুরি প্রয়োজনে দ্রুত ব্যবস্থা।" },
  cafeteria: { icon: "utensils", title: "স্বাস্থ্যকর ক্যান্টিন", desc: "পরিচ্ছন্ন পরিবেশে সাশ্রয়ী দামে স্বাস্থ্যসম্মত খাবার।" },
  counseling: { icon: "users", title: "কাউন্সেলিং সেবা", desc: "শিক্ষার্থীর মানসিক বিকাশ ও ক্যারিয়ার পরিকল্পনায় পেশাদার পরামর্শ।" },
};

const f = (...keys: (keyof typeof commonFacilities)[]) => keys.map((k) => commonFacilities[k]);

/* ── রুটিন ────────────────────────────────────────────────────────
   হাতে ৪২টি ঘর লেখা মানে ভুল ও একঘেয়েমি। বদলে বিষয়ের তালিকা প্রতিদিন
   এক ধাপ ঘুরিয়ে দিলে বাস্তব রুটিনের মতোই দেখায় — এবং প্রতিষ্ঠান
   অ্যাডমিন থেকে নিজের আসল রুটিন বসালে এটিই প্রতিস্থাপিত হয়। */
const BN_DAYS = ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার"];
const BN_PERIODS = ["১ম · ১০:০০", "২য় · ১০:৫০", "৩য় · ১১:৪০", "বিরতি · ১২:৩০", "৪র্থ · ১:০০", "৫ম · ১:৫০", "৬ষ্ঠ · ২:৪০"];

export function buildRoutine(
  title: string, subjects: string[], days = BN_DAYS, periods = BN_PERIODS, breakAt = 3, breakLabel = "টিফিন বিরতি"
): RoutineTable {
  const slots = periods.length - 1; // বিরতি বাদে
  return {
    title, periods,
    rows: days.map((day, d) => {
      const rotated = subjects.slice(d % subjects.length).concat(subjects.slice(0, d % subjects.length));
      const cells = rotated.slice(0, slots);
      while (cells.length < slots) cells.push(...rotated.slice(0, slots - cells.length));
      cells.splice(breakAt, 0, breakLabel);
      return { day, cells };
    }),
  };
}

const routineBn = (type: InstitutionType): RoutineTable[] => {
  if (type === "madrasah") {
    return [
      buildRoutine("হিফজ ও নাযেরা বিভাগ", ["সবক", "সবকিনা", "আমুখতা", "তাজবীদ", "মাসায়েল", "বাংলা ও গণিত"]),
      buildRoutine("কিতাব বিভাগ", ["নাহু", "সরফ", "ফিকহ", "হাদীস", "তাফসীর", "আরবি সাহিত্য"]),
    ];
  }
  if (type === "kindergarten") {
    return [buildRoutine("প্লে – কেজি", ["বাংলা", "ইংরেজি", "গণিত", "ছবি আঁকা", "ছড়া ও গান", "খেলাধুলা"],
      BN_DAYS.slice(0, 5), ["১ম · ৮:০০", "২য় · ৮:৪০", "৩য় · ৯:২০", "বিরতি · ১০:০০", "৪র্থ · ১০:২০", "৫ম · ১১:০০"], 3)];
  }
  if (type === "college" || type === "coaching") {
    return [
      buildRoutine("একাদশ – দ্বাদশ (বিজ্ঞান)", ["পদার্থবিজ্ঞান", "রসায়ন", "জীববিজ্ঞান", "উচ্চতর গণিত", "বাংলা", "ইংরেজি"]),
      buildRoutine("একাদশ – দ্বাদশ (মানবিক ও ব্যবসায়)", ["হিসাববিজ্ঞান", "ব্যবস্থাপনা", "অর্থনীতি", "পৌরনীতি", "বাংলা", "ইংরেজি"]),
    ];
  }
  return [
    buildRoutine("ষষ্ঠ – অষ্টম শ্রেণি", ["বাংলা", "ইংরেজি", "গণিত", "বিজ্ঞান", "ধর্ম ও নৈতিক শিক্ষা", "তথ্য ও যোগাযোগ প্রযুক্তি"]),
    buildRoutine("নবম – দশম শ্রেণি", ["বাংলা", "ইংরেজি", "গণিত", "পদার্থ ও রসায়ন", "জীববিজ্ঞান", "বাংলাদেশ ও বিশ্বপরিচয়"]),
  ];
};

/* ── ক্লাব ও সহশিক্ষা ─────────────────────────────────────────── */
const clubsBn = (type: InstitutionType): Club[] => {
  const common: Club[] = [
    { name: "বিতর্ক ক্লাব", icon: "users", desc: "যুক্তি দিয়ে কথা বলার সাহস ও শালীনতা — দুটোই শেখানো হয় এখানে।", day: "প্রতি বুধবার", members: "৪৫" },
    { name: "সাংস্কৃতিক ক্লাব", icon: "sparkles", desc: "আবৃত্তি, গান, নাটক ও নৃত্য — জাতীয় দিবস ও বার্ষিক অনুষ্ঠানের প্রস্তুতি।", day: "প্রতি সোমবার", members: "৬০" },
    { name: "ক্রীড়া ক্লাব", icon: "trophy", desc: "ফুটবল, ক্রিকেট, ব্যাডমিন্টন ও অ্যাথলেটিকস — আন্তঃশ্রেণি ও আন্তঃস্কুল প্রতিযোগিতা।", day: "প্রতি বৃহস্পতিবার", members: "৮০" },
    { name: "স্কাউট ও রেড ক্রিসেন্ট", icon: "shield", desc: "সেবা, শৃঙ্খলা ও দুর্যোগে সহায়তার প্রশিক্ষণ; জাতীয় সমাবেশে অংশগ্রহণ।", day: "প্রতি রবিবার", members: "৩৫" },
  ];
  if (type === "madrasah") {
    return [
      { name: "কিরাত ও হিফজ ক্লাব", icon: "book", desc: "বিশুদ্ধ তিলাওয়াত ও সুললিত কিরাতের অনুশীলন; জাতীয় প্রতিযোগিতার প্রস্তুতি।", day: "প্রতি বৃহস্পতিবার", members: "৫০" },
      { name: "ইসলামি সাহিত্য ও বক্তৃতা", icon: "quote", desc: "আরবি-বাংলা বক্তৃতা, না'ত ও লেখালেখির চর্চা।", day: "প্রতি সোমবার", members: "৩৮" },
      { name: "দাওয়াহ ও সমাজসেবা", icon: "handHeart", desc: "এলাকায় দ্বীনি দাওয়াহ, শীতবস্ত্র বিতরণ ও ত্রাণ কার্যক্রম।", day: "মাসিক", members: "৪২" },
      { name: "ক্রীড়া ও শরীরচর্চা", icon: "trophy", desc: "সুন্নাহসম্মত খেলাধুলা — তীরন্দাজি, সাঁতার ও দৌড়ের আয়োজন।", day: "প্রতি বৃহস্পতিবার", members: "৫৫" },
      { name: "আইসিটি ক্লাব", icon: "monitor", desc: "কম্পিউটার, টাইপিং ও ডিজিটাল দক্ষতার প্রশিক্ষণ।", day: "প্রতি মঙ্গলবার", members: "৩০" },
    ];
  }
  if (type === "kindergarten") {
    return [
      { name: "ছবি আঁকা ক্লাব", icon: "sparkles", desc: "রঙ, কল্পনা ও ছোট ছোট হাতের নিখুঁত কাজ।", day: "প্রতি রবিবার", members: "৪০" },
      { name: "গান ও ছড়ার আসর", icon: "play", desc: "ছড়া, গান ও নাচের মাধ্যমে ভাষা ও ছন্দবোধ গড়ে তোলা।", day: "প্রতি মঙ্গলবার", members: "৪৫" },
      { name: "খেলার ক্লাব", icon: "trophy", desc: "নিরাপদ খেলাধুলায় শরীর ও মনের বিকাশ।", day: "প্রতিদিন", members: "সবাই" },
      { name: "গল্প পাঠের আসর", icon: "book", desc: "শিক্ষিকার মুখে গল্প শোনা ও নিজে বলতে শেখা।", day: "প্রতি বৃহস্পতিবার", members: "৩৫" },
    ];
  }
  return [
    ...common,
    { name: "বিজ্ঞান ক্লাব", icon: "flask", desc: "প্রজেক্ট, বিজ্ঞান মেলা ও উদ্ভাবনী প্রতিযোগিতার প্রস্তুতি।", day: "প্রতি মঙ্গলবার", members: "৫২" },
    { name: "আইসিটি ও প্রোগ্রামিং ক্লাব", icon: "monitor", desc: "কম্পিউটার দক্ষতা, প্রোগ্রামিং বেসিক ও ডিজিটাল কনটেন্ট তৈরি।", day: "প্রতি শনিবার", members: "৪০" },
    { name: "ভাষা ও সাহিত্য ক্লাব", icon: "book", desc: "দেয়ালিকা, বার্ষিক সংকলন ও সৃজনশীল লেখালেখি।", day: "পাক্ষিক", members: "৩৩" },
    { name: "পরিবেশ ও বৃক্ষরোপণ ক্লাব", icon: "heart", desc: "ক্যাম্পাস পরিচ্ছন্নতা, বৃক্ষরোপণ ও সচেতনতামূলক কার্যক্রম।", day: "মাসিক", members: "২৮" },
  ];
};

/* ── ফলাফলের ধারা (চার্টের উৎস) ──────────────────────────────── */
const chartBn = (type: InstitutionType): ResultSeries[] => {
  const years = ["২০২১", "২০২২", "২০২৩", "২০২৪", "২০২৫"];
  const mk = (exam: string, pass: number[], gpa: number[], appeared: number[], note?: string): ResultSeries => ({
    exam, note,
    rows: years.map((year, i) => ({
      year, passRate: pass[i], gpa5: gpa[i], appeared: appeared[i],
      passed: Math.round((appeared[i] * pass[i]) / 100),
    })),
  });
  if (type === "madrasah") {
    return [
      mk("দাখিল পরীক্ষা", [94, 96, 97, 98, 100], [12, 18, 21, 26, 31], [88, 95, 102, 110, 118]),
      mk("হিফজ সমাপনী", [100, 100, 100, 100, 100], [14, 17, 19, 22, 26], [14, 17, 19, 22, 26], "প্রতি বছর ৩০ পারা হিফজ সম্পন্নকারী শিক্ষার্থীর সংখ্যা।"),
    ];
  }
  if (type === "college") {
    return [
      mk("এইচএসসি পরীক্ষা", [91, 94, 95, 97, 98], [46, 62, 78, 96, 112], [310, 335, 348, 366, 382]),
      mk("এসএসসি পরীক্ষা", [95, 96, 98, 99, 100], [58, 71, 85, 103, 124], [285, 298, 312, 330, 345]),
    ];
  }
  if (type === "kindergarten") {
    return [mk("প্রাথমিক বৃত্তি পরীক্ষা", [88, 91, 94, 96, 98], [6, 9, 11, 14, 18], [42, 48, 55, 61, 68], "ট্যালেন্টপুল ও সাধারণ গ্রেডে বৃত্তিপ্রাপ্তির সংখ্যা।")];
  }
  if (type === "coaching") {
    return [mk("বিশ্ববিদ্যালয় ভর্তি", [72, 78, 81, 85, 88], [34, 45, 58, 72, 91], [180, 210, 245, 280, 320], "কাঙ্ক্ষিত প্রতিষ্ঠানে চান্সপ্রাপ্ত শিক্ষার্থীর সংখ্যা।")];
  }
  return [
    mk("এসএসসি পরীক্ষা", [92, 95, 96, 98, 100], [24, 33, 41, 52, 64], [186, 204, 218, 232, 248]),
    mk("জেএসসি / অষ্টম শ্রেণি", [96, 97, 98, 99, 100], [38, 44, 51, 60, 72], [210, 226, 238, 252, 265]),
  ];
};

/* ── ধরনভিত্তিক ডিফল্ট ─────────────────────────────────────────── */
type Partial2<T> = { [K in keyof T]?: T[K] };

const DEFAULTS: Record<InstitutionType, Partial2<SiteContent>> = {
  /* ইংলিশ মিডিয়াম / স্মার্ট স্কুল — আধুনিক, ক্যারিয়ারমুখী ভাষা */
  english_medium: {
    heroKicker: "ভর্তি চলছে",
    heroSub: "আন্তর্জাতিক মানের পাঠক্রম, ছোট ক্লাস সাইজ এবং প্রতিটি শিক্ষার্থীর প্রতি আলাদা মনোযোগ — আপনার সন্তানের জন্য একটি আত্মবিশ্বাসী ভবিষ্যৎ।",
    aboutTitle: "আমাদের সম্পর্কে",
    aboutPoints: [
      "অভিজ্ঞ ও প্রশিক্ষিত শিক্ষকমণ্ডলী",
      "প্রতি শ্রেণিতে সর্বোচ্চ ৩০ জন শিক্ষার্থী",
      "ইংরেজি ভাষায় সাবলীল যোগাযোগের উপর বিশেষ গুরুত্ব",
      "ডিজিটাল ক্লাসরুম ও প্রজেক্টভিত্তিক শিখন",
    ],
    why: [
      { icon: "graduation", title: "আন্তর্জাতিক মানের পাঠক্রম", desc: "জাতীয় পাঠ্যক্রমের সাথে আধুনিক শিখন পদ্ধতির সমন্বয়ে তৈরি নিজস্ব কারিকুলাম।" },
      { icon: "users", title: "ছোট ক্লাস, বড় মনোযোগ", desc: "প্রতি শ্রেণিতে সীমিত আসন — প্রতিটি শিক্ষার্থী শিক্ষকের সরাসরি নজরে থাকে।" },
      { icon: "monitor", title: "স্মার্ট ও ডিজিটাল ক্লাস", desc: "মাল্টিমিডিয়া কনটেন্ট, ইন্টার‌্যাকটিভ বোর্ড ও অনলাইন রিসোর্সে সমৃদ্ধ পাঠদান।" },
      { icon: "shield", title: "সম্পূর্ণ নিরাপদ ক্যাম্পাস", desc: "সিসিটিভি নজরদারি, নিয়ন্ত্রিত প্রবেশপথ ও প্রশিক্ষিত নিরাপত্তা কর্মী।" },
      { icon: "trophy", title: "সহশিক্ষা কার্যক্রম", desc: "বিতর্ক, বিজ্ঞান মেলা, ক্রীড়া ও সাংস্কৃতিক আয়োজনে পূর্ণাঙ্গ বিকাশ।" },
      { icon: "heart", title: "অভিভাবক-বান্ধব যোগাযোগ", desc: "নিয়মিত প্রগতি প্রতিবেদন, এসএমএস আপডেট ও সরাসরি শিক্ষক সাক্ষাৎ।" },
    ],
    programs: [
      { title: "প্লে ও নার্সারি", level: "বয়স ৩–৫", desc: "খেলার ছলে শেখা, ভাষা ও সামাজিক দক্ষতার ভিত্তি গঠন।", icon: "sparkles", points: ["ফোনিক্স ও প্রি-রাইটিং", "গল্প ও ছড়ার আসর", "সৃজনশীল কারুকাজ"] },
      { title: "প্রাথমিক শাখা", level: "প্রথম–পঞ্চম", desc: "মজবুত ভিত্তি — পড়া, লেখা, গণিত ও অনুসন্ধিৎসু মন।", icon: "book", points: ["প্রজেক্টভিত্তিক শিখন", "সাপ্তাহিক মূল্যায়ন", "পাঠাগার কার্যক্রম"] },
      { title: "মাধ্যমিক শাখা", level: "ষষ্ঠ–অষ্টম", desc: "বিষয়ভিত্তিক গভীরতা এবং স্বাধীনভাবে চিন্তা করার অভ্যাস।", icon: "flask", points: ["বিজ্ঞান ল্যাব ক্লাস", "উপস্থাপন দক্ষতা", "আইসিটি বাধ্যতামূলক"] },
      { title: "এসএসসি প্রস্তুতি", level: "নবম–দশম", desc: "বিজ্ঞান, ব্যবসায় ও মানবিক — বোর্ড পরীক্ষার পূর্ণ প্রস্তুতি।", icon: "graduation", points: ["মডেল টেস্ট সিরিজ", "দুর্বল বিষয়ে বিশেষ ক্লাস", "ক্যারিয়ার কাউন্সেলিং"] },
    ],
    facilities: f("smart", "computer", "lab", "library", "transport", "cctv", "medical", "playground"),
    fees: [
      { label: "প্লে – নার্সারি", admission: "৳ ৮,০০০", monthly: "৳ ২,০০০" },
      { label: "প্রথম – তৃতীয়", admission: "৳ ১০,০০০", monthly: "৳ ২,৫০০" },
      { label: "চতুর্থ – পঞ্চম", admission: "৳ ১২,০০০", monthly: "৳ ৩,০০০" },
      { label: "ষষ্ঠ – অষ্টম", admission: "৳ ১৪,০০০", monthly: "৳ ৩,৫০০" },
      { label: "নবম – দশম", admission: "৳ ১৬,০০০", monthly: "৳ ৪,০০০", note: "বিভাগভেদে সামান্য তারতম্য" },
    ],
    feeNote: "ভর্তি ফি এককালীন। মেধাবী ও অসচ্ছল শিক্ষার্থীদের জন্য উপবৃত্তি ও বেতন মওকুফের সুযোগ রয়েছে।",
  },

  /* বাংলা মিডিয়াম স্কুল — ঐতিহ্য, আস্থা, সরকারি অনুমোদন */
  school: {
    heroKicker: "ভর্তি বিজ্ঞপ্তি প্রকাশিত",
    heroSub: "মানসম্মত শিক্ষা, কঠোর শৃঙ্খলা ও নৈতিক মূল্যবোধের সমন্বয়ে গড়ে উঠছে আগামী দিনের সুনাগরিক।",
    aboutTitle: "প্রতিষ্ঠান পরিচিতি",
    aboutPoints: [
      "সরকার অনুমোদিত ও এমপিওভুক্ত প্রতিষ্ঠান",
      "অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষকমণ্ডলী",
      "নিয়মিত অভিভাবক সমাবেশ ও প্রগতি প্রতিবেদন",
      "বোর্ড পরীক্ষায় ধারাবাহিক সাফল্য",
    ],
    why: [
      { icon: "shield", title: "সরকার অনুমোদিত", desc: "যথাযথ কর্তৃপক্ষের অনুমোদন ও EIIN নম্বরসহ পূর্ণ স্বীকৃতিপ্রাপ্ত প্রতিষ্ঠান।" },
      { icon: "graduation", title: "ধারাবাহিক ফলাফল", desc: "বোর্ড পরীক্ষায় বছরের পর বছর ঈর্ষণীয় পাসের হার ও জিপিএ-৫ অর্জন।" },
      { icon: "users", title: "অভিজ্ঞ শিক্ষকমণ্ডলী", desc: "প্রশিক্ষণপ্রাপ্ত, দীর্ঘদিনের অভিজ্ঞ শিক্ষকদের যত্নে পাঠদান।" },
      { icon: "book", title: "নিয়মিত পরীক্ষা ও মূল্যায়ন", desc: "সাপ্তাহিক, মাসিক ও অর্ধবার্ষিক মূল্যায়নে ধারাবাহিক অগ্রগতি নিশ্চিত।" },
      { icon: "heart", title: "নৈতিক শিক্ষা", desc: "ধর্মীয় ও নৈতিক শিক্ষার মাধ্যমে চরিত্র গঠনে বিশেষ গুরুত্ব।" },
      { icon: "trophy", title: "সহশিক্ষা কার্যক্রম", desc: "বিতর্ক, আবৃত্তি, ক্রীড়া ও সাংস্কৃতিক প্রতিযোগিতায় নিয়মিত অংশগ্রহণ।" },
    ],
    programs: [
      { title: "প্রাথমিক শাখা", level: "প্রথম–পঞ্চম", desc: "শিশুর পাঠাভ্যাস ও মৌলিক দক্ষতা গঠনের সময়।", icon: "book", points: ["বাংলা ও ইংরেজি হাতের লেখা", "গণিতের ভিত্তি", "নিয়মিত পাঠ মূল্যায়ন"] },
      { title: "নিম্ন মাধ্যমিক", level: "ষষ্ঠ–অষ্টম", desc: "বিষয়ভিত্তিক শিক্ষার সূচনা ও অনুসন্ধিৎসা তৈরি।", icon: "flask", points: ["বিজ্ঞান ব্যবহারিক ক্লাস", "আইসিটি শিক্ষা", "জেএসসি প্রস্তুতি"] },
      { title: "মাধ্যমিক — বিজ্ঞান", level: "নবম–দশম", desc: "পদার্থ, রসায়ন, জীববিজ্ঞান ও উচ্চতর গণিত।", icon: "flask", points: ["ব্যবহারিক ল্যাব", "মডেল টেস্ট", "বিশেষ কোচিং ক্লাস"] },
      { title: "মাধ্যমিক — মানবিক ও ব্যবসায়", level: "নবম–দশম", desc: "ভবিষ্যৎ লক্ষ্য অনুযায়ী বিভাগ নির্বাচনের সুযোগ।", icon: "graduation", points: ["হিসাববিজ্ঞান ও ব্যবসায় উদ্যোগ", "ভূগোল ও পৌরনীতি", "ক্যারিয়ার পরামর্শ"] },
    ],
    facilities: f("library", "lab", "computer", "playground", "prayer", "transport", "medical", "smart"),
    fees: [
      { label: "প্রথম – পঞ্চম", admission: "৳ ১,৫০০", monthly: "৳ ৩০০" },
      { label: "ষষ্ঠ – অষ্টম", admission: "৳ ২,০০০", monthly: "৳ ৪৫০" },
      { label: "নবম – দশম (মানবিক/ব্যবসায়)", admission: "৳ ২,৫০০", monthly: "৳ ৬০০" },
      { label: "নবম – দশম (বিজ্ঞান)", admission: "৳ ৩,০০০", monthly: "৳ ৭৫০", note: "ব্যবহারিক ফি অন্তর্ভুক্ত" },
    ],
    feeNote: "সরকারি নির্দেশনা অনুযায়ী উপবৃত্তিপ্রাপ্ত ও অসচ্ছল শিক্ষার্থীদের বেতন আংশিক বা সম্পূর্ণ মওকুফ করা হয়।",
  },

  /* কলেজ — উচ্চ মাধ্যমিক, ভর্তি ও ফলাফলকেন্দ্রিক */
  college: {
    heroKicker: "একাদশ শ্রেণিতে ভর্তি চলছে",
    heroSub: "উচ্চ মাধ্যমিক ও উচ্চশিক্ষার শক্ত ভিত্তি — অভিজ্ঞ শিক্ষক, সমৃদ্ধ গবেষণাগার এবং বিশ্ববিদ্যালয় ভর্তির লক্ষ্যভিত্তিক প্রস্তুতি।",
    aboutTitle: "কলেজ পরিচিতি",
    aboutPoints: [
      "বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা — তিন বিভাগেই পাঠদান",
      "এইচএসসি ও বিশ্ববিদ্যালয় ভর্তির সমন্বিত প্রস্তুতি",
      "সুসজ্জিত গবেষণাগার ও সমৃদ্ধ পাঠাগার",
      "শিক্ষার্থীদের জন্য আবাসিক ও পরিবহন সুবিধা",
    ],
    why: [
      { icon: "graduation", title: "এইচএসসিতে ধারাবাহিক সাফল্য", desc: "প্রতি বছর উচ্চ পাসের হার ও উল্লেখযোগ্য সংখ্যক জিপিএ-৫।" },
      { icon: "flask", title: "সমৃদ্ধ গবেষণাগার", desc: "পদার্থ, রসায়ন ও জীববিজ্ঞানের পূর্ণাঙ্গ ব্যবহারিক ব্যবস্থা।" },
      { icon: "users", title: "বিশ্ববিদ্যালয় ভর্তি সহায়তা", desc: "মেডিকেল, প্রকৌশল ও বিশ্ববিদ্যালয় ভর্তির জন্য আলাদা প্রস্তুতিমূলক ক্লাস।" },
      { icon: "library", title: "সমৃদ্ধ পাঠাগার", desc: "রেফারেন্স বই, জার্নাল ও ডিজিটাল রিসোর্সের বড় সংগ্রহ।" },
      { icon: "home", title: "আবাসিক সুবিধা", desc: "দূরবর্তী শিক্ষার্থীদের জন্য ছাত্র ও ছাত্রী পৃথক হোস্টেল।" },
      { icon: "trophy", title: "সহপাঠক্রমিক কার্যক্রম", desc: "বিএনসিসি, রোভার স্কাউট, বিতর্ক ও বিজ্ঞান ক্লাব।" },
    ],
    programs: [
      { title: "বিজ্ঞান বিভাগ", level: "একাদশ–দ্বাদশ", desc: "পদার্থ, রসায়ন, জীববিজ্ঞান ও উচ্চতর গণিত।", icon: "flask", points: ["পূর্ণাঙ্গ ব্যবহারিক ক্লাস", "মেডিকেল ও বুয়েট প্রস্তুতি", "সাপ্তাহিক পরীক্ষা"] },
      { title: "ব্যবসায় শিক্ষা", level: "একাদশ–দ্বাদশ", desc: "হিসাববিজ্ঞান, ব্যবস্থাপনা, ফিন্যান্স ও মার্কেটিং।", icon: "book", points: ["ব্যবহারিক কেস স্টাডি", "বিবিএ ভর্তি প্রস্তুতি", "কম্পিউটার প্রশিক্ষণ"] },
      { title: "মানবিক বিভাগ", level: "একাদশ–দ্বাদশ", desc: "অর্থনীতি, পৌরনীতি, সমাজবিজ্ঞান, ভূগোল ও ইতিহাস।", icon: "graduation", points: ["বিশ্লেষণী লেখার প্রশিক্ষণ", "বিশ্ববিদ্যালয় ‘ক’ ইউনিট প্রস্তুতি", "সেমিনার ও উপস্থাপনা"] },
      { title: "ভর্তি প্রস্তুতি শাখা", level: "এইচএসসি উত্তীর্ণ", desc: "বিশ্ববিদ্যালয় ও মেডিকেল ভর্তির নিবিড় কোর্স।", icon: "sparkles", points: ["বিষয়ভিত্তিক শর্ট সিলেবাস", "নিয়মিত মডেল টেস্ট", "মেধা তালিকা প্রকাশ"] },
    ],
    facilities: f("lab", "library", "computer", "hostel", "transport", "playground", "prayer", "counseling"),
    fees: [
      { label: "একাদশ — মানবিক", admission: "৳ ৩,৫০০", monthly: "৳ ৮০০" },
      { label: "একাদশ — ব্যবসায় শিক্ষা", admission: "৳ ৪,০০০", monthly: "৳ ৯০০" },
      { label: "একাদশ — বিজ্ঞান", admission: "৳ ৫,০০০", monthly: "৳ ১,২০০", note: "ব্যবহারিক ফি অন্তর্ভুক্ত" },
      { label: "হোস্টেল (মাসিক)", monthly: "৳ ৩,৫০০", note: "খাবারসহ" },
    ],
    feeNote: "সরকারি বিধি অনুযায়ী উপবৃত্তি ও মেধাবৃত্তির ব্যবস্থা রয়েছে। মুক্তিযোদ্ধা কোটায় বিশেষ ছাড় প্রযোজ্য।",
  },

  /* মাদ্রাসা — দ্বীনি পরিভাষা, আদব-আখলাক */
  madrasah: {
    heroKicker: "ভর্তি চলছে",
    heroSub: "কুরআন ও সুন্নাহর আলোকে ইলম, আমল ও আখলাকের সমন্বয়ে গড়ে উঠছে আদর্শ প্রজন্ম।",
    aboutTitle: "মাদরাসা পরিচিতি",
    aboutPoints: [
      "হিফজুল কুরআন, কিতাব ও জেনারেল শিক্ষার সমন্বিত পাঠক্রম",
      "অভিজ্ঞ হাফেজ ও মুহাদ্দিস উস্তাযগণের তত্ত্বাবধান",
      "আবাসিক ও অনাবাসিক — উভয় ব্যবস্থা",
      "আদব-আখলাক ও চরিত্র গঠনে বিশেষ গুরুত্ব",
    ],
    why: [
      { icon: "book", title: "বিশুদ্ধ কুরআন শিক্ষা", desc: "তাজবীদসহ বিশুদ্ধ তিলাওয়াত ও হিফজের নিবিড় তত্ত্বাবধান।" },
      { icon: "users", title: "অভিজ্ঞ উস্তাযমণ্ডলী", desc: "দেশবরেণ্য মাদরাসা থেকে ফারেগ, দীর্ঘ অভিজ্ঞতাসম্পন্ন শিক্ষকমণ্ডলী।" },
      { icon: "heart", title: "আদব ও আখলাক", desc: "ইলমের পাশাপাশি উত্তম চরিত্র ও আচরণ গঠনে সার্বক্ষণিক তারবিয়্যাত।" },
      { icon: "graduation", title: "সমন্বিত পাঠক্রম", desc: "দ্বীনি শিক্ষার সাথে বাংলা, ইংরেজি, গণিত ও কম্পিউটার শিক্ষা।" },
      { icon: "home", title: "সুশৃঙ্খল আবাসিক ব্যবস্থা", desc: "পরিচ্ছন্ন আবাসন, সুষম খাবার এবং রাতের তত্ত্বাবধানে পাঠচক্র।" },
      { icon: "shield", title: "নিরাপদ পরিবেশ", desc: "সিসিটিভি নজরদারি ও সার্বক্ষণিক তত্ত্বাবধায়ক — অভিভাবক নিশ্চিন্ত।" },
    ],
    programs: [
      { title: "নাযেরা বিভাগ", level: "প্রাথমিক", desc: "বিশুদ্ধ মাখরাজ ও তাজবীদসহ কুরআন পাঠের ভিত্তি।", icon: "book", points: ["মাখরাজ ও সিফাত", "দৈনিক সবক ও সবকিনা", "নূরানী পদ্ধতি"] },
      { title: "হিফজুল কুরআন", level: "আবাসিক", desc: "পূর্ণ ৩০ পারা হিফজ — অভিজ্ঞ হাফেজ সাহেবদের তত্ত্বাবধানে।", icon: "sparkles", points: ["দৈনিক সবক, সবকিনা ও দাওর", "সাপ্তাহিক শোনানো", "খতম ও দোয়ার মাহফিল"] },
      { title: "কিতাব বিভাগ", level: "ইবতেদায়ি–দাখিল", desc: "আরবি ব্যাকরণ, ফিকহ, হাদীস ও তাফসীরের ধারাবাহিক পাঠ।", icon: "library", points: ["নাহু ও সরফ", "ফিকহ ও উসূল", "হাদীস ও তাফসীর"] },
      { title: "জেনারেল শিক্ষা", level: "সব বিভাগে", desc: "দ্বীনি শিক্ষার পাশাপাশি জাতীয় পাঠ্যক্রমের বিষয়সমূহ।", icon: "monitor", points: ["বাংলা ও ইংরেজি", "গণিত ও বিজ্ঞান", "কম্পিউটার শিক্ষা"] },
    ],
    facilities: f("prayer", "hostel", "library", "computer", "medical", "cctv", "cafeteria", "playground"),
    fees: [
      { label: "নাযেরা (অনাবাসিক)", admission: "৳ ১,০০০", monthly: "৳ ৫০০" },
      { label: "হিফজ (আবাসিক)", admission: "৳ ৩,০০০", monthly: "৳ ৩,৫০০", note: "খাবার ও আবাসনসহ" },
      { label: "কিতাব বিভাগ (অনাবাসিক)", admission: "৳ ১,৫০০", monthly: "৳ ৮০০" },
      { label: "কিতাব বিভাগ (আবাসিক)", admission: "৳ ৩,০০০", monthly: "৳ ৪,০০০", note: "খাবার ও আবাসনসহ" },
    ],
    feeNote: "এতিম ও দরিদ্র শিক্ষার্থীদের জন্য যাকাত ও দান তহবিল থেকে সম্পূর্ণ বিনা খরচে পড়ার সুযোগ রয়েছে।",
  },

  /* কিন্ডারগার্টেন — কোমল, অভিভাবককে আশ্বস্ত করা ভাষা */
  kindergarten: {
    heroKicker: "ভর্তি চলছে",
    heroSub: "স্নেহ, নিরাপত্তা আর আনন্দের পরিবেশে আপনার সোনামণির প্রথম পাঠশালা — শেখা হোক খেলার ছলে।",
    aboutTitle: "আমাদের পরিচয়",
    aboutPoints: [
      "খেলাভিত্তিক শিখন পদ্ধতি",
      "প্রশিক্ষিত ও স্নেহশীল শিক্ষিকা",
      "প্রতি শ্রেণিতে সীমিত সংখ্যক শিশু",
      "সিসিটিভি নজরদারিসহ সম্পূর্ণ নিরাপদ পরিবেশ",
    ],
    why: [
      { icon: "heart", title: "স্নেহময় পরিবেশ", desc: "প্রতিটি শিশু যেন নিজের ঘরের মতো নিরাপদ ও আনন্দে থাকে — সেটিই আমাদের প্রথম কাজ।" },
      { icon: "sparkles", title: "খেলার ছলে শেখা", desc: "গান, ছড়া, ছবি আঁকা ও খেলার মাধ্যমে অক্ষর, সংখ্যা ও ভাষার হাতেখড়ি।" },
      { icon: "shield", title: "নিরাপত্তাই অগ্রাধিকার", desc: "সিসিটিভি, নিয়ন্ত্রিত প্রবেশপথ এবং অভিভাবক ছাড়া কাউকে শিশু হস্তান্তর নয়।" },
      { icon: "users", title: "প্রশিক্ষিত শিক্ষিকা", desc: "শিশু মনস্তত্ত্বে প্রশিক্ষণপ্রাপ্ত, ধৈর্যশীল ও যত্নশীল শিক্ষিকামণ্ডলী।" },
      { icon: "utensils", title: "স্বাস্থ্যকর টিফিন", desc: "পুষ্টিকর ও পরিচ্ছন্ন টিফিনের ব্যবস্থা, খাদ্য অ্যালার্জির প্রতি বিশেষ নজর।" },
      { icon: "bus", title: "নিরাপদ পরিবহন", desc: "প্রতিটি গাড়িতে তত্ত্বাবধায়ক আপা — ঘর থেকে স্কুল, স্কুল থেকে ঘর।" },
    ],
    programs: [
      { title: "প্লে গ্রুপ", level: "বয়স ২.৫–৩.৫", desc: "মায়ের কোল ছেড়ে প্রথম সামাজিক পরিবেশে মানিয়ে নেওয়া।", icon: "sparkles", points: ["রঙ ও আকৃতি চেনা", "ছড়া ও গান", "সহপাঠীর সাথে মেশা"] },
      { title: "নার্সারি", level: "বয়স ৩.৫–৪.৫", desc: "অক্ষর ও সংখ্যার সাথে বন্ধুত্ব।", icon: "book", points: ["বাংলা ও ইংরেজি বর্ণ", "১–৫০ সংখ্যা", "হাতের লেখার প্রস্তুতি"] },
      { title: "কেজি", level: "বয়স ৪.৫–৫.৫", desc: "প্রথম শ্রেণিতে ভর্তির পূর্ণ প্রস্তুতি।", icon: "graduation", points: ["শব্দ গঠন ও পড়া", "যোগ-বিয়োগ", "ছোট বাক্য লেখা"] },
      { title: "সৃজনশীল কার্যক্রম", level: "সব শ্রেণিতে", desc: "শিশুর কল্পনা ও আত্মবিশ্বাস গড়ে তোলা।", icon: "trophy", points: ["ছবি আঁকা ও কারুকাজ", "নাচ, গান ও আবৃত্তি", "বার্ষিক ক্রীড়া ও সাংস্কৃতিক দিবস"] },
    ],
    facilities: f("playground", "medical", "cctv", "cafeteria", "transport", "library", "smart", "counseling"),
    fees: [
      { label: "প্লে গ্রুপ", admission: "৳ ৩,০০০", monthly: "৳ ১,০০০" },
      { label: "নার্সারি", admission: "৳ ৩,৫০০", monthly: "৳ ১,২০০" },
      { label: "কেজি", admission: "৳ ৪,০০০", monthly: "৳ ১,৫০০" },
      { label: "পরিবহন (মাসিক)", monthly: "৳ ১,০০০", note: "দূরত্বভেদে" },
    ],
    feeNote: "একই পরিবারের দ্বিতীয় সন্তানের ক্ষেত্রে ভর্তি ফিতে ৫০% ছাড় প্রযোজ্য।",
  },

  /* কোচিং / ভর্তি কোচিং — ফলাফল ও ব্যাচকেন্দ্রিক */
  coaching: {
    heroKicker: "নতুন ব্যাচ শুরু হচ্ছে",
    heroSub: "অভিজ্ঞ শিক্ষক, পরিকল্পিত সিলেবাস ও নিয়মিত পরীক্ষা — লক্ষ্যে পৌঁছানোর সবচেয়ে নিশ্চিত পথ।",
    aboutTitle: "আমাদের সম্পর্কে",
    aboutPoints: [
      "বিষয়ভিত্তিক অভিজ্ঞ শিক্ষকমণ্ডলী",
      "ছোট ব্যাচে ব্যক্তিগত মনোযোগ",
      "নিয়মিত মডেল টেস্ট ও মেধা তালিকা",
      "নিজস্ব লেকচার শিট ও প্রশ্নব্যাংক",
    ],
    why: [
      { icon: "trophy", title: "প্রমাণিত ফলাফল", desc: "প্রতি বছর শতাধিক শিক্ষার্থীর কাঙ্ক্ষিত প্রতিষ্ঠানে ভর্তি নিশ্চিত।" },
      { icon: "users", title: "ছোট ব্যাচ", desc: "প্রতি ব্যাচে সীমিত আসন — প্রতিটি শিক্ষার্থীর দুর্বলতা ধরে আলাদা যত্ন।" },
      { icon: "book", title: "নিজস্ব লেকচার শিট", desc: "সংক্ষিপ্ত, গোছানো ও পরীক্ষামুখী নোট — বাড়তি বই কেনার প্রয়োজন নেই।" },
      { icon: "monitor", title: "নিয়মিত পরীক্ষা", desc: "সাপ্তাহিক পরীক্ষা ও অনলাইন মেধা তালিকায় নিজের অবস্থান জানুন।" },
      { icon: "heart", title: "অভিভাবক রিপোর্ট", desc: "প্রতি মাসে উপস্থিতি ও ফলাফলের বিস্তারিত রিপোর্ট এসএমএসে।" },
      { icon: "sparkles", title: "সাশ্রয়ী ফি", desc: "মানসম্মত পাঠদান সবার নাগালের মধ্যে — মেধাবীদের জন্য বিশেষ ছাড়।" },
    ],
    programs: [
      { title: "এসএসসি প্রোগ্রাম", level: "নবম–দশম", desc: "বোর্ড পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি, সব বিষয়।", icon: "book", points: ["অধ্যায়ভিত্তিক ক্লাস", "সাপ্তাহিক পরীক্ষা", "বোর্ড প্রশ্ন সমাধান"] },
      { title: "এইচএসসি প্রোগ্রাম", level: "একাদশ–দ্বাদশ", desc: "বিজ্ঞান, ব্যবসায় ও মানবিক — সব বিভাগে।", icon: "flask", points: ["ব্যবহারিক সহায়তা", "শর্ট সিলেবাস রিভিশন", "মডেল টেস্ট সিরিজ"] },
      { title: "বিশ্ববিদ্যালয় ভর্তি", level: "এইচএসসি উত্তীর্ণ", desc: "ঢাবি, রাবি, জাবিসহ গুচ্ছ ভর্তি প্রস্তুতি।", icon: "graduation", points: ["ইউনিটভিত্তিক ব্যাচ", "প্রশ্নব্যাংক বিশ্লেষণ", "সাপ্তাহিক মেধা তালিকা"] },
      { title: "মেডিকেল ও প্রকৌশল", level: "নিবিড় কোর্স", desc: "সীমিত আসনের নিবিড় প্রস্তুতিমূলক ব্যাচ।", icon: "sparkles", points: ["দৈনিক পরীক্ষা", "বিষয়ভিত্তিক বিশেষজ্ঞ শিক্ষক", "ব্যক্তিগত ফলো-আপ"] },
    ],
    facilities: f("smart", "computer", "library", "counseling", "cctv", "cafeteria", "medical", "transport"),
    fees: [
      { label: "এসএসসি প্রোগ্রাম", admission: "৳ ১,০০০", monthly: "৳ ১,৫০০" },
      { label: "এইচএসসি প্রোগ্রাম", admission: "৳ ১,৫০০", monthly: "৳ ২,০০০" },
      { label: "বিশ্ববিদ্যালয় ভর্তি", admission: "৳ ২,০০০", monthly: "৳ ২,৫০০" },
      { label: "মেডিকেল/প্রকৌশল নিবিড়", admission: "৳ ৩,০০০", monthly: "৳ ৩,৫০০", note: "সীমিত আসন" },
    ],
    feeNote: "এ+ প্রাপ্ত ও অসচ্ছল শিক্ষার্থীদের জন্য ২৫%–১০০% পর্যন্ত বৃত্তির সুযোগ রয়েছে।",
  },
};

/* ── সব ধরনের জন্য অভিন্ন ডিফল্ট ─────────────────────────────── */
const shared = (name: string, type: InstitutionType): SiteContent => ({
  heroKicker: "ভর্তি চলছে",
  heroTitle: "",
  heroSub: "",
  heroCta: "ভর্তি তথ্য জানুন",
  aboutTitle: "আমাদের সম্পর্কে",
  aboutBody: "",
  aboutPoints: [],
  why: [],
  chairman: {
    name: "",
    role: "সভাপতি, পরিচালনা পর্ষদ",
    message:
      "শিক্ষা কেবল সনদ অর্জনের মাধ্যম নয় — এটি একজন মানুষকে পূর্ণ মানুষ করে তোলার প্রক্রিয়া। " +
      `${name}-এ আমরা সেই বিশ্বাস থেকেই কাজ করি। অভিভাবকগণ যে আস্থা নিয়ে সন্তানকে আমাদের হাতে তুলে দেন, ` +
      "সেই আস্থার মর্যাদা রক্ষা করাই আমাদের সবচেয়ে বড় দায়িত্ব।",
  },
  principal: {
    name: "",
    role: type === "madrasah" ? "মুহতামিম" : "প্রধান শিক্ষক",
    message:
      "প্রতিটি শিক্ষার্থীর মধ্যেই আলাদা সম্ভাবনা লুকিয়ে থাকে। আমাদের শিক্ষকমণ্ডলীর কাজ সেই সম্ভাবনাটুকু খুঁজে বের করা " +
      "এবং যত্ন দিয়ে বিকশিত করা। শৃঙ্খলা, নিয়মিত মূল্যায়ন ও অভিভাবকের সক্রিয় অংশগ্রহণ — এই তিনের সমন্বয়েই " +
      "আমরা ধারাবাহিক সাফল্য ধরে রেখেছি।",
  },
  stats: [],
  trust: [],
  programs: [],
  facilities: [],
  campusLife: [
    { title: "বার্ষিক ক্রীড়া প্রতিযোগিতা", desc: "শীতের সকালে পুরো মাঠজুড়ে উৎসব — দৌড়, মোরগ লড়াই আর পুরস্কার বিতরণী।" },
    { title: "বিজ্ঞান ও প্রযুক্তি মেলা", desc: "শিক্ষার্থীদের নিজ হাতে তৈরি প্রজেক্ট প্রদর্শনী ও উদ্ভাবনী প্রতিযোগিতা।" },
    { title: "সাংস্কৃতিক সন্ধ্যা", desc: "আবৃত্তি, গান, নাটক ও নৃত্যে শিক্ষার্থীদের প্রতিভার প্রকাশ।" },
    { title: "শিক্ষা সফর", desc: "প্রতি বছর ঐতিহাসিক ও দর্শনীয় স্থানে শিক্ষামূলক ভ্রমণের আয়োজন।" },
  ],
  achievements: [
    { title: "বোর্ড পরীক্ষায় শতভাগ পাস", year: "২০২৫", desc: "টানা পঞ্চম বছর শতভাগ পাসের হার অর্জন।", icon: "trophy" },
    { title: "উপজেলা পর্যায়ে শ্রেষ্ঠ প্রতিষ্ঠান", year: "২০২৪", desc: "শিক্ষা ও শৃঙ্খলার স্বীকৃতিস্বরূপ সম্মাননা লাভ।", icon: "award" },
    { title: "জাতীয় বিজ্ঞান মেলায় পুরস্কার", year: "২০২৪", desc: "আঞ্চলিক পর্যায়ে প্রথম স্থান অর্জন।", icon: "sparkles" },
    { title: "আন্তঃস্কুল বিতর্কে চ্যাম্পিয়ন", year: "২০২৩", desc: "জেলা পর্যায়ের বিতর্ক প্রতিযোগিতায় শিরোপা।", icon: "users" },
  ],
  topStudents: [],
  testimonials: [
    { name: "রুবিনা আক্তার", relation: "অভিভাবক, ৭ম শ্রেণি", rating: 5, text: "শিক্ষকরা যে যত্ন নিয়ে পড়ান, তা সত্যিই প্রশংসনীয়। আমার মেয়ের ফলাফল এক বছরেই অনেক ভালো হয়েছে, আর সবচেয়ে বড় কথা — সে এখন স্কুলে যেতে ভালোবাসে।" },
    { name: "মোঃ শফিকুল ইসলাম", relation: "অভিভাবক, ১০ম শ্রেণি", rating: 5, text: "নিয়মিত অভিভাবক সভা আর মাসিক রিপোর্টের কারণে ছেলের পড়াশোনার খোঁজ সবসময় পাই। এমন স্বচ্ছতা সব প্রতিষ্ঠানে দেখা যায় না।" },
    { name: "নাসরিন সুলতানা", relation: "অভিভাবক, ৩য় শ্রেণি", rating: 5, text: "ক্যাম্পাস অনেক পরিষ্কার আর নিরাপদ। সিসিটিভি আছে, গেটে দারোয়ান আছে — সন্তানকে রেখে নিশ্চিন্তে অফিসে যেতে পারি।" },
    { name: "আব্দুল্লাহ আল মামুন", relation: "প্রাক্তন শিক্ষার্থী", rating: 5, text: "এখান থেকে পাওয়া শৃঙ্খলা আর ভিত্তির জোরেই বিশ্ববিদ্যালয়ে ভালো করতে পেরেছি। শিক্ষকদের কাছে আজীবন কৃতজ্ঞ।" },
  ],
  faq: baseFaq,
  admissionSteps: baseAdmissionSteps,
  admissionTimeline: baseTimeline,
  fees: [],
  videos: [],
  resultPortalNote: "রোল নম্বর ও শ্রেণি নির্বাচন করে ফলাফল দেখুন। ফল প্রকাশের সাথে সাথেই এখানে পাওয়া যাবে।",
  departments: [],
  routine: routineBn(type),
  clubs: clubsBn(type),
  resultChart: chartBn(type),
});

/* ── মার্জ ────────────────────────────────────────────────────── */
const isEmpty = (v: unknown) =>
  v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

/** টেন্যান্টের নিজস্ব মান থাকলে সেটিই জেতে; না থাকলে ডিফল্ট। */
function overlay<T extends object>(base: T, over?: Partial<T> | null): T {
  if (!over) return base;
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(over)) if (!isEmpty(v)) out[k] = v;
  return out as T;
}

export function normalizeType(t?: string): InstitutionType {
  const k = String(t || "school");
  return (["school", "english_medium", "college", "madrasah", "kindergarten", "coaching"] as const).includes(k as never)
    ? (k as InstitutionType)
    : "school";
}

/**
 * টেন্যান্ট → রেন্ডার-রেডি কনটেন্ট।
 * টেমপ্লেটগুলো কখনো tenant.content সরাসরি পড়ে না — সবসময় এই ফাংশনের আউটপুট পড়ে,
 * তাই কোনো সেকশন কখনোই ফাঁকা রেন্ডার হয় না।
 *
 * `lang` আসে টেমপ্লেট থেকে (ইংরেজি অফিসিয়াল টেমপ্লেটে "en")। ইংরেজি হলে বাংলা
 * ভিত্তির উপর সম্পূর্ণ ইংরেজি ডিফল্ট স্তর বসে, তারপর প্রতিষ্ঠানের নিজস্ব কনটেন্ট।
 */
export function resolveContent(
  tenant: Tenant & { content?: Partial<SiteContent> },
  lang: Lang = "bn"
): SiteContent {
  const type = normalizeType(tenant.type);
  const base = shared(tenant.name, type);
  const byType = DEFAULTS[type] as Partial<SiteContent>;
  const en = lang === "en" ? englishDefaults(tenant.name, type) : null;
  const merged = overlay(overlay(overlay(base, byType), en), tenant.content);

  // টেন্যান্টের মূল ফিল্ড থেকে যেগুলো সরাসরি আসে
  merged.heroTitle = tenant.content?.heroTitle || tenant.tagline || defaultTagline(type, tenant.name, lang);
  merged.aboutBody = tenant.content?.aboutBody || tenant.about || defaultAbout(type, tenant.name, lang);
  if (!merged.heroSub) merged.heroSub = (en || base).heroSub!;

  // পরিসংখ্যান: tenant.stats থাকলে সেটি, নইলে ধরনভিত্তিক নিরাপদ ডিফল্ট
  merged.stats = tenant.content?.stats?.length
    ? tenant.content.stats
    : statsFrom(tenant, type, lang);

  merged.trust = tenant.content?.trust?.length ? tenant.content.trust : trustFrom(tenant, type, lang);

  // চেয়ারম্যান ও প্রধান শিক্ষকের নাম না থাকলে ব্লক দেখাবে না — ভুয়া নাম দেখানো হয় না
  merged.chairman = mergePerson((en || base).chairman!, tenant.content?.chairman);
  merged.principal = mergePerson((en || base).principal!, tenant.content?.principal);

  if (!merged.topStudents?.length) merged.topStudents = tenant.content?.topStudents || [];

  // বিভাগ আলাদা করে না দিলে পাঠক্রম থেকেই তৈরি — "বিভাগসমূহ" পেজ কখনো ফাঁকা নয়
  if (!merged.departments?.length) merged.departments = departmentsFrom(merged.programs);
  return merged;
}

/** পাঠক্রম → বিভাগ। বিষয় তালিকা points থেকে; বিভাগীয় প্রধানের নাম প্রতিষ্ঠান বসাবে। */
function departmentsFrom(programs: Program[]): Department[] {
  return programs.map((p) => ({
    name: p.title, level: p.level, desc: p.desc, icon: p.icon, subjects: p.points,
  }));
}

function mergePerson(base: Person, over?: Partial<Person>): Person | undefined {
  const p = overlay(base, over);
  return p.name ? p : undefined; // নাম না দিলে সেকশনটি বাদ
}

function defaultTagline(type: InstitutionType, name: string, lang: Lang = "bn") {
  if (lang === "en") {
    const mapEn: Record<InstitutionType, string> = {
      english_medium: "Shaping confident global citizens",
      school: "Knowledge, discipline and character",
      college: "A trusted address for higher education",
      madrasah: "Knowledge illuminated by faith",
      kindergarten: "Where learning begins with play",
      coaching: "Focused preparation, proven results",
    };
    return mapEn[type] || `Welcome to ${name}`;
  }
  const map: Record<InstitutionType, string> = {
    english_medium: "আত্মবিশ্বাসী প্রজন্ম গড়ার পথে",
    school: "জ্ঞানের আলোয়, শৃঙ্খলার পথে",
    college: "উচ্চশিক্ষার নির্ভরযোগ্য ঠিকানা",
    madrasah: "ইলম ও আমলের সমন্বয়ে",
    kindergarten: "খেলায় খেলায় শেখার শুরু",
    coaching: "লক্ষ্য যখন সাফল্য, প্রস্তুতি হোক নিখুঁত",
  };
  return map[type] || `স্বাগতম ${name}-এ`;
}

function defaultAbout(type: InstitutionType, name: string, lang: Lang = "bn") {
  if (lang === "en") {
    const tailEn =
      type === "madrasah"
        ? "Under the guidance of experienced ustaz, students study the Qur'an, Hadith and Fiqh alongside Bangla, English, Mathematics and computer studies, so that they are prepared for both this world and the next."
        : type === "kindergarten"
        ? "We take the responsibility of being a child's first school very seriously. In a warm, safe environment, learning happens through play — building language, imagination and confidence."
        : type === "coaching"
        ? "A planned syllabus, experienced teachers and regular assessment — these three together carry each student to the result they are aiming for."
        : "Quality teaching, firm discipline and strong moral values shape the citizens of tomorrow. Experienced teachers, modern classroom practice and active involvement of parents form the foundation of our success.";
    return `${name} provides a safe, disciplined and inspiring environment for every student. ${tailEn}`;
  }
  const tail =
    type === "madrasah"
      ? "কুরআন-সুন্নাহর আলোকে ইলম ও আমলের সমন্বয়ে আদর্শ প্রজন্ম গঠনে আমরা নিবেদিত। অভিজ্ঞ উস্তাযমণ্ডলীর তত্ত্বাবধানে দ্বীনি শিক্ষার পাশাপাশি প্রয়োজনীয় জেনারেল শিক্ষাও এখানে দেওয়া হয়।"
      : type === "kindergarten"
      ? "শিশুর জীবনের প্রথম পাঠশালা হওয়ার দায়িত্ব আমরা অত্যন্ত যত্নের সাথে পালন করি। স্নেহময় পরিবেশে খেলার ছলে শেখার মাধ্যমে প্রতিটি শিশুর ভাষা, কল্পনা ও আত্মবিশ্বাস গড়ে ওঠে।"
      : type === "coaching"
      ? "পরিকল্পিত সিলেবাস, অভিজ্ঞ শিক্ষক এবং নিয়মিত মূল্যায়ন — এই তিনের সমন্বয়ে শিক্ষার্থীকে তার কাঙ্ক্ষিত লক্ষ্যে পৌঁছে দেওয়াই আমাদের একমাত্র কাজ।"
      : "মানসম্মত শিক্ষা, কঠোর শৃঙ্খলা ও নৈতিক মূল্যবোধের সমন্বয়ে আমরা গড়ে তুলি আগামী দিনের সুনাগরিক। অভিজ্ঞ শিক্ষকমণ্ডলী, আধুনিক পাঠদান পদ্ধতি ও অভিভাবকের সক্রিয় অংশগ্রহণ আমাদের সাফল্যের মূল ভিত্তি।";
  return `${name} শিক্ষার্থীদের জন্য একটি নিরাপদ, সুশৃঙ্খল ও অনুপ্রেরণাদায়ক পরিবেশ নিশ্চিত করে। ${tail}`;
}

function statsFrom(tenant: Tenant, type: InstitutionType, lang: Lang = "bn"): Stat[] {
  const s = tenant.stats || {};
  const out: Stat[] = [];
  const en = lang === "en";
  const n = (v: string) => (en ? toEnDigits(v) : v);
  if (s.students) out.push({ value: n(s.students), label: en ? "Students" : "শিক্ষার্থী", icon: "users" });
  if (s.teachers) out.push({ value: n(s.teachers), label: en ? "Teachers" : type === "madrasah" ? "উস্তায" : "শিক্ষক", icon: "graduation" });
  if (s.passRate) out.push({ value: n(s.passRate), label: en ? "Pass rate" : "পাসের হার", icon: "trophy" });
  if (tenant.established) out.push({ value: n(yearsSince(tenant.established, lang)), label: en ? "Years of service" : "বছরের পথচলা", icon: "award" });
  return out;
}

function trustFrom(tenant: Tenant, type: InstitutionType, lang: Lang = "bn"): TrustBadge[] {
  const out: TrustBadge[] = [];
  const en = lang === "en";
  const n = (v: string) => (en ? toEnDigits(v) : v);
  if (tenant.eiin) out.push({ label: en ? "Government recognised" : "সরকার অনুমোদিত", sub: `EIIN ${n(tenant.eiin)}`, icon: "shield" });
  else out.push({ label: en ? "Recognised institution" : "অনুমোদিত প্রতিষ্ঠান", sub: en ? "By the competent authority" : "যথাযথ কর্তৃপক্ষ কর্তৃক", icon: "shield" });
  if (tenant.established) {
    out.push(en
      ? { label: `Established ${toEnDigits(tenant.established)}`, sub: `${yearsSince(tenant.established, lang)} years of experience`, icon: "award" }
      : { label: `প্রতিষ্ঠা ${tenant.established}`, sub: `${yearsSince(tenant.established)} বছরের অভিজ্ঞতা`, icon: "award" });
  }
  if (tenant.stats?.students) {
    out.push(en
      ? { label: `${toEnDigits(tenant.stats.students)} students`, sub: "Currently enrolled", icon: "users" }
      : { label: `${tenant.stats.students} শিক্ষার্থী`, sub: "বর্তমানে অধ্যয়নরত", icon: "users" });
  }
  out.push({
    label: en
      ? (type === "madrasah" ? "Safe residential care" : "Safe campus")
      : (type === "madrasah" ? "নিরাপদ আবাসিক পরিবেশ" : "নিরাপদ ক্যাম্পাস"),
    sub: en ? "Under CCTV surveillance" : "সিসিটিভি নজরদারিতে", icon: "camera",
  });
  return out;
}

/** "১৯৮২" বা "1982" → "৪৩+" (ভাষা অনুযায়ী অঙ্কে) */
export function yearsSince(established: string, lang: Lang = "bn") {
  const en = toEnDigits(established).match(/\d{4}/)?.[0];
  if (!en) return established;
  const yrs = new Date().getFullYear() - Number(en);
  if (yrs <= 0) return established;
  return (lang === "en" ? String(yrs) : toBnDigits(String(yrs))) + "+";
}

// অঙ্ক রূপান্তর lib/digits.ts-এ; পুরোনো সব কলসাইট যেন না ভাঙে তাই এখান থেকেও রপ্তানি
export { toBnDigits, toEnDigits } from "./digits";
