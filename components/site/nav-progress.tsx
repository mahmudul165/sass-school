"use client";
/* নেভিগেশন অগ্রগতি পট্টি
   ------------------------------------------------------------------
   সমস্যা: লিংকে ক্লিকের পর সার্ভারের সাড়া না আসা পর্যন্ত App Router
   পুরোনো পাতাটাই ধরে রাখে। ধীর সংযোগে (বা dev-এ, যেখানে রুট তখন কম্পাইল
   হয়) সেটি কয়েক সেকেন্ড হতে পারে — ব্যবহারকারীর মনে হয় ক্লিকটাই কাজ
   করেনি, তাই তিনি রিফ্রেশ চাপেন এবং সব কাজ আবার শুরু হয়।

   সমাধান: ক্লিকের সাথে সাথেই উপরে একটি সরু পট্টি চলতে শুরু করে। নতুন
   পাতা এলে পট্টি পূর্ণ হয়ে মিলিয়ে যায়। এটি "কিছু একটা হচ্ছে" জানানোর
   সবচেয়ে সস্তা উপায় — একটিমাত্র <div>, কোনো লাইব্রেরি নয়।

   কেন document-এ ক্লিক শোনা: তাতে প্রতিটি <Link> বদলাতে হয় না, আর
   ভবিষ্যতে যোগ হওয়া লিংকও আপনাআপনি এর আওতায় আসে। */
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  // নতুন পাতা এসে গেছে — পট্টি থামাও
  useEffect(() => { setActive(false); }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // নতুন ট্যাব / ডাউনলোড / ডান-ক্লিক — এগুলোতে পাতা বদলায় না
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.target === "_blank" || a.hasAttribute("download")) return;

      // একই অরিজিনের ভেতরের নেভিগেশন হলেই কেবল
      let url: URL;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      setActive(true);
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true } as never);
  }, []);

  if (!active) return null;

  return (
    <div className="no-print fixed inset-x-0 top-0 z-[100] h-[3px] bg-black/5" role="status" aria-live="polite">
      <span className="nav-progress-bar block h-full" />
      <span className="sr-only">পাতা আসছে…</span>
    </div>
  );
}
