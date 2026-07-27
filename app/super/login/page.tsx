import { superLogin } from "@/actions/super";

export const dynamic = "force-dynamic";

export default async function SuperLogin({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;

  const field =
    "w-full min-h-[50px] rounded-xl border border-rule bg-[#fdfcf9] px-4 text-[15.5px] text-ink " +
    "outline-none transition-[border-color,box-shadow,background-color] duration-200 " +
    "hover:border-ink/25 focus:bg-paper focus:border-sky focus:ring-4 focus:ring-sky/12";

  return (
    <main className="spine min-h-screen grid place-items-center p-4">
      <form action={superLogin}
        className="w-full max-w-[400px] bg-paper rounded-2xl border border-rule p-6 md:p-8 space-y-4
                   shadow-[0_20px_60px_-24px_rgba(0,0,0,.55)]">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl text-white font-bold text-[16px]"
            style={{ background: "linear-gradient(160deg, #b9852a, #7d560f)" }}>আ</span>
          <div>
            <h1 className="font-display text-[20px] font-extrabold text-ink leading-tight tracking-tight">সুপার প্যানেল</h1>
            <p className="text-[12.5px] text-ink-soft">প্ল্যাটফর্ম ব্যবস্থাপনা</p>
          </div>
        </div>
        <span className="block h-[3px] w-11 rounded-full"
          style={{ background: "linear-gradient(90deg, var(--color-brass), rgba(169,118,30,.15))" }} />

        {e && (
          <p className="rounded-xl bg-[#f9e9e7] text-margin px-3.5 py-3 text-[13.5px] font-bold" role="alert">
            ইউজারনেম বা পাসওয়ার্ড ভুল — আবার চেষ্টা করুন
          </p>
        )}

        <label className="block">
          <span className="block text-[13.5px] font-bold text-ink mb-1.5">ইউজারনেম</span>
          <input name="username" placeholder="superadmin" autoFocus required
            autoCapitalize="none" autoComplete="username" className={field} />
        </label>

        <label className="block">
          <span className="block text-[13.5px] font-bold text-ink mb-1.5">পাসওয়ার্ড</span>
          <input name="password" type="password" placeholder="••••••••" required
            autoComplete="current-password" className={field} />
        </label>

        <button
          className="w-full min-h-[50px] rounded-xl font-bold text-[15.5px] text-white tracking-tight
                     transition-all duration-200 hover:brightness-[1.07] active:brightness-95
                     shadow-[0_1px_2px_rgba(27,42,36,.12),0_8px_20px_-10px_rgba(169,118,30,.75)]
                     focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky/25"
          style={{ background: "linear-gradient(180deg, #b9852a, var(--color-brass))" }}>
          প্রবেশ করুন
        </button>

        <p className="text-center text-[12.5px] text-ink-soft">এই প্যানেল শুধু প্ল্যাটফর্ম মালিকের জন্য।</p>
      </form>
    </main>
  );
}
