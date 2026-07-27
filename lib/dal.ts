import { getDb, ObjectId } from "./db";
import { unstable_cache } from "next/cache";
import { contentTag } from "./tenant";
import type { Notice, Teacher, Result, Gallery, EventDoc } from "@/templates/types";

// Tenant-scoped Data Access Layer — সরাসরি collection query নিষিদ্ধ,
// সব read/write এখান দিয়ে যায় যাতে tenant leak অসম্ভব হয়।
export function forTenant(tenantId: string) {
  const tid = new ObjectId(tenantId);
  // JSON round-trip: ObjectId/Date → string, যাতে সার্ভার→ক্লায়েন্ট সীমানা পেরোতে পারে।
  // জেনেরিক <T> দেওয়ায় প্রতিটি কলসাইট আসল টাইপ পায়, `any` ছড়ায় না।
  const scoped = (col: string) => ({
    async list<T = Record<string, unknown>>(
      filter: Record<string, unknown> = {},
      sort: Record<string, 1 | -1> = { createdAt: -1 },
      limit = 100
    ): Promise<T[]> {
      const db = await getDb();
      const docs = await db.collection(col).find({ ...filter, tenantId: tid }).sort(sort).limit(limit).toArray();
      return JSON.parse(JSON.stringify(docs)) as T[];
    },
    async get<T = Record<string, unknown>>(id: string): Promise<T | null> {
      const db = await getDb();
      const doc = await db.collection(col).findOne({ _id: new ObjectId(id), tenantId: tid });
      return doc ? (JSON.parse(JSON.stringify(doc)) as T) : null;
    },
    async create(doc: Record<string, unknown>) {
      const db = await getDb();
      return db.collection(col).insertOne({ ...doc, tenantId: tid, createdAt: new Date() });
    },
    async update(id: string, set: Record<string, unknown>) {
      const db = await getDb();
      return db.collection(col).updateOne({ _id: new ObjectId(id), tenantId: tid }, { $set: set });
    },
    async remove(id: string) {
      const db = await getDb();
      return db.collection(col).deleteOne({ _id: new ObjectId(id), tenantId: tid });
    },
  });
  return {
    notices: scoped("notices"),
    teachers: scoped("teachers"),
    results: scoped("results"),
    galleries: scoped("galleries"),
    events: scoped("events"),
    inquiries: scoped("inquiries"),
    users: scoped("users"),
  };
}

// পাবলিক পেজের জন্য ক্যাশড রিড — নোটিশ পাবলিশে revalidateTag(contentTag)
export function cachedContent(tenantId: string) {
  const cache = <T>(fn: () => Promise<T>, key: string) =>
    unstable_cache(fn, [key], { tags: [contentTag(tenantId)], revalidate: 3600 })();

  return {
    notices: (limit = 20) =>
      cache<Notice[]>(
        () => forTenant(tenantId).notices.list<Notice>({}, { pinned: -1, createdAt: -1 }, limit),
        `notices-${tenantId}-${limit}`
      ),
    teachers: () =>
      cache<Teacher[]>(
        () => forTenant(tenantId).teachers.list<Teacher>({}, { order: 1, createdAt: 1 }),
        `teachers-${tenantId}`
      ),
    results: () =>
      cache<Result[]>(
        () => forTenant(tenantId).results.list<Result>({}, { createdAt: -1 }, 50),
        `results-${tenantId}`
      ),
    galleries: () =>
      cache<Gallery[]>(
        () => forTenant(tenantId).galleries.list<Gallery>({}, { createdAt: -1 }, 30),
        `galleries-${tenantId}`
      ),
    // অনুষ্ঠান — তারিখের ক্রমে, যাতে আসন্নগুলো আগে আসে
    events: (limit = 12) =>
      cache<EventDoc[]>(
        () => forTenant(tenantId).events.list<EventDoc>({}, { date: 1 }, limit),
        `events-${tenantId}-${limit}`
      ),
  };
}
