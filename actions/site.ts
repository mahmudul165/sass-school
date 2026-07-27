"use server";
/* পাবলিক সাইটের কনভার্সন অ্যাকশন — লগইন ছাড়াই চলে, তাই এখানে যাচাই কড়া।
   এটি প্ল্যাটফর্মের একমাত্র unauthenticated write path। */

import { getDb, ObjectId } from "@/lib/db";
import { getTenantByHost } from "@/lib/tenant";
import { headers } from "next/headers";

type State = { ok: boolean; message: string } | null;

const BD_PHONE = /^01[3-9]\d{8}$/;
const BN = "০১২৩৪৫৬৭৮৯";
const toEn = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN.indexOf(d)));

function normalizePhone(raw: string) {
  let p = toEn(String(raw)).replace(/[^0-9]/g, "");
  if (p.startsWith("880")) p = p.slice(3);
  if (p.length === 10 && p.startsWith("1")) p = "0" + p;
  return BD_PHONE.test(p) ? p : null;
}

/** একই নম্বর থেকে বারবার জমা ঠেকাতে — সহজ, DB-ভিত্তিক থ্রটল */
async function tooSoon(tenantId: ObjectId, phone: string) {
  const db = await getDb();
  const last = await db.collection("inquiries").findOne(
    { tenantId, phone, createdAt: { $gt: new Date(Date.now() - 90 * 1000) } },
    { projection: { _id: 1 } }
  );
  return Boolean(last);
}

export async function submitInquiry(_prev: State, fd: FormData): Promise<State> {
  // মধুকলস — বট ভরলে সফলতা দেখিয়ে চুপচাপ ফেলে দিই (বট যেন বুঝতে না পারে)
  if (String(fd.get("website") || "").trim()) {
    return { ok: true, message: "আপনার তথ্য গৃহীত হয়েছে।" };
  }

  const h = await headers();
  const host = (h.get("x-forwarded-host") || h.get("host") || "").replace(/^www\./, "").split(":")[0];
  const tenant = await getTenantByHost(host);
  if (!tenant) return { ok: false, message: "প্রতিষ্ঠান শনাক্ত করা যায়নি। অনুগ্রহ করে সরাসরি ফোন করুন।" };

  const name = String(fd.get("name") || "").trim().slice(0, 80);
  const phone = normalizePhone(String(fd.get("phone") || ""));
  const studentClass = String(fd.get("studentClass") || "").trim().slice(0, 60);
  const message = String(fd.get("message") || "").trim().slice(0, 600);
  const kindRaw = String(fd.get("kind") || "admission");
  const kind = (["admission", "callback", "contact"] as const).includes(kindRaw as never)
    ? (kindRaw as "admission" | "callback" | "contact")
    : "admission";

  if (name.length < 2) return { ok: false, message: "অনুগ্রহ করে আপনার নাম লিখুন।" };
  if (!phone) return { ok: false, message: "সঠিক মোবাইল নম্বর দিন (যেমন ০১৭XXXXXXXX)।" };

  const tenantId = new ObjectId(String(tenant._id));
  if (await tooSoon(tenantId, phone)) {
    return { ok: true, message: "আপনার তথ্য ইতিমধ্যে পেয়েছি। কর্তৃপক্ষ শিগগিরই যোগাযোগ করবেন।" };
  }

  const db = await getDb();
  await db.collection("inquiries").insertOne({
    tenantId, name, phone, studentClass: studentClass || undefined,
    message: message || undefined, kind,
    page: h.get("referer") || undefined,
    status: "new", createdAt: new Date(),
  });

  return {
    ok: true,
    message:
      kind === "callback"
        ? "আমরা শিগগিরই আপনাকে ফোন করব। ধন্যবাদ।"
        : "আপনার আবেদন পৌঁছে গেছে। কর্তৃপক্ষ ২৪ ঘণ্টার মধ্যে যোগাযোগ করবেন।",
  };
}
