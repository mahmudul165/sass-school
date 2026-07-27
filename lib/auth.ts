import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDb } from "./db";
import { verifyPassword, normalizeUsername } from "./password";

/* লগইন: ইউজারনেম + পাসওয়ার্ড।
   আগে ফোনে OTP পাঠানো হতো — তাতে প্রতিটি লগইনে SMS খরচ, গেটওয়ে নির্ভরতা
   এবং কোড দেরিতে আসার ঝুঁকি ছিল। প্রতিষ্ঠান-অ্যাডমিন একই ডিভাইস থেকে বারবার
   ঢোকেন, তাই সাধারণ ইউজারনেম-পাসওয়ার্ডই ব্যবহারিক ও নির্ভরযোগ্য। */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      async authorize(creds) {
        const raw = String(creds?.username || "").trim();
        const username = normalizeUsername(raw);
        const password = String(creds?.password || "");
        if (!password || (!username && !raw)) return null;

        const db = await getDb();
        // ইউজারনেম, নয়তো মোবাইল নম্বর — পুরোনো অ্যাকাউন্টও যেন ঢুকতে পারে
        const user = await db.collection("users").findOne({
          $or: [{ username: username || raw.toLowerCase() }, { phone: raw }],
        });
        if (!user || !verifyPassword(password, user.passwordHash)) return null;

        return {
          id: String(user._id),
          name: user.name || user.username || user.phone,
          tenantId: String(user.tenantId),
          role: user.role || "admin",
          permissions: Array.isArray(user.permissions) ? user.permissions : [],
        } as never;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.tenantId = (user as never as { tenantId: string }).tenantId;
        token.role = (user as never as { role: string }).role;
        token.permissions = (user as never as { permissions: string[] }).permissions;
      }
      return token;
    },
    session({ session, token }) {
      const u = session.user as never as { tenantId: string; role: string; permissions: string[] };
      u.tenantId = token.tenantId as string;
      u.role = token.role as string;
      u.permissions = (token.permissions as string[]) || [];
      return session;
    },
  },
});
