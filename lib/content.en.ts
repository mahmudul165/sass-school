/* ইংরেজি ডিফল্ট কনটেন্ট
   ------------------------------------------------------------------
   দুটি অফিসিয়াল টেমপ্লেট সম্পূর্ণ ইংরেজি — "বেসরকারি বাংলা মাধ্যম স্কুল/কলেজ (English)"
   ও "English Medium / International"। ইংরেজি সাইটে বাংলা প্লেসহোল্ডার থেকে গেলে
   সেলস ডেমোতেই বিশ্বাসযোগ্যতা নষ্ট হয়, তাই প্রতিটি সেকশনের জন্য পূর্ণাঙ্গ ইংরেজি
   ডিফল্ট এখানে রাখা — বাংলা ভিত্তির ঠিক উপরে বসে।

   বাংলা ফাইলের মতোই: প্রতিষ্ঠান নিজে যা লিখবে, সেটিই সবার উপরে বসে। */

import type {
  SiteContent, InstitutionType, Facility, Faq, Step, TimelineItem, Club, ResultSeries, RoutineTable,
} from "./content";
import { buildRoutine } from "./content";

const FACILITY: Record<string, Facility> = {
  library: { icon: "library", title: "Well-stocked Library", desc: "Textbooks, literature, science and reference collections with a quiet reading room." },
  lab: { icon: "flask", title: "Science Laboratories", desc: "Separate physics, chemistry and biology labs where students run experiments themselves." },
  computer: { icon: "monitor", title: "Computer Lab", desc: "Modern workstations with broadband access and a dedicated desk for every student." },
  smart: { icon: "presentation", title: "Smart Classrooms", desc: "Multimedia projectors and digital content make difficult topics easy to grasp." },
  transport: { icon: "bus", title: "School Transport", desc: "Our own buses on fixed routes, each with a supervising teacher on board." },
  hostel: { icon: "home", title: "Residential Hostel", desc: "Separate accommodation for boys and girls with supervised evening study." },
  prayer: { icon: "moon", title: "Prayer Room", desc: "A spacious prayer room with ablution facilities for congregational prayer." },
  playground: { icon: "trophy", title: "Playground", desc: "A large field for daily sports and physical education." },
  cctv: { icon: "shield", title: "CCTV Security", desc: "The full campus is monitored around the clock with controlled entry and exit." },
  medical: { icon: "heart", title: "Medical Corner", desc: "A first-aid room with a trained nurse and fast response in emergencies." },
  cafeteria: { icon: "utensils", title: "Healthy Cafeteria", desc: "Hygienic, affordable meals prepared in a clean kitchen." },
  counseling: { icon: "users", title: "Counselling Service", desc: "Professional guidance for emotional wellbeing and career planning." },
};
const f = (...k: (keyof typeof FACILITY)[]) => k.map((x) => FACILITY[x]);

const faqEn: Faq[] = [
  { q: "What documents are required for admission?", a: "A photocopy of the student's birth certificate, the transfer certificate and progress report from the previous institution, photocopies of both parents' national ID cards, and four recent passport-size photographs." },
  { q: "Where can I collect the admission form?", a: "Forms are available from the institution office during working hours. You can also apply from home using the 'Apply Online' button on this website." },
  { q: "What are the class hours?", a: "Regular classes run from 8:00 am to 1:30 pm. The institution remains closed on Fridays and government holidays." },
  { q: "How much is the monthly fee and how do I pay it?", a: "Fees vary by class — the full breakdown is given in the 'Fee Information' section. Payment can be made at the office or through bKash/Nagad by the 10th of each month." },
  { q: "How can parents follow their child's progress?", a: "We hold monthly parent–teacher meetings, publish examination results on this website, and send urgent updates by SMS." },
  { q: "Is the institution government recognised?", a: "Yes. The institution is approved by the competent authority and holds a valid permission to teach. The EIIN number is shown at the top of this website." },
];

const stepsEn: Step[] = [
  { title: "Collect the form", desc: "Collect the admission form from the office or download it from this website." },
  { title: "Fill in and submit", desc: "Submit the completed form with all required documents before the deadline." },
  { title: "Assessment / interview", desc: "A short written and oral assessment is held on the announced date." },
  { title: "Result published", desc: "The list of selected students is posted on the notice board and this website." },
  { title: "Confirm admission", desc: "Pay the admission fee to confirm the seat and receive the class allocation." },
];

const timelineEn: TimelineItem[] = [
  { date: "1 December", title: "Admission circular published", desc: "Full details on the website and notice board" },
  { date: "1–20 December", title: "Form distribution and collection", desc: "At the office during working hours, and online" },
  { date: "27 December", title: "Admission test", desc: "10:00 am, at our own campus" },
  { date: "30 December", title: "Result published", desc: "4:00 pm on this website" },
  { date: "1–10 January", title: "Admission period", desc: "Selected students pay fees and confirm their seat" },
];

const clubsEn: Club[] = [
  { name: "Debate Club", icon: "users", desc: "Students learn to argue with evidence — and to disagree with grace.", day: "Every Wednesday", members: "45" },
  { name: "Science Club", icon: "flask", desc: "Projects, science fairs and preparation for innovation contests.", day: "Every Tuesday", members: "52" },
  { name: "Cultural Club", icon: "sparkles", desc: "Recitation, music, drama and dance for national days and the annual programme.", day: "Every Monday", members: "60" },
  { name: "Sports Club", icon: "trophy", desc: "Football, cricket, badminton and athletics — inter-class and inter-school competition.", day: "Every Thursday", members: "80" },
  { name: "ICT & Programming Club", icon: "monitor", desc: "Computer skills, programming fundamentals and digital content creation.", day: "Every Saturday", members: "40" },
  { name: "Scouts & Red Crescent", icon: "shield", desc: "Service, discipline and disaster-response training; participation in national camps.", day: "Every Sunday", members: "35" },
  { name: "Language & Literature Club", icon: "book", desc: "Wall magazine, annual anthology and creative writing workshops.", day: "Fortnightly", members: "33" },
  { name: "Environment Club", icon: "heart", desc: "Campus clean-ups, tree planting and awareness campaigns.", day: "Monthly", members: "28" },
];

const EN_DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const EN_PERIODS = ["1st · 10:00", "2nd · 10:50", "3rd · 11:40", "Break · 12:30", "4th · 1:00", "5th · 1:50", "6th · 2:40"];

const routineEn = (type: InstitutionType): RoutineTable[] => {
  if (type === "college" || type === "coaching") {
    return [
      buildRoutine("Class XI – XII (Science)", ["Physics", "Chemistry", "Biology", "Higher Mathematics", "Bangla", "English"], EN_DAYS, EN_PERIODS, 3, "Tiffin break"),
      buildRoutine("Class XI – XII (Humanities & Business)", ["Accounting", "Management", "Economics", "Civics", "Bangla", "English"], EN_DAYS, EN_PERIODS, 3, "Tiffin break"),
    ];
  }
  if (type === "english_medium") {
    return [
      buildRoutine("Junior Section (Class I – V)", ["English", "Mathematics", "Bangla", "Science", "Social Studies", "ICT"], EN_DAYS, EN_PERIODS, 3, "Tiffin break"),
      buildRoutine("Senior Section (Class VI – X)", ["English", "Mathematics", "Physics", "Chemistry", "Biology", "ICT"], EN_DAYS, EN_PERIODS, 3, "Tiffin break"),
    ];
  }
  return [
    buildRoutine("Class VI – VIII", ["Bangla", "English", "Mathematics", "General Science", "Religion & Moral Studies", "ICT"], EN_DAYS, EN_PERIODS, 3, "Tiffin break"),
    buildRoutine("Class IX – X", ["Bangla", "English", "Mathematics", "Physics & Chemistry", "Biology", "Bangladesh & Global Studies"], EN_DAYS, EN_PERIODS, 3, "Tiffin break"),
  ];
};

const chartEn = (type: InstitutionType): ResultSeries[] => {
  const years = ["2021", "2022", "2023", "2024", "2025"];
  const mk = (exam: string, pass: number[], gpa: number[], appeared: number[], note?: string): ResultSeries => ({
    exam, note,
    rows: years.map((year, i) => ({
      year, passRate: pass[i], gpa5: gpa[i], appeared: appeared[i],
      passed: Math.round((appeared[i] * pass[i]) / 100),
    })),
  });
  if (type === "college") {
    return [
      mk("HSC Examination", [91, 94, 95, 97, 98], [46, 62, 78, 96, 112], [310, 335, 348, 366, 382]),
      mk("SSC Examination", [95, 96, 98, 99, 100], [58, 71, 85, 103, 124], [285, 298, 312, 330, 345]),
    ];
  }
  return [
    mk("SSC Examination", [92, 95, 96, 98, 100], [24, 33, 41, 52, 64], [186, 204, 218, 232, 248]),
    mk("JSC / Class VIII", [96, 97, 98, 99, 100], [38, 44, 51, 60, 72], [210, 226, 238, 252, 265]),
  ];
};

/* ── ধরনভিত্তিক ইংরেজি অংশ ─────────────────────────────────────── */
const BY_TYPE: Partial<Record<InstitutionType, Partial<SiteContent>>> = {
  english_medium: {
    heroKicker: "Admission Open",
    heroSub: "An international-standard curriculum, small class sizes and individual attention for every child — the foundation of a confident future.",
    aboutTitle: "About Us",
    aboutPoints: [
      "Experienced and professionally trained faculty",
      "A maximum of 30 students in every class",
      "Strong emphasis on fluent spoken and written English",
      "Digital classrooms and project-based learning",
    ],
    why: [
      { icon: "graduation", title: "International-standard curriculum", desc: "Our own curriculum blends the national syllabus with modern teaching practice." },
      { icon: "users", title: "Small classes, close attention", desc: "Limited seats per class mean every student stays within the teacher's direct view." },
      { icon: "monitor", title: "Smart, digital classrooms", desc: "Multimedia content, interactive boards and online resources enrich every lesson." },
      { icon: "shield", title: "A completely safe campus", desc: "CCTV monitoring, controlled entry points and trained security staff." },
      { icon: "trophy", title: "Co-curricular activities", desc: "Debate, science fairs, sports and cultural events develop the whole child." },
      { icon: "heart", title: "Parent-friendly communication", desc: "Regular progress reports, SMS updates and direct access to teachers." },
    ],
    programs: [
      { title: "Play & Nursery", level: "Age 3–5", desc: "Learning through play, building language and social confidence.", icon: "sparkles", points: ["Phonics and pre-writing", "Story and rhyme sessions", "Creative craft work"] },
      { title: "Junior Section", level: "Class I–V", desc: "A firm foundation in reading, writing, mathematics and curiosity.", icon: "book", points: ["Project-based learning", "Weekly assessment", "Library programme"] },
      { title: "Middle Section", level: "Class VI–VIII", desc: "Subject depth and the habit of thinking independently.", icon: "flask", points: ["Laboratory sessions", "Presentation skills", "Compulsory ICT"] },
      { title: "SSC / O-Level Preparation", level: "Class IX–X", desc: "Science, business and humanities — complete board examination preparation.", icon: "graduation", points: ["Model test series", "Extra classes for weak areas", "Career counselling"] },
    ],
    facilities: f("smart", "computer", "lab", "library", "transport", "cctv", "medical", "playground"),
    fees: [
      { label: "Play – Nursery", admission: "BDT 8,000", monthly: "BDT 2,000" },
      { label: "Class I – III", admission: "BDT 10,000", monthly: "BDT 2,500" },
      { label: "Class IV – V", admission: "BDT 12,000", monthly: "BDT 3,000" },
      { label: "Class VI – VIII", admission: "BDT 14,000", monthly: "BDT 3,500" },
      { label: "Class IX – X", admission: "BDT 16,000", monthly: "BDT 4,000", note: "Varies slightly by stream" },
    ],
    feeNote: "The admission fee is a one-time payment. Scholarships and fee waivers are available for meritorious students and families in need.",
  },

  college: {
    heroKicker: "Admission open for Class XI",
    heroSub: "A strong foundation for higher secondary and university education — experienced teachers, well-equipped laboratories and targeted admission-test preparation.",
    aboutTitle: "About the College",
    aboutPoints: [
      "Teaching in all three streams — science, humanities and business studies",
      "Combined HSC and university admission preparation",
      "Well-equipped laboratories and a rich library",
      "Hostel and transport facilities for students",
    ],
    programs: [
      { title: "Science", level: "Class XI–XII", desc: "Physics, chemistry, biology and higher mathematics.", icon: "flask", points: ["Full practical programme", "Medical and engineering preparation", "Weekly tests"] },
      { title: "Business Studies", level: "Class XI–XII", desc: "Accounting, management, finance and marketing.", icon: "book", points: ["Practical case studies", "BBA admission preparation", "Computer training"] },
      { title: "Humanities", level: "Class XI–XII", desc: "Economics, civics, sociology, geography and history.", icon: "graduation", points: ["Analytical writing", "University unit preparation", "Seminars and presentations"] },
      { title: "Admission Preparation", level: "After HSC", desc: "Intensive courses for university and medical admission tests.", icon: "sparkles", points: ["Subject-wise short syllabus", "Regular model tests", "Published merit lists"] },
    ],
    facilities: f("lab", "library", "computer", "hostel", "transport", "playground", "prayer", "counseling"),
    fees: [
      { label: "Class XI — Humanities", admission: "BDT 3,500", monthly: "BDT 800" },
      { label: "Class XI — Business Studies", admission: "BDT 4,000", monthly: "BDT 900" },
      { label: "Class XI — Science", admission: "BDT 5,000", monthly: "BDT 1,200", note: "Practical fee included" },
      { label: "Hostel (monthly)", monthly: "BDT 3,500", note: "Including meals" },
    ],
    feeNote: "Government stipends and merit scholarships are available. Special concessions apply under the freedom-fighter quota.",
  },
};

const SCHOOL_EN: Partial<SiteContent> = {
  heroKicker: "Admission circular published",
  heroSub: "Quality teaching, firm discipline and strong moral values — shaping the responsible citizens of tomorrow.",
  aboutTitle: "About the Institution",
  aboutPoints: [
    "Government approved and MPO-enlisted institution",
    "Experienced and dedicated teaching staff",
    "Regular parents' meetings and progress reports",
    "Consistent success in board examinations",
  ],
  why: [
    { icon: "shield", title: "Government recognised", desc: "Fully approved by the competent authority with a valid EIIN number." },
    { icon: "graduation", title: "Consistent results", desc: "Year after year, an enviable pass rate and a growing number of GPA-5 holders." },
    { icon: "users", title: "Experienced teachers", desc: "Trained, long-serving teachers who know how to bring the best out of a student." },
    { icon: "book", title: "Regular assessment", desc: "Weekly, monthly and half-yearly evaluation keeps progress on track." },
    { icon: "heart", title: "Moral education", desc: "Religious and moral studies are given real weight in shaping character." },
    { icon: "trophy", title: "Co-curricular activities", desc: "Regular participation in debate, recitation, sports and cultural competitions." },
  ],
  programs: [
    { title: "Primary Section", level: "Class I–V", desc: "The years that build reading habits and core skills.", icon: "book", points: ["Bangla and English handwriting", "Foundations of mathematics", "Continuous assessment"] },
    { title: "Junior Secondary", level: "Class VI–VIII", desc: "The start of subject-based study and genuine curiosity.", icon: "flask", points: ["Science practical classes", "ICT education", "Class VIII examination preparation"] },
    { title: "Secondary — Science", level: "Class IX–X", desc: "Physics, chemistry, biology and higher mathematics.", icon: "flask", points: ["Laboratory practicals", "Model tests", "Special coaching classes"] },
    { title: "Secondary — Humanities & Business", level: "Class IX–X", desc: "Choosing a stream that matches the student's future goal.", icon: "graduation", points: ["Accounting and business entrepreneurship", "Geography and civics", "Career guidance"] },
  ],
  facilities: f("library", "lab", "computer", "playground", "prayer", "transport", "medical", "smart"),
  fees: [
    { label: "Class I – V", admission: "BDT 1,500", monthly: "BDT 300" },
    { label: "Class VI – VIII", admission: "BDT 2,000", monthly: "BDT 450" },
    { label: "Class IX – X (Humanities/Business)", admission: "BDT 2,500", monthly: "BDT 600" },
    { label: "Class IX – X (Science)", admission: "BDT 3,000", monthly: "BDT 750", note: "Practical fee included" },
  ],
  feeNote: "In line with government guidance, fees are partly or fully waived for stipend holders and students from families in need.",
};

/* ── সব ধরনের জন্য অভিন্ন ইংরেজি ভিত্তি ───────────────────────── */
export function englishDefaults(name: string, type: InstitutionType): Partial<SiteContent> {
  // স্কুলের ইংরেজি সেট সবসময় ভিত্তি — ধরনভিত্তিক অংশ তার উপরে বসে, তাই
  // কোনো ধরনেই (মাদ্রাসা/কিন্ডারগার্টেন) ইংরেজি পেজে বাংলা ফাঁক থেকে যায় না।
  const byType = BY_TYPE[type] || {};
  return {
    heroCta: "Admission information",
    aboutTitle: "About Us",
    chairman: {
      name: "",
      role: "Chairman, Governing Body",
      message:
        "Education is not merely a route to a certificate — it is the process of making a person whole. " +
        `That belief is what we work from at ${name}. The trust parents place in us when they hand over their children ` +
        "is the responsibility we take most seriously.",
    },
    principal: {
      name: "",
      role: type === "madrasah" ? "Muhtamim" : "Principal",
      message:
        "Every student carries a different possibility. The work of our teachers is to find that possibility and grow it with care. " +
        "Discipline, regular assessment and the active involvement of parents — these three together are why our results have stayed consistent.",
    },
    campusLife: [
      { title: "Annual Sports Day", desc: "A winter morning of races, games and the prize-giving ceremony across the whole field." },
      { title: "Science & Technology Fair", desc: "An exhibition of projects built by students, with an innovation contest." },
      { title: "Cultural Evening", desc: "Recitation, music, drama and dance — the students' talent on full display." },
      { title: "Educational Tour", desc: "An educational trip to historic and notable places every year." },
    ],
    achievements: [
      { title: "100% pass rate in board examinations", year: "2025", desc: "The fifth consecutive year of a full pass rate.", icon: "trophy" },
      { title: "Best institution at upazila level", year: "2024", desc: "Recognised for academic quality and discipline.", icon: "award" },
      { title: "Award at the national science fair", year: "2024", desc: "First place at the regional level.", icon: "sparkles" },
      { title: "Inter-school debate champions", year: "2023", desc: "Winners of the district debate competition.", icon: "users" },
    ],
    testimonials: [
      { name: "Rubina Akter", relation: "Parent, Class VII", rating: 5, text: "The care the teachers put into their lessons is genuinely impressive. My daughter's results improved a great deal in a single year — and, more importantly, she now loves going to school." },
      { name: "Md. Shafiqul Islam", relation: "Parent, Class X", rating: 5, text: "Regular parents' meetings and the monthly report mean I always know how my son is doing. That level of transparency is rare." },
      { name: "Nasrin Sultana", relation: "Parent, Class III", rating: 5, text: "The campus is clean and secure — CCTV, a guard at the gate. I can leave my child and go to work without worrying." },
      { name: "Abdullah Al Mamun", relation: "Former student", rating: 5, text: "The discipline and the foundation I got here are why I did well at university. I will always be grateful to my teachers." },
    ],
    faq: faqEn,
    admissionSteps: stepsEn,
    admissionTimeline: timelineEn,
    resultPortalNote: "Select the examination and enter the roll number to see the result. Results appear here as soon as they are published.",
    routine: routineEn(type),
    clubs: clubsEn,
    resultChart: chartEn(type),
    ...SCHOOL_EN,
    ...byType,
  };
}
