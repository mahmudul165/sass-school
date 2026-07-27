/* অনুমতি নেই — নরম ও স্পষ্ট বার্তা।
   ৪০৩ পাতা দেখিয়ে ছেড়ে দিলে ব্যবহারকারী বুঝতে পারেন না কী করবেন;
   তাই কোন ফিচার, কেন বন্ধ, আর কার সাথে কথা বলতে হবে — তিনটিই বলা হয়। */
import { requireAdmin } from "@/lib/admin-guard";
import { FEATURES } from "@/lib/permissions";
import { Card, Btn, PageHead } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Denied({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { permissions } = await requireAdmin();
  const { f } = await searchParams;
  const feature = FEATURES.find((x) => x.key === f);
  const allowed = FEATURES.filter((x) => !permissions.length || permissions.includes(x.key));

  return (
    <div className="max-w-2xl">
      <PageHead title="এই অংশে আপনার অনুমতি নেই" />
      <Card>
        <p className="text-[15.5px] text-ink leading-relaxed">
          {feature
            ? <>“<b>{feature.label}</b>” অংশটি আপনার অ্যাকাউন্টের জন্য খোলা নেই।</>
            : <>এই অংশটি আপনার অ্যাকাউন্টের জন্য খোলা নেই।</>}
        </p>
        <p className="mt-2 text-[14px] text-ink-soft leading-relaxed">
          প্রয়োজন হলে প্রতিষ্ঠানের ওয়েবসাইট সরবরাহকারীকে বলুন — তিনি সুপার প্যানেল থেকে
          আপনার অনুমতি বাড়িয়ে দিতে পারবেন।
        </p>

        {allowed.length > 0 && (
          <div className="mt-5 pt-5 border-t border-rule">
            <p className="text-[13px] font-bold text-ink-soft mb-2.5">আপনি যা যা করতে পারেন</p>
            <ul className="flex flex-wrap gap-2">
              {allowed.map((a) => (
                <li key={a.key} className="rounded-lg bg-[#efeadf] px-3 py-1.5 text-[13.5px] font-semibold text-ink-soft">
                  {a.icon} {a.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <Btn href={allowed[0]?.key === "settings" ? "/admin" : `/admin/${allowed[0]?.key || ""}`}>
            ফিরে যান
          </Btn>
        </div>
      </Card>
    </div>
  );
}
