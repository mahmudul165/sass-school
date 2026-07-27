/* শিক্ষার্থী ও অভিভাবক কর্নার
   ইচ্ছাকৃতভাবে "লগইন পোর্টাল" নয়। বেশিরভাগ বাংলাদেশি স্কুলে আলাদা পোর্টাল সিস্টেম নেই,
   আর নকল লগইন বাটন দিলে অভিভাবক ঠকেছেন মনে করেন — আস্থা নষ্ট হয়।
   তাই এখানে সত্যিকারের কাজে লাগে এমন সব কিছু এক জায়গায়:
   ফলাফল, নোটিশ, ডাউনলোড, ফি ও যোগাযোগ। প্রতিষ্ঠানের নিজস্ব পোর্টাল থাকলে
   tenant.content.portals দিয়ে সরাসরি সেই লিংক দেখানো যায়। */
import { loadTenant, type Params } from "@/lib/page";
import { Section, SectionHead, Btn, FeeTable, FAQ } from "@/components/site/ui";
import { Icon } from "@/components/site/icons";
import { ResultSearch, InquiryForm } from "@/components/site/interactive";
import { submitInquiry } from "@/actions/site";
import { bnDate } from "@/lib/utils";
import { TLink } from "@/components/site/tlink";

export const dynamic = "force-dynamic";
export const metadata = { title: "শিক্ষার্থী ও অভিভাবক কর্নার" };

export default async function PortalPage({ params }: Params) {
  const { T, tenant, content, lang, dal } = await loadTenant(params);
  const [results, notices] = await Promise.all([dal.results(), dal.notices(6)]);
  const portals = (tenant.content?.portals || {}) as { student?: string; parent?: string };

  return (
    <>
      <T.PageHeader lang={lang} title="শিক্ষার্থী ও অভিভাবক কর্নার" crumb="কর্নার"
        sub="ফলাফল, নোটিশ, ফি ও প্রয়োজনীয় সব তথ্য — এক জায়গায়।" />

      {/* ফলাফল */}
      <Section tone="plain">
        <SectionHead align="left" eyebrow="ফলাফল" title="ফলাফল অনুসন্ধান" sub={content.resultPortalNote} className="!mb-7" />
        <div className="rounded-2xl bg-n-50 hairline p-6">
          <ResultSearch exams={results} note={results.length ? undefined : "এখনো কোনো ফলাফল প্রকাশিত হয়নি।"} />
        </div>

        {(portals.student || portals.parent) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {portals.student && <Btn href={portals.student} variant="primary" icon="userCheck" external>শিক্ষার্থী পোর্টালে লগইন</Btn>}
            {portals.parent && <Btn href={portals.parent} variant="outline" icon="handHeart" external>অভিভাবক পোর্টালে লগইন</Btn>}
          </div>
        )}
      </Section>

      {/* দ্রুত লিংক */}
      <Section tone="soft" size="sm">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/notice", icon: "bell", label: "নোটিশ বোর্ড", sub: "সব বিজ্ঞপ্তি" },
            { href: "/events", icon: "calendar", label: "অনুষ্ঠান সূচি", sub: "আসন্ন কর্মসূচি" },
            { href: "/academics", icon: "book", label: "পাঠক্রম", sub: "শ্রেণিভিত্তিক" },
            { href: "/contact", icon: "phone", label: "যোগাযোগ", sub: "অফিসে জানান" },
          ].map((l, i) => (
            <TLink key={l.href} href={l.href} data-reveal style={{ ["--reveal-delay" as string]: `${i * 60}ms` }}
              className="lift rounded-2xl bg-white hairline p-6 flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
                <Icon name={l.icon} size={22} />
              </span>
              <span>
                <span className="block font-bold text-n-900">{l.label}</span>
                <span className="block text-[13px] text-n-500">{l.sub}</span>
              </span>
            </TLink>
          ))}
        </div>
      </Section>

      {/* সাম্প্রতিক নোটিশ */}
      {notices.length > 0 && (
        <Section tone="plain">
          <SectionHead align="left" eyebrow="সাম্প্রতিক" title="শিক্ষার্থীদের জন্য নোটিশ" className="!mb-7" />
          <div className="rounded-2xl bg-white hairline overflow-hidden max-w-3xl">
            {notices.map((n, i) => (
              <TLink key={n._id} href={`/notice/${n._id}`}
                className={`flex items-start gap-3 p-5 hover:bg-brand-50/60 transition ${i ? "border-t border-n-100" : ""}`}>
                <Icon name="file" size={18} className="mt-1 shrink-0 text-brand" />
                <span>
                  <span className="block font-semibold text-n-900 leading-snug">{n.title}</span>
                  <span className="block text-[13px] text-n-400 mt-0.5">{bnDate(n.createdAt)}</span>
                </span>
              </TLink>
            ))}
          </div>
        </Section>
      )}

      {/* অভিভাবক কর্নার */}
      <Section id="parents" tone="soft">
        <SectionHead eyebrow="অভিভাবক কর্নার" title="অভিভাবকদের জন্য প্রয়োজনীয় তথ্য" />
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-start">
          <div>
            {content.fees.length > 0 && (
              <>
                <h3 className="t-h3 text-n-900 mb-5 flex items-center gap-2.5">
                  <Icon name="money" size={21} className="text-brand" /> ফি ও বেতন
                </h3>
                <FeeTable rows={content.fees} note={content.feeNote} />
              </>
            )}
            {content.faq.length > 0 && (
              <div className="mt-12">
                <h3 className="t-h3 text-n-900 mb-5">সাধারণ জিজ্ঞাসা</h3>
                <FAQ items={content.faq.slice(0, 4)} name="portal-faq" />
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white hairline p-7 lg:sticky lg:top-28">
            <h3 className="t-h3 text-n-900">শিক্ষকের সাথে কথা বলতে চান?</h3>
            <p className="mt-2 text-[15px] text-n-600 mb-5">
              নাম ও মোবাইল নম্বর দিন — সংশ্লিষ্ট শ্রেণি শিক্ষক আপনার সাথে যোগাযোগ করবেন।
            </p>
            <InquiryForm action={submitInquiry} classes={tenant.admission?.classes} kind="callback" submitLabel="যোগাযোগের অনুরোধ" />
          </div>
        </div>
      </Section>
    </>
  );
}
