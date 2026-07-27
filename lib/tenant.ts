import { unstable_cache } from "next/cache";
import { headers } from "next/headers";
import { getDb, Tenant } from "./db";

const ROOT = process.env.ROOT_DOMAIN || "localhost";
const IS_LOCAL = ROOT === "localhost" || ROOT.startsWith("127.");

export function tenantTag(host: string) { return `tenant:${host}`; }
export function contentTag(tenantId: string) { return `content:${tenantId}`; }

export async function getTenantByHost(host: string): Promise<Tenant | null> {
  const h = decodeURIComponent(host).toLowerCase();
  return unstable_cache(
    async () => {
      const db = await getDb();
      const q = h.endsWith(`.${ROOT}`)
        ? { slug: h.replace(`.${ROOT}`, "") }
        : { $or: [{ customDomain: h }, { slug: h.split(".")[0] }] };
      const t = await db.collection<Tenant>("tenants").findOne({ ...q, status: { $ne: "deleted" } } as never);
      return t ? JSON.parse(JSON.stringify(t)) : null;
    },
    [`tenant-${h}`],
    { tags: [tenantTag(h)], revalidate: 3600 }
  )();
}

/** প্ল্যাটফর্মের মূল ডোমেইনের লিংক (অ্যাডমিন প্যানেল)।
    টেন্যান্ট সাইট থেকে /admin-এ গেলে middleware মূল ডোমেইনে পাঠায়, তাই
    লিংকটি শুরু থেকেই সঠিক দেওয়া হয়। লোকালে পোর্ট (3000/3001) ধরে রাখা হয়,
    না হলে ডেমো চলাকালীন লিংক ভেঙে যেত। */
export async function platformUrl(path = "/") {
  const h = await headers();
  const hostHeader = h.get("host") || "";
  const bareHost = hostHeader.split(":")[0];
  const port = hostHeader.includes(":") ? `:${hostHeader.split(":")[1]}` : "";

  /* প্ল্যাটফর্মের হোস্ট ঠিক করা।

     আগে সরাসরি ROOT_DOMAIN বসানো হতো, আর সেটি না থাকলে ডিফল্ট "localhost"।
     ফলে Vercel-এ ROOT_DOMAIN সেট না থাকলে অ্যাডমিনের প্রতিটি লিংক হতো
     http://localhost/admin/login — দর্শকের ব্রাউজার নিজের ৮০ পোর্টে গিয়ে
     ERR_CONNECTION_REFUSED দেখাত।

     এখন ROOT_DOMAIN তখনই মানা হয় যখন বর্তমান হোস্ট সত্যিই তার অধীনে;
     নইলে চলমান অনুরোধের হোস্টই ব্যবহার হয়। তাই পরিবেশ-চলক ভুল থাকলেও
     লিংক অন্তত কাজ করে। */
  const configured = (process.env.ROOT_DOMAIN || "").trim().toLowerCase();
  const underRoot = configured && (bareHost === configured || bareHost.endsWith(`.${configured}`));
  const platformHost = underRoot ? configured : bareHost;

  const isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(platformHost) || platformHost.endsWith(".localhost");
  const proto = h.get("x-forwarded-proto") || (isLocalHost ? "http" : "https");

  return `${proto}://${platformHost}${port}${path}`;
}

export function hostsForTenant(t: { slug: string; customDomain?: string | null }) {
  const hosts = [`${t.slug}.${ROOT}`];
  if (t.customDomain) hosts.push(t.customDomain);
  return hosts;
}
