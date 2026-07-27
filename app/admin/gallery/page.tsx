import { requireAdmin } from "@/lib/admin-guard";
import { forTenant } from "@/lib/dal";
import type { Gallery } from "@/templates/types";
import { saveGallery, deleteGallery } from "@/actions/admin";
import { Field, Btn, Card, PageHead, Empty, Row } from "@/components/ui";
import { ImageListField } from "@/components/admin/image-field";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { tenantId } = await requireAdmin("gallery");
  const galleries = await forTenant(tenantId).galleries.list<Gallery>();

  return (
    <div className="space-y-5 stagger">
      <PageHead title="গ্যালারি" sub="অ্যালবামগুলো সাইটের গ্যালারি পেজে ও হোমপেজে দেখাবে।" />

      <Card title="নতুন অ্যালবাম">
        <form action={saveGallery} className="space-y-4">
          <Field label="অ্যালবামের নাম" name="title" placeholder="বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬" required />
          <ImageListField name="urls" label="ছবি"
            hint="লাইব্রেরি থেকে বাছুন, অথবা নিজের ছবি আপলোড করে লিংক বসান। অন্তত একটি ছবি দিতে হবে।" />
          <Btn type="submit">অ্যালবাম তৈরি করুন</Btn>
        </form>
      </Card>

      <Card title={`অ্যালবাম (${galleries.length})`}>
        {!galleries.length && <Empty icon="🖼️" title="এখনও কোনো অ্যালবাম নেই" sub="প্রথম অ্যালবামটি উপরের ফর্ম থেকে তৈরি করুন।" />}
        <div className="-mx-5 md:-mx-6 -mb-5 md:-mb-6">
          {galleries.map((g: Gallery) => (
            <Row key={g._id}>
              <div className="flex gap-1.5 shrink-0">
                {g.images.slice(0, 3).map((im, i) => (
                  <span key={i} className="h-12 w-12 rounded-lg overflow-hidden bg-[#efeadf]">
                    <img src={im.url} alt="" className="h-full w-full object-cover" />
                  </span>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink truncate">{g.title}</p>
                <p className="text-[13.5px] text-ink-soft">{g.images.length}টি ছবি</p>
              </div>
              <form action={deleteGallery} className="shrink-0">
                <input type="hidden" name="id" value={g._id} />
                <Btn type="submit" size="sm" danger>মুছুন</Btn>
              </form>
            </Row>
          ))}
        </div>
      </Card>
    </div>
  );
}
