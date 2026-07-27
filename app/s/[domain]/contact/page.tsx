import { loadTenant, type Params } from "@/lib/page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navContact, description: t.subContact };
}

export default async function ContactPage({ params }: Params) {
  const { T, tenant, lang, t } = await loadTenant(params);
  return (
    <>
      <T.PageHeader lang={lang} title={t.navContact} crumb={t.navContact}
        sub={tenant.contact.officeHours
          ? `${t.officeHours}: ${tenant.contact.officeHours}`
          : lang === "en"
            ? "Reach us in person, by phone or on WhatsApp."
            : "সরাসরি, ফোনে অথবা WhatsApp-এ যোগাযোগ করুন।"} />
      <T.ContactBlock lang={lang} tenant={tenant} />
    </>
  );
}
