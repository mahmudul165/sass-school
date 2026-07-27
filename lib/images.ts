/* বিল্ট-ইন ছবির লাইব্রেরি
   ------------------------------------------------------------------
   প্রতিটি নতুন প্রতিষ্ঠানের সাইট প্রথম দিন থেকেই ছবিসহ দেখায় — নিজের ছবি
   তোলার আগ পর্যন্ত। ছবিগুলো `public/img/bd/`-তে রাখা নিজস্ব আঁকা দৃশ্য:
   কয়েক কিলোবাইট, যেকোনো মাপে ঝকঝকে, ধীর সংযোগেও সাথে সাথে আসে।

   প্রতিষ্ঠান অ্যাডমিন প্যানেল থেকে যেকোনো ছবির বদলে নিজের ছবি বসাতে পারেন। */

export type StockImage = { file: string; label: string; tags: ("campus" | "class" | "event" | "madrasah" | "person")[] };

export const STOCK: StockImage[] = [
  { file: "campus-flag", label: "বিদ্যালয় প্রাঙ্গণ ও জাতীয় পতাকা", tags: ["campus"] },
  { file: "assembly", label: "সকালের সমাবেশ ও শহীদ মিনার", tags: ["campus", "event"] },
  { file: "classroom", label: "শ্রেণিকক্ষ", tags: ["class"] },
  { file: "library", label: "পাঠাগার", tags: ["class"] },
  { file: "science-lab", label: "বিজ্ঞান গবেষণাগার", tags: ["class"] },
  { file: "computer-lab", label: "কম্পিউটার ল্যাব", tags: ["class"] },
  { file: "playground", label: "খেলার মাঠ", tags: ["campus", "event"] },
  { file: "cultural", label: "সাংস্কৃতিক অনুষ্ঠান", tags: ["event"] },
  { file: "riverside", label: "নদীর পাড়ে গ্রামীণ বিদ্যালয়", tags: ["campus"] },
  { file: "madrasah", label: "মাদরাসা — গম্বুজ ও মিনার", tags: ["madrasah", "campus"] },
  { file: "avatar-m1", label: "প্রতিকৃতি — শিক্ষক", tags: ["person"] },
  { file: "avatar-f1", label: "প্রতিকৃতি — শিক্ষিকা", tags: ["person"] },
  { file: "avatar-m2", label: "প্রতিকৃতি — ছাত্র", tags: ["person"] },
  { file: "avatar-f2", label: "প্রতিকৃতি — ছাত্রী", tags: ["person"] },
  { file: "avatar-ustaz", label: "প্রতিকৃতি — উস্তায", tags: ["person", "madrasah"] },
];

export const stockUrl = (file: string) => `/img/bd/${file}.svg`;

/** কোনো URL আমাদের বিল্ট-ইন লাইব্রেরির কি না */
export const isStock = (url?: string) =>
  Boolean(url && /^\/img\/bd\/[a-z0-9-]+\.svg$/i.test(url));

export const stockFor = (tag: StockImage["tags"][number]) => STOCK.filter((s) => s.tags.includes(tag));
