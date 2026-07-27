/* সুপার প্যানেল শেল — অ্যাডমিনের মতোই "দপ্তর" ভাষা, কিন্তু পিতলের পট্টি
   দিয়ে আলাদা করা, যাতে স্ক্রিনশট দেখেই বোঝা যায় কোন প্যানেলের কথা হচ্ছে। */
import Link from "next/link";
import { SuperTabs } from "@/components/admin/nav";
import { NavProgress } from "@/components/site/nav-progress";
import { NavRecovery } from "@/components/site/nav-recovery";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/super/tenants", label: "প্রতিষ্ঠান" },
  { href: "/super/users", label: "অ্যাডমিন" },
];

export default function SuperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen canvas-paper text-ink">
      <header className="spine sticky top-0 z-30 text-white"
        style={{ boxShadow: "inset 0 -3px 0 rgba(169,118,30,.85)" }}>
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 h-[60px] flex items-center gap-3">
          <Link href="/super/tenants" className="flex items-center gap-2.5 min-w-0 group">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[15px] font-bold"
              style={{ background: "linear-gradient(160deg, #b9852a, #7d560f)" }}>আ</span>
            <span className="min-w-0">
              <span className="block font-display font-bold text-[15.5px] leading-tight truncate">আমাদের স্কুল</span>
              <span className="block text-[11.5px] text-white/45">সুপার প্যানেল</span>
            </span>
          </Link>
          <SuperTabs items={TABS} />
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 md:py-8">{children}</main>
      <NavProgress />
      <NavRecovery />
    </div>
  );
}
