"use client";
/* ক্লায়েন্ট-সাইড ইন্টার‌্যাকশন — যতটা সম্ভব কম।
   নীতি: যা CSS দিয়ে হয় তা CSS দিয়েই (accordion = <details>, dropdown = focus-within,
   carousel = scroll-snap)। JS শুধু সেখানেই যেখানে অ্যাক্সেসিবিলিটি বা কার্যকারিতা দাবি করে।
   কারণ — বাংলাদেশে বড় অংশ দর্শক ২জি/৩জি ও কম-ক্ষমতার ফোনে সাইট খোলেন। */

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Icon, WhatsAppIcon, MessengerIcon } from "./icons";
import { toBnDigits, toEnDigits } from "@/lib/digits";
import { waLink } from "@/lib/utils";

/* ── ১. স্ক্রল রিভিল ─────────────────────────────────────
   এখানে আর কোনো কোড নেই — ইচ্ছাকৃতভাবে।

   আগে একটি RevealProvider ছিল যা IntersectionObserver দিয়ে [data-reveal]
   উপাদানে ক্লাস বসাত। কিন্তু সেটি layout-এ মাউন্ট হতো, আর App Router-এ
   রুট বদলালে layout রিমাউন্ট হয় না — তাই নতুন পাতার উপাদান কখনো observe
   হতো না, opacity:0-তেই থেকে যেত। ব্যবহারকারীর অভিজ্ঞতা: "রিফ্রেশ না
   দিলে কনটেন্ট দেখা যায় না।"

   এখন পুরোটাই CSS (globals.css → animation-timeline: view())। কনটেন্ট
   ডিফল্টে দৃশ্যমান, অ্যানিমেশন কেবল বাড়তি — JS ব্যর্থ হলেও লেখা পড়া
   যাবে। উপরন্তু ক্লায়েন্টে কম জাভাস্ক্রিপ্ট, যা কম-ক্ষমতার ফোনে লাভ। */

/* ── ২. পরিসংখ্যান কাউন্টার ──────────────────────────────
   "৮৫০+" / "৯৮%" — বাংলা সংখ্যা, উপসর্গ ও প্রত্যয় অক্ষত রেখে গোনে। */
export function CountUp({ value, className, duration = 1400 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const en = toEnDigits(value);
    const m = en.match(/(\D*)(\d[\d,]*)(.*)/s);
    if (!m) { setShown(value); return; }
    const [, pre, numRaw, post] = m;
    const target = Number(numRaw.replace(/,/g, ""));
    if (!Number.isFinite(target) || target === 0) { setShown(value); return; }

    const wasBn = /[০-৯]/.test(value);
    const fmt = (n: number) => {
      const s = String(n);
      return pre + (wasBn ? toBnDigits(s) : s) + post;
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(value); return; }

    setShown(fmt(0));
    let raf = 0, start = 0;
    const run = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      // easeOutExpo — শুরুতে দ্রুত, শেষে থিতু; চোখে "গুনছে" মনে হয়
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setShown(fmt(Math.round(target * eased)));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) { raf = requestAnimationFrame(run); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, duration]);

  return <span ref={ref} className={className}>{shown}</span>;
}

/* ── ভাষা পরিবর্তন ────────────────────────────────────────
   কুকিতে পছন্দ রেখে পেজ রিফ্রেশ। কেন URL-এ /en নয়: তাতে প্রতিটি পেজের
   দুটি ঠিকানা তৈরি হতো, নোটিশের লিংক শেয়ার করলে ভাষা বদলে যেত, আর
   সার্চ ইঞ্জিনে ডুপ্লিকেট কনটেন্ট হিসেবে গণ্য হওয়ার ঝুঁকি থাকত। */
export function LangSwitch({ lang, className = "" }: { lang: "bn" | "en"; className?: string }) {
  const pick = (l: "bn" | "en") => {
    document.cookie = `site-lang=${l};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    window.location.reload();
  };
  const btn = (l: "bn" | "en", label: string) => (
    <button type="button" onClick={() => pick(l)} aria-pressed={lang === l} lang={l}
      className={`px-2 py-1 rounded-md text-[12.5px] font-bold transition ${
        lang === l ? "bg-white/25 text-white" : "text-white/65 hover:text-white"
      }`}>
      {label}
    </button>
  );
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-lg bg-white/10 p-0.5 ${className}`}
      role="group" aria-label={lang === "en" ? "Language" : "ভাষা"}>
      {btn("bn", "বাংলা")}
      {btn("en", "EN")}
    </span>
  );
}

/* ── ৩. মোবাইল ড্রয়ার নেভিগেশন ──────────────────────────── */
export type NavNode = { href: string; label: string; children?: { href: string; label: string; desc?: string; icon?: string }[] };

export function MobileNav({ nav, name, logo, phone, whatsapp, accentClass = "bg-brand", labels }: {
  nav: NavNode[]; name: string; logo?: string; phone?: string; whatsapp?: string; accentClass?: string;
  labels?: { open?: string; close?: string; menu?: string; call?: string };
}) {
  const L = { open: "মেনু খুলুন", close: "বন্ধ করুন", menu: "প্রধান মেনু", call: "কল করুন", ...labels };
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <>
      <button
        type="button" onClick={() => setOpen(true)}
        className="lg:hidden inline-grid place-items-center h-11 w-11 rounded-xl hairline bg-white/90 text-n-800"
        aria-label={L.open} aria-expanded={open}
      >
        <Icon name="menu" size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label={L.menu}>
          <button className="absolute inset-0 bg-n-900/55 backdrop-blur-sm" aria-label={L.close} onClick={() => setOpen(false)} />
          <div ref={panelRef} className="absolute inset-y-0 right-0 w-[86%] max-w-sm bg-white shadow-2xl flex flex-col animate-[slideIn_.28s_cubic-bezier(.22,1,.36,1)]">
            <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:none}}`}</style>
            <div className="flex items-center gap-3 p-4 border-b border-n-200">
              {logo ? <img src={logo} alt="" className="h-10 w-10 rounded-lg object-contain" />
                : <span className={`h-10 w-10 rounded-lg grid place-items-center text-white font-bold ${accentClass}`}>{name[0]}</span>}
              <p className="font-bold text-n-900 leading-tight flex-1 line-clamp-2">{name}</p>
              <button onClick={() => setOpen(false)} aria-label={L.close} className="h-10 w-10 grid place-items-center rounded-lg hover:bg-n-100">
                <Icon name="x" size={22} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain p-3">
              {nav.map((n) =>
                n.children?.length ? (
                  <details key={n.href} className="group border-b border-n-100">
                    <summary className="flex items-center justify-between py-3.5 px-2 font-semibold text-n-800 cursor-pointer list-none marker:hidden">
                      {n.label}
                      <Icon name="chevronDown" size={18} className="transition-transform group-open:rotate-180 text-n-400" />
                    </summary>
                    <div className="pb-2">
                      {n.children.map((c) => (
                        <Link key={c.href} href={c.href} onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 py-2.5 pl-5 pr-2 text-[15px] text-n-600 rounded-lg hover:bg-n-50">
                          <Icon name={c.icon} size={16} className="text-brand shrink-0" />
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                    className="block py-3.5 px-2 font-semibold text-n-800 border-b border-n-100 hover:bg-n-50 rounded-lg">
                    {n.label}
                  </Link>
                )
              )}
            </nav>

            <div className="p-4 border-t border-n-200 grid grid-cols-2 gap-2.5">
              {phone && (
                <a href={`tel:${phone}`} className={`flex items-center justify-center gap-2 h-12 rounded-xl text-white font-bold ${accentClass}`}>
                  <Icon name="phone" size={18} /> {L.call}
                </a>
              )}
              {whatsapp && (
                <a href={waLink(whatsapp)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-12 rounded-xl text-white font-bold" style={{ background: "#25D366" }}>
                  <WhatsAppIcon width={18} height={18} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// waLink lib/utils.ts-এ — সার্ভার ও ক্লায়েন্ট দুই দিকেই ডাকা হয়

/* ── ৪. ভাসমান কনভার্সন বোতাম ───────────────────────────
   বাংলাদেশে অভিভাবক ফর্ম ভরার চেয়ে সরাসরি কল/WhatsApp করতে বেশি স্বচ্ছন্দ —
   তাই এগুলো সবসময় হাতের নাগালে (মোবাইলে থাম্ব-জোনে) থাকে। */
export function FloatingActions({ phone, whatsapp, messenger, waText, labels }: {
  phone?: string; whatsapp?: string; messenger?: string; waText?: string;
  labels?: { call?: string; admission?: string; top?: string };
}) {
  const L = { call: "এখনই কল করুন", admission: "ভর্তি তথ্য", top: "উপরে যান", ...labels };
  const [up, setUp] = useState(false);
  useEffect(() => {
    const on = () => setUp(window.scrollY > 700);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      {/* ডেস্কটপ ও মোবাইল — ডান পাশে স্তম্ভ */}
      <div className="no-print fixed right-3 bottom-20 md:bottom-6 z-50 flex flex-col gap-2.5 items-end">
        {up && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={L.top}
            className="h-11 w-11 rounded-full glass hairline text-n-700 grid place-items-center shadow-lg hover:text-brand transition">
            <Icon name="chevronDown" size={20} className="rotate-180" />
          </button>
        )}
        {messenger && (
          <a href={messenger} target="_blank" rel="noopener noreferrer" aria-label="Messenger-এ বার্তা"
            className="h-12 w-12 rounded-full grid place-items-center text-white shadow-lg hover:scale-105 transition"
            style={{ background: "linear-gradient(135deg,#00B2FF,#006AFF)" }}>
            <MessengerIcon width={24} height={24} />
          </a>
        )}
        {whatsapp && (
          <a href={waLink(whatsapp, waText)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp-এ যোগাযোগ"
            className="anim-ring h-14 w-14 rounded-full grid place-items-center text-white shadow-xl hover:scale-105 transition"
            style={{ background: "#25D366" }}>
            <WhatsAppIcon width={28} height={28} />
          </a>
        )}
      </div>

      {/* মোবাইল — নিচে স্থায়ী কল-বার (থাম্বের ঠিক নিচে) */}
      {phone && (
        <div className="no-print md:hidden fixed inset-x-0 bottom-0 z-40 glass border-t border-n-200 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex gap-2.5">
          <a href={`tel:${phone}`} className="flex-1 h-12 rounded-xl bg-brand text-brand-on font-bold grid place-items-center">
            <span className="flex items-center gap-2"><Icon name="phone" size={18} /> {L.call}</span>
          </a>
          <Link href="/admission" className="h-12 px-5 rounded-xl bg-accent text-accent-on font-bold grid place-items-center whitespace-nowrap">
            {L.admission}
          </Link>
        </div>
      )}
    </>
  );
}

/* ── ৫. ট্যাব (একাডেমিক প্রোগ্রাম / বিভাগ) ─────────────── */
export function Tabs({ items, variant = "pill" }: {
  items: { key: string; label: string; sub?: string; content: React.ReactNode }[];
  variant?: "pill" | "underline" | "card";
}) {
  const [active, setActive] = useState(0);
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const onKey = (e: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next =
      e.key === "Home" ? 0 :
      e.key === "End" ? items.length - 1 :
      e.key === "ArrowRight" ? (active + 1) % items.length :
      (active - 1 + items.length) % items.length;
    setActive(next);
    listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  const base = "whitespace-nowrap font-bold transition-all outline-none";
  const styles = {
    pill: (on: boolean) => `${base} px-5 py-3 rounded-full ${on ? "bg-brand text-brand-on shadow-e2" : "bg-n-100 text-n-600 hover:bg-n-200"}`,
    underline: (on: boolean) => `${base} px-1 py-3.5 border-b-[3px] ${on ? "border-brand text-brand" : "border-transparent text-n-500 hover:text-n-800"}`,
    card: (on: boolean) => `${base} px-5 py-4 rounded-xl text-left ${on ? "bg-white shadow-e3 text-brand" : "bg-transparent text-n-600 hover:bg-white/60"}`,
  }[variant];

  return (
    <div>
      <div ref={listRef} role="tablist" aria-label="বিভাগসমূহ" onKeyDown={onKey}
        className={`flex gap-2 overflow-x-auto snap-row ${variant === "underline" ? "border-b border-n-200 gap-7" : ""}`}>
        {items.map((it, i) => (
          <button key={it.key} role="tab" id={`${id}-t${i}`} aria-selected={i === active}
            aria-controls={`${id}-p${i}`} tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)} className={styles(i === active)}>
            {it.label}
            {it.sub && <span className="block text-[11px] font-medium opacity-70 mt-0.5">{it.sub}</span>}
          </button>
        ))}
      </div>
      {items.map((it, i) => (
        <div key={it.key} role="tabpanel" id={`${id}-p${i}`} aria-labelledby={`${id}-t${i}`}
          hidden={i !== active} className="pt-8 animate-[fadeUp_.4s_var(--ease-out-quint)]">
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`}</style>
          {it.content}
        </div>
      ))}
    </div>
  );
}

/* ── ৬. গ্যালারি লাইটবক্স ──────────────────────────────────
   থাম্বনেইলগুলো সার্ভারেই রেন্ডার হয় (SEO ও গতি), লাইটবক্স শুধু ক্লিক ধরে।
   কেন render-prop নয়: সার্ভার কম্পোনেন্ট থেকে ক্লায়েন্ট কম্পোনেন্টে ফাংশন
   পাঠানো যায় না — React তা সিরিয়ালাইজ করতে পারে না। তাই ইভেন্ট ডেলিগেশন:
   ভেতরের যেকোনো এলিমেন্টে data-lb="<index>" থাকলেই সেটি খুলবে। */
export function Lightbox({ images, children, className = "" }: {
  images: { url: string; caption?: string }[];
  children: React.ReactNode;
  className?: string;
}) {
  const [idx, setIdx] = useState<number | null>(null);
  const open = idx !== null;

  const onClick = (e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest?.("[data-lb]");
    if (!el) return;
    const i = Number(el.getAttribute("data-lb"));
    if (Number.isFinite(i) && images[i]) { e.preventDefault(); setIdx(i); }
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowRight") setIdx((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open, images.length]);

  return (
    <>
      <div className={className} onClick={onClick}>{children}</div>
      {open && (
        <div className="fixed inset-0 z-[80] bg-n-900/95 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="ছবি">
          <button className="absolute inset-0" aria-label="বন্ধ করুন" onClick={() => setIdx(null)} />
          <button onClick={() => setIdx(null)} aria-label="বন্ধ করুন"
            className="absolute top-4 right-4 h-12 w-12 rounded-full glass-dark text-white grid place-items-center z-10">
            <Icon name="x" size={24} />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={() => setIdx((i) => (i! - 1 + images.length) % images.length)} aria-label="আগের ছবি"
                className="absolute left-2 md:left-6 h-12 w-12 rounded-full glass-dark text-white grid place-items-center z-10">
                <Icon name="chevronLeft" size={24} />
              </button>
              <button onClick={() => setIdx((i) => (i! + 1) % images.length)} aria-label="পরের ছবি"
                className="absolute right-2 md:right-6 h-12 w-12 rounded-full glass-dark text-white grid place-items-center z-10">
                <Icon name="chevronRight" size={24} />
              </button>
            </>
          )}
          <figure className="relative z-[1] max-w-5xl w-full text-center pointer-events-none">
            <img src={images[idx!].url} alt={images[idx!].caption || ""}
              className="max-h-[78vh] w-auto mx-auto rounded-xl object-contain shadow-2xl" />
            <figcaption className="mt-4 text-white/85 text-sm">
              {images[idx!].caption}
              <span className="block text-white/50 mt-1 tnum">{toBnDigits(String(idx! + 1))} / {toBnDigits(String(images.length))}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

/* ── ৭. ইউটিউব — ক্লিকে লোড ────────────────────────────
   iframe আগেই বসালে প্রতি ভিডিওতে ~৭০০kB ও কয়েকশ ms নষ্ট হয়।
   থাম্বনেইল দেখিয়ে ক্লিকে embed বসালে পেজ হালকা থাকে। */
export function VideoEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [play, setPlay] = useState(false);
  if (play) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
        title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen loading="lazy"
      />
    );
  }
  return (
    <button onClick={() => setPlay(true)} className="group absolute inset-0 h-full w-full" aria-label={`ভিডিও চালান: ${title}`}>
      <img src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`} alt="" loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      <span className="absolute inset-0 bg-n-900/25 group-hover:bg-n-900/10 transition" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="h-16 w-16 rounded-full grid place-items-center shadow-xl transition group-hover:scale-110"
          style={{ background: "rgba(255,255,255,.94)" }}>
          <Icon name="play" size={26} className="text-brand translate-x-0.5" />
        </span>
      </span>
    </button>
  );
}

/* ── ৮. ফলাফল অনুসন্ধান ──────────────────────────────────
   labels না দিলে বাংলা — ইংরেজি অফিসিয়াল টেমপ্লেট নিজের অভিধান পাঠায়। */
export type ResultSearchLabels = {
  exam: string; roll: string; view: string; empty: string; needRoll: string; notPublished: string;
};
const RS_BN: ResultSearchLabels = {
  exam: "পরীক্ষা", roll: "রোল নম্বর", view: "ফলাফল দেখুন",
  empty: "কোনো পরীক্ষা যুক্ত হয়নি", needRoll: "রোল নম্বর লিখুন।",
  notPublished: "এই পরীক্ষার ফলাফল শিট এখনো প্রকাশিত হয়নি। প্রকাশিত হলে এখানেই পাওয়া যাবে।",
};

export function ResultSearch({ exams, note, labels }: {
  exams: { _id: string; examName: string; year?: string; pdfUrl?: string }[];
  note?: string; labels?: Partial<ResultSearchLabels>;
}) {
  const L = { ...RS_BN, ...labels };
  const [exam, setExam] = useState(exams[0]?._id || "");
  const [roll, setRoll] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const chosen = exams.find((e) => e._id === exam);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roll.trim()) { setMsg(L.needRoll); return; }
    if (chosen?.pdfUrl) { window.open(chosen.pdfUrl, "_blank", "noopener"); setMsg(null); return; }
    setMsg(L.notPublished);
  };

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
      <label className="block">
        <span className="sr-only">{L.exam}</span>
        <select value={exam} onChange={(e) => setExam(e.target.value)}
          className="w-full h-13 min-h-[52px] px-4 rounded-xl border border-n-300 bg-white text-n-800 font-medium focus:border-brand">
          {exams.length === 0 && <option>{L.empty}</option>}
          {exams.map((e) => <option key={e._id} value={e._id}>{e.examName} {e.year ? `— ${e.year}` : ""}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="sr-only">{L.roll}</span>
        <input value={roll} onChange={(e) => setRoll(e.target.value)} inputMode="numeric" placeholder={L.roll}
          className="w-full h-13 min-h-[52px] px-4 rounded-xl border border-n-300 bg-white text-n-800 placeholder:text-n-400 focus:border-brand" />
      </label>
      <button className="h-13 min-h-[52px] px-7 rounded-xl bg-brand text-brand-on font-bold inline-flex items-center justify-center gap-2">
        <Icon name="search" size={18} /> {L.view}
      </button>
      {(msg || note) && (
        <p className="sm:col-span-3 text-sm text-n-500" role={msg ? "status" : undefined}>{msg || note}</p>
      )}
    </form>
  );
}

/* ── ৯. ভর্তি জিজ্ঞাসা / কলব্যাক ফর্ম ───────────────────── */
type InquiryState = { ok: boolean; message: string } | null;

export type InquiryLabels = {
  name: string; phone: string; selectClass: string; message: string;
  sending: string; thanks: string; privacy: string;
};
const IF_BN: InquiryLabels = {
  name: "আপনার নাম *", phone: "মোবাইল নম্বর *", selectClass: "শ্রেণি নির্বাচন করুন",
  message: "আপনার জিজ্ঞাসা (ঐচ্ছিক)", sending: "পাঠানো হচ্ছে…", thanks: "ধন্যবাদ!",
  privacy: "আপনার তথ্য শুধুমাত্র প্রতিষ্ঠান কর্তৃপক্ষের কাছে যাবে। আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করি।",
};

export function InquiryForm({
  action, classes, kind = "admission", compact = false, submitLabel = "তথ্য পাঠান", labels,
}: {
  action: (prev: InquiryState, fd: FormData) => Promise<InquiryState>;
  classes?: string; kind?: "admission" | "callback" | "contact"; compact?: boolean;
  submitLabel?: string; labels?: Partial<InquiryLabels>;
}) {
  const L = { ...IF_BN, ...labels };
  const [state, formAction, pending] = useActionState(action, null);
  const options = (classes || "").split(/[,،/|]/).map((s) => s.trim()).filter(Boolean);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-n-200 bg-white p-8 text-center" role="status">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand">
          <Icon name="check" size={30} />
        </span>
        <p className="t-h3 text-n-900">{L.thanks}</p>
        <p className="mt-2 text-n-600">{state.message}</p>
      </div>
    );
  }

  const field = "w-full min-h-[52px] px-4 rounded-xl border border-n-300 bg-white text-n-800 placeholder:text-n-400 focus:border-brand transition";

  return (
    <form action={formAction} className={compact ? "space-y-3" : "space-y-4"}>
      <input type="hidden" name="kind" value={kind} />
      {/* মধুকলস — বট ভরে, মানুষ দেখে না */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className={compact ? "space-y-3" : "grid sm:grid-cols-2 gap-4"}>
        <label className="block">
          <span className="sr-only">{L.name}</span>
          <input name="name" required placeholder={L.name} className={field} />
        </label>
        <label className="block">
          <span className="sr-only">{L.phone}</span>
          <input name="phone" required inputMode="tel" pattern="[0-9০-৯\s\-\+]{11,17}"
            placeholder={L.phone} className={field} />
        </label>
      </div>

      {options.length > 0 && (
        <label className="block">
          <span className="sr-only">{L.selectClass}</span>
          <select name="studentClass" className={field} defaultValue="">
            <option value="">{L.selectClass}</option>
            {options.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      )}

      {!compact && (
        <label className="block">
          <span className="sr-only">{L.message}</span>
          <textarea name="message" rows={3} placeholder={L.message} className={`${field} py-3 resize-y`} />
        </label>
      )}

      {state && !state.ok && (
        <p className="text-sm font-medium text-red-600" role="alert">{state.message}</p>
      )}

      <button disabled={pending}
        className="w-full min-h-[52px] rounded-xl bg-brand text-brand-on font-bold text-[17px] inline-flex items-center justify-center gap-2 disabled:opacity-60 transition hover:brightness-110">
        {pending ? L.sending : <>{submitLabel} <Icon name="arrowRight" size={18} /></>}
      </button>
      <p className="text-center text-xs text-n-400">{L.privacy}</p>
    </form>
  );
}

/* ── ১০. হিরো স্লাইডশো ────────────────────────────────────
   একাধিক ক্যাম্পাস ছবি থাকলে ধীরে ক্রসফেড। প্রথম ছবি eager, বাকিগুলো lazy। */
export function HeroSlides({ images, alt, className = "" }: { images: string[]; alt: string; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % images.length), 6000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden={images.length > 1 ? "true" : undefined}>
      {images.map((src, n) => (
        <img key={src} src={src} alt={n === 0 ? alt : ""} loading={n === 0 ? "eager" : "lazy"}
          fetchPriority={n === 0 ? "high" : "low"}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1400ms] ease-out"
          style={{ opacity: n === i ? 1 : 0 }} />
      ))}
    </div>
  );
}

/* ── ১১. ডেস্কটপ মেগা-মেনু ───────────────────────────────
   হোভার + focus-within — কীবোর্ড ব্যবহারকারীও পাবে। JS শুধু বাইরে ক্লিকে বন্ধের জন্য নয়,
   কারণ CSS :focus-within সেটাও সামলায়। তাই এটি সার্ভার-রেন্ডারযোগ্য ও শূন্য-JS। */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [threshold]);
  return scrolled;
}

/** স্টিকি হেডার — উপরে থাকলে স্বচ্ছ, স্ক্রলে কাচ+ছায়া */
export function StickyHeader({ children, transparentTop = true, className = "" }: {
  children: React.ReactNode; transparentTop?: boolean; className?: string;
}) {
  const scrolled = useScrolled(24);
  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${className} ${
        scrolled || !transparentTop ? "glass shadow-e2" : "bg-transparent"
      }`}
      data-scrolled={scrolled ? "true" : "false"}
    >
      {children}
    </div>
  );
}
