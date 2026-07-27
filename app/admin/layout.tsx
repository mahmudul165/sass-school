/* অ্যাডমিন শেল — "দপ্তর"
   ------------------------------------------------------------------
   ডেস্কটপে বাঁয়ে গাঢ় সবুজ স্পাইন (খাতার মলাট), ডানে উষ্ণ কাগজে কাজের জায়গা।
   ফোনে উপরে সরু হেডার, নিচে আঙুলের নাগালে ট্যাব বার — কারণ প্রধান শিক্ষক
   বেশিরভাগ সময় ফোন থেকেই নোটিশ দেন, আর থাম্ব-জোনই সবচেয়ে সহজ নাগাল।
   একই মেনু দুই বিন্যাসে; কোনো ডুপ্লিকেট তালিকা নয়। */
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { can, type Feature } from "@/lib/permissions";
import { getDb, ObjectId } from "@/lib/db";
import { headers } from "next/headers";
import { AdminSidebar, AdminTabBar } from "@/components/admin/nav";
import { NavProgress } from "@/components/site/nav-progress";
import { NavRecovery } from "@/components/site/nav-recovery";

export const dynamic = "force-dynamic";

const MENU: { href: string; label: string; short: string; icon: string; feature: Feature }[] = [
  { href: "/admin", label: "সেটিংস", short: "সেটিংস", icon: "🏫", feature: "settings" },
  { href: "/admin/content", label: "একাডেমিক তথ্য", short: "একাডেমিক", icon: "📚", feature: "content" },
  { href: "/admin/notices", label: "নোটিশ", short: "নোটিশ", icon: "📢", feature: "notices" },
  { href: "/admin/events", label: "অনুষ্ঠান", short: "অনুষ্ঠান", icon: "📅", feature: "notices" },
  { href: "/admin/teachers", label: "শিক্ষক", short: "শিক্ষক", icon: "👩‍🏫", feature: "teachers" },
  { href: "/admin/results", label: "ফলাফল", short: "ফলাফল", icon: "🏆", feature: "results" },
  { href: "/admin/gallery", label: "গ্যালারি", short: "গ্যালারি", icon: "🖼️", feature: "gallery" },
  { href: "/admin/inquiries", label: "ভর্তি আবেদন", short: "আবেদন", icon: "📬", feature: "inquiries" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const session = await auth();

  /* সেশন না থাকলে শুধু পেজটুকু — কোনো শেল নয়, কোনো রিডাইরেক্টও নয়।
     আগে x-invoke-path হেডার দেখে "login পেজ কি না" বোঝার চেষ্টা ছিল; Next 15
     সেই হেডার আর পাঠায় না, ফলে লগইন পেজ নিজেই নিজের দিকে রিডাইরেক্ট করত।
     প্রতিটি সুরক্ষিত পেজ নিজেই পাহারা দেয়, তাই এখানে অনুমানের দরকার নেই। */
  if (!session) return <>{children}</>;

  const user = session.user as never as { tenantId: string; name?: string; permissions?: string[] };
  const tenantId = user.tenantId;
  const db = await getDb();
  const tenant = await db.collection("tenants").findOne({ _id: new ObjectId(tenantId) });
  const root = process.env.ROOT_DOMAIN || "localhost:3000";
  const isLocal = root === "localhost" || root.startsWith("127.");
  const host = h.get("host") || "";
  const port = isLocal && host.includes(":") ? `:${host.split(":")[1]}` : "";
  const siteUrl = tenant?.customDomain
    ? `https://${tenant.customDomain}`
    : `${isLocal ? "http" : "https"}://${tenant?.slug}.${root}${port}`;

  const newInquiries = await db.collection("inquiries")
    .countDocuments({ tenantId: new ObjectId(tenantId), status: "new" });

  // অনুমতি না থাকলে মেনুটিই দেখানো হয় না — না-খোলা দরজা ঠেলার চেয়ে দরজা না দেখাই ভালো
  const items = MENU.filter((m) => can(user.permissions, m.feature))
    .map((m) => ({ ...m, badge: m.href === "/admin/inquiries" ? newInquiries : undefined }));

  return (
    <div className="min-h-screen canvas-paper text-ink">
      {/* ── উপরের পট্টি — মলাটের রং ── */}
      <header className="spine spine-under sticky top-0 z-30 text-white">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 h-14 md:h-[60px] flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[15px] font-bold text-white/95"
            style={{ background: "linear-gradient(160deg, #b9852a, #7d560f)" }}>
            {tenant?.name?.[0] || "আ"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-bold truncate text-[15.5px] leading-tight">{tenant?.name}</p>
            <p className="text-[11.5px] text-white/45 truncate">
              {user.name || "অ্যাডমিন"} · {tenant?.slug}
            </p>
          </div>
          <a href={siteUrl} target="_blank" rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-[13.5px] px-3.5 h-9 rounded-lg font-semibold
                       bg-white/10 hover:bg-white/20 transition-colors">
            সাইট দেখুন ↗
          </a>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
            <button className="text-[13.5px] h-9 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              লগ আউট
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] md:flex md:gap-7 md:px-6">
        {/* ── স্পাইন (ডেস্কটপ) — হেডারের ধারাবাহিকতা ── */}
        <div className="hidden md:block relative">
          <div className="spine spine-edge absolute inset-y-0 -top-[60px] -left-6 w-[calc(100%+1.5rem)]" aria-hidden="true" />
          <div className="relative py-6">
            <AdminSidebar items={items}
              footer={
                <a href={siteUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-5 mx-3 flex items-center gap-2.5 rounded-lg px-3 h-10 text-[13.5px] font-semibold
                             text-white/55 hover:text-white hover:bg-white/[0.06] transition-colors">
                  <span aria-hidden="true">🌐</span> সাইট দেখুন ↗
                </a>
              } />
          </div>
        </div>

        {/* ── কাজের জায়গা ── */}
        <main className="flex-1 min-w-0 px-4 py-6 md:px-0 md:py-7 pb-24 md:pb-10">{children}</main>
      </div>

      <AdminTabBar items={items} />
      <NavProgress />
      <NavRecovery />
    </div>
  );
}
