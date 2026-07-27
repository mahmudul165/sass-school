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
  let port = "";
  if (IS_LOCAL) {
    const host = (await headers()).get("host") || "";
    port = host.includes(":") ? `:${host.split(":")[1]}` : "";
  }
  return `${IS_LOCAL ? "http" : "https"}://${ROOT}${port}${path}`;
}

export function hostsForTenant(t: { slug: string; customDomain?: string | null }) {
  const hosts = [`${t.slug}.${ROOT}`];
  if (t.customDomain) hosts.push(t.customDomain);
  return hosts;
}
