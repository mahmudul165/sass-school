/* সার্ভার-রেন্ডারযোগ্য প্রিমিটিভ — তিনটি টেমপ্লেটই এগুলো ব্যবহার করে,
   কিন্তু variant/className দিয়ে নিজের চেহারা দেয়। কোনো "use client" নেই,
   তাই এগুলো বান্ডলে যায় না — শুধু HTML যায়। */
import Image from "next/image";
import { TLink } from "@/components/site/tlink";
import { Icon } from "./icons";
import { bnDate } from "@/lib/utils";
import { toBnDigits } from "@/lib/content";
import type { Faq } from "@/lib/content";

/* ── সেকশন র‌্যাপার ─────────────────────────────────────── */
export function Section({
  id, children, className = "", inner = "container-x", tone = "plain", size = "lg",
}: {
  id?: string; children: React.ReactNode; className?: string; inner?: string;
  tone?: "plain" | "soft" | "brand" | "dark"; size?: "lg" | "sm";
}) {
  const tones = {
    plain: "bg-white",
    soft: "bg-n-50",
    brand: "bg-brand-50",
    dark: "bg-n-900 text-white",
  }[tone];
  return (
    <section id={id} className={`${tones} ${size === "lg" ? "section" : "section-sm"} ${className}`}>
      <div className={inner}>{children}</div>
    </section>
  );
}

/* ── সেকশন শিরোনাম ─────────────────────────────────────── */
export function SectionHead({
  eyebrow, title, sub, align = "center", rule, className = "", light = false, as: As = "h2",
}: {
  eyebrow?: string; title: string; sub?: string; align?: "center" | "left";
  rule?: React.ReactNode; className?: string; light?: boolean; as?: "h1" | "h2" | "h3";
}) {
  return (
    <div
      data-reveal
      className={`${align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-2xl"} mb-10 md:mb-14 ${className}`}
    >
      {eyebrow && (
        <p className={`t-eyebrow mb-3 ${light ? "text-accent-300" : "text-brand"}`}>{eyebrow}</p>
      )}
      <As className={`t-h2 ${light ? "text-white" : "text-n-900"}`}>{title}</As>
      {rule}
      {sub && (
        <p className={`t-lead mt-4 ${light ? "text-white/75" : "text-n-600"}`}>{sub}</p>
      )}
    </div>
  );
}

/* ── বোতাম ──────────────────────────────────────────────
   min-height 52px — বাংলাদেশে অধিকাংশ দর্শক মোবাইলে, আঙুলের নিরাপদ টার্গেট। */
type BtnProps = {
  href?: string; children: React.ReactNode; variant?: "primary" | "accent" | "outline" | "ghost" | "white" | "whatsapp";
  size?: "md" | "lg"; className?: string; icon?: string; iconRight?: string; external?: boolean;
  title?: string; download?: boolean;
};
export function Btn({
  href, children, variant = "primary", size = "md", className = "", icon, iconRight, external, title, download,
}: BtnProps) {
  /* পাশের প্যাডিং ফোনে ছোট, sm থেকে আগের মাপ।
     এই প্রকল্পে --spacing দ্বিগুণ, তাই px-6 মানে ছিল দুই পাশে ৪৮px (মোট
     ৯৬px) আর px-8 মানে ৬৪px (মোট ১২৮px)। ৩৬০px পর্দায় container-x-এর পর
     থাকে ৩২০px — অর্থাৎ বড় বোতামে লেখার জন্য বাকি থাকত ~১৯০px, আর
     "অনলাইনে আবেদন করুন"-এর মতো বাংলা লেবেল দুই লাইনে ভেঙে যেত।
     ফোনে ৩২/৪০px যথেষ্ট; min-height অপরিবর্তিত, তাই লক্ষ্য ছোট হয়নি। */
  const sizes = size === "lg" ? "min-h-[56px] px-5 sm:px-8 text-[17px]" : "min-h-[52px] px-4 sm:px-6 text-[16px]";
  const variants = {
    primary: "bg-brand text-brand-on shadow-e2 hover:brightness-110 hover:shadow-e3",
    accent: "bg-accent text-accent-on shadow-e2 hover:brightness-105 hover:shadow-e3",
    outline: "bg-white text-n-800 hairline hover:border-brand hover:text-brand hover:shadow-e2",
    ghost: "text-brand hover:bg-brand-50",
    white: "bg-white text-brand shadow-e2 hover:shadow-e3",
    whatsapp: "text-white shadow-e2 hover:brightness-110",
  }[variant];
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300 ${sizes} ${variants} ${className}`;
  const style = variant === "whatsapp" ? { background: "#25D366" } : undefined;
  const inner = (
    <>
      {icon && <Icon name={icon} size={19} />}
      {children}
      {iconRight && <Icon name={iconRight} size={19} />}
    </>
  );
  if (!href) return <button className={cls} style={style} title={title}>{inner}</button>;
  if (external || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={cls} style={style} title={title} download={download}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {inner}
      </a>
    );
  }
  return <TLink href={href} className={cls} style={style} title={title}>{inner}</TLink>;
}

/* ── ব্যাজ / পিল ────────────────────────────────────────── */
export function Pill({ children, tone = "brand", className = "", icon, dot }: {
  children: React.ReactNode; tone?: "brand" | "accent" | "green" | "light" | "dark";
  className?: string; icon?: string; dot?: boolean;
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-800",
    accent: "bg-accent-50 text-accent-800",
    green: "bg-emerald-50 text-emerald-800",
    light: "bg-white/15 text-white hairline-light",
    dark: "bg-n-900 text-white",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-bold ${tones} ${className}`}>
      {dot && <span className="h-2 w-2 rounded-full bg-current animate-pulse" />}
      {icon && <Icon name={icon} size={15} />}
      {children}
    </span>
  );
}

/* ── নোটিশ টিকার (CSS-only marquee) ─────────────────────
   বাংলাদেশে "চলমান নোটিশ" অভিভাবকের চেনা অভ্যাস — কিন্তু পুরোনো সাইটের
   <marquee> ট্যাগ সস্তা দেখায়। এখানে একই অভ্যাস, প্রিমিয়াম বাস্তবায়নে। */
export function NoticeTicker({ notices, label = "সর্বশেষ নোটিশ", className = "" }: {
  notices: { _id: string; title: string; createdAt: string }[]; label?: string; className?: string;
}) {
  if (!notices.length) return null;
  const items = [...notices, ...notices]; // নিরবচ্ছিন্ন লুপের জন্য দ্বিগুণ
  return (
    <div className={`flex items-stretch overflow-hidden ${className}`}>
      <span className="shrink-0 z-10 inline-flex items-center gap-2 px-4 md:px-5 font-bold text-[13px] bg-accent text-accent-on">
        <Icon name="bell" size={15} className="shrink-0" />
        <span className="hidden sm:inline">{label}</span>
      </span>
      <div className="marquee flex-1 flex items-center" style={{ ["--marquee-dur" as string]: `${Math.max(24, notices.length * 9)}s` }}>
        <div>
          {items.map((n, i) => (
            <TLink key={`${n._id}-${i}`} href={`/notice/${n._id}`}
              className="inline-flex items-center gap-2.5 px-6 text-[14.5px] hover:underline">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              {n.title}
              <span className="opacity-60 text-[12.5px]">{bnDate(n.createdAt)}</span>
            </TLink>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── FAQ অ্যাকর্ডিয়ন — <details> ভিত্তিক
   কেন কাস্টম JS নয়: <details> স্ক্রিনরিডারে নেটিভভাবে কাজ করে, JS ছাড়াই খোলে,
   Ctrl+F দিয়ে ভেতরের লেখা খুঁজে পাওয়া যায় এবং প্রিন্টে খোলা থাকে।
   name="faq" দিলে একসাথে একটিই খোলে (আধুনিক ব্রাউজার); পুরোনোতে সবগুলো খুলতে পারে — ক্ষতি নেই। */
export function FAQ({ items, name = "faq", variant = "card" }: {
  items: Faq[]; name?: string; variant?: "card" | "line";
}) {
  const box = variant === "card"
    ? "rounded-2xl bg-white hairline mb-3 overflow-hidden"
    : "border-b border-n-200";
  return (
    <div className={variant === "card" ? "" : "rounded-2xl bg-white hairline px-5"}>
      {items.map((f, i) => (
        <details key={i} name={name} className={`group ${box}`}>
          <summary className="flex items-start gap-4 cursor-pointer list-none marker:hidden px-5 py-5 font-bold text-n-900 text-[16.5px] hover:text-brand transition">
            <span className="flex-1">{f.q}</span>
            <span className="mt-0.5 shrink-0 grid h-7 w-7 place-items-center rounded-full bg-n-100 text-n-500 transition-all group-open:bg-brand group-open:text-brand-on group-open:rotate-45">
              <Icon name="plus" size={16} />
            </span>
          </summary>
          <div className="px-5 pb-5 -mt-1 text-n-600 leading-relaxed">{f.a}</div>
        </details>
      ))}
    </div>
  );
}

/* ── রেটিং তারকা ────────────────────────────────────────── */
export function Stars({ n = 5, size = 16, className = "" }: { n?: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${toBnDigits(String(n))} তারকা রেটিং`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="star" size={size}
          className={i < n ? "fill-current text-amber-400" : "text-n-300"} />
      ))}
    </span>
  );
}

/* ── মানচিত্র ───────────────────────────────────────────── */
export function MapEmbed({ src, address, className = "", height = "h-[380px]" }: {
  src?: string; address?: string; className?: string; height?: string;
}) {
  if (src) {
    return (
      <iframe src={src} title="মানচিত্রে অবস্থান" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
        className={`w-full ${height} border-0 ${className}`} allowFullScreen />
    );
  }
  const q = encodeURIComponent(address || "Bangladesh");
  return (
    <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer"
      className={`grid ${height} w-full place-items-center bg-n-100 text-center ${className}`}>
      <span>
        <Icon name="mapPin" size={34} className="mx-auto mb-3 text-brand" />
        <span className="block font-bold text-n-800">{address || "ঠিকানা শিগগিরই যুক্ত হবে"}</span>
        <span className="mt-1 block text-sm text-brand font-semibold">Google Maps-এ দেখুন →</span>
      </span>
    </a>
  );
}

/* ── ছবির নিরাপদ ফলব্যাক ────────────────────────────────
   ক্লায়েন্ট ছবি না দিলে ভাঙা <img> নয় — ব্র্যান্ড রঙের মার্জিত প্লেসহোল্ডার।
   এটাই ডেমো সাইটকে "ফাঁকা" নয়, "ডিজাইনড" দেখায়। */
export function Figure({
  src, alt, className = "", ratio = "aspect-[4/3]", icon = "images", rounded = "rounded-2xl", priority,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: {
  src?: string; alt: string; className?: string; ratio?: string; icon?: string; rounded?: string; priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${ratio} ${rounded} bg-n-100 ${className}`}>
      {src ? (
        /* next/image — next.config.ts-এ AVIF→WebP, বাংলাদেশি পর্দার মাপে
           কাটা deviceSizes ও ৩০ দিনের ক্যাশ আগে থেকেই সাজানো ছিল, কিন্তু
           সাইটের একটিও ছবি সেই পথ দিয়ে যেত না — সবই কাঁচা <img> ছিল।
           `fill` ব্যবহার করা হলো কারণ মোড়কটি ইতিমধ্যেই relative + aspect-*,
           তাই মাপ CSS-ই ঠিক করে এবং CLS শূন্য থাকে।
           `sizes` না দিলে next/image সবচেয়ে বড় ভ্যারিয়েন্ট নামায় — কার্ডের
           ছবিতে সেটি কয়েকশ kB অপচয়, তাই ডিফল্টটি গ্রিড-কার্ড ধরে বসানো। */
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority}
          className="object-cover" />
      ) : (
        <span className="absolute inset-0 grid place-items-center"
          style={{ background: "linear-gradient(135deg, var(--brand-50), var(--brand-100))" }}>
          <Icon name={icon} size={40} className="text-brand-300" />
        </span>
      )}
    </div>
  );
}

/* ── অ্যাভাটার (শিক্ষক/অভিভাবক) ────────────────────────── */
export function Avatar({ src, name, size = 56, className = "", rounded = "rounded-full" }: {
  src?: string; name: string; size?: number; className?: string; rounded?: string;
}) {
  if (src) {
    /* স্থির পিক্সেল মাপ, তাই fill নয় — width/height সরাসরি।
       ৫২–৯০px মাপগুলো next.config.ts-এর imageSizes [64,96,128…]-এর সাথে
       মেলে, ফলে ২× পর্দার জন্যও ঠিক মাপের ভ্যারিয়েন্ট তৈরি হয়। */
    return <Image src={src} alt={name} width={size} height={size}
      className={`${rounded} object-cover shrink-0 ${className}`} style={{ width: size, height: size }} />;
  }
  return (
    <span
      className={`${rounded} grid place-items-center shrink-0 font-bold text-brand-700 bg-brand-100 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true"
    >
      {name.trim()[0] || "•"}
    </span>
  );
}

/* ── তালিকা টিক ─────────────────────────────────────────── */
export function CheckList({ items, className = "", iconClass = "text-brand" }: {
  items: string[]; className?: string; iconClass?: string;
}) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-current/10 ${iconClass}`}>
            <Icon name="check" size={13} />
          </span>
          <span className="text-n-700">{t}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── ফি টেবিল — মোবাইলে কার্ড, ডেস্কটপে টেবিল ──────────
   বাংলাদেশে অভিভাবকের সবচেয়ে বেশি খোঁজা তথ্য "বেতন কত"।
   টেবিল মোবাইলে অনুভূমিক স্ক্রল করালে তারা হারিয়ে যান — তাই দুই রূপ। */
export function FeeTable({ rows, note, labels }: {
  rows: { label: string; admission?: string; monthly?: string; note?: string }[];
  note?: string;
  labels?: { head?: string; admission?: string; monthly?: string };
}) {
  const L = { head: "শ্রেণি / বিভাগ", admission: "ভর্তি ফি", monthly: "মাসিক বেতন", ...labels };
  if (!rows.length) return null;
  return (
    <div>
      {/* ডেস্কটপ */}
      <div className="hidden md:block overflow-hidden rounded-2xl hairline bg-white">
        <table className="w-full text-left">
          <caption className="sr-only">শ্রেণিভিত্তিক ফি তালিকা</caption>
          <thead>
            <tr className="bg-n-50">
              <th scope="col" className="px-6 py-4 text-[14px] font-bold text-n-700">{L.head}</th>
              <th scope="col" className="px-6 py-4 text-[14px] font-bold text-n-700">{L.admission}</th>
              <th scope="col" className="px-6 py-4 text-[14px] font-bold text-n-700">{L.monthly}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-n-100 hover:bg-brand-50/40 transition">
                <td className="px-6 py-4 font-semibold text-n-900">
                  {r.label}
                  {r.note && <span className="block text-[13px] font-normal text-n-500">{r.note}</span>}
                </td>
                <td className="px-6 py-4 text-n-700 tnum">{r.admission || "—"}</td>
                <td className="px-6 py-4 font-bold text-brand tnum">{r.monthly || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* মোবাইল */}
      <div className="md:hidden space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="rounded-2xl hairline bg-white p-4">
            <p className="font-bold text-n-900">{r.label}</p>
            {r.note && <p className="text-[13px] text-n-500">{r.note}</p>}
            <div className="mt-3 flex gap-6">
              <span className="text-sm"><span className="block text-n-500">{L.admission}</span>
                <b className="text-n-800 tnum">{r.admission || "—"}</b></span>
              <span className="text-sm"><span className="block text-n-500">{L.monthly}</span>
                <b className="text-brand tnum">{r.monthly || "—"}</b></span>
            </div>
          </div>
        ))}
      </div>
      {note && <p className="mt-4 text-sm text-n-500 flex gap-2"><Icon name="bulb" size={17} className="shrink-0 mt-0.5 text-accent-500" />{note}</p>}
    </div>
  );
}
