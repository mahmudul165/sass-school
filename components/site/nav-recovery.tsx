"use client";
/* নেভিগেশন পুনরুদ্ধার — "রিফ্রেশ না দিলে কনটেন্ট আসে না" সমস্যার আসল সমাধান
   ------------------------------------------------------------------
   কেন হয়: App Router পাতা বদলানোর সময় জাভাস্ক্রিপ্ট চাঙ্ক ও RSC পেলোড
   আলাদা করে নামায়। সার্ভারে নতুন বিল্ড গেলে (ডেপ্লয়, বা dev-এ রিস্টার্ট)
   পুরোনো ট্যাবের হাতে থাকা ফাইলের নামগুলো আর সার্ভারে নেই — অনুরোধ 404
   হয়, রাউটার নীরবে থেমে যায়, পাতা বদলায় না। ব্যবহারকারীর মনে হয়
   "কনটেন্ট আসছে না", তিনি রিফ্রেশ দেন, আর তখন কাজ করে।

   সমাধান: সেই নীরব ব্যর্থতাকে ধরে ফেলে নিজে থেকেই পুরো পাতা লোড করা।
   ব্যবহারকারীকে আর কখনো রিফ্রেশ চাপতে হয় না।

   দুটি সুরক্ষা:
   • একই ঠিকানায় বারবার রিলোড হয়ে লুপ তৈরি না হয় — sessionStorage-এ চিহ্ন।
   • শুধু চাঙ্ক/মডিউল লোডের ব্যর্থতা ধরা হয়, অন্য কোনো ত্রুটি নয়। */
import { useEffect } from "react";

const KEY = "nav-recovery-count";
const MAX_RECOVERIES = 2;
const CHUNK_ERROR =
  /ChunkLoadError|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

/* লুপ গার্ড: সময়ের জানালা নয়, গোনা।
   সময়ভিত্তিক গার্ড দিলে সত্যিই ভাঙা বিল্ডে প্রতি ১০ সেকেন্ডে একবার করে
   অনন্তকাল রিলোড হতো — ব্যবহারকারীর কাছে সেটি আরও খারাপ। তাই এক
   ট্যাব-সেশনে সর্বোচ্চ দুইবার; তারপরও না সারলে error boundary নিজের
   বার্তা দেখাবে, আর ব্যবহারকারী সিদ্ধান্ত নেবেন। */
function recover(target?: string) {
  let count = 0;
  try {
    count = Number(sessionStorage.getItem(KEY) || 0);
    if (count >= MAX_RECOVERIES) return;
    sessionStorage.setItem(KEY, String(count + 1));
  } catch {
    /* সিক্রেট মোডে sessionStorage বন্ধ থাকতে পারে — তখন একবার চেষ্টা করেই ক্ষান্ত */
    if (count > 0) return;
  }
  if (target && target !== window.location.href) window.location.href = target;
  else window.location.reload();
}

/** পাতা ঠিকভাবে চলছে — গোনা মুছে দিই, যাতে ভবিষ্যতে আবার সুযোগ থাকে */
function markHealthy() {
  try { sessionStorage.removeItem(KEY); } catch { /* উপেক্ষা */ }
}

export function NavRecovery() {
  useEffect(() => {
    /* গোনা মুছি, তবে সাথে সাথে নয় — ৩০ সেকেন্ড টিকে থাকলে তবেই।
       সাথে সাথে মুছলে যে লুপ তৈরি হতো: মাউন্ট → গোনা শূন্য → নেভিগেশন
       ব্যর্থ → রিলোড → আবার মাউন্ট → অনন্তকাল। টিকে থাকা প্রমাণ করে
       পাতাটি সত্যিই সুস্থ, তখনই আবার সুযোগ দেওয়া নিরাপদ। */
    const healthy = setTimeout(markHealthy, 30_000);

    const onError = (e: ErrorEvent) => {
      const msg = e?.message || "";
      if (CHUNK_ERROR.test(msg)) recover();
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e?.reason;
      const msg = typeof r === "string" ? r : r?.message || "";
      if (CHUNK_ERROR.test(msg)) recover();
    };

    /* ক্লিক করেও পাতা না বদলালে — শেষ ভরসা। লিংকে ক্লিকের ৮ সেকেন্ড পরেও
       যদি ঠিকানা একই থাকে, ধরে নেওয়া হয় রাউটার আটকে গেছে, আর সরাসরি
       পুরো পাতা লোড করা হয়। ৮ সেকেন্ড ইচ্ছাকৃতভাবে উদার — ধীর ৩জি-তে
       স্বাভাবিক নেভিগেশনকে যেন ভুল করে না ধরে। */
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try { url = new URL(a.href, location.href); } catch { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;

      const from = location.pathname + location.search;
      setTimeout(() => {
        const now = location.pathname + location.search;
        if (now === from) recover(url.href);
      }, 8000);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      clearTimeout(healthy);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      document.removeEventListener("click", onClick, { capture: true } as never);
    };
  }, []);

  return null;
}
