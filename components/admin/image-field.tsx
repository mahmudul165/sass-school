"use client";
/* ছবি নির্বাচক — তিনটি পথ এক জায়গায়
   ------------------------------------------------------------------
   ১. বিল্ট-ইন লাইব্রেরি থেকে বেছে নেওয়া (সবচেয়ে সহজ, প্রথম দিনেই কাজ করে)
   ২. নিজের ছবি আপলোড (Blob কনফিগার থাকলে)
   ৩. সরাসরি URL বসানো (ফেসবুক/ড্রাইভের লিংক)

   কেন তিনটিই: বাংলাদেশে অনেক প্রতিষ্ঠানের হাতে প্রথমেই ভালো ছবি থাকে না।
   লাইব্রেরি দিয়ে সাইট চালু হয়ে যায়, পরে নিজের ছবি বসিয়ে নেওয়া যায়। */
import { useRef, useState } from "react";
import { STOCK, stockUrl } from "@/lib/images";

export function ImageField({
  name, label, defaultValue, hint, ratio = "aspect-[4/3]", filter,
}: {
  /* defaultValue null-ও হতে পারে: ডেটাবেসে ছবি না দিলে ঘরটি null থাকে।
     `defaultValue = ""` ডিফল্ট শুধু undefined-এর বেলায় কাজ করে, null-এ নয় —
     ফলে null সোজা <input value> পর্যন্ত পৌঁছে React-এর সতর্কবার্তা আনত
     ("`value` prop on `input` should not be null")। তাই টাইপে null মেনে
     নিয়ে ভেতরেই খালি স্ট্রিং-এ রূপান্তর করা হয়। */
  name: string; label: string; defaultValue?: string | null; hint?: string; ratio?: string;
  filter?: "person" | "campus" | "class" | "event" | "madrasah";
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const list = filter ? STOCK.filter((s) => s.tags.includes(filter)) : STOCK;

  async function upload(file: File) {
    setBusy(true); setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "আপলোড ব্যর্থ হয়েছে");
      setUrl(data.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "আপলোড ব্যর্থ হয়েছে");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="block">
      <span className="block text-[14px] font-semibold text-ink mb-1.5">{label}</span>
      <input type="hidden" name={name} value={url ?? ""} />

      <div className="flex gap-3">
        {/* প্রিভিউ */}
        <div className={`${ratio} w-28 shrink-0 rounded-xl border border-rule bg-[#efeadf] overflow-hidden grid place-items-center`}>
          {url
            ? <img src={url} alt="" className="h-full w-full object-cover" />
            : <span className="text-[12px] text-ink-soft px-2 text-center">ছবি নেই</span>}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpen((o) => !o)}
              className="min-h-[40px] px-3.5 rounded-lg border border-rule bg-paper text-[13.5px] font-semibold text-ink hover:border-ink/40 transition">
              লাইব্রেরি থেকে বাছুন
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
              className="min-h-[40px] px-3.5 rounded-lg border border-rule bg-paper text-[13.5px] font-semibold text-ink hover:border-ink/40 transition disabled:opacity-60">
              {busy ? "আপলোড হচ্ছে…" : "ছবি আপলোড"}
            </button>
            {url && (
              <button type="button" onClick={() => setUrl("")}
                className="min-h-[40px] px-3.5 rounded-lg border border-margin/30 text-[13.5px] font-semibold text-margin hover:bg-margin hover:text-white transition">
                সরান
              </button>
            )}
          </div>

          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="অথবা ছবির লিংক (URL) বসান"
            className="w-full min-h-[46px] rounded-lg border border-rule bg-paper px-3 text-[14px] text-ink
                       placeholder:text-ink-soft/55 outline-none focus:border-sky focus:ring-4 focus:ring-sky/12 transition" />

          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />

          {err && <p className="text-[12.5px] text-margin">{err}</p>}
          {hint && !err && <p className="text-[12.5px] text-ink-soft leading-relaxed">{hint}</p>}
        </div>
      </div>

      {open && (
        <div className="mt-3 rounded-xl border border-rule bg-[#fcfaf5] p-3">
          <p className="text-[13px] font-semibold text-ink-soft mb-2.5">
            বাংলাদেশের শিক্ষাপ্রতিষ্ঠানের নিজস্ব আঁকা দৃশ্য — যেকোনোটি বেছে নিন
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {list.map((s) => {
              const u = stockUrl(s.file);
              const on = url === u;
              return (
                <button key={s.file} type="button" onClick={() => { setUrl(u); setOpen(false); }} title={s.label}
                  className={`group rounded-lg overflow-hidden border-2 transition text-left ${
                    on ? "border-sky ring-4 ring-sky/15" : "border-rule hover:border-ink/30"
                  }`}>
                  <span className="block aspect-[4/3] bg-white">
                    <img src={u} alt={s.label} loading="lazy" className="h-full w-full object-cover" />
                  </span>
                  <span className="block px-2 py-1.5 text-[11.5px] leading-tight text-ink-soft line-clamp-2">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** একাধিক ছবি (হিরো স্লাইড) — লাইব্রেরি থেকে টিক দিয়ে বাছাই */
export function ImageListField({ name, label, defaultValue, hint }: {
  /* একই কারণে null মেনে নেওয়া — ডেটাবেসে তালিকা না থাকলে null আসে */
  name: string; label: string; defaultValue?: string[] | null; hint?: string;
}) {
  const [urls, setUrls] = useState<string[]>(defaultValue ?? []);
  const [open, setOpen] = useState(false);
  const toggle = (u: string) =>
    setUrls((xs) => (xs.includes(u) ? xs.filter((x) => x !== u) : [...xs, u]));

  return (
    <div className="block">
      <span className="block text-[14px] font-semibold text-ink mb-1.5">{label}</span>
      <input type="hidden" name={name} value={urls.join("\n")} />

      <div className="flex flex-wrap gap-2 mb-2.5">
        {urls.map((u) => (
          <span key={u} className="relative h-16 w-24 rounded-lg overflow-hidden border border-rule bg-paper">
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => toggle(u)} aria-label="সরান"
              className="absolute top-0.5 right-0.5 h-6 w-6 grid place-items-center rounded-md bg-white/90 text-margin text-[13px] font-bold">
              ✕
            </button>
          </span>
        ))}
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="h-16 w-24 rounded-lg border border-dashed border-rule text-[12.5px] font-semibold text-ink-soft hover:border-sky hover:text-sky transition">
          + ছবি
        </button>
      </div>

      {open && (
        <div className="rounded-xl border border-rule bg-[#fcfaf5] p-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {STOCK.filter((s) => !s.tags.includes("person")).map((s) => {
              const u = stockUrl(s.file);
              const on = urls.includes(u);
              return (
                <button key={s.file} type="button" onClick={() => toggle(u)} title={s.label}
                  className={`rounded-lg overflow-hidden border-2 transition text-left ${
                    on ? "border-sky ring-4 ring-sky/15" : "border-rule hover:border-ink/30"
                  }`}>
                  <span className="block aspect-[4/3] bg-white">
                    <img src={u} alt={s.label} loading="lazy" className="h-full w-full object-cover" />
                  </span>
                  <span className="block px-2 py-1.5 text-[11.5px] leading-tight text-ink-soft line-clamp-2">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {hint && <p className="mt-1.5 text-[12.5px] text-ink-soft leading-relaxed">{hint}</p>}
    </div>
  );
}
