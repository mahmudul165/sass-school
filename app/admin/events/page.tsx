/* অনুষ্ঠান ও কার্যক্রম — সাইটের /events পেজ ও হোমপেজের "আসন্ন অনুষ্ঠান"।
   নোটিশের মতোই ঘোষণা-ধর্মী কাজ, তাই একই অনুমতির (notices) আওতায়। */
import { requireAdmin } from "@/lib/admin-guard";
import { forTenant } from "@/lib/dal";
import type { EventDoc } from "@/templates/types";
import { saveEvent, deleteEvent } from "@/actions/admin";
import { Field, Btn, Card, PageHead, Empty, Row, Badge } from "@/components/ui";
import { ImageField } from "@/components/admin/image-field";
import { bnDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Events() {
  const { tenantId } = await requireAdmin("notices");
  const events = await forTenant(tenantId).events.list<EventDoc>({}, { date: 1 }, 100);
  const now = Date.now();

  return (
    <div className="space-y-5 stagger">
      <PageHead title="অনুষ্ঠান" sub="আসন্ন অনুষ্ঠান হোমপেজে ও “অনুষ্ঠান” পেজে দেখাবে; তারিখ পেরোলে নিজে থেকেই “সম্পন্ন” অংশে চলে যাবে।" />

      <Card title="নতুন অনুষ্ঠান">
        <form action={saveEvent} className="grid md:grid-cols-2 gap-4">
          <Field label="অনুষ্ঠানের নাম" name="title" placeholder="বার্ষিক ক্রীড়া প্রতিযোগিতা" required />
          <Field label="তারিখ" name="date" type="date" required />
          <Field label="সময়" name="time" placeholder="সকাল ৯:০০" />
          <Field label="স্থান" name="venue" placeholder="প্রতিষ্ঠান মাঠ" />
          <div className="md:col-span-2">
            <Field textarea rows={3} label="বিবরণ" name="desc"
              placeholder="সকল শ্রেণির শিক্ষার্থীদের অংশগ্রহণে দিনব্যাপী ক্রীড়া প্রতিযোগিতা ও পুরস্কার বিতরণী।" />
          </div>
          <div className="md:col-span-2">
            <ImageField name="image" label="ছবি (ঐচ্ছিক)" filter="event" />
          </div>
          <div className="md:col-span-2"><Btn type="submit">যোগ করুন</Btn></div>
        </form>
      </Card>

      <Card title={`অনুষ্ঠানের তালিকা (${events.length})`}>
        {!events.length && <Empty icon="📅" title="এখনও কোনো অনুষ্ঠান যোগ করা হয়নি" sub="উপরের ফর্ম থেকে প্রথমটি যোগ করুন।" />}
        <div className="-mx-5 md:-mx-7 -mb-5 md:-mb-7">
          {events.map((e: EventDoc) => {
            const upcoming = new Date(e.date).getTime() >= now - 864e5;
            return (
              <Row key={e._id}>
                <span className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-[#efeadf] grid place-items-center">
                  {e.image
                    ? <img src={e.image} alt="" className="h-full w-full object-cover" />
                    : <span aria-hidden="true">📅</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink flex flex-wrap items-center gap-2">
                    <span className="truncate">{e.title}</span>
                    {upcoming ? <Badge tone="good">আসন্ন</Badge> : <Badge>সম্পন্ন</Badge>}
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-soft">
                    {bnDate(e.date)}{e.time ? ` · ${e.time}` : ""}{e.venue ? ` · ${e.venue}` : ""}
                  </p>
                </div>
                <form action={deleteEvent} className="shrink-0">
                  <input type="hidden" name="id" value={e._id} />
                  <Btn type="submit" size="sm" danger>মুছুন</Btn>
                </form>
              </Row>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
