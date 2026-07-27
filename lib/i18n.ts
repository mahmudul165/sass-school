import { bnDate, enDate } from "./utils";

/* দ্বিভাষিক অভিধান (বাংলা / English)
   ------------------------------------------------------------------
   কেন দরকার: "Official Template" পরিবারে দুটি টেমপ্লেট সম্পূর্ণ ইংরেজি
   (বেসরকারি স্কুল/কলেজ — English, এবং English Medium / International)।
   প্রতিটি টেমপ্লেটে আলাদা করে স্ট্রিং লিখলে অনুবাদ ছড়িয়ে যায় ও অসঙ্গতি তৈরি হয়।
   তাই একটিমাত্র অভিধান — টেমপ্লেট শুধু নিজের `lang` ঘোষণা করে, বাকিটা এখান থেকে আসে।

   নিয়ম: `bn` হলো উৎস। `en`-এ ঠিক একই কী থাকতে বাধ্য (টাইপ দিয়ে নিশ্চিত)। */

export type Lang = "bn" | "en";

const bn = {
  /* ── নেভিগেশন ─────────────────────────────────────── */
  navHome: "হোম",
  navAbout: "আমাদের সম্পর্কে",
  navAboutAlt: "প্রতিষ্ঠানের পরিচিতি",
  navChairman: "সভাপতির বাণী",
  navPrincipal: "অধ্যক্ষের বাণী",
  navNotice: "নোটিশ",
  navAcademic: "একাডেমিক তথ্য",
  navDepartments: "বিভাগসমূহ",
  navTeachers: "শিক্ষকবৃন্দ",
  navRoutine: "রুটিন",
  navClub: "ক্লাব",
  navResults: "ফলাফল",
  navAdmission: "ভর্তি",
  navGallery: "গ্যালারি",
  navContact: "যোগাযোগ",
  navLogin: "লগইন",
  menu: "মেনু",
  mainMenu: "প্রধান মেনু",
  skipToContent: "মূল কনটেন্টে যান",
  breadcrumb: "পথ",

  /* ── পেজ উপশিরোনাম ───────────────────────────────── */
  subAbout: "প্রতিষ্ঠানের ইতিহাস, লক্ষ্য ও অর্জন — এক নজরে।",
  subChairman: "পরিচালনা পর্ষদের সভাপতির শুভেচ্ছা বার্তা।",
  subPrincipal: "প্রতিষ্ঠান প্রধানের বাণী ও দিকনির্দেশনা।",
  subNotice: "সকল ঘোষণা, বিজ্ঞপ্তি ও জরুরি তথ্য এক জায়গায়।",
  subDepartments: "শ্রেণি ও বিভাগভিত্তিক পাঠক্রম, বিষয় ও বিভাগীয় প্রধান।",
  subTeachers: "প্রশিক্ষিত, অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষকমণ্ডলী।",
  subRoutine: "শ্রেণিভিত্তিক ক্লাস রুটিন ও পরীক্ষার সময়সূচি।",
  subClub: "সহশিক্ষা কার্যক্রম — শিক্ষার্থীর পূর্ণাঙ্গ বিকাশে।",
  subResults: "পরীক্ষার ফল, পাসের হারের ধারা ও কৃতী শিক্ষার্থী।",
  subAdmission: "ভর্তি বিজ্ঞপ্তি, প্রক্রিয়া, সময়সূচি ও ফি।",
  subGallery: "ক্যাম্পাস, অনুষ্ঠান ও শিক্ষার্থীদের মুহূর্ত।",
  subContact: "ঠিকানা, ফোন, মানচিত্র ও বার্তা পাঠানোর সুযোগ।",
  subLogin: "শিক্ষার্থী, অভিভাবক ও প্রতিষ্ঠান কর্তৃপক্ষের প্রবেশপথ।",

  /* ── সেকশন শিরোনাম ───────────────────────────────── */
  secNoticeBoard: "নোটিশ বোর্ড",
  secLatestNotice: "সর্বশেষ নোটিশ",
  secQuickLinks: "দ্রুত সেবা",
  secImportantLinks: "গুরুত্বপূর্ণ লিংক",
  secWhyUs: "কেন আমাদের প্রতিষ্ঠান",
  secWhyUsSub: "অভিভাবকের আস্থা অর্জনই আমাদের সবচেয়ে বড় অর্জন।",
  secPrograms: "শিক্ষা কার্যক্রম",
  secProgramsSub: "শ্রেণি ও বিভাগভিত্তিক পাঠক্রম ও কার্যক্রম।",
  secFacilities: "সুযোগ-সুবিধা",
  secFacilitiesSub: "শিক্ষার্থীর নিরাপত্তা, স্বাচ্ছন্দ্য ও শেখার প্রয়োজন — সবই বিবেচনায়।",
  secAchievements: "অর্জন ও সাফল্য",
  secTopStudents: "কৃতী শিক্ষার্থীবৃন্দ",
  secEvents: "আসন্ন অনুষ্ঠান",
  secCampusLife: "ক্যাম্পাস জীবন",
  secGallery: "ছবি ও ভিডিও গ্যালারি",
  secTestimonials: "অভিভাবকদের মতামত",
  secFaq: "সাধারণ জিজ্ঞাসা",
  secFaqSub: "অভিভাবকদের বহুল জিজ্ঞাসিত প্রশ্নের উত্তর।",
  secResultSearch: "ফলাফল অনুসন্ধান",
  secResultTrend: "ফলাফলের ধারা",
  secStats: "এক নজরে",
  secLeadership: "কর্তৃপক্ষের বাণী",
  secMessage: "বাণী",

  /* ── সাধারণ শব্দ ─────────────────────────────────── */
  seeAll: "সব দেখুন",
  readMore: "বিস্তারিত",
  viewAll: "সবগুলো দেখুন",
  allNotices: "সকল বিজ্ঞপ্তি",
  allTeachers: "সকল শিক্ষক দেখুন",
  fullGallery: "সম্পূর্ণ গ্যালারি",
  applyNow: "ভর্তির আবেদন",
  applyOnline: "অনলাইনে আবেদন",
  admissionInfo: "ভর্তি তথ্য",
  callNow: "এখনই কল করুন",
  contactUs: "যোগাযোগ করুন",
  sendMessage: "বার্তা পাঠান",
  download: "ডাউনলোড",
  prospectus: "প্রসপেক্টাস",
  admissionForm: "ভর্তি ফরম",
  important: "গুরুত্বপূর্ণ",
  established: "প্রতিষ্ঠাকাল",
  eiin: "EIIN",
  address: "ঠিকানা",
  phone: "ফোন",
  email: "ইমেইল",
  officeHours: "অফিস সময়",
  location: "মানচিত্রে অবস্থান",
  admissionOpen: "ভর্তি চলছে",
  government: "শিক্ষা মন্ত্রণালয় অনুমোদিত",
  approved: "অনুমোদিত প্রতিষ্ঠান",
  rights: "সর্বস্বত্ব সংরক্ষিত।",
  poweredBy: "ওয়েবসাইট",
  more: "আরও",

  /* ── খালি অবস্থা ─────────────────────────────────── */
  emptyNotice: "এখনও কোনো নোটিশ প্রকাশিত হয়নি।",
  emptyTeachers: "শিক্ষক তালিকা শিগগিরই যুক্ত হবে।",
  emptyResults: "ফলাফল শিগগিরই প্রকাশিত হবে।",
  emptyGallery: "ছবি শিগগিরই যুক্ত হবে।",
  emptyEvents: "আসন্ন অনুষ্ঠানের তথ্য শিগগিরই যুক্ত হবে।",
  emptyDepartments: "বিভাগের তথ্য শিগগিরই যুক্ত হবে।",
  emptyRoutine: "রুটিন শিগগিরই প্রকাশিত হবে।",
  emptyClub: "ক্লাব কার্যক্রমের তথ্য শিগগিরই যুক্ত হবে।",

  /* ── বিভাগ / রুটিন / ক্লাব ───────────────────────── */
  deptHead: "বিভাগীয় প্রধান",
  deptSubjects: "বিষয়সমূহ",
  deptStudents: "শিক্ষার্থী",
  routineDay: "বার",
  routinePeriod: "পিরিয়ড",
  routineNote: "রুটিন পরিবর্তন হলে নোটিশ বোর্ডে জানানো হয়।",
  routineDownload: "রুটিন ডাউনলোড",
  clubModerator: "পরিচালক শিক্ষক",
  clubDay: "কার্যদিবস",
  clubMembers: "সদস্য",

  /* ── ফলাফল ও চার্ট ───────────────────────────────── */
  resultChartTitle: "বছরভিত্তিক ফলাফল",
  passRate: "পাসের হার",
  gpa5: "জিপিএ-৫",
  appeared: "অংশগ্রহণকারী",
  passed: "উত্তীর্ণ",
  year: "সাল",
  exam: "পরীক্ষা",
  rollNo: "রোল নম্বর",
  selectExam: "পরীক্ষা নির্বাচন",
  viewResult: "ফলাফল দেখুন",
  showTable: "তালিকা আকারে দেখুন",
  chartNote: "শিক্ষা বোর্ড ও প্রতিষ্ঠানের নিজস্ব পরীক্ষার প্রকাশিত ফল অনুযায়ী।",
  students: "শিক্ষার্থী",

  /* ── ভর্তি ────────────────────────────────────────── */
  admissionProcess: "ভর্তি প্রক্রিয়া",
  admissionTimeline: "ভর্তির সময়সূচি",
  feeInfo: "ফি সংক্রান্ত তথ্য",
  feeClass: "শ্রেণি / বিভাগ",
  feeAdmission: "ভর্তি ফি",
  feeMonthly: "মাসিক বেতন",
  applyTitle: "অনলাইনে আবেদন করুন",
  applyDesc: "নাম ও মোবাইল নম্বর দিন — কর্তৃপক্ষ আপনার সাথে সরাসরি যোগাযোগ করবেন।",
  classes: "শ্রেণি",

  /* ── লগইন ─────────────────────────────────────────── */
  loginAdmin: "প্রতিষ্ঠান অ্যাডমিন",
  loginAdminDesc: "নোটিশ, শিক্ষক, ফলাফল ও গ্যালারি হালনাগাদ করুন। ইউজারনেম ও পাসওয়ার্ড দিয়ে প্রবেশ।",
  loginAdminCta: "অ্যাডমিন প্যানেলে যান",
  loginStudent: "শিক্ষার্থী কর্নার",
  loginStudentDesc: "ফলাফল, রুটিন, নোটিশ ও প্রয়োজনীয় ডাউনলোড — এক জায়গায়।",
  loginStudentCta: "শিক্ষার্থী কর্নারে যান",
  loginParent: "অভিভাবক কর্নার",
  loginParentDesc: "সন্তানের ফলাফল, উপস্থিতি ও বেতনের তথ্য জানুন।",
  loginParentCta: "অভিভাবক কর্নারে যান",
  loginHelp: "লগইনে সমস্যা হলে প্রতিষ্ঠানের অফিসে যোগাযোগ করুন।",

  /* ── ফর্ম ─────────────────────────────────────────── */
  formName: "আপনার নাম *",
  formPhone: "মোবাইল নম্বর *",
  formClass: "শ্রেণি নির্বাচন করুন",
  formMessage: "আপনার জিজ্ঞাসা (ঐচ্ছিক)",
  formSubmit: "তথ্য পাঠান",
  formSending: "পাঠানো হচ্ছে…",
  formThanks: "ধন্যবাদ!",
  formPrivacy: "আপনার তথ্য শুধুমাত্র প্রতিষ্ঠান কর্তৃপক্ষের কাছে যাবে। আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করি।",
  formCallback: "কল ব্যাক চাই",
  formCallbackTitle: "কল ব্যাক চান?",
  formCallbackDesc: "নম্বর দিন — আমরা ফোন করব।",
};

export type Dict = typeof bn;

const en: Dict = {
  navHome: "Home",
  navAbout: "About Us",
  navAboutAlt: "About the Institution",
  navChairman: "Chairman's Message",
  navPrincipal: "Principal's Message",
  navNotice: "Notice",
  navAcademic: "Academic Information",
  navDepartments: "Departments",
  navTeachers: "Teachers",
  navRoutine: "Routine",
  navClub: "Club",
  navResults: "Results",
  navAdmission: "Admission",
  navGallery: "Gallery",
  navContact: "Contact",
  navLogin: "Login",
  menu: "Menu",
  mainMenu: "Main menu",
  skipToContent: "Skip to main content",
  breadcrumb: "Breadcrumb",

  subAbout: "Our history, mission and achievements at a glance.",
  subChairman: "A welcome message from the Chairman of the Governing Body.",
  subPrincipal: "Message and guidance from the head of the institution.",
  subNotice: "Every announcement, circular and urgent update in one place.",
  subDepartments: "Curriculum, subjects and department heads by stream.",
  subTeachers: "Trained, experienced and dedicated faculty members.",
  subRoutine: "Class routines and examination schedules by grade.",
  subClub: "Co-curricular activities for the complete growth of every student.",
  subResults: "Examination results, pass-rate trends and top achievers.",
  subAdmission: "Admission circular, process, schedule and fees.",
  subGallery: "Moments from our campus, events and students.",
  subContact: "Address, phone, map and a direct message form.",
  subLogin: "Entry point for students, parents and institution staff.",

  secNoticeBoard: "Notice Board",
  secLatestNotice: "Latest Notice",
  secQuickLinks: "Quick Services",
  secImportantLinks: "Important Links",
  secWhyUs: "Why Choose Us",
  secWhyUsSub: "Earning the trust of parents is our greatest achievement.",
  secPrograms: "Academic Programmes",
  secProgramsSub: "Curriculum and activities by grade and stream.",
  secFacilities: "Facilities",
  secFacilitiesSub: "Safety, comfort and everything a student needs to learn well.",
  secAchievements: "Achievements",
  secTopStudents: "Top Achievers",
  secEvents: "Upcoming Events",
  secCampusLife: "Campus Life",
  secGallery: "Photo & Video Gallery",
  secTestimonials: "What Parents Say",
  secFaq: "Frequently Asked Questions",
  secFaqSub: "Answers to the questions parents ask us most.",
  secResultSearch: "Result Search",
  secResultTrend: "Result Trend",
  secStats: "At a Glance",
  secLeadership: "Messages from the Leadership",
  secMessage: "Message",

  seeAll: "See all",
  readMore: "Read more",
  viewAll: "View all",
  allNotices: "All notices",
  allTeachers: "View all teachers",
  fullGallery: "Full gallery",
  applyNow: "Apply for Admission",
  applyOnline: "Apply Online",
  admissionInfo: "Admission Info",
  callNow: "Call Now",
  contactUs: "Contact Us",
  sendMessage: "Send Message",
  download: "Download",
  prospectus: "Prospectus",
  admissionForm: "Admission Form",
  important: "Important",
  established: "Established",
  eiin: "EIIN",
  address: "Address",
  phone: "Phone",
  email: "Email",
  officeHours: "Office Hours",
  location: "Location on map",
  admissionOpen: "Admission Open",
  government: "Approved by the Ministry of Education",
  approved: "Recognised Institution",
  rights: "All rights reserved.",
  poweredBy: "Website",
  more: "More",

  emptyNotice: "No notices have been published yet.",
  emptyTeachers: "The faculty list will be added shortly.",
  emptyResults: "Results will be published shortly.",
  emptyGallery: "Photos will be added shortly.",
  emptyEvents: "Upcoming event details will be added shortly.",
  emptyDepartments: "Department details will be added shortly.",
  emptyRoutine: "The routine will be published shortly.",
  emptyClub: "Club activity details will be added shortly.",

  deptHead: "Head of Department",
  deptSubjects: "Subjects",
  deptStudents: "Students",
  routineDay: "Day",
  routinePeriod: "Period",
  routineNote: "Any change to the routine is announced on the notice board.",
  routineDownload: "Download routine",
  clubModerator: "Moderator",
  clubDay: "Meets on",
  clubMembers: "Members",

  resultChartTitle: "Results by Year",
  passRate: "Pass rate",
  gpa5: "GPA-5",
  appeared: "Appeared",
  passed: "Passed",
  year: "Year",
  exam: "Examination",
  rollNo: "Roll number",
  selectExam: "Select examination",
  viewResult: "View result",
  showTable: "Show as table",
  chartNote: "Based on results published by the education board and the institution.",
  students: "Students",

  admissionProcess: "Admission Process",
  admissionTimeline: "Admission Schedule",
  feeInfo: "Fee Information",
  feeClass: "Class / Stream",
  feeAdmission: "Admission fee",
  feeMonthly: "Monthly fee",
  applyTitle: "Apply Online",
  applyDesc: "Leave your name and mobile number — our office will contact you directly.",
  classes: "Classes",

  loginAdmin: "Institution Admin",
  loginAdminDesc: "Update notices, teachers, results and gallery. Sign in with your username and password.",
  loginAdminCta: "Go to admin panel",
  loginStudent: "Student Corner",
  loginStudentDesc: "Results, routine, notices and downloads — all in one place.",
  loginStudentCta: "Go to student corner",
  loginParent: "Parent Corner",
  loginParentDesc: "Follow your child's results, attendance and fee status.",
  loginParentCta: "Go to parent corner",
  loginHelp: "Having trouble signing in? Please contact the institution office.",

  formName: "Your name *",
  formPhone: "Mobile number *",
  formClass: "Select a class",
  formMessage: "Your question (optional)",
  formSubmit: "Send",
  formSending: "Sending…",
  formThanks: "Thank you!",
  formPrivacy: "Your details go only to the institution office. We respond within 24 hours.",
  formCallback: "Request a call back",
  formCallbackTitle: "Want a call back?",
  formCallbackDesc: "Leave your number — we will call you.",
};

const DICTS: Record<Lang, Dict> = { bn, en };

/** ভাষা অনুযায়ী অভিধান — অজানা ভাষা এলে বাংলা (প্ল্যাটফর্মের ডিফল্ট) */
export function dict(lang: Lang = "bn"): Dict {
  return DICTS[lang] || bn;
}

/** সংখ্যা: বাংলায় বাংলা অঙ্ক, ইংরেজিতে ইংরেজি অঙ্ক */
export function num(v: string | number, lang: Lang = "bn") {
  const s = String(v);
  if (lang === "en") return s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  return s.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
}

/** তারিখ — লোকেল সচেতন।
    গণনাটি lib/utils-এ, কারণ সেখানে সময় অঞ্চল ঢাকা ধরে স্থির ফল দেওয়া হয়;
    toLocaleDateString সরাসরি ব্যবহার করলে সার্ভার (UTC) ও ব্রাউজার (UTC+৬)
    ভিন্ন তারিখ দেখাত এবং হাইড্রেশন ভেঙে পড়ত। */
export function fmtDate(d: string | Date, lang: Lang = "bn") {
  return lang === "en" ? enDate(d) : bnDate(d);
}

/** "সভাপতির বাণী" ধাঁচের অধিকারবাচক শিরোনাম।
 *
 *  পদবি সাধারণত লেখা হয় "সভাপতি, পরিচালনা পর্ষদ" আকারে। সরাসরি জুড়ে দিলে
 *  দাঁড়াত "সভাপতি, পরিচালনা পর্ষদ-এর বাণী" — যা বাংলায় বেমানান। তাই কমার
 *  আগের অংশটুকু নিয়ে সঠিক বিভক্তি বসানো হয়:
 *    স্বরান্ত (সভাপতি, মুহতামিমা) → "র"  →  সভাপতির বাণী
 *    ব্যঞ্জনান্ত (অধ্যক্ষ, প্রধান শিক্ষক) → "ের"  →  অধ্যক্ষের বাণী
 */
const BN_VOWEL_END = /[ািীুূৃেৈোৌয়]$/;

export function messageOf(role: string, lang: Lang = "bn") {
  const head = String(role || "").split(/[,،]/)[0].trim();
  if (lang === "en") return `Message from the ${head || "Head"}`;
  if (!head) return "বাণী";
  return `${head}${BN_VOWEL_END.test(head) ? "র" : "ের"} বাণী`;
}
