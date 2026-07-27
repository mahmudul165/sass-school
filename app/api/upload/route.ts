import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "লগইন প্রয়োজন" }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: "ছবি স্টোরেজ কনফিগার করা নেই — আপাতত ছবির লিংক (URL) ব্যবহার করুন" }, { status: 501 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "ফাইল পাওয়া যায়নি" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "ছবি সর্বোচ্চ ৪MB" }, { status: 400 });
  const blob = await put(`u/${Date.now()}-${file.name}`, file, { access: "public" });
  return NextResponse.json({ url: blob.url });
}
