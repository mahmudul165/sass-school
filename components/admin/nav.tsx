"use client";
/* প্যানেলের নেভিগেশন — ডেস্কটপে স্পাইন, মোবাইলে থাম্ব-বার
   ------------------------------------------------------------------
   ক্লায়েন্ট কম্পোনেন্ট হওয়ার একমাত্র কারণ: usePathname()। কোন পাতায় আছি
   তা না দেখালে ব্যবহারকারী প্রতিবার হারিয়ে যান — আর "কোথায় আছি" জানানোই
   একটি প্যানেলকে পেশাদার মনে করায়। বাকি সবকিছু সার্ভারেই থাকে। */
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; short: string; icon: string; badge?: number };

/** কোন লিংকটি সক্রিয় — /admin শুধু হুবহু মিললে, বাকিগুলো উপসর্গ মিললেই */
function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminSidebar({ items, footer }: { items: NavItem[]; footer?: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <nav aria-label="প্রশাসন মেনু" className="hidden md:block w-[228px] shrink-0">
      <div className="sticky top-[72px]">
        <p className="px-4 pb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
          ব্যবস্থাপনা
        </p>
        <ul className="space-y-0.5">
          {items.map((m) => {
            const on = isActive(pathname, m.href);
            return (
              <li key={m.href}>
                <Link href={m.href} data-active={on} aria-current={on ? "page" : undefined}
                  className={`nav-item flex items-center gap-3 pl-4 pr-3 h-11 rounded-lg text-[14.5px] font-semibold
                              transition-colors duration-200 ${
                    on ? "bg-white/10 text-white" : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                  }`}>
                  <span aria-hidden="true" className={`text-[15px] transition-transform duration-200 ${on ? "scale-110" : ""}`}>
                    {m.icon}
                  </span>
                  <span className="flex-1 truncate">{m.label}</span>
                  {m.badge ? (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11.5px] font-bold text-white tabular-nums"
                      style={{ background: "var(--color-margin)" }}>
                      {m.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
        {footer}
      </div>
    </nav>
  );
}

export function AdminTabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="প্রশাসন মেনু"
      className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper/96 backdrop-blur
                 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="flex overflow-x-auto">
        {items.map((m) => {
          const on = isActive(pathname, m.href);
          return (
            <Link key={m.href} href={m.href} aria-current={on ? "page" : undefined}
              className={`relative flex-1 min-w-[76px] flex flex-col items-center justify-center gap-0.5
                          py-2 min-h-[58px] text-[11.5px] font-bold transition-colors
                          ${on ? "text-ink" : "text-ink-soft"}`}>
              {/* সক্রিয় ট্যাবের উপরে পিতলের দাগ */}
              <span aria-hidden="true"
                className={`absolute top-0 h-[3px] rounded-b-full transition-all duration-250 ${on ? "w-8" : "w-0"}`}
                style={{ background: "var(--color-brass)" }} />
              <span className="text-[17px] leading-none" aria-hidden="true">{m.icon}</span>
              {m.short}
              {m.badge ? (
                <span className="absolute top-1.5 right-1/2 translate-x-5 grid h-4 min-w-4 place-items-center
                                 rounded-full px-1 text-[10px] font-bold text-white tabular-nums"
                  style={{ background: "var(--color-margin)" }}>
                  {m.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** সুপার প্যানেলের উপরের ট্যাব */
export function SuperTabs({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="ms-auto flex items-center gap-1 text-[13.5px]">
      {items.map((m) => {
        const on = pathname.startsWith(m.href);
        return (
          <Link key={m.href} href={m.href} aria-current={on ? "page" : undefined}
            className={`relative px-3.5 h-9 grid place-items-center rounded-lg font-semibold transition-colors
                        ${on ? "bg-white/12 text-white" : "text-white/70 hover:text-white hover:bg-white/[0.08]"}`}>
            {m.label}
            <span aria-hidden="true"
              className={`absolute -bottom-[11px] h-[3px] rounded-full transition-all duration-250 ${on ? "w-6" : "w-0"}`}
              style={{ background: "var(--color-brass)" }} />
          </Link>
        );
      })}
    </nav>
  );
}
