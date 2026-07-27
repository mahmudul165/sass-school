import { requireAdmin } from "@/lib/admin-guard";
import { forTenant } from "@/lib/dal";
import type { Result } from "@/templates/types";
import { saveResult, deleteResult } from "@/actions/admin";
import { Field, Btn, Card, PageHead, Empty, Row } from "@/components/ui";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Results() {
  const { tenantId } = await requireAdmin("results");
  const results = await forTenant(tenantId).results.list<Result>();

  return (
    <div className="space-y-5 stagger">
      <PageHead
        title="ফলাফল"
        sub="এখানে প্রকাশিত ফল “ফলাফল” পেজে তালিকা ও অনুসন্ধানে দেখাবে।"
        action={<Btn href="/admin/content#chart" variant="outline" size="sm">চার্টের তথ্য</Btn>}
      />

      <Card title="ফলাফল প্রকাশ করুন">
        <form action={saveResult} className="grid md:grid-cols-2 gap-4">
          <Field label="পরীক্ষার নাম" name="examName" placeholder="বার্ষিক পরীক্ষা / এসএসসি" required />
          <Field label="সাল" name="year" placeholder="২০২৬" />
          <div className="md:col-span-2">
            <Field label="সারসংক্ষেপ" name="summary" placeholder="পাসের হার ৯৮% · জিপিএ-৫ প্রাপ্ত ১২ জন" />
          </div>
          <div className="md:col-span-2">
            <Field label="ফলাফল PDF লিংক (ঐচ্ছিক)" name="pdfUrl" placeholder="https://…"
              hint="দিলে শিক্ষার্থীরা রোল দিয়ে খুঁজে এই শিটটিই খুলতে পারবে।" />
          </div>
          <div className="md:col-span-2"><Btn type="submit">প্রকাশ করুন</Btn></div>
        </form>
      </Card>

      <Card title={`প্রকাশিত ফলাফল (${results.length})`}>
        {!results.length && <Empty icon="🏆" title="এখনও কোনো ফলাফল প্রকাশিত হয়নি" />}
        <div className="-mx-5 md:-mx-6 -mb-5 md:-mb-6">
          {results.map((r: Result) => (
            <Row key={r._id}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink">{r.examName}{r.year && <span className="text-ink-soft font-normal"> — {r.year}</span>}</p>
                {r.summary && <p className="mt-0.5 text-[13.5px] text-ink-soft">{r.summary}</p>}
              </div>
              <form action={deleteResult} className="shrink-0">
                <input type="hidden" name="id" value={r._id} />
                <Btn type="submit" size="sm" danger>মুছুন</Btn>
              </form>
            </Row>
          ))}
        </div>
      </Card>
    </div>
  );
}
