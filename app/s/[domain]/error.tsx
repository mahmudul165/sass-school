"use client";
/* পেজ রেন্ডারে ত্রুটি হলে — ফাঁকা পাতার বদলে স্পষ্ট বার্তা ও পুনরায় চেষ্টা।
   ফাঁকা সাদা পাতা দেখলে দর্শক ভাবেন সাইটটাই নষ্ট; এখানে তিনি অন্তত
   জানেন কী হয়েছে এবং এক চাপে আবার চেষ্টা করতে পারেন। */
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // চাঙ্ক লোডের ত্রুটি হলে পুরো পাতা লোডই একমাত্র নিরাময়
    if (/ChunkLoadError|Loading chunk|dynamically imported module/i.test(error?.message || "")) {
      window.location.reload();
    }
  }, [error]);

  return (
    <main className="min-h-[60vh] grid place-items-center p-6">
      <div className="max-w-md text-center">
        <p className="text-[34px] mb-3" aria-hidden="true">⚠️</p>
        <h1 className="t-h3 text-n-900">পাতাটি দেখাতে সমস্যা হয়েছে</h1>
        <p className="mt-3 text-n-600 leading-relaxed">
          সাময়িক সমস্যা হতে পারে। একবার চেষ্টা করলেই সাধারণত ঠিক হয়ে যায়।
        </p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <button onClick={reset}
            className="min-h-[48px] px-6 rounded-xl bg-brand text-brand-on font-bold">
            আবার চেষ্টা করুন
          </button>
          <a href="/" className="min-h-[48px] px-6 rounded-xl bg-white hairline text-n-800 font-bold inline-flex items-center">
            হোমে ফিরুন
          </a>
        </div>
      </div>
    </main>
  );
}
