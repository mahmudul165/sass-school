/* ডেমো প্রিভিউ চালু/বন্ধ
   ------------------------------------------------------------------
   কেন এই পথ: Vercel-এর *.vercel.app ঠিকানায় নিজের ইচ্ছেমতো সাবডোমেইন
   বানানো যায় না — demo-govt.<project>.vercel.app-এর কোনো DNS নেই, তাই
   ব্রাউজার ERR_CONNECTION_CLOSED দেখায়। কাস্টম ডোমেইনে ওয়াইল্ডকার্ড
   (*.example.com) যোগ না করা পর্যন্ত সাবডোমেইন-ভিত্তিক মাল্টি-টেন্যান্সি
   ওখানে চলবে না।

   তাই বিকল্প: এখানে একটি কুকি বসে, আর middleware মূল ডোমেইনের সব পথকে
   ওই প্রতিষ্ঠানের সাইটে রূপান্তরিত করে। টেমপ্লেটের ভেতরের লিংকগুলো
   ("/about", "/notice") অবিকল থাকে বলে পুরো সাইট স্বাভাবিকভাবেই ঘোরা যায়।

   /demo/exit — কুকি মুছে আবার পরিচিতি পাতায় ফেরত। */
import { NextResponse } from "next/server";

/* শুধু এই দুটি ডেমো প্রতিষ্ঠান — যেকোনো slug বসিয়ে অন্যের সাইট
   মূল ডোমেইনে দেখানো যাবে না। */
const ALLOWED = ["demo-govt", "demo-madrasah-official"];

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const url = new URL(_req.url);

  if (slug === "exit") {
    const res = NextResponse.redirect(new URL("/", url.origin));
    res.cookies.delete("demo-tenant");
    return res;
  }

  if (!ALLOWED.includes(slug)) {
    return NextResponse.redirect(new URL("/", url.origin));
  }

  const res = NextResponse.redirect(new URL("/", url.origin));
  res.cookies.set("demo-tenant", slug, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 4, // চার ঘণ্টা — ঘুরে দেখার জন্য যথেষ্ট
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
