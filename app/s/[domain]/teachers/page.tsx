import { loadTenant, type Params } from "@/lib/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navTeachers, description: t.subTeachers };
}

export default async function TeachersPage({ params }: Params) {
  const { T, tenant, lang, t, dal } = await loadTenant(params);
  const teachers = await dal.teachers();
  const isM = tenant.type === "madrasah" && lang === "bn";
  return (
    <>
      <T.PageHeader lang={lang}
        title={isM ? "উস্তাযবৃন্দ" : t.navTeachers}
        crumb={t.navAcademic}
        sub={isM ? "অভিজ্ঞ ও দ্বীনদার উস্তাযমণ্ডলীর তত্ত্বাবধানে তা'লিম ও তারবিয়্যাত।" : t.subTeachers}
      />
      <T.TeacherGrid lang={lang} teachers={teachers} />
    </>
  );
}
