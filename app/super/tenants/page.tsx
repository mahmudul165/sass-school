import { getDb } from "@/lib/db";
import { isSuper } from "@/lib/super";
import { createTenant, updateBilling, setCustomDomain, resetAdminLogin, deleteTenant, clearTenantData } from "@/actions/super";
import { Field, Select, Btn, Card, PageHead, Stat, Badge, Empty } from "@/components/ui";
import { templateOptions } from "@/templates/registry";
import { redirect } from "next/navigation";
import { bnDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPES = [
  { value: "school", label: "স্কুল (বাংলা মিডিয়াম)" },
  { value: "english_medium", label: "ইংলিশ মিডিয়াম / ইংরেজি ভার্সন" },
  { value: "college", label: "কলেজ / উচ্চ মাধ্যমিক" },
  { value: "madrasah", label: "মাদরাসা" },
  { value: "kindergarten", label: "কিন্ডারগার্টেন" },
  { value: "coaching", label: "কোচিং / ভর্তি কোচিং" },
];

const STATUS: Record<string, { label: string; tone: "good" | "warn" | "bad" }> = {
  active: { label: "সচল", tone: "good" },
  grace: { label: "গ্রেস", tone: "warn" },
  suspended: { label: "স্থগিত", tone: "bad" },
};

export default async function Tenants({ searchParams }: {
  searchParams: Promise<{
    created?: string; u?: string; p?: string; reset?: string; e?: string;
    t?: string; purged?: string; cleared?: string;
  }>;
}) {
  if (!(await isSuper())) redirect("/super/login");
  const { created, u, p, reset, e, t: eSlug, purged, cleared } = await searchParams;
  const db = await getDb();
  const tenants = await db.collection("tenants").find().sort({ createdAt: -1 }).toArray();
  const admins = await db.collection("users").find({ role: "admin" }).toArray();
  const adminOf = new Map(admins.map((a) => [String(a.tenantId), a]));
  const root = process.env.ROOT_DOMAIN || "localhost:3000";
  const isLocal = root === "localhost" || root.startsWith("127.");
  const proto = isLocal ? "http" : "https";
  const siteOf = (slug: string) => `${proto}://${slug}.${root}${isLocal ? ":3000" : ""}`;
  const today = new Date().toISOString().slice(0, 10);

  const overdueCount = tenants.filter((t) => t.plan?.renewalDate && t.plan.renewalDate < today).length;
  const activeCount = tenants.filter((t) => t.status === "active").length;
  const yearly = tenants.reduce((s, t) => s + (t.plan?.amountYearly || 0), 0);

  return (
    <>
      <PageHead title="প্রতিষ্ঠানসমূহ" sub="সাইট তৈরি, বিলিং ও ডোমেইন — সব এক জায়গায়।" />

      {e === "username" && (
        <p className="mb-5 rounded-xl bg-[#f9e9e7] text-margin px-4 py-3.5 text-[14.5px] font-semibold" role="alert">
          এই ইউজারনেমটি আগে থেকেই ব্যবহৃত — অন্য একটি দিন।
        </p>
      )}
      {e === "confirm" && (
        <p className="mb-5 rounded-xl bg-[#f9e9e7] text-margin px-4 py-3.5 text-[14.5px] font-bold" role="alert">
          নিশ্চিতকরণ মেলেনি — কিছুই মোছা হয়নি।{" "}
          {eSlug && <>ঘরটিতে হুবহু <code className="bg-white/70 px-1.5 py-0.5 rounded">{eSlug}</code> লিখুন।</>}
        </p>
      )}
      {(purged || cleared) && (
        <p className="mb-5 rounded-xl bg-[#e9f1ec] text-[#1f5b48] px-4 py-3.5 text-[14.5px] font-bold" role="status">
          {purged
            ? <>✓ “{purged}” এবং তার সব তথ্য ও অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা হয়েছে।</>
            : <>✓ “{cleared}” প্রতিষ্ঠানের সব কনটেন্ট মুছে খালি করা হয়েছে — লগইন অক্ষত আছে।</>}
        </p>
      )}

      {(created || reset) && (
        <div className="mb-5 rounded-xl bg-[#e9f1ec] text-[#1f5b48] px-4 py-3.5 text-[14.5px] space-y-2">
          {created && (
            <p>
              ✓ সাইট লাইভ! ডেমো লিংক:{" "}
              <a className="font-bold underline" href={siteOf(created)} target="_blank" rel="noopener noreferrer">
                {created}.{root}
              </a>{" "}
              — এখনই প্রধান শিক্ষককে দেখান।
            </p>
          )}
          {u && p && (
            <p className="font-semibold">
              অ্যাডমিন লগইন — ইউজারনেম: <code className="bg-white/70 px-2 py-0.5 rounded">{u}</code>{" "}
              পাসওয়ার্ড: <code className="bg-white/70 px-2 py-0.5 rounded">{p}</code>
              <span className="block mt-1 font-normal text-[13px]">
                পাসওয়ার্ডটি এখনই ক্লায়েন্টকে দিয়ে দিন — এটি আর দেখানো হবে না।
              </span>
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="মোট প্রতিষ্ঠান" value={tenants.length} />
        <Stat label="সচল" value={activeCount} tone="good" />
        <Stat label="রিনিউয়াল বাকি" value={overdueCount} tone={overdueCount ? "bad" : "neutral"} />
        <Stat label="বার্ষিক আয় (৳)" value={yearly.toLocaleString("en-US")} hint="সব প্রতিষ্ঠানের বার্ষিক ফি মিলিয়ে" />
      </div>

      <div className="space-y-5 stagger">
        <Card title="⚡ ৫ মিনিটে নতুন সাইট" desc="নাম, ধরন ও অ্যাডমিনের মোবাইল — এটুকুই। বাকি সব ডিফল্ট বসে যাবে।">
          <form action={createTenant} className="grid md:grid-cols-3 gap-4">
            <Field label="প্রতিষ্ঠানের নাম" name="name" placeholder="ঢাকা আদর্শ উচ্চ বিদ্যালয়" required />
            <Select label="ধরন" name="type" options={TYPES}
              hint="ধরন অনুযায়ী অফিসিয়াল টেমপ্লেট, রঙ ও বাংলা কনটেন্ট আপনাআপনি বসবে।" />
            <Field label="অ্যাডমিনের মোবাইল" name="adminPhone" placeholder="01XXXXXXXXX"
              hint="সাইটের যোগাযোগ ও WhatsApp বোতামে বসবে।" />
            <Field label="অ্যাডমিন ইউজারনেম" name="adminUsername" placeholder="dhaka-adarsha"
              hint="না দিলে সাবডোমেইনটিই ইউজারনেম হবে।" />
            <Field label="অ্যাডমিন পাসওয়ার্ড" name="adminPassword" placeholder="খালি রাখলে তৈরি হয়ে যাবে"
              hint="তৈরির পর একবারই দেখানো হবে — তখনই ক্লায়েন্টকে দিন।" />
            <Field label="ঠিকানা (ঐচ্ছিক)" name="address" />
            <Field label="সাবডোমেইন (ঐচ্ছিক)" name="slug" placeholder="dhaka-adarsha"
              hint="না দিলে নাম থেকে তৈরি হবে।" />
            <Field label="বার্ষিক ফি (৳)" name="amountYearly" type="number" defaultValue="5000" />
            <div className="md:col-span-3"><Btn type="submit">সাইট তৈরি করুন</Btn></div>
          </form>
        </Card>

        <Card title="অফিসিয়াল টেমপ্লেট" desc="প্রতিটি প্রতিষ্ঠান নিজের অ্যাডমিন প্যানেল থেকেও টেমপ্লেট বদলাতে পারে।">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templateOptions.map((o) => (
              <div key={o.key} className="rounded-xl border border-rule bg-[#fcfaf5] p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="h-6 w-6 rounded-md shrink-0" style={{ background: o.primary }} />
                  <span className="h-6 w-6 rounded-md shrink-0" style={{ background: o.secondary }} />
                  <code className="ms-auto text-[11.5px] text-ink-soft">{o.key}</code>
                </div>
                <p className="font-bold text-ink text-[14.5px] leading-snug">{o.label}</p>
                <p className="mt-1.5 text-[13px] text-ink-soft leading-relaxed">{o.blurb}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title={`সব প্রতিষ্ঠান (${tenants.length})`}>
          {!tenants.length && <Empty icon="🏫" title="এখনো কোনো প্রতিষ্ঠান নেই" sub="উপরের ফর্ম থেকে প্রথম সাইটটি তৈরি করুন।" />}

          <div className="space-y-4">
            {tenants.map((t) => {
              const overdue = t.plan?.renewalDate && t.plan.renewalDate < today;
              const st = STATUS[t.status] || STATUS.active;
              return (
                <div key={String(t._id)} className="rounded-xl border border-rule bg-paper p-4 md:p-5">
                  <div className="flex flex-wrap items-start gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-ink text-[16.5px]">{t.name}</p>
                        <Badge tone={st.tone}>{st.label}</Badge>
                        <Badge>{t.type}</Badge>
                        {t.plan?.setupPaid ? <Badge tone="good">সেটআপ পেইড</Badge> : <Badge tone="warn">সেটআপ বাকি</Badge>}
                      </div>
                      <p className="mt-1.5 text-[13.5px]">
                        <a className="text-sky font-semibold hover:underline" href={siteOf(t.slug)} target="_blank" rel="noopener noreferrer">
                          {t.slug}.{root}
                        </a>
                        {t.customDomain && (
                          <> · <a className="text-sky font-semibold hover:underline" href={`https://${t.customDomain}`} target="_blank" rel="noopener noreferrer">{t.customDomain}</a></>
                        )}
                      </p>
                      <p className="mt-1 text-[12.5px] text-ink-soft">
                        তৈরি: {bnDate(t.createdAt)} · অ্যাডমিন ইউজারনেম:{" "}
                        <code>{adminOf.get(String(t._id))?.username || "—"}</code> · টেমপ্লেট: <code>{t.template}</code>
                      </p>
                      {overdue && (
                        <p className="mt-2 text-[13px] font-bold text-margin">
                          ⚠ রিনিউয়াল বাকি ({t.plan.renewalDate}) — WhatsApp-এ নক করুন
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
                    <form action={updateBilling} className="rounded-lg border border-rule bg-[#fcfaf5] p-3.5">
                      <input type="hidden" name="id" value={String(t._id)} />
                      <p className="text-[12.5px] font-bold text-ink-soft mb-2.5">বিলিং</p>
                      <div className="flex flex-wrap items-end gap-3">
                        <label className="flex items-center gap-2 text-[13.5px] font-semibold text-ink min-h-[42px]">
                          <input type="checkbox" name="setupPaid" defaultChecked={t.plan?.setupPaid} className="h-5 w-5 accent-[color:var(--color-brass)]" />
                          সেটআপ পেইড
                        </label>
                        <label className="block">
                          <span className="block text-[12px] text-ink-soft mb-1">রিনিউয়াল তারিখ</span>
                          <input type="date" name="renewalDate" defaultValue={t.plan?.renewalDate}
                            className="min-h-[42px] rounded-lg border border-rule bg-paper px-2.5 text-[14px]" />
                        </label>
                        <label className="block">
                          <span className="block text-[12px] text-ink-soft mb-1">৳/বছর</span>
                          <input type="number" name="amountYearly" defaultValue={t.plan?.amountYearly || 5000}
                            className="w-24 min-h-[42px] rounded-lg border border-rule bg-paper px-2.5 text-[14px] tabular-nums" />
                        </label>
                        <label className="block">
                          <span className="block text-[12px] text-ink-soft mb-1">স্ট্যাটাস</span>
                          <select name="status" defaultValue={t.status}
                            className="min-h-[42px] rounded-lg border border-rule bg-paper px-2.5 text-[14px]">
                            <option value="active">সচল</option>
                            <option value="grace">গ্রেস</option>
                            <option value="suspended">স্থগিত</option>
                          </select>
                        </label>
                        <Btn type="submit" size="sm">আপডেট</Btn>
                      </div>
                    </form>

                    <div className="space-y-3">
                      <form action={setCustomDomain} className="rounded-lg border border-rule bg-[#fcfaf5] p-3.5">
                        <input type="hidden" name="id" value={String(t._id)} />
                        <p className="text-[12.5px] font-bold text-ink-soft mb-2.5">কাস্টম ডোমেইন</p>
                        <div className="flex items-end gap-2">
                          <label className="block flex-1">
                            <input name="customDomain" defaultValue={t.customDomain || ""} placeholder="school.edu.bd"
                              className="w-full min-h-[42px] rounded-lg border border-rule bg-paper px-2.5 text-[14px]" />
                          </label>
                          <Btn type="submit" size="sm" variant="outline">ম্যাপ</Btn>
                        </div>
                      </form>

                      {/* ইনপুটগুলো নিজেদের সারিতে — পাশাপাশি রাখলে সরু কলামে
                          প্লেসহোল্ডার ও লেখা কেটে যেত ("নতুন পাসওয়ার্ড (ঐ") */}
                      <form action={resetAdminLogin} className="rounded-lg border border-rule bg-[#fcfaf5] p-3.5">
                        <input type="hidden" name="id" value={String(t._id)} />
                        <p className="text-[12.5px] font-bold text-ink-soft mb-2.5">অ্যাডমিন লগইন ঠিক করুন</p>
                        <div className="space-y-2">
                          <label className="block">
                            <span className="block text-[12px] text-ink-soft mb-1">ইউজারনেম</span>
                            <input name="username" defaultValue={adminOf.get(String(t._id))?.username || t.slug}
                              className="w-full min-h-[42px] rounded-lg border border-rule bg-paper px-2.5 text-[14px]" />
                          </label>
                          <label className="block">
                            <span className="block text-[12px] text-ink-soft mb-1">নতুন পাসওয়ার্ড (ঐচ্ছিক)</span>
                            <input name="password" placeholder="খালি রাখলে বদলাবে না"
                              className="w-full min-h-[42px] rounded-lg border border-rule bg-paper px-2.5 text-[14px]" />
                          </label>
                          <Btn type="submit" size="sm" variant="outline">সেট করুন</Btn>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* ── বিপজ্জনক অংশ — ভাঁজ করা, যাতে ভুল ক্লিকে খুলে না যায় ── */}
                  <details className="mt-4 rounded-lg border border-margin/25 bg-[#fdf4f3] overflow-hidden">
                    <summary className="cursor-pointer list-none marker:hidden px-3.5 py-2.5 text-[12.5px] font-bold text-margin
                                        hover:bg-margin/[0.06] transition-colors">
                      ⚠ তথ্য মুছে ফেলা — সাবধানে
                    </summary>
                    <div className="p-3.5 pt-1 grid md:grid-cols-2 gap-3">
                      <form action={clearTenantData} className="rounded-lg border border-rule bg-paper p-3">
                        <input type="hidden" name="id" value={String(t._id)} />
                        <p className="text-[13px] font-bold text-ink">সব কনটেন্ট মুছে খালি করুন</p>
                        <p className="mt-1 text-[12.5px] text-ink-soft leading-relaxed">
                          নোটিশ, শিক্ষক, ফলাফল, গ্যালারি, অনুষ্ঠান ও আবেদন মুছে যাবে।
                          প্রতিষ্ঠান ও অ্যাডমিন লগইন থেকে যাবে।
                        </p>
                        <input name="confirm" placeholder={`নিশ্চিত করতে লিখুন: ${t.slug}`} required
                          className="mt-2.5 w-full min-h-[40px] rounded-lg border border-rule bg-[#fdfcf9] px-2.5 text-[13.5px]" />
                        <Btn type="submit" size="sm" danger className="mt-2.5">খালি করুন</Btn>
                      </form>

                      <form action={deleteTenant} className="rounded-lg border border-margin/30 bg-paper p-3">
                        <input type="hidden" name="id" value={String(t._id)} />
                        <p className="text-[13px] font-bold text-margin">প্রতিষ্ঠানটি সম্পূর্ণ মুছে ফেলুন</p>
                        <p className="mt-1 text-[12.5px] text-ink-soft leading-relaxed">
                          সাইট, সব তথ্য এবং সব অ্যাডমিন অ্যাকাউন্ট চিরতরে মুছে যাবে।
                          এটি ফেরানো যাবে না।
                        </p>
                        <input name="confirm" placeholder={`নিশ্চিত করতে লিখুন: ${t.slug}`} required
                          className="mt-2.5 w-full min-h-[40px] rounded-lg border border-margin/30 bg-[#fdfcf9] px-2.5 text-[13.5px]" />
                        <Btn type="submit" size="sm" danger className="mt-2.5">চিরতরে মুছুন</Btn>
                      </form>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="কাস্টম ডোমেইনের DNS নির্দেশনা" desc="ক্লায়েন্টকে হুবহু এই দুটি রেকর্ড পাঠান।">
          <div className="overflow-x-auto rounded-lg border border-rule">
            <table className="w-full text-[14px] min-w-[420px]">
              <thead>
                <tr className="bg-[#efeadf] text-left text-[12.5px] font-bold text-ink-soft">
                  <th className="px-3 py-2">Record</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Value</th>
                </tr>
              </thead>
              <tbody className="font-mono text-ink">
                <tr className="border-t border-rule"><td className="px-3 py-2">A</td><td className="px-3 py-2">@</td><td className="px-3 py-2">76.76.21.21</td></tr>
                <tr className="border-t border-rule"><td className="px-3 py-2">CNAME</td><td className="px-3 py-2">www</td><td className="px-3 py-2">cname.vercel-dns.com</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] text-ink-soft leading-relaxed">
            Cloudflare হলে অবশ্যই DNS-only (ধূসর মেঘ) — proxy চালু থাকলে SSL সার্টিফিকেট ইস্যু হবে না।
          </p>
        </Card>
      </div>
    </>
  );
}
