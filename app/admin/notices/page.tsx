import { requireAdmin } from "@/lib/admin-guard";
import { forTenant } from "@/lib/dal";
import type { Notice } from "@/templates/types";
import { saveNotice, deleteNotice } from "@/actions/admin";
import { Field, Toggle, Btn, Card, PageHead, Empty, Row, Badge } from "@/components/ui";
import { bnDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Notices() {
  const { tenantId } = await requireAdmin("notices");
  const notices = await forTenant(tenantId).notices.list<Notice>({}, { createdAt: -1 }, 100);

  return (
    <div className="space-y-5 stagger">
      <PageHead title="নোটিশ" sub="প্রকাশ করার সাথে সাথেই সাইটের নোটিশ বোর্ডে ও উপরের চলন্ত পট্টিতে দেখাবে।" />

      <Card title="নতুন নোটিশ প্রকাশ করুন">
        <form action={saveNotice} className="space-y-4">
          <Field label="শিরোনাম" name="title" placeholder="যেমন: বার্ষিক পরীক্ষার সময়সূচি" required />
          <Field textarea label="বিস্তারিত (ঐচ্ছিক)" name="body" hint="খালি রাখলে শুধু শিরোনামটুকুই দেখাবে।" />
          <Field label="সংযুক্তি PDF/ছবির লিংক (ঐচ্ছিক)" name="attachmentUrl" placeholder="https://…" />
          <Toggle label="উপরে পিন করুন" name="pinned" hint="পিন করা নোটিশ তালিকার সবার উপরে ★ চিহ্নসহ থাকে।" />
          <Btn type="submit">প্রকাশ করুন</Btn>
        </form>
      </Card>

      <Card title={`প্রকাশিত নোটিশ (${notices.length})`}>
        {!notices.length && <Empty icon="📢" title="এখনও কোনো নোটিশ নেই" sub="উপরের ফর্ম থেকে প্রথমটি প্রকাশ করুন।" />}
        <div className="-mx-5 md:-mx-6 -mb-5 md:-mb-6">
          {notices.map((n: Notice) => (
            <Row key={n._id}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink flex items-center gap-2 flex-wrap">
                  {n.pinned && <Badge tone="warn">পিন করা</Badge>}
                  <span className="truncate">{n.title}</span>
                </p>
                <p className="mt-0.5 text-[13px] text-ink-soft">{bnDate(n.createdAt)}</p>
              </div>
              <form action={deleteNotice} className="shrink-0">
                <input type="hidden" name="id" value={n._id} />
                <Btn type="submit" size="sm" danger>মুছুন</Btn>
              </form>
            </Row>
          ))}
        </div>
      </Card>
    </div>
  );
}
