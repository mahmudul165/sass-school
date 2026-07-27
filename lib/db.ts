import { MongoClient, Db, ObjectId } from "mongodb";

let client: MongoClient | null = null;

export async function getDb(): Promise<Db> {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI সেট করা নেই");
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
  }
  return client.db();
}

export { ObjectId };

export type InstitutionType =
  | "school" | "english_medium" | "college" | "madrasah" | "kindergarten" | "coaching";

/** প্ল্যাটফর্মে টেমপ্লেট দুটিই। পুরোনো কী registry-র ALIASES দিয়ে এদের একটিতে ম্যাপ হয়। */
export type TemplateKey = "school" | "madrasah";

export type Tenant = {
  _id: ObjectId;
  slug: string;
  customDomain?: string | null;
  name: string;
  nameEn?: string;
  shortName?: string;
  eiin?: string;
  type: InstitutionType;
  template: TemplateKey | string;
  /** সাইটের ডিফল্ট ভাষা; দর্শক হেডার থেকে বদলাতে পারেন। না দিলে বাংলা। */
  language?: "bn" | "en";
  theme: { primary: string; secondary: string };
  logo?: string;
  heroImage?: string;
  heroImages?: string[];
  tagline?: string;
  about?: string;
  established?: string;
  contact: {
    phone?: string; phone2?: string; whatsapp?: string; email?: string;
    address?: string; mapEmbed?: string; messenger?: string; facebook?: string;
    youtube?: string; officeHours?: string;
  };
  admission?: { open: boolean; classes?: string; note?: string; deadline?: string; formUrl?: string };
  stats?: { students?: string; teachers?: string; passRate?: string; gpa5?: string };
  /** টেমপ্লেট সেকশনের সব সম্পাদনযোগ্য কনটেন্ট — অনুপস্থিত অংশ lib/content.ts ডিফল্ট দিয়ে পূরণ হয় */
  content?: Record<string, unknown>;
  /** কোন সেকশন দেখানো হবে — অনুপস্থিত মানে "দেখাও" */
  sections?: Record<string, boolean>;
  modules: { website: boolean };
  plan: { setupPaid: boolean; renewalDate?: string; amountYearly: number };
  status: "active" | "grace" | "suspended";
  createdAt: Date;
};

export type Inquiry = {
  _id: ObjectId;
  tenantId: ObjectId;
  name: string;
  phone: string;
  studentClass?: string;
  message?: string;
  kind: "admission" | "callback" | "contact";
  page?: string;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
};
