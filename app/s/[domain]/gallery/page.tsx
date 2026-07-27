import { loadTenant, type Params } from "@/lib/page";
import { Section, SectionHead } from "@/components/site/ui";
import { VideoEmbed } from "@/components/site/interactive";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params) {
  const { t } = await loadTenant(params);
  return { title: t.navGallery, description: t.subGallery };
}

export default async function GalleryPage({ params }: Params) {
  const { T, content, lang, t, dal } = await loadTenant(params);
  const galleries = await dal.galleries();
  return (
    <>
      <T.PageHeader lang={lang} title={t.secGallery} crumb={t.navGallery} sub={t.subGallery} />
      <T.GallerySection lang={lang} galleries={galleries} />

      {content.videos.length > 0 && (
        <Section id="video" tone="soft">
          <SectionHead
            eyebrow={lang === "en" ? "Video gallery" : "ভিডিও গ্যালারি"}
            title={lang === "en" ? "Take a tour of our campus" : "ক্যাম্পাস ঘুরে দেখুন"} />
          <div className="grid md:grid-cols-3 gap-6">
            {content.videos.map((v) => (
              <div key={v.youtubeId}>
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-n-200">
                  <VideoEmbed youtubeId={v.youtubeId} title={v.title} />
                </div>
                <p className="mt-3 font-semibold text-n-800">{v.title}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
