/* সাইটের কনটেন্ট — পেজ ধরে ধরে
   ------------------------------------------------------------------
   সাজানো হয়েছে সাইটের ঠিকানা অনুযায়ী, ফিচার অনুযায়ী নয়। প্রধান শিক্ষক
   ভাবেন "ভর্তি পেজের লেখাটা বদলাব", "ফলাফল পেজের চার্টটা ঠিক করব" — তাই
   প্রতিটি কার্ডের মাথায় সেই পেজের নামই লেখা, পাশে "পেজটি দেখুন" লিংক।
   উপরে আটকে থাকা সূচি দিয়ে যেকোনো অংশে এক লাফে যাওয়া যায়। */
import { requireAdmin } from "@/lib/admin-guard";
import { getDb, ObjectId } from "@/lib/db";
import { saveStructuredContent } from "@/actions/admin";
import { Card, Btn, PageHead, StickySave, Field } from "@/components/ui";
import {
  DepartmentsEditor, ClubsEditor, RoutineEditor, ResultChartEditor,
  ListEditor, SimpleListEditor,
} from "@/components/admin/editors";
import type { Department, Club, RoutineTable, ResultSeries } from "@/components/admin/editors";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/* প্রতিটি অংশ কোন পেজ চালায় — সূচির লেবেল এখান থেকেই */
const SECTIONS = [
  { id: "home", label: "হোম" },
  { id: "about", label: "পরিচিতি" },
  { id: "academics", label: "একাডেমিক" },
  { id: "departments", label: "বিভাগ" },
  { id: "routine", label: "রুটিন" },
  { id: "club", label: "ক্লাব" },
  { id: "results", label: "ফলাফল" },
  { id: "admission", label: "ভর্তি" },
  { id: "facilities", label: "সুযোগ-সুবিধা" },
  { id: "gallery", label: "গ্যালারি" },
  { id: "faq", label: "জিজ্ঞাসা" },
  { id: "portal", label: "কর্নার" },
];

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { tenantId } = await requireAdmin("content");
  const { saved } = await searchParams;
  const db = await getDb();
  const t = (await db.collection("tenants").findOne({ _id: new ObjectId(tenantId) }))!;

  const root = process.env.ROOT_DOMAIN || "localhost:3000";
  const isLocal = root === "localhost" || root.startsWith("127.");
  const h = await headers();
  const host = h.get("host") || "";
  const port = isLocal && host.includes(":") ? `:${host.split(":")[1]}` : "";
  const site = t.customDomain
    ? `https://${t.customDomain}`
    : `${isLocal ? "http" : "https"}://${t.slug}.${root}${port}`;

  type Row = Record<string, unknown>;
  const c = (t.content || {}) as {
    departments?: Department[]; clubs?: Club[]; routine?: RoutineTable[]; resultChart?: ResultSeries[];
    heroKicker?: string; heroSub?: string; heroCta?: string;
    aboutPoints?: string[]; why?: Row[]; programs?: Row[]; facilities?: Row[]; campusLife?: Row[];
    achievements?: Row[]; topStudents?: Row[]; testimonials?: Row[]; faq?: Row[];
    admissionSteps?: Row[]; admissionTimeline?: Row[]; fees?: Row[]; feeNote?: string;
    videos?: Row[]; resultPortalNote?: string; portals?: { student?: string; parent?: string };
  };

  const view = (path: string) => (
    <Btn href={`${site}${path}`} external variant="outline" size="sm">পেজটি দেখুন ↗</Btn>
  );

  return (
    <form action={saveStructuredContent}>
      <PageHead
        title="সাইটের কনটেন্ট"
        sub="সাইটের প্রতিটি পেজের লেখা ও তালিকা এখান থেকেই বদলানো যায়। যা ফাঁকা রাখবেন, সেখানে প্রতিষ্ঠানের ধরন অনুযায়ী মানসম্মত ডিফল্ট বসবে।"
      />

      {saved && (
        <p className="mb-5 rounded-xl bg-[#e9f1ec] text-[#1f5b48] px-4 py-3 text-[14.5px] font-bold">
          ✓ সংরক্ষণ হয়েছে — সাইটে সাথে সাথে আপডেট হয়ে গেছে
        </p>
      )}

      {/* পেজ-সূচি */}
      <nav aria-label="পেজ সূচি"
        className="sticky top-[60px] z-10 -mx-4 md:mx-0 mb-5 px-4 md:px-3 py-2.5
                   bg-paper/95 backdrop-blur border-y md:border border-rule md:rounded-xl">
        <div className="nav-row gap-1.5">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              className="px-3 h-9 inline-flex items-center rounded-lg text-[13.5px] font-bold text-ink-soft
                         hover:text-ink hover:bg-[#efeadf] transition-colors">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-5 stagger">
        {/* ── হোম ── */}
        <Card id="home" title="হোম পেজ" desc="উপরের বার্তা, “কেন আমরা”, ক্যাম্পাস জীবন ও অভিভাবকের মতামত।" aside={view("/")}>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="উপরের ছোট ব্যাজ" name="heroKicker" defaultValue={c.heroKicker}
              placeholder="ভর্তি চলছে" hint="ভর্তি চালু থাকলে হিরোতে দেখাবে।" />
            <Field label="বোতামের লেখা" name="heroCta" defaultValue={c.heroCta} placeholder="ভর্তি তথ্য জানুন" />
            <Field label="ফলাফল অনুসন্ধানের নোট" name="resultPortalNote" defaultValue={c.resultPortalNote}
              placeholder="রোল নম্বর দিয়ে ফল দেখুন" />
            <div className="md:col-span-3">
              <Field textarea rows={3} label="হিরোর নিচের বাক্য" name="heroSub" defaultValue={c.heroSub}
                hint="বড় শিরোনামটি “সেটিংস → স্লোগান” থেকে আসে; এটি তার নিচের ব্যাখ্যা।" />
            </div>
          </div>

          <div className="mt-7 pt-6 border-t border-rule">
            <p className="font-display font-bold text-ink mb-3">কেন আমাদের প্রতিষ্ঠান</p>
            <ListEditor name="why" initial={c.why || []} titleKey="title" addLabel="কারণ যোগ করুন"
              emptyNote="কিছু না দিলে প্রতিষ্ঠানের ধরন অনুযায়ী ছয়টি কারণ স্বয়ংক্রিয়ভাবে দেখানো হবে।"
              fields={[
                { key: "title", label: "শিরোনাম", placeholder: "অভিজ্ঞ শিক্ষকমণ্ডলী" },
                { key: "icon", label: "আইকন", type: "icon" },
                { key: "desc", label: "বিবরণ", type: "textarea", full: true },
              ]} />
          </div>

          <div className="mt-7 pt-6 border-t border-rule">
            <p className="font-display font-bold text-ink mb-3">ক্যাম্পাস জীবন</p>
            <ListEditor name="campusLife" initial={c.campusLife || []} titleKey="title" addLabel="কার্যক্রম যোগ করুন"
              fields={[
                { key: "title", label: "শিরোনাম", placeholder: "বার্ষিক ক্রীড়া প্রতিযোগিতা" },
                { key: "image", label: "ছবির লিংক (ঐচ্ছিক)", type: "url", placeholder: "/img/bd/playground.svg" },
                { key: "desc", label: "বিবরণ", type: "textarea", full: true },
              ]} />
          </div>

          <div className="mt-7 pt-6 border-t border-rule">
            <p className="font-display font-bold text-ink mb-3">অভিভাবকদের মতামত</p>
            <ListEditor name="testimonials" initial={c.testimonials || []} titleKey="name" addLabel="মতামত যোগ করুন"
              fields={[
                { key: "name", label: "নাম", placeholder: "রুবিনা আক্তার" },
                { key: "relation", label: "পরিচয়", placeholder: "অভিভাবক, ৭ম শ্রেণি" },
                { key: "rating", label: "রেটিং (১–৫)", type: "number" },
                { key: "photo", label: "ছবির লিংক (ঐচ্ছিক)", type: "url" },
                { key: "text", label: "মতামত", type: "textarea", full: true },
              ]} />
          </div>
        </Card>

        {/* ── পরিচিতি ── */}
        <Card id="about" title="আমাদের সম্পর্কে" desc="পরিচিতির টিক-পয়েন্ট ও অর্জনের তালিকা। মূল লেখাটি “সেটিংস” পেজে।" aside={view("/about")}>
          <p className="font-display font-bold text-ink mb-2">পরিচিতির মূল দিকগুলো</p>
          <SimpleListEditor name="aboutPoints" initial={c.aboutPoints || []}
            placeholder={"সরকার অনুমোদিত ও এমপিওভুক্ত প্রতিষ্ঠান\nঅভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষকমণ্ডলী"}
            hint="প্রতি লাইনে একটি — সাইটে টিক-চিহ্নসহ তালিকা হিসেবে দেখাবে।" />

          <div className="mt-7 pt-6 border-t border-rule">
            <p className="font-display font-bold text-ink mb-3">অর্জন ও সাফল্য</p>
            <ListEditor name="achievements" initial={c.achievements || []} titleKey="title" addLabel="অর্জন যোগ করুন"
              fields={[
                { key: "title", label: "শিরোনাম", placeholder: "বোর্ড পরীক্ষায় শতভাগ পাস" },
                { key: "year", label: "সাল", placeholder: "২০২৫" },
                { key: "icon", label: "আইকন", type: "icon" },
                { key: "desc", label: "বিবরণ", type: "textarea", full: true },
              ]} />
          </div>
        </Card>

        {/* ── একাডেমিক ── */}
        <Card id="academics" title="শিক্ষা কার্যক্রম" desc="শ্রেণি/শাখাভিত্তিক পাঠক্রম ও ফি তালিকা।" aside={view("/academics")}>
          <ListEditor name="programs" initial={c.programs || []} titleKey="title" addLabel="শাখা যোগ করুন"
            emptyNote="কিছু না দিলে প্রতিষ্ঠানের ধরন অনুযায়ী পাঠক্রম স্বয়ংক্রিয়ভাবে দেখানো হবে।"
            fields={[
              { key: "title", label: "শাখার নাম", placeholder: "মাধ্যমিক — বিজ্ঞান" },
              { key: "level", label: "স্তর", placeholder: "নবম–দশম" },
              { key: "icon", label: "আইকন", type: "icon" },
              { key: "desc", label: "বিবরণ", type: "textarea", full: true },
              { key: "points", label: "যা যা থাকছে", type: "list", full: true, placeholder: "ব্যবহারিক ল্যাব, মডেল টেস্ট" },
            ]} />

          <div className="mt-7 pt-6 border-t border-rule">
            <p className="font-display font-bold text-ink mb-3">ফি তালিকা</p>
            <ListEditor name="fees" initial={c.fees || []} titleKey="label" addLabel="সারি যোগ করুন"
              fields={[
                { key: "label", label: "শ্রেণি / বিভাগ", placeholder: "নবম – দশম (বিজ্ঞান)" },
                { key: "admission", label: "ভর্তি ফি", placeholder: "৳ ৩,০০০" },
                { key: "monthly", label: "মাসিক বেতন", placeholder: "৳ ৭৫০" },
                { key: "note", label: "নোট (ঐচ্ছিক)", placeholder: "ব্যবহারিক ফি অন্তর্ভুক্ত" },
              ]} />
            <div className="mt-4">
              <Field textarea rows={2} label="ফি তালিকার নিচের নোট" name="feeNote" defaultValue={c.feeNote}
                hint="উপবৃত্তি বা ছাড়ের কথা এখানে লিখলে ভালো হয়।" />
            </div>
          </div>
        </Card>

        {/* ── বিভাগ / রুটিন / ক্লাব ── */}
        <Card id="departments" title="বিভাগসমূহ" desc="“একাডেমিক তথ্য → বিভাগসমূহ” পেজ।" aside={view("/academics/departments")}>
          <DepartmentsEditor initial={c.departments || []} />
        </Card>

        <Card id="routine" title="ক্লাস রুটিন" desc="মোবাইলে ছকটি পাশে স্ক্রল করে, বারের কলাম আটকে থাকে।" aside={view("/academics/routine")}>
          <RoutineEditor initial={c.routine || []} />
        </Card>

        <Card id="club" title="ক্লাব ও সহশিক্ষা" aside={view("/club")}>
          <ClubsEditor initial={c.clubs || []} />
        </Card>

        {/* ── ফলাফল ── */}
        <Card id="results" title="ফলাফল পেজ" desc="বছরভিত্তিক চার্ট ও কৃতী শিক্ষার্থী। প্রকাশিত ফলের তালিকা “ফলাফল” মেনুতে।" aside={view("/results")}>
          <ResultChartEditor initial={c.resultChart || []} />

          <div className="mt-7 pt-6 border-t border-rule">
            <p className="font-display font-bold text-ink mb-3">কৃতী শিক্ষার্থী</p>
            <ListEditor name="topStudents" initial={c.topStudents || []} titleKey="name" addLabel="শিক্ষার্থী যোগ করুন"
              fields={[
                { key: "name", label: "নাম", placeholder: "সাদিয়া ইসলাম" },
                { key: "result", label: "ফলাফল", placeholder: "GPA 5.00" },
                { key: "exam", label: "পরীক্ষা", placeholder: "এসএসসি" },
                { key: "year", label: "সাল", placeholder: "২০২৫" },
                { key: "photo", label: "ছবির লিংক (ঐচ্ছিক)", type: "url", full: true },
              ]} />
          </div>
        </Card>

        {/* ── ভর্তি ── */}
        <Card id="admission" title="ভর্তি পেজ" desc="ভর্তির ধাপ ও সময়সূচি। ভর্তি চালু/বন্ধ ও শ্রেণির তালিকা “সেটিংস” পেজে।" aside={view("/admission")}>
          <p className="font-display font-bold text-ink mb-3">ভর্তি প্রক্রিয়ার ধাপ</p>
          <ListEditor name="admissionSteps" initial={c.admissionSteps || []} titleKey="title" addLabel="ধাপ যোগ করুন"
            fields={[
              { key: "title", label: "ধাপের নাম", placeholder: "ফরম সংগ্রহ" },
              { key: "desc", label: "বিবরণ", type: "textarea", full: true },
            ]} />

          <div className="mt-7 pt-6 border-t border-rule">
            <p className="font-display font-bold text-ink mb-3">ভর্তির সময়সূচি</p>
            <ListEditor name="admissionTimeline" initial={c.admissionTimeline || []} titleKey="title" addLabel="তারিখ যোগ করুন"
              fields={[
                { key: "date", label: "তারিখ", placeholder: "১–২০ ডিসেম্বর" },
                { key: "title", label: "কী হবে", placeholder: "ফরম বিতরণ ও গ্রহণ" },
                { key: "desc", label: "বিবরণ", type: "textarea", full: true },
              ]} />
          </div>
        </Card>

        {/* ── সুযোগ-সুবিধা ── */}
        <Card id="facilities" title="সুযোগ-সুবিধা" desc="পাঠাগার, ল্যাব, পরিবহন — সুবিধা পেজ ও হোমপেজে দেখাবে।" aside={view("/facilities")}>
          <ListEditor name="facilities" initial={c.facilities || []} titleKey="title" addLabel="সুবিধা যোগ করুন"
            emptyNote="কিছু না দিলে প্রতিষ্ঠানের ধরন অনুযায়ী আটটি সুবিধা স্বয়ংক্রিয়ভাবে দেখানো হবে।"
            fields={[
              { key: "title", label: "নাম", placeholder: "সমৃদ্ধ পাঠাগার" },
              { key: "icon", label: "আইকন", type: "icon" },
              { key: "desc", label: "বিবরণ", type: "textarea", full: true },
            ]} />
        </Card>

        {/* ── গ্যালারি ── */}
        <Card id="gallery" title="ভিডিও গ্যালারি" desc="ছবির অ্যালবাম “গ্যালারি” মেনুতে; এখানে শুধু ইউটিউব ভিডিও।" aside={view("/gallery")}>
          <ListEditor name="videos" initial={c.videos || []} titleKey="title" addLabel="ভিডিও যোগ করুন"
            fields={[
              { key: "title", label: "ভিডিওর নাম", placeholder: "ক্যাম্পাস ট্যুর" },
              { key: "youtubeId", label: "ইউটিউব আইডি", placeholder: "aqz-KE-bpKQ",
                hint: "লিংকের শেষ অংশটুকু — youtube.com/watch?v=এই-অংশটি" },
            ]} />
        </Card>

        {/* ── জিজ্ঞাসা ── */}
        <Card id="faq" title="সাধারণ জিজ্ঞাসা" desc="হোমপেজের নিচের দিকে অ্যাকর্ডিয়ন হিসেবে দেখাবে।" aside={view("/#faq")}>
          <ListEditor name="faq" initial={c.faq || []} titleKey="q" addLabel="প্রশ্ন যোগ করুন"
            emptyNote="কিছু না দিলে অভিভাবকদের বহুল জিজ্ঞাসিত ছয়টি প্রশ্ন স্বয়ংক্রিয়ভাবে দেখানো হবে।"
            fields={[
              { key: "q", label: "প্রশ্ন", full: true, placeholder: "ভর্তির জন্য কী কী কাগজপত্র লাগবে?" },
              { key: "a", label: "উত্তর", type: "textarea", full: true },
            ]} />
        </Card>

        {/* ── কর্নার ── */}
        <Card id="portal" title="শিক্ষার্থী ও অভিভাবক কর্নার" desc="নিজস্ব পোর্টাল থাকলে লিংক দিন — না দিলে বোতামগুলো দেখাবে না।" aside={view("/portal")}>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="শিক্ষার্থী পোর্টালের লিংক" name="portalStudent" defaultValue={c.portals?.student} placeholder="https://…" />
            <Field label="অভিভাবক পোর্টালের লিংক" name="portalParent" defaultValue={c.portals?.parent} placeholder="https://…" />
          </div>
        </Card>
      </div>

      <StickySave note="খালি নাম/শিরোনামের সারিগুলো সংরক্ষণের সময় বাদ পড়বে।">
        <Btn href="/admin" variant="outline">সেটিংস</Btn>
        <Btn type="submit">সংরক্ষণ করুন</Btn>
      </StickySave>
    </form>
  );
}
