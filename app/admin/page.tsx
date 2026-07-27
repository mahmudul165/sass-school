import { requireAdmin } from "@/lib/admin-guard";
import { getDb, ObjectId } from "@/lib/db";
import { saveSettings } from "@/actions/admin";
import { Field, Select, Toggle, Btn, Card, PageHead, StickySave, Stat } from "@/components/ui";
import { ImageField, ImageListField } from "@/components/admin/image-field";
import { templateOptions } from "@/templates/registry";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const TYPES = [
  { value: "school", label: "স্কুল (বাংলা মিডিয়াম)" },
  { value: "english_medium", label: "ইংলিশ মিডিয়াম / ইংরেজি ভার্সন" },
  { value: "college", label: "কলেজ / উচ্চ মাধ্যমিক" },
  { value: "madrasah", label: "মাদরাসা" },
  { value: "kindergarten", label: "কিন্ডারগার্টেন" },
  { value: "coaching", label: "কোচিং / ভর্তি কোচিং" },
];

export default async function Settings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { tenantId } = await requireAdmin("settings");
  const { saved } = await searchParams;
  const db = await getDb();
  const t = (await db.collection("tenants").findOne({ _id: new ObjectId(tenantId) }))!;
  const c = (t.content || {}) as Record<string, { name?: string; role?: string; photo?: string; message?: string }> &
    { prospectusUrl?: string };

  const tid = new ObjectId(tenantId);
  const [notices, teachers, galleries, newInquiries] = await Promise.all([
    db.collection("notices").countDocuments({ tenantId: tid }),
    db.collection("teachers").countDocuments({ tenantId: tid }),
    db.collection("galleries").countDocuments({ tenantId: tid }),
    db.collection("inquiries").countDocuments({ tenantId: tid, status: "new" }),
  ]);

  return (
    <form action={saveSettings}>
      <PageHead title="প্রতিষ্ঠানের সেটিংস" sub="এখানে যা বদলাবেন, সাইটে সাথে সাথেই দেখা যাবে।" />

      {saved && (
        <p className="mb-5 rounded-xl bg-[#e9f1ec] text-[#1f5b48] px-4 py-3 text-[14.5px] font-semibold">
          ✓ সংরক্ষণ হয়েছে — সাইটে সাথে সাথে আপডেট হয়ে গেছে
        </p>
      )}

      {/* এক নজরে */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="নতুন আবেদন" value={newInquiries} tone={newInquiries ? "warn" : "neutral"} href="/admin/inquiries" />
        <Stat label="নোটিশ" value={notices} href="/admin/notices" />
        <Stat label="শিক্ষক" value={teachers} href="/admin/teachers" />
        <Stat label="গ্যালারি অ্যালবাম" value={galleries} href="/admin/gallery" />
      </div>

      <div className="space-y-5 stagger">
        <Card title="প্রতিষ্ঠানের পরিচয়">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="ইংরেজি নাম" name="nameEn" defaultValue={t.nameEn} placeholder="Dhaka Adarsha High School" />
            <Field label="EIIN নম্বর" name="eiin" defaultValue={t.eiin} placeholder="১০৮৭৬৫"
              hint="দিলে হেডারে “সরকার অনুমোদিত” ব্যাজ দেখাবে।" />
            <Field label="স্লোগান / ট্যাগলাইন" name="tagline" defaultValue={t.tagline} placeholder="জ্ঞানের আলোয়, শৃঙ্খলার পথে"
              hint="হোমপেজের বড় শিরোনাম হিসেবে এটিই ব্যবহৃত হয়।" />
            <Field label="প্রতিষ্ঠা সাল" name="established" defaultValue={t.established} placeholder="১৯৮২" />
            <div className="md:col-span-2">
              <Field textarea rows={5} label="প্রতিষ্ঠান সম্পর্কে" name="about" defaultValue={t.about}
                hint="না লিখলে প্রতিষ্ঠানের ধরন অনুযায়ী মানসম্মত একটি পরিচিতি স্বয়ংক্রিয়ভাবে বসে।" />
            </div>
          </div>
        </Card>

        <Card title="ছবি" desc="নিজের ছবি না থাকলে লাইব্রেরি থেকে বেছে নিন — পরে যেকোনো সময় বদলানো যাবে।">
          <div className="grid md:grid-cols-2 gap-5">
            <ImageField name="logo" label="প্রতিষ্ঠানের লোগো" defaultValue={t.logo} ratio="aspect-square"
              hint="বর্গাকার ছবি সবচেয়ে ভালো দেখায়।" />
            <ImageField name="heroImage" label="প্রধান ছবি (হোমপেজের উপরে)" defaultValue={t.heroImage} filter="campus" />
            <div className="md:col-span-2">
              <ImageListField name="heroImages" label="হিরো স্লাইডের ছবি" defaultValue={t.heroImages || []}
                hint="একাধিক ছবি দিলে হোমপেজে ধীরে ধীরে বদলাবে। একটিও না দিলে উপরের প্রধান ছবিটিই থাকবে।" />
            </div>
          </div>
        </Card>

        <Card title="ডিজাইন" desc="টেমপ্লেট বদলালে সাইটের গঠন একই থাকে, শুধু চেহারা বদলায়।">
          <div className="grid md:grid-cols-2 gap-4">
            <Select label="প্রতিষ্ঠানের ধরন" name="type" defaultValue={t.type || "school"} options={TYPES}
              hint="ধরন অনুযায়ী সাইটের ডিফল্ট লেখা, বিভাগ ও ফি তালিকা ঠিক হয়।" />
            <Select label="টেমপ্লেট" name="template" defaultValue={t.template}
              options={templateOptions.map((o) => ({ value: o.key, label: o.label }))}
              hint="দুটি টেমপ্লেটই বাংলা ও ইংরেজি — দুই ভাষাতেই চলে।" />
            <Select label="সাইটের ভাষা" name="language" defaultValue={t.language || "bn"}
              options={[{ value: "bn", label: "বাংলা (ডিফল্ট)" }, { value: "en", label: "English" }]}
              hint="দর্শক চাইলে সাইটের উপরের বোতাম থেকে নিজেই ভাষা বদলাতে পারবেন।" />
            <Field label="মূল রং" name="primary" type="color" defaultValue={t.theme?.primary || "#1d4ed8"} />
            <Field label="সহায়ক রং (অ্যাকসেন্ট)" name="secondary" type="color" defaultValue={t.theme?.secondary || "#f59e0b"} />
          </div>
          <p className="mt-4 text-[13px] text-ink-soft leading-relaxed">
            এই দুটি রং থেকেই সাইটের পুরো প্যালেট তৈরি হয় — বোতাম, কার্ড, হেডার, ফুটার সব।
          </p>
        </Card>

        <Card title="যোগাযোগ">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="ফোন" name="phone" defaultValue={t.contact?.phone} placeholder="01XXXXXXXXX"
              hint="মোবাইলে সাইটের নিচে স্থায়ী “কল করুন” বোতামে এই নম্বরটিই বসে।" />
            <Field label="দ্বিতীয় ফোন / ল্যান্ডলাইন" name="phone2" defaultValue={t.contact?.phone2} />
            <Field label="WhatsApp নম্বর" name="whatsapp" defaultValue={t.contact?.whatsapp} placeholder="01XXXXXXXXX" />
            <Field label="ইমেইল" name="email" defaultValue={t.contact?.email} />
            <Field label="ঠিকানা" name="address" defaultValue={t.contact?.address} />
            <Field label="অফিস সময়" name="officeHours" defaultValue={t.contact?.officeHours}
              placeholder="শনি–বৃহস্পতি, সকাল ৯টা – বিকাল ৪টা" />
            <Field label="Facebook পেজ" name="facebook" defaultValue={t.contact?.facebook} placeholder="https://facebook.com/…" />
            <Field label="YouTube চ্যানেল" name="youtube" defaultValue={t.contact?.youtube} placeholder="https://youtube.com/…" />
            <Field label="Messenger লিংক" name="messenger" defaultValue={t.contact?.messenger} placeholder="https://m.me/…" />
            <Field label="Google Map embed লিংক" name="mapEmbed" defaultValue={t.contact?.mapEmbed}
              placeholder="https://www.google.com/maps/embed?…"
              hint="Google Maps → Share → Embed a map → লিংকটি এখানে বসান।" />
          </div>
        </Card>

        <Card title="ভর্তি">
          <div className="mb-5">
            <Toggle label="ভর্তি চলছে" name="admissionOpen" defaultChecked={t.admission?.open}
              hint="চালু থাকলে হোমপেজে “ভর্তি চলছে” ব্যাজ ও আবেদন ফরম দেখাবে।" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="শ্রেণি / বিভাগসমূহ" name="admissionClasses" defaultValue={t.admission?.classes}
              placeholder="প্লে, নার্সারি, প্রথম–দশম শ্রেণি"
              hint="কমা দিয়ে লিখলে ভর্তি ফরমে সেগুলো ড্রপডাউন হিসেবে আসে।" />
            <Field label="আবেদনের শেষ তারিখ" name="admissionDeadline" defaultValue={t.admission?.deadline} placeholder="২০ ডিসেম্বর" />
            <Field label="ভর্তি ফরম (PDF লিংক)" name="admissionFormUrl" defaultValue={t.admission?.formUrl} placeholder="https://…" />
            <Field label="প্রসপেক্টাস (PDF লিংক)" name="prospectusUrl" defaultValue={c.prospectusUrl as string} placeholder="https://…" />
            <div className="md:col-span-2">
              <Field textarea label="ভর্তি বিজ্ঞপ্তি / নির্দেশনা" name="admissionNote" defaultValue={t.admission?.note} />
            </div>
          </div>
        </Card>

        <Card title="পরিসংখ্যান" desc="হোমপেজে গুনে গুনে দেখানো হয়। যেগুলো ফাঁকা রাখবেন সেগুলো দেখাবে না।">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="শিক্ষার্থী" name="students" defaultValue={t.stats?.students} placeholder="৮৫০" />
            <Field label="শিক্ষক" name="teachersCount" defaultValue={t.stats?.teachers} placeholder="৩২" />
            <Field label="পাসের হার" name="passRate" defaultValue={t.stats?.passRate} placeholder="৯৮%" />
          </div>
        </Card>

        <Card title="সভাপতির বাণী" desc="সাইটের “সভাপতির বাণী” পেজ এখান থেকেই তৈরি হয়।">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="নাম" name="chairmanName" defaultValue={c.chairman?.name}
              hint="নাম না দিলে পেজটি “শিগগিরই প্রকাশিত হবে” দেখাবে।" />
            <Field label="পদবি" name="chairmanRole" defaultValue={c.chairman?.role} placeholder="সভাপতি, পরিচালনা পর্ষদ" />
            <div className="md:col-span-2">
              <ImageField name="chairmanPhoto" label="ছবি" defaultValue={c.chairman?.photo} filter="person" ratio="aspect-[3/4]" />
            </div>
            <div className="md:col-span-2">
              <Field textarea rows={6} label="বাণী" name="chairmanMessage" defaultValue={c.chairman?.message}
                hint="অনুচ্ছেদ আলাদা করতে দুইবার এন্টার চাপুন।" />
            </div>
          </div>
        </Card>

        <Card title="প্রধান শিক্ষক / অধ্যক্ষ / মুহতামিমের বাণী" desc="সাইটের “অধ্যক্ষের বাণী” পেজ এখান থেকেই তৈরি হয়।">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="নাম" name="principalName" defaultValue={c.principal?.name} />
            <Field label="পদবি" name="principalRole" defaultValue={c.principal?.role} placeholder="প্রধান শিক্ষক"
              hint="যা লিখবেন সেটিই শিরোনামে বসবে — যেমন “অধ্যক্ষের বাণী”।" />
            <div className="md:col-span-2">
              <ImageField name="principalPhoto" label="ছবি" defaultValue={c.principal?.photo} filter="person" ratio="aspect-[3/4]" />
            </div>
            <div className="md:col-span-2">
              <Field textarea rows={6} label="বাণী" name="principalMessage" defaultValue={c.principal?.message} />
            </div>
          </div>
        </Card>
      </div>

      <StickySave note="বিভাগ, রুটিন ও ক্লাব আলাদা পেজে — “একাডেমিক তথ্য” মেনুতে।">
        <Btn href="/admin/content" variant="outline">একাডেমিক তথ্য</Btn>
        <Btn type="submit">সংরক্ষণ করুন</Btn>
      </StickySave>
    </form>
  );
}
