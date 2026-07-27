/* লগইন — প্রবেশপথ নির্বাচন
   প্রতিষ্ঠান অ্যাডমিন প্ল্যাটফর্মের মূল ডোমেইনে ইউজারনেম ও পাসওয়ার্ড দিয়ে ঢোকেন (middleware
   টেন্যান্ট ডোমেইন থেকে /admin কে সেখানেই পাঠায়), তাই লিংকটি সরাসরি
   মূল ডোমেইনের — এক ক্লিক কম, এবং লোকালে পোর্টও ঠিক থাকে। */
import { loadTenant, type Params } from "@/lib/page";
import { LoginOptions } from "@/components/site/blocks";
import { platformUrl } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navLogin, description: t.subLogin, robots: { index: false, follow: true } };
}

/* কেবল এই দুটি ডেমো প্রতিষ্ঠানের লগইন লিংকে ?demo=<slug> যোগ হয়, যাতে
   অ্যাডমিন লগইনের ঘর দুটি নিজে থেকেই ভরে যায় আর দর্শক এক ক্লিকেই ভেতরটা
   দেখে নিতে পারেন। আসল প্রতিষ্ঠানের লিংকে এটি কখনো বসে না। */
const DEMO_SLUGS = ["demo-govt", "demo-madrasah-official"];

export default async function LoginPage({ params }: Params) {
  const { T, tenant, lang, t } = await loadTenant(params);
  const isDemo = DEMO_SLUGS.includes(tenant.slug);
  const adminUrl = await platformUrl(`/admin/login${isDemo ? `?demo=${tenant.slug}` : ""}`);
  const portals = (tenant.content?.portals || {}) as { student?: string; parent?: string };

  return (
    <>
      <T.PageHeader lang={lang} title={t.navLogin} crumb={t.navLogin} sub={t.subLogin} />
      <LoginOptions
        lang={lang}
        adminUrl={adminUrl}
        studentUrl={portals.student}
        parentUrl={portals.parent}
        phone={tenant.contact.phone}
      />
    </>
  );
}
