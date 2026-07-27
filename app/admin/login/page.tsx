"use client";
/* অ্যাডমিন লগইন — খাতার প্রথম পাতা।
   বাঁয়ে মলাটের রঙে পরিচয়, ডানে সাদা পাতায় ফর্ম। ফোনে শুধু ফর্মটুকু,
   কারণ ছোট পর্দায় সাজসজ্জা নয়, দ্রুত ঢোকাই দরকার। */
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

/* ডেমো অ্যাকাউন্ট — শুধু দুটি ডেমো প্রতিষ্ঠানের জন্য।
   দর্শক ডেমো সাইটের লগইন লিংকে ক্লিক করলে ঠিকানায় ?demo=<slug> থাকে,
   তখনই ঘর দুটি নিজে থেকে ভরে যায় — এক ক্লিকেই ভেতরে ঢুকে দেখতে পারেন।

   ⚠ ইচ্ছাকৃতভাবে এখানে কোনো বোতাম বা তালিকা দেখানো হয় না। এই পাতাটি
   আসল প্রতিষ্ঠানগুলোও ব্যবহার করে; সবার সামনে ডেমো পাসওয়ার্ড ঝুলিয়ে
   রাখলে সেটি নিরাপত্তার দিক থেকে ভুল বার্তা দিত। */
const DEMO_ACCOUNTS: Record<string, string> = {
  "demo-govt": "school1234",
  "demo-madrasah-official": "school1234",
};

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  /* ঠিকানায় ?demo=<slug> থাকলে ঘর দুটি নিজে থেকেই ভরে যায়।
     useEffect-এ করা হচ্ছে ইচ্ছাকৃতভাবে — সার্ভারে ঠিকানার query জানা
     যায় না বলে রেন্ডারের সময় পড়লে সার্ভার ও ব্রাউজারের HTML আলাদা হয়ে
     হাইড্রেশন ভেঙে পড়ত। */
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("demo") || "";
    const pass = DEMO_ACCOUNTS[slug];
    if (pass) { setUsername(slug); setPassword(pass); setIsDemo(true); }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await signIn("credentials", { username, password, redirect: false });
    setBusy(false);
    if (r?.error) return setErr("ইউজারনেম বা পাসওয়ার্ড মেলেনি");
    window.location.href = "/admin";
  }

  const field =
    "w-full min-h-[50px] rounded-xl border border-rule bg-[#fdfcf9] px-4 text-[15.5px] text-ink " +
    "outline-none transition-[border-color,box-shadow,background-color] duration-200 " +
    "hover:border-ink/25 focus:bg-paper focus:border-sky focus:ring-4 focus:ring-sky/12";

  return (
    <main className="min-h-screen canvas-paper grid lg:grid-cols-[1.05fr_1fr]">
      {/* মলাট — শুধু বড় পর্দায় */}
      <aside className="spine hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl text-[17px] font-bold"
            style={{ background: "linear-gradient(160deg, #b9852a, #7d560f)" }}>আ</span>
          <span className="font-display font-bold text-[18px]">আমাদের স্কুল</span>
        </div>

        <div className="max-w-md">
          <h2 className="font-display text-[34px] font-extrabold leading-[1.3]">
            আপনার প্রতিষ্ঠানের<br />ওয়েবসাইট, আপনার হাতে
          </h2>
          <span className="mt-5 block h-[3px] w-16 rounded-full"
            style={{ background: "linear-gradient(90deg, var(--color-brass), transparent)" }} />
          <p className="mt-5 text-[15px] text-white/60 leading-[1.9]">
            নোটিশ, ফলাফল, শিক্ষক তালিকা ও ছবি — এখান থেকে যা বদলাবেন,
            সাইটে সাথে সাথেই দেখা যাবে।
          </p>
        </div>

        <p className="text-[12.5px] text-white/35">
          ইউজারনেম ভুলে গেলে ওয়েবসাইট সরবরাহকারীর সাথে যোগাযোগ করুন।
        </p>
      </aside>

      {/* পাতা — ফর্ম */}
      <div className="grid place-items-center p-4 sm:p-8">
        <form onSubmit={submit}
          className="w-full max-w-[400px] bg-paper rounded-2xl border border-rule p-6 md:p-8 space-y-4
                     shadow-[0_1px_2px_rgba(27,42,36,.04),0_18px_44px_-24px_rgba(27,42,36,.35)]">
          <div className="lg:hidden flex items-center gap-2.5 mb-1">
            <span className="grid h-10 w-10 place-items-center rounded-xl text-white text-[15px] font-bold"
              style={{ background: "linear-gradient(160deg, #b9852a, #7d560f)" }}>আ</span>
            <span className="font-display font-bold text-ink text-[16px]">আমাদের স্কুল</span>
          </div>

          <div>
            <h1 className="font-display text-[24px] font-extrabold text-ink tracking-tight">অ্যাডমিন লগইন</h1>
            <span className="mt-2.5 block h-[3px] w-11 rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-brass), rgba(169,118,30,.15))" }} />
            <p className="mt-3 text-[14px] text-ink-soft">প্রতিষ্ঠানের ওয়েবসাইট পরিচালনা করুন</p>
          </div>

          {err && (
            <p className="rounded-xl bg-[#f9e9e7] text-margin px-3.5 py-3 text-[13.5px] font-bold" role="alert">
              {err}
            </p>
          )}

          <label className="block">
            <span className="block text-[13.5px] font-bold text-ink mb-1.5">ইউজারনেম</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required
              autoCapitalize="none" autoComplete="username" placeholder="যেমন: dhaka-adarsha" className={field} />
          </label>

          <label className="block">
            <span className="block text-[13.5px] font-bold text-ink mb-1.5">পাসওয়ার্ড</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
              autoComplete="current-password" placeholder="••••••••" className={field} />
          </label>

          <button disabled={busy}
            className="w-full min-h-[50px] rounded-xl font-bold text-[15.5px] text-white tracking-tight
                       transition-all duration-200 disabled:opacity-60
                       shadow-[0_1px_2px_rgba(27,42,36,.12),0_8px_20px_-10px_rgba(169,118,30,.75)]
                       hover:brightness-[1.07] active:brightness-95
                       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky/25"
            style={{ background: "linear-gradient(180deg, #b9852a, var(--color-brass))" }}>
            {busy ? "যাচাই হচ্ছে…" : "লগইন করুন"}
          </button>

          <p className="text-center text-[12.5px] text-ink-soft leading-relaxed">
            পাসওয়ার্ড ভুলে গেলে ওয়েবসাইট সরবরাহকারীর সাথে যোগাযোগ করুন।
          </p>

          {/* ডেমো থেকে আসা হলে ছোট্ট আশ্বাস — ঘর ভরা কেন, তা যেন স্পষ্ট হয় */}
          {isDemo && (
            <p className="rounded-xl bg-brass-soft text-[12.5px] text-ink px-3.5 py-2.5 text-center leading-relaxed">
              ডেমো অ্যাকাউন্ট বসানো আছে — শুধু <b>লগইন করুন</b> চাপুন।
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
