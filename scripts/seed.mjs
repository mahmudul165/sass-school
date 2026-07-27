/* ডেমো ডেটা — পাঁচটি অফিসিয়াল টেমপ্লেটের পাঁচটি পূর্ণাঙ্গ প্রতিষ্ঠান
   (+ পুরোনো তিনটি ডিজাইনের ডেমো, যাতে সেগুলোও চালু আছে দেখানো যায়)।

   প্রতিটি ডেমোতে প্রতিটি সেকশনে কনটেন্ট আছে, কারণ সেলস ডেমোতে একটি ফাঁকা সেকশনও
   দেখানো মানে ক্লায়েন্টের মনে সন্দেহ তৈরি হওয়া।

   ছবি: /public/img/bd/*.svg — বাংলাদেশের স্কুল-জীবনের নিজস্ব আঁকা দৃশ্য
   (পতাকা-উড়ন্ত প্রাঙ্গণ, শহীদ মিনার, মাদরাসার গম্বুজ, নদীর পাড়ের স্কুল)।
   কেন স্টক ফটো নয়: বাইরের ছবি লিংক যেকোনো দিন ভেঙে যেতে পারে, ধীর সংযোগে
   দেরি করায়, আর বাংলাদেশের প্রকৃত স্কুল-পরিবেশ দেখায় না। এই SVG কয়েক কিলোবাইট,
   যেকোনো মাপে ঝকঝকে, অফলাইনেও ঠিক থাকে।

   চালাতে:  node --env-file=.env scripts/seed.mjs
   পুনরায় চালালে বিদ্যমান ডেমো আপডেট হবে (upsert), ডুপ্লিকেট হবে না। */
import { MongoClient } from "mongodb";
import crypto from "crypto";

/* lib/password.ts-এর মতোই scrypt হ্যাশ — সিড স্ক্রিপ্ট TypeScript আমদানি করতে
   পারে না, তাই একই সূত্র এখানে ছোট করে লেখা (ফরম্যাট হুবহু এক)। */
const hashPassword = (pw) => {
  const salt = crypto.randomBytes(16).toString("hex");
  return `scrypt$${salt}$${crypto.scryptSync(pw, salt, 64).toString("hex")}`;
};
const DEMO_PASSWORD = "school1234";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI দিন:  node --env-file=.env scripts/seed.mjs"); process.exit(1); }
const client = new MongoClient(uri);
await client.connect();
const db = client.db();

const img = (name) => `/img/bd/${name}.svg`;
const daysFromNow = (n) => new Date(Date.now() + n * 864e5);

/* ───────── ১. সরকারি ও এমপিও স্কুল (official_govt) ───────── */
const demoGovt = {
  slug: "demo-govt",
  name: "শহীদ স্মৃতি সরকারি উচ্চ বিদ্যালয়",
  nameEn: "Shaheed Smriti Government High School",
  type: "school",
  template: "school", language: "bn",
  theme: { primary: "#00674B", secondary: "#B01C24" },
  eiin: "১০৭৪২৩",
  established: "১৯৬৮",
  tagline: "শিক্ষাই জাতির মেরুদণ্ড",
  about:
    "১৯৬৮ সালে প্রতিষ্ঠিত শহীদ স্মৃতি সরকারি উচ্চ বিদ্যালয় পাঁচ দশকেরও বেশি সময় ধরে এ অঞ্চলে মানসম্মত " +
    "মাধ্যমিক শিক্ষা বিস্তারে ভূমিকা রেখে চলেছে। ষষ্ঠ থেকে দশম শ্রেণি পর্যন্ত বিজ্ঞান, মানবিক ও ব্যবসায় " +
    "শিক্ষা—তিন বিভাগেই পাঠদান করা হয়। প্রতিষ্ঠানটি মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তরের অনুমোদনপ্রাপ্ত এবং " +
    "এমপিওভুক্ত। বোর্ড পরীক্ষায় ধারাবাহিক সাফল্য, অভিজ্ঞ শিক্ষকমণ্ডলী ও কঠোর শৃঙ্খলাই আমাদের পরিচয়।",
  heroImage: img("campus-flag"),
  heroImages: [img("campus-flag"), img("assembly"), img("playground")],
  contact: {
    phone: "01700000011", phone2: "02-9112233", whatsapp: "01700000011",
    email: "info@shaheedsmriti-demo.edu.bd",
    address: "স্টেশন রোড, সদর, ময়মনসিংহ-২২০০",
    officeHours: "শনি–বৃহস্পতি, সকাল ৯টা – বিকাল ৪টা",
    facebook: "https://facebook.com/", youtube: "https://youtube.com/",
  },
  admission: { open: true, classes: "ষষ্ঠ, সপ্তম, নবম শ্রেণি", deadline: "৩১ ডিসেম্বর", note: "সরকারি নির্দেশনা অনুযায়ী লটারির মাধ্যমে ভর্তি সম্পন্ন হবে।" },
  stats: { students: "১৮৫০", teachers: "৫২", passRate: "১০০%", gpa5: "৬৪" },
  content: {
    chairman: { name: "জনাব মোঃ আনোয়ার হোসেন", role: "সভাপতি, ম্যানেজিং কমিটি", photo: img("avatar-m1"), since: "২০২১" },
    principal: { name: "মোঃ গোলাম মোস্তফা", role: "প্রধান শিক্ষক", photo: img("avatar-m2"), since: "২০১৯" },
    topStudents: [
      { name: "সাদিয়া ইসলাম", result: "GPA 5.00", exam: "এসএসসি", year: "২০২৫", photo: img("avatar-f2") },
      { name: "রাকিবুল হাসান", result: "GPA 5.00", exam: "এসএসসি", year: "২০২৫", photo: img("avatar-m2") },
      { name: "মেহনাজ আক্তার", result: "ট্যালেন্টপুল বৃত্তি", exam: "বৃত্তি পরীক্ষা", year: "২০২৪", photo: img("avatar-f1") },
      { name: "তানভীর আহমেদ", result: "GPA 5.00", exam: "জেএসসি", year: "২০২৪", photo: img("avatar-m1") },
    ],
    prospectusUrl: "#",
  },
  plan: { setupPaid: true, amountYearly: 5000 },
};

/* ───────── ২. বেসরকারি বাংলা মাধ্যম (official_bangla) ───────── */
const demoBangla = {
  slug: "demo-bangla",
  name: "নবারুণ উচ্চ বিদ্যালয় ও কলেজ",
  nameEn: "Nabarun High School & College",
  type: "college",
  template: "school", language: "bn",
  theme: { primary: "#1E3A8A", secondary: "#B45309" },
  eiin: "১১৩৮৯২",
  established: "১৯৮৫",
  tagline: "জ্ঞানের আলোয়, শৃঙ্খলার পথে",
  about:
    "নবারুণ উচ্চ বিদ্যালয় ও কলেজ ১৯৮৫ সাল থেকে ষষ্ঠ শ্রেণি থেকে দ্বাদশ শ্রেণি পর্যন্ত মানসম্মত শিক্ষা দিয়ে " +
    "আসছে। বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা—তিন বিভাগেই পূর্ণাঙ্গ পাঠদান, সুসজ্জিত গবেষণাগার এবং " +
    "বিশ্ববিদ্যালয় ভর্তির লক্ষ্যভিত্তিক প্রস্তুতি আমাদের বৈশিষ্ট্য। শিক্ষার্থীর নৈতিক গঠনকে আমরা " +
    "ফলাফলের চেয়ে কম গুরুত্ব দিই না।",
  heroImage: img("assembly"),
  heroImages: [img("assembly"), img("science-lab"), img("library")],
  contact: {
    phone: "01700000012", phone2: "02-8801234", whatsapp: "01700000012",
    email: "info@nabarun-demo.edu.bd",
    address: "নবাবগঞ্জ রোড, মুগদা, ঢাকা-১২১৪",
    officeHours: "শনি–বৃহস্পতি, সকাল ৮টা – বিকাল ৪টা",
    facebook: "https://facebook.com/", youtube: "https://youtube.com/", messenger: "https://m.me/",
  },
  admission: { open: true, classes: "ষষ্ঠ, নবম, একাদশ শ্রেণি", deadline: "২০ ডিসেম্বর", note: "একাদশ শ্রেণিতে তিন বিভাগেই ভর্তি চলছে। আসন সীমিত।" },
  stats: { students: "২৪০০", teachers: "৯৬", passRate: "৯৮%", gpa5: "১১২" },
  content: {
    chairman: { name: "অধ্যাপক ড. মোঃ আব্দুল হামিদ", role: "সভাপতি, পরিচালনা পর্ষদ", photo: img("avatar-m1"), since: "২০২০" },
    principal: { name: "প্রফেসর শাহনাজ পারভীন", role: "অধ্যক্ষ", photo: img("avatar-f1"), since: "২০১৮" },
    topStudents: [
      { name: "তানজিলা আক্তার", result: "GPA 5.00", exam: "এইচএসসি", year: "২০২৫", photo: img("avatar-f1") },
      { name: "মেহেদী হাসান", result: "মেডিকেলে চান্স", exam: "ভর্তি পরীক্ষা", year: "২০২৫", photo: img("avatar-m2") },
      { name: "সুমাইয়া ইসলাম", result: "GPA 5.00", exam: "এসএসসি", year: "২০২৫", photo: img("avatar-f2") },
      { name: "ইমরান হোসেন", result: "বুয়েটে চান্স", exam: "ভর্তি পরীক্ষা", year: "২০২৪", photo: img("avatar-m1") },
    ],
    prospectusUrl: "#",
  },
  plan: { setupPaid: true, amountYearly: 6000 },
};

/* ───────── ৩. বেসরকারি বাংলা মাধ্যম — English (official_bangla_en) ───────── */
const demoBanglaEn = {
  slug: "demo-bangla-en",
  name: "Nabarun Model School & College",
  nameEn: "নবারুণ মডেল স্কুল অ্যান্ড কলেজ",
  type: "college",
  template: "school", language: "en",
  theme: { primary: "#0F766E", secondary: "#B45309" },
  eiin: "১১৪০২৭",
  established: "১৯৯২",
  tagline: "Knowledge, discipline and character",
  about:
    "Established in 1992, Nabarun Model School & College teaches the national curriculum from Class VI to " +
    "Class XII across the science, humanities and business streams. Our laboratories, library and " +
    "university-admission programme are built around one idea: that a student should leave us able to think, " +
    "not merely to recite. The institution is government recognised and MPO-enlisted.",
  heroImage: img("library"),
  heroImages: [img("library"), img("classroom"), img("assembly")],
  contact: {
    phone: "01700000013", whatsapp: "01700000013",
    email: "info@nabarunmodel-demo.edu.bd",
    address: "Zindabazar, Sylhet-3100",
    officeHours: "Sat–Thu, 8:00 am – 4:00 pm",
    facebook: "https://facebook.com/", youtube: "https://youtube.com/",
  },
  admission: { open: true, classes: "Class VI, IX, XI", deadline: "20 December", note: "Admission to all three streams is open in Class XI. Seats are limited." },
  stats: { students: "১৯৬০", teachers: "৭৮", passRate: "৯৯%", gpa5: "৮৬" },
  content: {
    chairman: { name: "Prof. Dr. Kamrul Ahsan", role: "Chairman, Governing Body", photo: img("avatar-m1"), since: "2019" },
    principal: { name: "Mrs. Rowshan Ara Begum", role: "Principal", photo: img("avatar-f1"), since: "2017" },
    topStudents: [
      { name: "Farhana Yasmin", result: "GPA 5.00", exam: "HSC", year: "2025", photo: img("avatar-f1") },
      { name: "Nafis Iqbal", result: "Admitted to BUET", exam: "Admission test", year: "2025", photo: img("avatar-m2") },
      { name: "Sabrina Haque", result: "GPA 5.00", exam: "SSC", year: "2025", photo: img("avatar-f2") },
      { name: "Tahmid Rahman", result: "Admitted to DU", exam: "Admission test", year: "2024", photo: img("avatar-m1") },
    ],
    prospectusUrl: "#",
  },
  plan: { setupPaid: true, amountYearly: 6000 },
};

/* ───────── ৪. মাদরাসা (official_madrasah) ───────── */
const demoMadrasahOfficial = {
  slug: "demo-madrasah-official",
  name: "দারুল হিকমাহ ইসলামিয়া মাদরাসা",
  nameEn: "Darul Hikmah Islamia Madrasah",
  type: "madrasah",
  template: "madrasah", language: "bn",
  theme: { primary: "#0B5D3B", secondary: "#C9A227" },
  established: "১৯৯৭",
  tagline: "ইলম ও আমলের সমন্বয়ে",
  about:
    "দারুল হিকমাহ ইসলামিয়া মাদরাসা ১৯৯৭ সাল থেকে কুরআন ও সুন্নাহর আলোকে দ্বীনি শিক্ষা বিস্তারে নিয়োজিত। " +
    "নাযেরা, হিফজুল কুরআন ও কিতাব বিভাগের পাশাপাশি এখানে বাংলা, ইংরেজি, গণিত ও কম্পিউটার শিক্ষাও দেওয়া হয়, " +
    "যাতে তালিবুল ইলম দ্বীন ও দুনিয়া—দুই ময়দানেই যোগ্য হয়ে ওঠে। আবাসিক ও অনাবাসিক উভয় ব্যবস্থা রয়েছে, " +
    "এবং এতিম ও দরিদ্র শিক্ষার্থীদের জন্য বিনা খরচে পড়ার সুযোগ আছে।",
  heroImage: img("madrasah"),
  heroImages: [img("madrasah"), img("library"), img("riverside")],
  contact: {
    phone: "01700000014", whatsapp: "01700000014",
    email: "info@darulhikmah-demo.edu.bd",
    address: "হেমায়েতপুর, সাভার, ঢাকা-১৩৪০",
    officeHours: "শনি–বৃহস্পতি, সকাল ৮টা – দুপুর ২টা",
    facebook: "https://facebook.com/", youtube: "https://youtube.com/",
  },
  admission: { open: true, classes: "নাযেরা, হিফজ, ইবতেদায়ি, দাখিল", deadline: "১৫ শাওয়াল", note: "হিফজ বিভাগে আবাসিক আসন সীমিত। ভর্তির পূর্বে অভিভাবকসহ সাক্ষাৎ আবশ্যক।" },
  stats: { students: "৭৪০", teachers: "৩৮", passRate: "১০০%" },
  content: {
    chairman: { name: "মাওলানা মুফতি আব্দুর রহমান", role: "সভাপতি, মজলিসে শুরা", photo: img("avatar-ustaz"), since: "২০১৫" },
    principal: { name: "মাওলানা হাফেজ মোঃ ইউসুফ আলী", role: "মুহতামিম", photo: img("avatar-ustaz"), since: "২০১১" },
    topStudents: [
      { name: "হাফেজ আব্দুল্লাহ", result: "৩০ পারা সম্পন্ন", exam: "হিফজ", year: "২০২৫", photo: img("avatar-m2") },
      { name: "হাফেজ মুয়াজ", result: "৩০ পারা সম্পন্ন", exam: "হিফজ", year: "২০২৫", photo: img("avatar-m1") },
      { name: "মোঃ সাইফুল ইসলাম", result: "মুমতাজ", exam: "দাখিল", year: "২০২৫", photo: img("avatar-m2") },
      { name: "হাফেজ তালহা", result: "জাতীয় কিরাত ১ম", exam: "প্রতিযোগিতা", year: "২০২৪", photo: img("avatar-ustaz") },
    ],
    testimonials: [
      { name: "মোঃ নূরুল ইসলাম", relation: "অভিভাবক, হিফজ বিভাগ", rating: 5, text: "ছেলেকে হিফজে দিয়েছিলাম দুশ্চিন্তা নিয়ে। উস্তাযগণের যত্ন ও তারবিয়্যাত দেখে সেই দুশ্চিন্তা কেটে গেছে। আলহামদুলিল্লাহ, দুই বছরেই সে ২০ পারা শেষ করেছে।" },
      { name: "আবু বকর সিদ্দিক", relation: "অভিভাবক, কিতাব বিভাগ", rating: 5, text: "দ্বীনি শিক্ষার পাশাপাশি বাংলা-ইংরেজি ও কম্পিউটার শেখানো হয় — এটাই আমাকে সবচেয়ে বেশি টেনেছে। সন্তান দ্বীনদারও হবে, বাস্তব জীবনেও পিছিয়ে থাকবে না।" },
      { name: "মাওলানা রফিকুল ইসলাম", relation: "প্রাক্তন ছাত্র", rating: 5, text: "এই মাদরাসা থেকে পাওয়া আদব ও ইলমের ভিত্তির জোরেই আজ আমি নিজে দরস দিতে পারছি। উস্তাযগণের প্রতি আজীবন কৃতজ্ঞ।" },
    ],
  },
  plan: { setupPaid: true, amountYearly: 5000 },
};

/* ───────── ৫. English Medium / International (official_english) ───────── */
const demoInternational = {
  slug: "demo-international",
  name: "Green Delta International School",
  nameEn: "গ্রিন ডেল্টা ইন্টারন্যাশনাল স্কুল",
  type: "english_medium",
  template: "school", language: "en",
  theme: { primary: "#12326B", secondary: "#EA580C" },
  eiin: "১৩২৪৫৬",
  established: "২০০৬",
  tagline: "Shaping confident global citizens",
  about:
    "Green Delta International School has taught the English-medium curriculum in Dhaka since 2006. " +
    "We believe education is not only about examination results — it is about learning to ask questions, " +
    "to express an opinion, and to respect the person who disagrees with you. Small class sizes, trained " +
    "teachers and modern classroom practice mean every student here is genuinely seen.",
  heroImage: img("computer-lab"),
  heroImages: [img("computer-lab"), img("classroom"), img("cultural")],
  contact: {
    phone: "01700000015", phone2: "02-9876543", whatsapp: "01700000015",
    email: "info@greendelta-demo.edu.bd",
    address: "House 12, Road 7, Dhanmondi, Dhaka-1205",
    officeHours: "Sat–Thu, 8:00 am – 4:00 pm",
    facebook: "https://facebook.com/", youtube: "https://youtube.com/", messenger: "https://m.me/",
  },
  admission: { open: true, classes: "Play, Nursery, KG, Class I–X", deadline: "20 December", note: "Seats are limited — early applications are given priority." },
  stats: { students: "১২৫০", teachers: "৬৫", passRate: "১০০%", gpa5: "৮৪" },
  content: {
    chairman: { name: "Engr. Tanvir Ahmed", role: "Chairman, Board of Trustees", photo: img("avatar-m1"), since: "2014" },
    principal: { name: "Mrs. Farzana Huq", role: "Principal", photo: img("avatar-f1"), since: "2016" },
    topStudents: [
      { name: "Sadia Rahman", result: "GPA 5.00", exam: "SSC", year: "2025", photo: img("avatar-f2") },
      { name: "Ariful Islam", result: "GPA 5.00", exam: "SSC", year: "2025", photo: img("avatar-m2") },
      { name: "Nusrat Jahan", result: "3rd in merit list", exam: "Scholarship", year: "2024", photo: img("avatar-f1") },
      { name: "Rafsan Kabir", result: "GPA 5.00", exam: "Class VIII", year: "2024", photo: img("avatar-m1") },
    ],
    prospectusUrl: "#",
  },
  plan: { setupPaid: true, amountYearly: 8000 },
};

/* ───────── পুরোনো তিনটি ডিজাইনের ডেমো (অপরিবর্তিত থাকুক, ছবি হালনাগাদ) ───────── */
const demoModern = {
  slug: "demo-school",
  name: "সানরাইজ ইন্টারন্যাশনাল স্কুল",
  nameEn: "Sunrise International School",
  type: "english_medium", template: "school", language: "bn",
  theme: { primary: "#1d4ed8", secondary: "#f59e0b" },
  eiin: "১৩২৪৫৭", established: "২০০৫",
  tagline: "আত্মবিশ্বাসী প্রজন্ম গড়ার পথে",
  about: "সানরাইজ ইন্টারন্যাশনাল স্কুল ২০০৫ সাল থেকে ঢাকায় মানসম্মত ইংরেজি মাধ্যম শিক্ষা দিয়ে আসছে। ছোট ক্লাস সাইজ, প্রশিক্ষিত শিক্ষক ও আধুনিক পাঠদান পদ্ধতির সমন্বয়ে প্রতিটি শিক্ষার্থী এখানে আলাদা মনোযোগ পায়।",
  heroImage: img("classroom"), heroImages: [img("classroom"), img("computer-lab")],
  contact: { phone: "01700000001", whatsapp: "01700000001", email: "info@sunrise-demo.edu.bd", address: "ধানমন্ডি, ঢাকা-১২০৫", officeHours: "শনি–বৃহস্পতি, সকাল ৮টা – বিকাল ৪টা", facebook: "https://facebook.com/" },
  admission: { open: true, classes: "প্লে, নার্সারি, কেজি, প্রথম–দশম শ্রেণি", deadline: "২০ ডিসেম্বর" },
  stats: { students: "১২৫০", teachers: "৬৫", passRate: "১০০%" },
  content: {
    chairman: { name: "ইঞ্জিনিয়ার তানভীর আহমেদ", role: "চেয়ারম্যান, পরিচালনা পর্ষদ", photo: img("avatar-m1") },
    principal: { name: "মিসেস ফারজানা হক", role: "অধ্যক্ষ", photo: img("avatar-f1") },
  },
  plan: { setupPaid: true, amountYearly: 8000 },
};

const demoTraditional = {
  slug: "demo-college",
  name: "ঢাকা আদর্শ উচ্চ বিদ্যালয় ও কলেজ",
  nameEn: "Dhaka Adarsha High School & College",
  type: "college", template: "school", language: "bn",
  theme: { primary: "#0f766e", secondary: "#c2410c" },
  eiin: "১০৮৭৬৫", established: "১৯৮২",
  tagline: "জ্ঞানের আলোয়, শৃঙ্খলার পথে",
  about: "১৯৮২ সালে প্রতিষ্ঠিত ঢাকা আদর্শ উচ্চ বিদ্যালয় ও কলেজ চার দশকেরও বেশি সময় ধরে মানসম্মত শিক্ষা বিস্তারে ভূমিকা রেখে চলেছে। প্রতিষ্ঠানটি সরকার অনুমোদিত ও এমপিওভুক্ত।",
  heroImage: img("campus-flag"), heroImages: [img("campus-flag"), img("assembly")],
  contact: { phone: "01700000002", whatsapp: "01700000002", email: "info@adarsha-demo.edu.bd", address: "মুগদা, ঢাকা-১২১৪", officeHours: "শনি–বৃহস্পতি, সকাল ৯টা – বিকাল ৪টা", facebook: "https://facebook.com/" },
  admission: { open: true, classes: "ষষ্ঠ, নবম, একাদশ শ্রেণি", deadline: "৩১ ডিসেম্বর" },
  stats: { students: "২১০০", teachers: "৮৮", passRate: "৯৮%" },
  content: {
    chairman: { name: "অধ্যাপক ড. মোঃ আব্দুল হামিদ", role: "সভাপতি, পরিচালনা পর্ষদ", photo: img("avatar-m1") },
    principal: { name: "মোঃ শাহজাহান মিয়া", role: "অধ্যক্ষ", photo: img("avatar-m2") },
  },
  plan: { setupPaid: true, amountYearly: 6000 },
};

const demoIslamic = {
  slug: "demo-madrasah",
  name: "দারুল উলুম ইসলামিয়া মাদরাসা",
  nameEn: "Darul Uloom Islamia Madrasah",
  type: "madrasah", template: "madrasah", language: "bn",
  theme: { primary: "#065f46", secondary: "#c9a227" },
  established: "১৯৯৪",
  tagline: "ইলম ও আমলের সমন্বয়ে",
  about: "দারুল উলুম ইসলামিয়া মাদরাসা ১৯৯৪ সাল থেকে কুরআন ও সুন্নাহর আলোকে দ্বীনি শিক্ষা বিস্তারে নিয়োজিত। আবাসিক ও অনাবাসিক উভয় ব্যবস্থা রয়েছে।",
  heroImage: img("madrasah"), heroImages: [img("madrasah"), img("riverside")],
  contact: { phone: "01700000003", whatsapp: "01700000003", email: "info@darululoom-demo.edu.bd", address: "সাভার, ঢাকা-১৩৪০", officeHours: "শনি–বৃহস্পতি, সকাল ৮টা – দুপুর ২টা", facebook: "https://facebook.com/" },
  admission: { open: true, classes: "নাযেরা, হিফজ, ইবতেদায়ি, দাখিল", deadline: "১৫ শাওয়াল" },
  stats: { students: "৬৮০", teachers: "৩৪", passRate: "১০০%" },
  content: {
    chairman: { name: "মাওলানা মুফতি আব্দুর রহমান", role: "সভাপতি, মজলিসে শুরা", photo: img("avatar-ustaz") },
    principal: { name: "মাওলানা হাফেজ মোঃ ইউসুফ আলী", role: "মুহতামিম", photo: img("avatar-ustaz") },
  },
  plan: { setupPaid: true, amountYearly: 5000 },
};

const demos = [demoGovt, demoBangla, demoBanglaEn, demoMadrasahOfficial, demoInternational, demoModern, demoTraditional, demoIslamic];

/* ── ভাষা-সচেতন কনটেন্ট ── */
const isEn = (d) => d.template === "official_bangla_en" || d.template === "official_english";

/* ── নোটিশ / শিক্ষক / অনুষ্ঠান / গ্যালারি / ফলাফল ── */
/* চলতি সাল বাংলা অঙ্কে — বাংলা নোটিশে "2026" দেখালে সাইটটি অনুবাদ-করা মনে হয় */
const bnYear = String(new Date().getFullYear()).replace(/\d/g, (x) => "০১২৩৪৫৬৭৮৯"[Number(x)]);

const noticesFor = (d) => isEn(d)
  ? [
      { title: `Admission circular  — applications open`, body: "Parents may collect the form from the office during working hours, or apply online from this website. Completed forms with all required documents must be submitted before the announced deadline.", pinned: true, createdAt: daysFromNow(-1) },
      { title: "Half-yearly examination routine published", body: "The half-yearly examination for all classes begins in the first week of next month. The full routine is on the notice board and can be downloaded from the Routine page.", createdAt: daysFromNow(-3) },
      { title: "Parents' meeting this Friday", body: "The presence of all parents is requested. There will be an opportunity to speak directly with class teachers about each student's progress.", createdAt: daysFromNow(-6) },
      { title: "Annual sports day — registration open", body: "Interested students may register their names with their class teacher.", createdAt: daysFromNow(-10) },
      { title: "Winter vacation notice", body: "The institution will remain closed according to the announced schedule. Classes resume as usual afterwards.", createdAt: daysFromNow(-14) },
      { title: "Monthly fee payment deadline", body: "Please pay fees by the 10th of each month, at the office or through bKash/Nagad.", createdAt: daysFromNow(-18) },
    ]
  : [
      { title: `ভর্তি বিজ্ঞপ্তি ${bnYear} — আবেদন শুরু`, body: "আগ্রহী অভিভাবকগণ অফিস চলাকালীন সময়ে অথবা ওয়েবসাইট থেকে অনলাইনে আবেদন করতে পারবেন। প্রয়োজনীয় কাগজপত্রসহ নির্ধারিত তারিখের মধ্যে ফরম জমা দিতে হবে।", pinned: true, createdAt: daysFromNow(-1) },
      { title: "অর্ধবার্ষিক পরীক্ষার সময়সূচি প্রকাশ", body: "সকল শ্রেণির অর্ধবার্ষিক পরীক্ষা আগামী মাসের প্রথম সপ্তাহে শুরু হবে। বিস্তারিত রুটিন নোটিশ বোর্ডে টাঙানো হয়েছে এবং ‘রুটিন’ পেজ থেকেও দেখা যাবে।", createdAt: daysFromNow(-3) },
      { title: "অভিভাবক সমাবেশ আগামী শুক্রবার", body: "সকল শ্রেণির অভিভাবকদের উপস্থিতি একান্ত কাম্য। শিক্ষার্থীর অগ্রগতি নিয়ে শ্রেণি শিক্ষকের সাথে সরাসরি আলোচনার সুযোগ থাকবে।", createdAt: daysFromNow(-6) },
      { title: "বার্ষিক ক্রীড়া প্রতিযোগিতার প্রস্তুতি শুরু", body: "আগ্রহী শিক্ষার্থীরা নিজ নিজ শ্রেণি শিক্ষকের কাছে নাম নিবন্ধন করতে পারবে।", createdAt: daysFromNow(-10) },
      { title: "শীতকালীন ছুটির নোটিশ", body: "ঘোষিত সময়সূচি অনুযায়ী প্রতিষ্ঠান বন্ধ থাকবে। ছুটির পর যথারীতি ক্লাস শুরু হবে।", createdAt: daysFromNow(-14) },
      { title: "মাসিক বেতন পরিশোধের সময়সীমা", body: "প্রতি মাসের ১০ তারিখের মধ্যে বেতন পরিশোধের অনুরোধ করা হলো। বিকাশ ও নগদেও বেতন দেওয়া যাবে।", createdAt: daysFromNow(-18) },
    ];

const teachersFor = (d) => {
  const madrasah = [
    { name: "মাওলানা হাফেজ মোঃ ইউসুফ আলী", designation: "মুহতামিম", subject: "হাদীস ও তাফসীর", qualification: "দাওরায়ে হাদীস", photo: img("avatar-ustaz") },
    { name: "মুফতি আব্দুল কাদির", designation: "নায়েবে মুহতামিম", subject: "ফিকহ ও উসূল", qualification: "ইফতা", photo: img("avatar-ustaz") },
    { name: "হাফেজ মোঃ রুহুল আমিন", designation: "শিক্ষা সচিব", subject: "হিফজ বিভাগ", qualification: "হিফজ ও কিরাত", photo: img("avatar-m1") },
    { name: "মাওলানা শামসুল হক", designation: "সিনিয়র উস্তায", subject: "নাহু ও সরফ", qualification: "কামিল", photo: img("avatar-ustaz") },
    { name: "মোঃ আনিসুর রহমান", designation: "উস্তায", subject: "বাংলা ও ইংরেজি", qualification: "এম.এ.", photo: img("avatar-m2") },
    { name: "মোঃ জাকির হোসেন", designation: "উস্তায", subject: "গণিত ও কম্পিউটার", qualification: "বি.এস.সি.", photo: img("avatar-m1") },
  ];
  const general = [
    { name: "মিসেস ফারজানা হক", designation: "প্রধান শিক্ষক", subject: "ইংরেজি", qualification: "এম.এ. (ইংরেজি), বি.এড." },
    { name: "মোঃ আব্দুল করিম", designation: "সহকারী প্রধান শিক্ষক", subject: "গণিত", qualification: "এম.এস.সি. (গণিত)" },
    { name: "ড. নাজমা বেগম", designation: "সিনিয়র শিক্ষক", subject: "পদার্থবিজ্ঞান", qualification: "পিএইচ.ডি. (পদার্থ)" },
    { name: "মোঃ রফিকুল ইসলাম", designation: "সিনিয়র শিক্ষক", subject: "রসায়ন", qualification: "এম.এস.সি. (রসায়ন)" },
    { name: "সাবরিনা আক্তার", designation: "শিক্ষক", subject: "জীববিজ্ঞান", qualification: "এম.এস.সি. (প্রাণিবিদ্যা)" },
    { name: "মোঃ হাসান মাহমুদ", designation: "শিক্ষক", subject: "বাংলা", qualification: "এম.এ. (বাংলা)" },
    { name: "তানিয়া রহমান", designation: "শিক্ষক", subject: "আইসিটি", qualification: "বি.এস.সি. (সিএসই)" },
    { name: "মোঃ সোহেল রানা", designation: "শিক্ষক", subject: "হিসাববিজ্ঞান", qualification: "এম.বি.এ." },
  ];
  const generalEn = [
    { name: "Mrs. Farzana Huq", designation: "Principal", subject: "English", qualification: "MA (English), B.Ed." },
    { name: "Md. Abdul Karim", designation: "Assistant Head Teacher", subject: "Mathematics", qualification: "MSc (Mathematics)" },
    { name: "Dr. Nazma Begum", designation: "Senior Teacher", subject: "Physics", qualification: "PhD (Physics)" },
    { name: "Md. Rafiqul Islam", designation: "Senior Teacher", subject: "Chemistry", qualification: "MSc (Chemistry)" },
    { name: "Sabrina Akter", designation: "Teacher", subject: "Biology", qualification: "MSc (Zoology)" },
    { name: "Md. Hasan Mahmud", designation: "Teacher", subject: "Bangla", qualification: "MA (Bangla)" },
    { name: "Tania Rahman", designation: "Teacher", subject: "ICT", qualification: "BSc (CSE)" },
    { name: "Md. Sohel Rana", designation: "Teacher", subject: "Accounting", qualification: "MBA" },
  ];
  const list = d.type === "madrasah" ? madrasah : isEn(d) ? generalEn : general;
  // নারী নাম হলে নারী প্রতিকৃতি — ডেমোতে অসঙ্গতি চোখে পড়ে
  const female = /মিসেস|নাজমা|সাবরিনা|তানিয়া|Mrs\.|Nazma|Sabrina|Tania/;
  return list.map((t, i) => ({
    ...t, order: i + 1,
    photo: t.photo || (female.test(t.name) ? img(i % 2 ? "avatar-f2" : "avatar-f1") : img(i % 2 ? "avatar-m2" : "avatar-m1")),
  }));
};

const eventsFor = (d) => isEn(d)
  ? [
      { title: "Annual Sports Day", date: daysFromNow(12), time: "9:00 am", venue: "School field", desc: "A full day of athletics for all classes, ending with the prize-giving ceremony.", image: img("playground") },
      { title: "Science & Technology Fair", date: daysFromNow(26), time: "10:00 am", venue: "Main hall", desc: "An exhibition of student-built projects and an innovation contest.", image: img("science-lab") },
      { title: "Parents' Meeting", date: daysFromNow(5), time: "3:00 pm", venue: "Classrooms", desc: "Speak directly with class teachers about your child's progress.", image: img("classroom") },
      { title: "Educational Tour", date: daysFromNow(-20), time: "7:00 am", venue: "Sonargaon Museum", desc: "A day-long educational trip for Class IX and X.", image: img("riverside") },
    ]
  : [
      { title: "বার্ষিক ক্রীড়া প্রতিযোগিতা", date: daysFromNow(12), time: "সকাল ৯:০০", venue: "প্রতিষ্ঠান মাঠ", desc: "সকল শ্রেণির শিক্ষার্থীদের অংশগ্রহণে দিনব্যাপী ক্রীড়া প্রতিযোগিতা ও পুরস্কার বিতরণী।", image: img("playground") },
      { title: d.type === "madrasah" ? "খতমে বুখারি ও দোয়ার মাহফিল" : "বিজ্ঞান ও প্রযুক্তি মেলা", date: daysFromNow(26), time: "সকাল ১০:০০", venue: "মূল হলরুম", desc: d.type === "madrasah" ? "বার্ষিক খতমে বুখারি উপলক্ষে বিশেষ দোয়ার মাহফিল। সকলের উপস্থিতি কাম্য।" : "শিক্ষার্থীদের নিজ হাতে তৈরি প্রজেক্ট প্রদর্শনী ও উদ্ভাবনী প্রতিযোগিতা।", image: d.type === "madrasah" ? img("madrasah") : img("science-lab") },
      { title: "অভিভাবক সমাবেশ", date: daysFromNow(5), time: "বিকাল ৩:০০", venue: "শ্রেণিকক্ষসমূহ", desc: "শিক্ষার্থীর অগ্রগতি নিয়ে শ্রেণি শিক্ষকের সাথে সরাসরি আলোচনা।", image: img("classroom") },
      { title: "বার্ষিক সাংস্কৃতিক অনুষ্ঠান", date: daysFromNow(34), time: "বিকাল ৪:০০", venue: "মূল মঞ্চ", desc: "আবৃত্তি, গান, নাটক ও পুরস্কার বিতরণী।", image: img("cultural") },
      { title: "শিক্ষা সফর", date: daysFromNow(-20), time: "সকাল ৭:০০", venue: "সোনারগাঁও জাদুঘর", desc: "নবম ও দশম শ্রেণির শিক্ষার্থীদের নিয়ে দিনব্যাপী শিক্ষামূলক ভ্রমণ।", image: img("riverside") },
    ];

const galleriesFor = (d) => {
  const campus = d.type === "madrasah"
    ? ["madrasah", "library", "riverside", "classroom"]
    : ["campus-flag", "classroom", "library", "computer-lab"];
  const events = ["assembly", "playground", "cultural", "science-lab"];
  const cap = (s, en, bn) => (isEn(d) ? en : bn);
  return [
    {
      title: cap(null, "Campus & Classrooms", "ক্যাম্পাস ও শ্রেণিকক্ষ"),
      images: campus.map((s) => ({ url: img(s), caption: cap(null, "A moment on campus", "ক্যাম্পাসের মুহূর্ত") })),
    },
    {
      title: cap(null, "Events & Activities", "অনুষ্ঠান ও কার্যক্রম"),
      images: events.map((s) => ({ url: img(s), caption: cap(null, "From our events", "অনুষ্ঠানের ছবি") })),
    },
  ];
};

const resultsFor = (d) => isEn(d)
  ? [
      { examName: "SSC Examination", year: "2025", summary: "Pass rate 100% · 64 students achieved GPA 5.00", pdfUrl: "#", createdAt: daysFromNow(-30) },
      { examName: "Half-yearly Examination", year: "2025", summary: "Results for all classes have been published", pdfUrl: "#", createdAt: daysFromNow(-60) },
      { examName: "Scholarship Examination", year: "2024", summary: "8 in talent pool, 15 in general grade", pdfUrl: "#", createdAt: daysFromNow(-200) },
    ]
  : [
      { examName: d.type === "madrasah" ? "দাখিল পরীক্ষা" : "এসএসসি পরীক্ষা", year: "২০২৫", summary: "পাসের হার ১০০% · জিপিএ-৫ প্রাপ্ত ৬৪ জন", pdfUrl: "#", createdAt: daysFromNow(-30) },
      { examName: "অর্ধবার্ষিক পরীক্ষা", year: "২০২৫", summary: "সকল শ্রেণির ফলাফল প্রকাশিত হয়েছে", pdfUrl: "#", createdAt: daysFromNow(-60) },
      { examName: "বৃত্তি পরীক্ষা", year: "২০২৪", summary: "ট্যালেন্টপুলে ৮ জন, সাধারণ গ্রেডে ১৫ জন", pdfUrl: "#", createdAt: daysFromNow(-200) },
    ];

/* ── লেখা ── */
for (const d of demos) {
  const { slug, ...rest } = d;
  const now = new Date();

  await db.collection("tenants").updateOne(
    { slug },
    { $set: { ...rest, slug, modules: { website: true }, status: "active" }, $setOnInsert: { createdAt: now } },
    { upsert: true }
  );
  const tenant = await db.collection("tenants").findOne({ slug });
  const tenantId = tenant._id;

  // অ্যাডমিন লগইন — ইউজারনেম = সাবডোমেইন, পাসওয়ার্ড সব ডেমোতে অভিন্ন
  await db.collection("users").updateOne(
    { username: slug },
    {
      $set: {
        username: slug, passwordHash: hashPassword(DEMO_PASSWORD),
        phone: d.contact.phone, tenantId, role: "admin", name: "অ্যাডমিন",
        permissions: ["settings", "content", "notices", "teachers", "results", "gallery", "inquiries"],
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  // পুরোনো ফোন-ভিত্তিক ডেমো অ্যাকাউন্ট থাকলে সরিয়ে দিই, নইলে দুটি অ্যাডমিন থেকে যেত
  await db.collection("users").deleteMany({ tenantId, username: { $exists: false } });

  for (const col of ["notices", "teachers", "events", "galleries", "results"]) {
    await db.collection(col).deleteMany({ tenantId });
  }

  await db.collection("notices").insertMany(noticesFor(d).map((n) => ({ ...n, tenantId })));
  await db.collection("teachers").insertMany(teachersFor(d).map((t) => ({ ...t, tenantId, createdAt: now })));
  await db.collection("events").insertMany(eventsFor(d).map((e) => ({ ...e, tenantId, createdAt: now })));
  await db.collection("galleries").insertMany(galleriesFor(d).map((g) => ({ ...g, tenantId, createdAt: now })));
  await db.collection("results").insertMany(resultsFor(d).map((r) => ({ ...r, tenantId })));

  console.log(`✓ ${slug.padEnd(24)} — ${d.name}  (${d.template})`);
}

/* দ্রুত খোঁজার জন্য ইনডেক্স */
await db.collection("tenants").createIndex({ slug: 1 }, { unique: true });
await db.collection("tenants").createIndex({ customDomain: 1 }, { sparse: true });
for (const col of ["notices", "teachers", "results", "galleries", "events", "inquiries"]) {
  await db.collection(col).createIndex({ tenantId: 1, createdAt: -1 });
}
await db.collection("users").createIndex({ username: 1 }, { unique: true, sparse: true });

console.log(`
অফিসিয়াল টেমপ্লেট ডেমো (dev — পোর্ট বদলালে সেটিই ব্যবহার করুন):
  http://demo-govt.localhost:3000              🇧🇩 সরকারি ও MPO স্কুল (বাংলা)
  http://demo-bangla.localhost:3000            🏫 বেসরকারি বাংলা মাধ্যম স্কুল/কলেজ (বাংলা)
  http://demo-bangla-en.localhost:3000         🏫 বেসরকারি বাংলা মাধ্যম স্কুল/কলেজ (English)
  http://demo-madrasah-official.localhost:3000 🕌 মাদ্রাসা ও ইসলামিক প্রতিষ্ঠান (বাংলা)
  http://demo-international.localhost:3000     🌍 English Medium / International

পুরোনো তিনটি ডিজাইন:
  http://demo-school.localhost:3000  ·  http://demo-college.localhost:3000  ·  http://demo-madrasah.localhost:3000

অ্যাডমিন লগইন — http://localhost:3000/admin/login
  ইউজারনেম: সাবডোমেইনটিই (যেমন demo-govt, demo-bangla, demo-international …)
  পাসওয়ার্ড: ${DEMO_PASSWORD}

সুপার প্যানেল — http://localhost:3000/super/login
  ইউজারনেম: SUPER_USER (ডিফল্ট superadmin) · পাসওয়ার্ড: .env-এর SUPER_PASSWORD`);

await client.close();
