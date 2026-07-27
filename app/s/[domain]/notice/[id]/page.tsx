import { getTenantByHost } from "@/lib/tenant";
import { forTenant } from "@/lib/dal";
import { getTemplate } from "@/templates/registry";
import { resolveLang } from "@/lib/lang";
import { dict, fmtDate } from "@/lib/i18n";
import { Section, Btn, Pill } from "@/components/site/ui";
import { Icon } from "@/components/site/icons";
import { notFound } from "next/navigation";
import { TLink } from "@/components/site/tlink";
import type { Metadata } from "next";
import type { Notice } from "@/templates/types";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ domain: string; id: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { domain, id } = await params;
  const tenant = await getTenantByHost(domain);
  if (!tenant) return {};
  const n = await forTenant(String(tenant._id)).notices.get<Notice>(id).catch(() => null);
  return n ? { title: n.title, description: (n.body || n.title).slice(0, 158) } : {};
}

export default async function NoticeDetail({ params }: P) {
  const { domain, id } = await params;
  const tenant = await getTenantByHost(domain);
  if (!tenant) notFound();
  const notice = await forTenant(String(tenant._id)).notices.get<Notice>(id).catch(() => null);
  if (!notice) notFound();
  const T = getTemplate(tenant.template);
  const lang = await resolveLang((tenant as { language?: string }).language);
  const tr = dict(lang);

  return (
    <>
      <T.PageHeader lang={lang} title={notice.title} sub={fmtDate(notice.createdAt, lang)} crumb={tr.navNotice} />
      <Section tone="plain" inner="container-x container-prose">
        <article className="prose-bn">
          {notice.pinned && <Pill tone="accent" icon="bell" className="mb-5">{tr.important}</Pill>}
          <div className="text-n-700 leading-[2] whitespace-pre-line text-[17px]">
            {notice.body || (lang === "en" ? "Please see the attachment for details." : "বিস্তারিত সংযুক্তিতে দেখুন।")}
          </div>

          {notice.attachmentUrl && (
            <div className="mt-9">
              <Btn href={notice.attachmentUrl} variant="primary" icon="download" external>
                {lang === "en" ? "Download attachment" : "সংযুক্তি ডাউনলোড করুন"}
              </Btn>
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-n-200 pt-6 no-print">
            <TLink href="/notice" className="inline-flex items-center gap-2 text-brand font-bold hover:gap-3 transition-all">
              <Icon name="chevronLeft" size={17} /> {tr.allNotices}
            </TLink>
            <span className="text-[14px] text-n-400">{fmtDate(notice.createdAt, lang)}</span>
          </div>
        </article>
      </Section>
    </>
  );
}
