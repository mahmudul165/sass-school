import { loadTenant, type Params } from "@/lib/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.secNoticeBoard, description: t.subNotice };
}

export default async function NoticePage({ params }: Params) {
  const { T, lang, t, dal } = await loadTenant(params);
  const notices = await dal.notices(100);
  return (
    <>
      <T.PageHeader lang={lang} title={t.secNoticeBoard} crumb={t.navNotice} sub={t.subNotice} />
      <T.NoticeList lang={lang} notices={notices} full />
    </>
  );
}
