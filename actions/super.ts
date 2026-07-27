"use server";
import { getDb, ObjectId } from "@/lib/db";
import { isSuper, setSuperCookie } from "@/lib/super";
import { hostsForTenant, tenantTag, contentTag } from "@/lib/tenant";
import { slugify, normalizePhone } from "@/lib/utils";
import { hashPassword, normalizeUsername, suggestPassword } from "@/lib/password";
import { parsePermissions, ALL_FEATURES } from "@/lib/permissions";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

/** সুপার অ্যাডমিন: ইউজারনেম + পাসওয়ার্ড (env থেকে; ইউজারনেম না দিলে "superadmin") */
export async function superLogin(fd: FormData) {
  const user = String(fd.get("username") || "").trim().toLowerCase();
  const pass = String(fd.get("password") || "");
  const expectedUser = (process.env.SUPER_USER || "superadmin").toLowerCase();
  if (user !== expectedUser || !pass || pass !== process.env.SUPER_PASSWORD) redirect("/super/login?e=1");
  await setSuperCookie();
  redirect("/super");
}
async function guard() { if (!(await isSuper())) redirect("/super/login"); }

/* প্রতিষ্ঠানের ধরন → টেমপ্লেট ও ব্র্যান্ড রঙের ডিফল্ট।
   সেলস ডেমোতে শুধু নাম ও ধরন দিলেই সাইট "সাজানো" অবস্থায় লাইভ হয় — এটাই ক্লোজিং মুহূর্ত। */
const DEFAULTS: Record<string, { template: string; primary: string; secondary: string }> = {
  school: { template: "school", primary: "#00674B", secondary: "#B01C24" },
  college: { template: "school", primary: "#1E3A8A", secondary: "#B45309" },
  english_medium: { template: "school", primary: "#12326B", secondary: "#EA580C" },
  kindergarten: { template: "school", primary: "#0891B2", secondary: "#F97316" },
  coaching: { template: "school", primary: "#4338CA", secondary: "#F59E0B" },
  madrasah: { template: "madrasah", primary: "#0B5D3B", secondary: "#C9A227" },
};

// ৫-মিনিট ডেমো ফ্লো: নাম + ধরন + অ্যাডমিনের লগইন → সাইট লাইভ
export async function createTenant(fd: FormData) {
  await guard();
  const db = await getDb();
  const name = String(fd.get("name") || "").trim();
  const type = String(fd.get("type") || "school");
  const phone = normalizePhone(String(fd.get("adminPhone") || ""));
  if (!name) redirect("/super/tenants?e=missing");

  let slug = slugify(String(fd.get("slug") || "")) || slugify(name) || `school-${Date.now()}`;
  if (await db.collection("tenants").findOne({ slug })) slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`;

  // ইউজারনেম না দিলে সাবডোমেইনই ইউজারনেম — মনে রাখা সহজ
  const username = normalizeUsername(String(fd.get("adminUsername") || "")) || normalizeUsername(slug) || `admin${Date.now()}`;
  if (await db.collection("users").findOne({ username })) redirect("/super/tenants?e=username");
  const password = String(fd.get("adminPassword") || "").trim() || suggestPassword();

  const d = DEFAULTS[type] || DEFAULTS.school;
  const r = await db.collection("tenants").insertOne({
    slug, name, type, template: d.template,
    theme: { primary: d.primary, secondary: d.secondary },
    contact: {
      phone: String(fd.get("adminPhone") || ""),
      whatsapp: phone || "",
      address: String(fd.get("address") || ""),
    },
    admission: { open: true },
    modules: { website: true },
    plan: { setupPaid: false, amountYearly: Number(fd.get("amountYearly") || 5000) },
    status: "active", createdAt: new Date(),
  });

  await db.collection("users").insertOne({
    username, passwordHash: hashPassword(password),
    phone: phone || "", tenantId: r.insertedId, role: "admin", name: "অ্যাডমিন",
    permissions: [...ALL_FEATURES], createdAt: new Date(),
  });

  // পাসওয়ার্ড একবারই দেখানো হয় — সুপার অ্যাডমিন তখনই ক্লায়েন্টকে দিয়ে দেন
  redirect(`/super/tenants?created=${slug}&u=${encodeURIComponent(username)}&p=${encodeURIComponent(password)}`);
}

/* ── অ্যাডমিন ব্যবহারকারী ব্যবস্থাপনা ──────────────────────────
   একটি প্রতিষ্ঠানে একাধিক অ্যাডমিন থাকতে পারেন, প্রত্যেকের আলাদা অনুমতি।
   সুপার অ্যাডমিন এখান থেকেই তৈরি, অনুমতি বদল ও পাসওয়ার্ড রিসেট করেন। */

export async function createAdminUser(fd: FormData) {
  await guard();
  const db = await getDb();
  const tenantId = new ObjectId(String(fd.get("tenantId")));
  const username = normalizeUsername(String(fd.get("username") || ""));
  if (!username) redirect("/super/users?e=username");
  if (await db.collection("users").findOne({ username })) redirect("/super/users?e=username");

  const password = String(fd.get("password") || "").trim() || suggestPassword();
  const permissions = parsePermissions(fd.getAll("permissions"));

  await db.collection("users").insertOne({
    username, passwordHash: hashPassword(password),
    name: String(fd.get("name") || "অ্যাডমিন").trim() || "অ্যাডমিন",
    phone: normalizePhone(String(fd.get("phone") || "")) || "",
    tenantId, role: "admin", permissions, createdAt: new Date(),
  });
  redirect(`/super/users?created=1&u=${encodeURIComponent(username)}&p=${encodeURIComponent(password)}`);
}

/** অনুমতি ও নাম হালনাগাদ; পাসওয়ার্ড দিলে সেটিও বদলায় */
export async function updateAdminUser(fd: FormData) {
  await guard();
  const db = await getDb();
  const id = new ObjectId(String(fd.get("id")));
  const set: Record<string, unknown> = {
    permissions: parsePermissions(fd.getAll("permissions")),
    name: String(fd.get("name") || "অ্যাডমিন").trim() || "অ্যাডমিন",
  };
  const password = String(fd.get("password") || "").trim();
  if (password) set.passwordHash = hashPassword(password);

  await db.collection("users").updateOne({ _id: id }, { $set: set });
  redirect(password ? `/super/users?reset=1&p=${encodeURIComponent(password)}` : "/super/users?saved=1");
}

export async function deleteAdminUser(fd: FormData) {
  await guard();
  const db = await getDb();
  await db.collection("users").deleteOne({ _id: new ObjectId(String(fd.get("id"))) });
  redirect("/super/users?deleted=1");
}

/* ── প্রতিষ্ঠান ও তার সব তথ্য মুছে ফেলা ────────────────────────
   এটি অপরিবর্তনীয়: সাইট, নোটিশ, শিক্ষক, ফলাফল, গ্যালারি, অনুষ্ঠান,
   ভর্তি আবেদন ও অ্যাডমিন অ্যাকাউন্ট — সব একসাথে যায়।

   সুরক্ষা: শুধু বোতাম চাপলেই হবে না — সুপার অ্যাডমিনকে প্রতিষ্ঠানের
   সাবডোমেইনটি হুবহু টাইপ করতে হয়। ভুল ক্লিকে চার বছরের নোটিশ হারিয়ে
   যাওয়ার চেয়ে দশ সেকেন্ড বেশি লাগা ভালো। */
const TENANT_COLLECTIONS = ["notices", "teachers", "results", "galleries", "events", "inquiries"];

export async function deleteTenant(fd: FormData) {
  await guard();
  const db = await getDb();
  const id = new ObjectId(String(fd.get("id")));
  const tenant = await db.collection("tenants").findOne({ _id: id });
  if (!tenant) redirect("/super/tenants?e=missing");

  // নিশ্চিতকরণ — সাবডোমেইন হুবহু না মিললে কিছুই মোছা হয় না
  const typed = String(fd.get("confirm") || "").trim().toLowerCase();
  if (typed !== String(tenant.slug).toLowerCase()) {
    redirect(`/super/tenants?e=confirm&t=${encodeURIComponent(String(tenant.slug))}`);
  }

  for (const col of TENANT_COLLECTIONS) await db.collection(col).deleteMany({ tenantId: id });
  await db.collection("users").deleteMany({ tenantId: id });
  await db.collection("tenants").deleteOne({ _id: id });

  // ক্যাশ খালি করা, নইলে মুছে ফেলা সাইট আরও কিছুক্ষণ দেখা যেত
  hostsForTenant(tenant as never).forEach((h) => revalidateTag(tenantTag(h)));
  revalidateTag(contentTag(String(id)));

  redirect(`/super/tenants?purged=${encodeURIComponent(String(tenant.slug))}`);
}

/** শুধু কনটেন্ট মুছে সাইটটি "নতুনের মতো" করা — প্রতিষ্ঠান ও লগইন থেকে যায়।
    ডেমো দেখানোর পর আসল কাজ শুরু করার আগে এটি কাজে লাগে। */
export async function clearTenantData(fd: FormData) {
  await guard();
  const db = await getDb();
  const id = new ObjectId(String(fd.get("id")));
  const tenant = await db.collection("tenants").findOne({ _id: id });
  if (!tenant) redirect("/super/tenants?e=missing");

  const typed = String(fd.get("confirm") || "").trim().toLowerCase();
  if (typed !== String(tenant.slug).toLowerCase()) {
    redirect(`/super/tenants?e=confirm&t=${encodeURIComponent(String(tenant.slug))}`);
  }

  for (const col of TENANT_COLLECTIONS) await db.collection(col).deleteMany({ tenantId: id });
  await db.collection("tenants").updateOne({ _id: id }, { $unset: { content: "" } });

  hostsForTenant(tenant as never).forEach((h) => revalidateTag(tenantTag(h)));
  revalidateTag(contentTag(String(id)));
  redirect(`/super/tenants?cleared=${encodeURIComponent(String(tenant.slug))}`);
}

/** প্রতিষ্ঠানের তালিকা থেকে দ্রুত পাসওয়ার্ড রিসেট */
export async function resetAdminLogin(fd: FormData) {
  await guard();
  const db = await getDb();
  const tenantId = new ObjectId(String(fd.get("id")));
  const username = normalizeUsername(String(fd.get("username") || ""));
  if (!username) redirect("/super/tenants?e=username");
  const password = String(fd.get("password") || "").trim() || suggestPassword();

  const clash = await db.collection("users").findOne({ username, tenantId: { $ne: tenantId } });
  if (clash) redirect("/super/tenants?e=username");

  await db.collection("users").updateOne(
    { tenantId, role: "admin" },
    {
      $set: { username, passwordHash: hashPassword(password), tenantId, role: "admin" },
      $setOnInsert: { name: "অ্যাডমিন", permissions: [...ALL_FEATURES], createdAt: new Date() },
    },
    { upsert: true }
  );
  redirect(`/super/tenants?reset=1&u=${encodeURIComponent(username)}&p=${encodeURIComponent(password)}`);
}

export async function updateBilling(fd: FormData) {
  await guard();
  const db = await getDb();
  const id = new ObjectId(String(fd.get("id")));
  await db.collection("tenants").updateOne({ _id: id }, { $set: {
    "plan.setupPaid": fd.get("setupPaid") === "on",
    "plan.renewalDate": String(fd.get("renewalDate") || ""),
    "plan.amountYearly": Number(fd.get("amountYearly") || 5000),
    status: String(fd.get("status") || "active"),
  }});
  const t = await db.collection("tenants").findOne({ _id: id });
  if (t) hostsForTenant(t as never).forEach((h) => revalidateTag(tenantTag(h)));
  redirect("/super/tenants");
}

export async function setCustomDomain(fd: FormData) {
  await guard();
  const db = await getDb();
  const id = new ObjectId(String(fd.get("id")));
  const domain = String(fd.get("customDomain") || "").toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*/, "");
  await db.collection("tenants").updateOne({ _id: id }, { $set: { customDomain: domain || null, domainStatus: "pending" } });
  // Vercel-এ ডোমেইন যোগ (token থাকলে)
  if (domain && process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
    const team = process.env.VERCEL_TEAM_ID ? `?teamId=${process.env.VERCEL_TEAM_ID}` : "";
    await fetch(`https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains${team}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: domain }),
    }).catch(() => null);
  }
  const t = await db.collection("tenants").findOne({ _id: id });
  if (t) hostsForTenant(t as never).forEach((h) => revalidateTag(tenantTag(h)));
  redirect("/super/tenants");
}
