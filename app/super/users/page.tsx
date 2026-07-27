/* অ্যাডমিন ব্যবহারকারী ও অনুমতি
   সুপার অ্যাডমিন এখান থেকে প্রতিটি প্রতিষ্ঠানের জন্য অ্যাকাউন্ট খোলেন এবং
   কে কোন অংশ বদলাতে পারবেন তা ঠিক করে দেন। */
import { getDb } from "@/lib/db";
import { isSuper } from "@/lib/super";
import { createAdminUser, updateAdminUser, deleteAdminUser } from "@/actions/super";
import { Field, Select, Btn, Card, PageHead, Empty, Badge } from "@/components/ui";
import { FEATURES } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { bnDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

function PermissionBoxes({ checked }: { checked?: string[] }) {
  const all = !checked || checked.length === 0;
  return (
    <fieldset className="mt-1">
      <legend className="text-[13px] font-semibold text-ink-soft mb-2">অনুমতি</legend>
      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
        {FEATURES.map((f) => (
          <label key={f.key} className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" name="permissions" value={f.key}
              defaultChecked={all || checked!.includes(f.key)}
              className="mt-1 h-4.5 w-4.5 shrink-0 accent-[color:var(--color-brass)]" style={{ height: 18, width: 18 }} />
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-ink leading-tight">{f.icon} {f.label}</span>
              <span className="block text-[12.5px] text-ink-soft leading-snug">{f.desc}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="mt-2 text-[12.5px] text-ink-soft">একটিও টিক না দিলে সব অনুমতি ধরা হবে।</p>
    </fieldset>
  );
}

export default async function Users({ searchParams }: {
  searchParams: Promise<{ created?: string; saved?: string; reset?: string; deleted?: string; e?: string; u?: string; p?: string }>;
}) {
  if (!(await isSuper())) redirect("/super/login");
  const { created, saved, reset, deleted, e, u, p } = await searchParams;
  const db = await getDb();
  const [tenants, users] = await Promise.all([
    db.collection("tenants").find().sort({ name: 1 }).toArray(),
    db.collection("users").find().sort({ createdAt: -1 }).toArray(),
  ]);
  const tenantName = new Map(tenants.map((t) => [String(t._id), t.name as string]));

  return (
    <>
      <PageHead title="অ্যাডমিন ব্যবহারকারী" sub="কে কোন প্রতিষ্ঠানের কোন অংশ বদলাতে পারবেন — সব এখানেই।"
        action={<Btn href="/super/tenants" variant="outline" size="sm">প্রতিষ্ঠানসমূহ</Btn>} />

      {e === "username" && (
        <p className="mb-5 rounded-xl bg-[#f9e9e7] text-margin px-4 py-3.5 text-[14.5px] font-semibold" role="alert">
          ইউজারনেমটি ভুল বা আগে থেকেই ব্যবহৃত — অন্য একটি দিন।
        </p>
      )}
      {(created || saved || reset || deleted) && (
        <div className="mb-5 rounded-xl bg-[#e9f1ec] text-[#1f5b48] px-4 py-3.5 text-[14.5px]">
          {created && <p>✓ অ্যাকাউন্ট তৈরি হয়েছে।</p>}
          {saved && <p>✓ অনুমতি সংরক্ষণ হয়েছে।</p>}
          {deleted && <p>✓ অ্যাকাউন্ট মুছে ফেলা হয়েছে।</p>}
          {(created || reset) && p && (
            <p className="mt-1 font-semibold">
              {u && <>ইউজারনেম: <code className="bg-white/70 px-2 py-0.5 rounded">{u}</code>{" "}</>}
              পাসওয়ার্ড: <code className="bg-white/70 px-2 py-0.5 rounded">{p}</code>
              <span className="block mt-1 font-normal text-[13px]">এখনই ক্লায়েন্টকে দিয়ে দিন — আর দেখানো হবে না।</span>
            </p>
          )}
        </div>
      )}

      <div className="space-y-5 stagger">
        <Card title="নতুন অ্যাডমিন অ্যাকাউন্ট" desc="প্রতিষ্ঠান বেছে নিন, ইউজারনেম দিন, আর কোন কোন অংশ খুলে দেবেন তা টিক দিন।">
          <form action={createAdminUser} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Select label="প্রতিষ্ঠান" name="tenantId"
                options={tenants.map((t) => ({ value: String(t._id), label: t.name as string }))} />
              <Field label="নাম" name="name" placeholder="মোঃ আব্দুল করিম" />
              <Field label="ইউজারনেম" name="username" placeholder="karim-sir" required
                hint="ছোট হাতের অক্ষর, সংখ্যা ও - . _ চলবে।" />
              <Field label="পাসওয়ার্ড" name="password" placeholder="খালি রাখলে তৈরি হয়ে যাবে" />
              <Field label="মোবাইল (ঐচ্ছিক)" name="phone" placeholder="01XXXXXXXXX" />
            </div>
            <PermissionBoxes />
            <Btn type="submit">অ্যাকাউন্ট তৈরি করুন</Btn>
          </form>
        </Card>

        <Card title={`সব অ্যাকাউন্ট (${users.length})`}>
          {!users.length && <Empty icon="👤" title="এখনো কোনো অ্যাডমিন অ্যাকাউন্ট নেই" />}
          <div className="space-y-4">
            {users.map((usr) => {
              const perms = (usr.permissions as string[]) || [];
              const all = perms.length === 0;
              return (
                <details key={String(usr._id)} className="rounded-xl border border-rule bg-paper overflow-hidden">
                  <summary className="flex flex-wrap items-center gap-2 p-4 cursor-pointer list-none marker:hidden hover:bg-[#fcfaf5]">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink">
                        <code className="text-[14px]">{usr.username || "—"}</code>
                        {usr.name && <span className="ms-2 font-normal text-ink-soft text-[14px]">{usr.name}</span>}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-ink-soft">
                        {tenantName.get(String(usr.tenantId)) || "প্রতিষ্ঠান নেই"}
                        {usr.createdAt ? ` · ${bnDate(usr.createdAt as Date)}` : ""}
                      </p>
                    </div>
                    {all
                      ? <Badge tone="good">সব অনুমতি</Badge>
                      : <Badge tone="info">{perms.length} টি অনুমতি</Badge>}
                    <span className="text-ink-soft text-[13px]">বদলান ▾</span>
                  </summary>

                  <div className="border-t border-rule p-4 bg-[#fcfaf5]">
                    <form action={updateAdminUser} className="space-y-4">
                      <input type="hidden" name="id" value={String(usr._id)} />
                      <div className="grid md:grid-cols-2 gap-4">
                        <Field label="নাম" name="name" defaultValue={usr.name as string} />
                        <Field label="নতুন পাসওয়ার্ড" name="password" placeholder="বদলাতে না চাইলে খালি রাখুন" />
                      </div>
                      <PermissionBoxes checked={perms} />
                      <div className="flex flex-wrap gap-2.5">
                        <Btn type="submit" size="sm">সংরক্ষণ করুন</Btn>
                      </div>
                    </form>

                    <form action={deleteAdminUser} className="mt-3 pt-3 border-t border-rule">
                      <input type="hidden" name="id" value={String(usr._id)} />
                      <Btn type="submit" size="sm" danger>এই অ্যাকাউন্টটি মুছে ফেলুন</Btn>
                    </form>
                  </div>
                </details>
              );
            })}
          </div>
        </Card>

        <Card title="অ্যাডমিন কী কী করতে পারেন">
          <ul className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <li key={f.key} className="rounded-xl border border-rule bg-[#fcfaf5] p-3.5">
                <p className="font-bold text-ink text-[14.5px]">{f.icon} {f.label}</p>
                <p className="mt-1 text-[13px] text-ink-soft leading-relaxed">{f.desc}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] text-ink-soft leading-relaxed">
            অনুমতি না থাকলে সেই মেনুটি অ্যাডমিন প্যানেলে দেখাই যায় না, এবং সরাসরি ঠিকানা দিয়ে
            ঢুকতে চাইলেও সার্ভার তা আটকে দেয়।{" "}
            <Link href="/super/tenants" className="text-sky font-semibold hover:underline">প্রতিষ্ঠান তালিকায় ফিরুন</Link>
          </p>
        </Card>
      </div>
    </>
  );
}
