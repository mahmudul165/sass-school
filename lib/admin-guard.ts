/* অ্যাডমিন পেজ ও অ্যাকশনের একমাত্র পাহারা
   ------------------------------------------------------------------
   প্রতিটি পেজে আলাদা করে auth() + অনুমতি পরীক্ষা লিখলে একদিন কোথাও
   ভুলে যাওয়া নিশ্চিত — আর ভুলে যাওয়া মানে অন্য কারও তথ্য বদলে ফেলা।
   তাই একটিই ফাংশন: সেশন নেই → লগইন পেজ; অনুমতি নেই → নিজের ড্যাশবোর্ড। */
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { can, type Feature } from "./permissions";

export type AdminCtx = { tenantId: string; permissions: string[]; name: string; role: string };

export async function requireAdmin(feature?: Feature): Promise<AdminCtx> {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const u = session.user as never as { tenantId?: string; permissions?: string[]; name?: string; role?: string };
  if (!u.tenantId) redirect("/admin/login");
  const permissions = u.permissions || [];
  if (feature && !can(permissions, feature)) redirect(`/admin/denied?f=${feature}`);
  return { tenantId: u.tenantId, permissions, name: u.name || "", role: u.role || "admin" };
}
