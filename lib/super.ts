import { cookies } from "next/headers";
import crypto from "crypto";

function sig(v: string) {
  return crypto.createHmac("sha256", process.env.AUTH_SECRET || "dev").update(v).digest("hex");
}
export async function setSuperCookie() {
  const c = await cookies();
  c.set("super", sig("super-ok"), {
    httpOnly: true,
    /* secure শুধু প্রোডাকশনে। লোকালে http://localhost-এ Secure কুকি ব্রাউজার
       সংরক্ষণই করে না — ফলে সঠিক পাসওয়ার্ড দিলেও লগইন "নীরবে" ব্যর্থ হয়ে
       আবার লগইন পেজেই ফিরিয়ে আনত, কোনো ভুল বার্তা ছাড়াই। */
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}
export async function isSuper() {
  const c = await cookies();
  return c.get("super")?.value === sig("super-ok");
}
