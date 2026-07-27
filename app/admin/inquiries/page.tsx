/* ভর্তি আবেদন ও কলব্যাক তালিকা
   এই পাতাটিই সাইটের ROI প্রমাণ করে: প্রধান শিক্ষক এখানে ঢুকে দেখেন
   ওয়েবসাইট থেকে কতজন অভিভাবক নিজে থেকে যোগাযোগ করেছেন। নবায়নের সময়
   এই সংখ্যাটাই সবচেয়ে বড় যুক্তি। */
import { requireAdmin } from "@/lib/admin-guard";
import { forTenant } from "@/lib/dal";
import { setInquiryStatus, deleteInquiry } from "@/actions/admin";
import { Card } from "@/components/ui";
import { bnDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Row = {
  _id: string; name: string; phone: string; studentClass?: string; message?: string;
  kind: string; status: string; createdAt: string;
};

const KIND: Record<string, string> = { admission: "ভর্তি আবেদন", callback: "কল ব্যাক", contact: "সাধারণ বার্তা" };
const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "নতুন", cls: "bg-blue-100 text-blue-800" },
  contacted: { label: "যোগাযোগ হয়েছে", cls: "bg-amber-100 text-amber-800" },
  closed: { label: "সম্পন্ন", cls: "bg-green-100 text-green-800" },
};

export default async function Inquiries() {
  const { tenantId } = await requireAdmin("inquiries");
  const list = await forTenant(tenantId).inquiries.list<Row>({}, { createdAt: -1 }, 200);

  const count = (s: string) => list.filter((i) => i.status === s).length;

  return (
    <div className="space-y-5 stagger">
      <div className="grid grid-cols-3 gap-4">
        {[["new", "নতুন"], ["contacted", "যোগাযোগ হয়েছে"], ["closed", "সম্পন্ন"]].map(([k, l]) => (
          <div key={k} className="bg-white rounded-xl border border-rule p-4 text-center">
            <p className="text-3xl font-bold text-ink">{count(k)}</p>
            <p className="text-sm text-ink-soft mt-1">{l}</p>
          </div>
        ))}
      </div>

      <Card title={`ওয়েবসাইট থেকে আসা আবেদন (${list.length})`}>
        {list.length === 0 && (
          <p className="text-ink-soft py-6 text-center">
            এখনো কোনো আবেদন আসেনি। সাইটে ভর্তি ফরম চালু আছে — অভিভাবক তথ্য দিলে এখানে দেখা যাবে।
          </p>
        )}
        <div className="divide-y divide-rule">
          {list.map((q) => (
            <div key={q._id} className="py-4 flex flex-wrap items-start gap-4">
              <div className="flex-1 min-w-[240px]">
                <p className="font-bold text-ink">
                  {q.name}
                  <a href={`tel:${q.phone}`} className="ml-3 font-semibold text-sky">{q.phone}</a>
                </p>
                <p className="text-sm text-ink-soft mt-0.5">
                  {KIND[q.kind] || q.kind}
                  {q.studentClass && ` · ${q.studentClass}`}
                  {` · ${bnDate(q.createdAt)}`}
                </p>
                {q.message && <p className="mt-1.5 text-sm text-ink">{q.message}</p>}
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS[q.status]?.cls || ""}`}>
                {STATUS[q.status]?.label || q.status}
              </span>

              <div className="flex gap-2">
                <a href={`tel:${q.phone}`} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-ink text-white">কল</a>
                <a href={`https://wa.me/88${q.phone}`} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ background: "#25D366" }}>
                  WhatsApp
                </a>
                {q.status !== "closed" && (
                  <form action={setInquiryStatus}>
                    <input type="hidden" name="id" value={q._id} />
                    <input type="hidden" name="status" value={q.status === "new" ? "contacted" : "closed"} />
                    <button className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-rule hover:bg-gray-50">
                      {q.status === "new" ? "যোগাযোগ হয়েছে" : "সম্পন্ন"}
                    </button>
                  </form>
                )}
                <form action={deleteInquiry}>
                  <input type="hidden" name="id" value={q._id} />
                  <button className="px-3 py-1.5 rounded-lg text-sm text-margin hover:bg-red-50">মুছুন</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
