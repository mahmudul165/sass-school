"use server";
import { auth } from "@/lib/auth";
import { can, type Feature } from "@/lib/permissions";
import { forTenant } from "@/lib/dal";
import { contentTag, tenantTag, hostsForTenant } from "@/lib/tenant";
import { getDb, ObjectId } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

/* প্রতিটি অ্যাকশনেও অনুমতি যাচাই — পেজ লুকিয়ে রাখাই যথেষ্ট নয়।
   কেউ সরাসরি ফর্ম POST করলে পেজের পাহারা এড়িয়ে যেত; তাই সার্ভার
   অ্যাকশনেই আসল সিদ্ধান্তটি নেওয়া হয়। */
async function ctx(feature?: Feature) {
  const session = await auth();
  const u = session?.user as never as { tenantId?: string; permissions?: string[] } | undefined;
  const tenantId = u?.tenantId;
  if (!tenantId) redirect("/admin/login");
  if (feature && !can(u?.permissions, feature)) redirect(`/admin/denied?f=${feature}`);
  return { tenantId, dal: forTenant(tenantId) };
}
async function bust(tenantId: string) {
  revalidateTag(contentTag(tenantId));
  const db = await getDb();
  const t = await db.collection("tenants").findOne({ _id: new ObjectId(tenantId) });
  if (t) hostsForTenant(t as never).forEach((h) => revalidateTag(tenantTag(h)));
}

// ---- নোটিশ ----
export async function saveNotice(fd: FormData) {
  const { tenantId, dal } = await ctx("notices");
  const doc = {
    title: String(fd.get("title") || "").trim(),
    body: String(fd.get("body") || ""),
    attachmentUrl: String(fd.get("attachmentUrl") || "") || null,
    pinned: fd.get("pinned") === "on",
  };
  if (!doc.title) return;
  const id = String(fd.get("id") || "");
  if (id) await dal.notices.update(id, doc); else await dal.notices.create(doc);
  await bust(tenantId);
  redirect("/admin/notices");
}
export async function deleteNotice(fd: FormData) {
  const { tenantId, dal } = await ctx("notices");
  await dal.notices.remove(String(fd.get("id")));
  await bust(tenantId);
}

// ---- শিক্ষক ----
export async function saveTeacher(fd: FormData) {
  const { tenantId, dal } = await ctx("teachers");
  const doc = {
    name: String(fd.get("name") || "").trim(),
    designation: String(fd.get("designation") || ""),
    // বিষয় ও যোগ্যতা সাইটের শিক্ষক কার্ডে দেখানো হয় — আগে ফর্মে ছিল না,
    // ফলে অ্যাডমিন থেকে যোগ করা শিক্ষকের কার্ড অর্ধেক ফাঁকা দেখাত
    subject: String(fd.get("subject") || ""),
    qualification: String(fd.get("qualification") || ""),
    photo: String(fd.get("photo") || "") || null,
    order: Number(fd.get("order") || 99),
  };
  if (!doc.name) return;
  const id = String(fd.get("id") || "");
  if (id) await dal.teachers.update(id, doc); else await dal.teachers.create(doc);
  await bust(tenantId);
  redirect("/admin/teachers");
}
export async function deleteTeacher(fd: FormData) {
  const { tenantId, dal } = await ctx("teachers");
  await dal.teachers.remove(String(fd.get("id")));
  await bust(tenantId);
}

// ---- ফলাফল ----
export async function saveResult(fd: FormData) {
  const { tenantId, dal } = await ctx("results");
  const doc = {
    examName: String(fd.get("examName") || "").trim(),
    year: String(fd.get("year") || ""),
    summary: String(fd.get("summary") || ""),
    pdfUrl: String(fd.get("pdfUrl") || "") || null,
  };
  if (!doc.examName) return;
  await dal.results.create(doc);
  await bust(tenantId);
  redirect("/admin/results");
}
export async function deleteResult(fd: FormData) {
  const { tenantId, dal } = await ctx("results");
  await dal.results.remove(String(fd.get("id")));
  await bust(tenantId);
}

// ---- অনুষ্ঠান ----
export async function saveEvent(fd: FormData) {
  const { tenantId, dal } = await ctx("notices");
  const doc = {
    title: String(fd.get("title") || "").trim(),
    date: String(fd.get("date") || ""),
    time: String(fd.get("time") || ""),
    venue: String(fd.get("venue") || ""),
    desc: String(fd.get("desc") || ""),
    image: String(fd.get("image") || "") || null,
  };
  if (!doc.title || !doc.date) return;
  await dal.events.create(doc);
  await bust(tenantId);
  redirect("/admin/events");
}
export async function deleteEvent(fd: FormData) {
  const { tenantId, dal } = await ctx("notices");
  await dal.events.remove(String(fd.get("id")));
  await bust(tenantId);
}

// ---- গ্যালারি ----
export async function saveGallery(fd: FormData) {
  const { tenantId, dal } = await ctx("gallery");
  const urls = String(fd.get("urls") || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const doc = { title: String(fd.get("title") || "ছবির অ্যালবাম"), images: urls.map((url) => ({ url })) };
  if (urls.length === 0) return;
  await dal.galleries.create(doc);
  await bust(tenantId);
  redirect("/admin/gallery");
}
export async function deleteGallery(fd: FormData) {
  const { tenantId, dal } = await ctx("gallery");
  await dal.galleries.remove(String(fd.get("id")));
  await bust(tenantId);
}

// ---- ভর্তি আবেদন / জিজ্ঞাসা ----
export async function setInquiryStatus(fd: FormData) {
  const { tenantId, dal } = await ctx("inquiries");
  const status = String(fd.get("status") || "contacted");
  if (!["new", "contacted", "closed"].includes(status)) return;
  await dal.inquiries.update(String(fd.get("id")), { status });
  await bust(tenantId);
}
export async function deleteInquiry(fd: FormData) {
  const { tenantId, dal } = await ctx("inquiries");
  await dal.inquiries.remove(String(fd.get("id")));
  await bust(tenantId);
}

// ---- সেটিংস ----
const s = (fd: FormData, k: string) => String(fd.get(k) || "").trim();

/** JSON ইনপুট নিরাপদে পড়া — সম্পাদকগুলো তালিকা এভাবেই পাঠায়।
    ভাঙা JSON এলে পুরো সেভ ব্যর্থ না করে ফাঁকা তালিকা ধরা হয়; নইলে একটিমাত্র
    ভুল অক্ষরে প্রধান শিক্ষক তাঁর সব কাজ হারাতেন। */
function json<T>(fd: FormData, key: string, fallback: T): T {
  const raw = fd.get(key);
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) || typeof v === "object" ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

/** খালি সারি বাদ — অ্যাডমিন প্যানেলে ফাঁকা ঘর রেখে দিলে সাইটে ফাঁকা কার্ড দেখাত */
const clean = <T extends Record<string, unknown>>(rows: T[], key: keyof T) =>
  rows.filter((r) => String(r[key] ?? "").trim());

/* ---- বিভাগ / রুটিন / ক্লাব / ফলাফলের ধারা ----
   চারটিই tenant.content-এ বসে, তাই একটিই ফর্ম ও একটিই অ্যাকশন। */
export async function saveStructuredContent(fd: FormData) {
  const { tenantId } = await ctx("content");
  const db = await getDb();

  type Row = Record<string, unknown>;
  type Routine = { title: string; periods: string[]; rows: { day: string; cells: string[] }[] };
  type Series = { exam: string; rows: { year: string; passRate: number }[] };

  /** সাধারণ তালিকা — যে কী-টি খালি হলে সারিটি অর্থহীন, সেটি দিয়েই ছাঁকা হয় */
  const list = (key: string, requiredKey: string) => clean(json<Row[]>(fd, key, []), requiredKey);

  const routine = clean(json<Routine[]>(fd, "routine", []), "title")
    .map((t) => ({ ...t, rows: clean(t.rows || [], "day") }));
  const resultChart = clean(json<Series[]>(fd, "resultChart", []), "exam")
    .map((sx) => ({ ...sx, rows: clean(sx.rows || [], "year") }));

  const set: Record<string, unknown> = {
    // তালিকা — সাইটের প্রতিটি পেজের যে অংশগুলো তালিকা
    "content.departments": list("departments", "name"),
    "content.clubs": list("clubs", "name"),
    "content.routine": routine,
    "content.resultChart": resultChart,
    "content.why": list("why", "title"),
    "content.programs": list("programs", "title"),
    "content.facilities": list("facilities", "title"),
    "content.campusLife": list("campusLife", "title"),
    "content.achievements": list("achievements", "title"),
    "content.topStudents": list("topStudents", "name"),
    "content.testimonials": list("testimonials", "name"),
    "content.faq": list("faq", "q"),
    "content.admissionSteps": list("admissionSteps", "title"),
    "content.admissionTimeline": list("admissionTimeline", "title"),
    "content.fees": list("fees", "label"),
    "content.videos": list("videos", "youtubeId"),
    "content.aboutPoints": json<string[]>(fd, "aboutPoints", []).filter((x) => String(x).trim()),

    // একক লেখা
    "content.heroKicker": s(fd, "heroKicker"),
    "content.heroSub": s(fd, "heroSub"),
    "content.heroCta": s(fd, "heroCta"),
    "content.feeNote": s(fd, "feeNote"),
    "content.resultPortalNote": s(fd, "resultPortalNote"),
    "content.portals.student": s(fd, "portalStudent"),
    "content.portals.parent": s(fd, "portalParent"),
  };

  await db.collection("tenants").updateOne({ _id: new ObjectId(tenantId) }, { $set: set });
  await bust(tenantId);
  redirect("/admin/content?saved=1");
}

export async function saveSettings(fd: FormData) {
  const { tenantId } = await ctx("settings");
  const db = await getDb();
  const set: Record<string, unknown> = {
    nameEn: s(fd, "nameEn"),
    eiin: s(fd, "eiin"),
    tagline: s(fd, "tagline"),
    about: s(fd, "about"),
    established: s(fd, "established"),
    logo: s(fd, "logo") || null,
    heroImage: s(fd, "heroImage") || null,
    // একাধিক হিরো ছবি — প্রতি লাইনে একটি URL
    heroImages: s(fd, "heroImages").split("\n").map((x) => x.trim()).filter(Boolean),
    type: s(fd, "type") || "school",
    template: s(fd, "template") || "school",
    language: s(fd, "language") === "en" ? "en" : "bn",
    "theme.primary": s(fd, "primary") || "#1d4ed8",
    "theme.secondary": s(fd, "secondary") || "#f59e0b",
    "contact.phone": s(fd, "phone"),
    "contact.phone2": s(fd, "phone2"),
    "contact.whatsapp": s(fd, "whatsapp").replace(/[^0-9]/g, ""),
    "contact.email": s(fd, "email"),
    "contact.address": s(fd, "address"),
    "contact.officeHours": s(fd, "officeHours"),
    "contact.mapEmbed": s(fd, "mapEmbed"),
    "contact.facebook": s(fd, "facebook"),
    "contact.youtube": s(fd, "youtube"),
    "contact.messenger": s(fd, "messenger"),
    "admission.open": fd.get("admissionOpen") === "on",
    "admission.classes": s(fd, "admissionClasses"),
    "admission.deadline": s(fd, "admissionDeadline"),
    "admission.note": s(fd, "admissionNote"),
    "admission.formUrl": s(fd, "admissionFormUrl"),
    "stats.students": s(fd, "students"),
    "stats.teachers": s(fd, "teachersCount"),
    "stats.passRate": s(fd, "passRate"),
    "content.chairman.name": s(fd, "chairmanName"),
    "content.chairman.role": s(fd, "chairmanRole") || "সভাপতি, পরিচালনা পর্ষদ",
    "content.chairman.photo": s(fd, "chairmanPhoto"),
    "content.chairman.message": s(fd, "chairmanMessage"),
    "content.principal.name": s(fd, "principalName"),
    "content.principal.role": s(fd, "principalRole") || "প্রধান শিক্ষক",
    "content.principal.photo": s(fd, "principalPhoto"),
    "content.principal.message": s(fd, "principalMessage"),
    "content.prospectusUrl": s(fd, "prospectusUrl"),
  };
  await db.collection("tenants").updateOne({ _id: new ObjectId(tenantId) }, { $set: set });
  await bust(tenantId);
  redirect("/admin?saved=1");
}
