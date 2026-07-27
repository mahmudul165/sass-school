import { requireAdmin } from "@/lib/admin-guard";
import { forTenant } from "@/lib/dal";
import type { Teacher } from "@/templates/types";
import { saveTeacher, deleteTeacher } from "@/actions/admin";
import { Field, Btn, Card, PageHead, Empty, Row } from "@/components/ui";
import { ImageField } from "@/components/admin/image-field";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Teachers() {
  const { tenantId } = await requireAdmin("teachers");
  const teachers = await forTenant(tenantId).teachers.list<Teacher>({}, { order: 1 });

  return (
    <div className="space-y-5 stagger">
      <PageHead title="শিক্ষকবৃন্দ" sub="সাইটের “শিক্ষকবৃন্দ” পেজ ও হোমপেজের শিক্ষক অংশে দেখাবে।" />

      <Card title="নতুন শিক্ষক যোগ করুন">
        <form action={saveTeacher} className="grid md:grid-cols-2 gap-4">
          <Field label="নাম" name="name" placeholder="মোঃ আব্দুল করিম" required />
          <Field label="পদবি" name="designation" placeholder="প্রধান শিক্ষক" />
          <Field label="বিষয়" name="subject" placeholder="গণিত" />
          <Field label="শিক্ষাগত যোগ্যতা" name="qualification" placeholder="এম.এস.সি. (গণিত), বি.এড." />
          <Field label="ক্রম" name="order" type="number" defaultValue="1"
            hint="ছোট সংখ্যা আগে দেখাবে — প্রধান শিক্ষককে ১ দিন।" />
          <div className="md:col-span-2">
            <ImageField name="photo" label="ছবি" filter="person" ratio="aspect-[3/4]"
              hint="ছবি না দিলে নামের প্রথম অক্ষর দিয়ে মার্জিত একটি প্লেসহোল্ডার বসবে।" />
          </div>
          <div className="md:col-span-2"><Btn type="submit">যোগ করুন</Btn></div>
        </form>
      </Card>

      <Card title={`শিক্ষক তালিকা (${teachers.length})`}>
        {!teachers.length && <Empty icon="👩‍🏫" title="তালিকা ফাঁকা" sub="প্রধান শিক্ষক দিয়ে শুরু করুন।" />}
        <div className="-mx-5 md:-mx-6 -mb-5 md:-mb-6">
          {teachers.map((t: Teacher) => (
            <Row key={t._id}>
              <span className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-[#efeadf] grid place-items-center">
                {t.photo
                  ? <img src={t.photo} alt="" className="h-full w-full object-cover" />
                  : <span className="font-bold text-ink-soft">{t.name?.[0]}</span>}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{t.name}</p>
                <p className="text-[13.5px] text-ink-soft truncate">
                  {[t.designation, t.subject, t.qualification].filter(Boolean).join(" · ")}
                </p>
              </div>
              <form action={deleteTeacher} className="shrink-0">
                <input type="hidden" name="id" value={t._id} />
                <Btn type="submit" size="sm" danger>মুছুন</Btn>
              </form>
            </Row>
          ))}
        </div>
      </Card>
    </div>
  );
}
