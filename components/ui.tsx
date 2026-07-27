/* ব্যাকঅফিস ডিজাইন সিস্টেম — "দপ্তর"
   ------------------------------------------------------------------
   ধারণা: যত্নে রাখা একটি সরকারি রেজিস্টার খাতা। উষ্ণ কাগজের ক্যানভাস,
   সাদা পাতা-কার্ড, পিতলের বিভাজক ট্যাব, বাংলা সেরিফে শিরোনাম।
   কেন এই সুর: ব্যবহারকারী প্রধান শিক্ষক — স্কুলের অফিসঘরে বসে, প্রায়শই
   ফোনে। তাঁর কাছে "প্রাতিষ্ঠানিক ও শান্ত" যতটা বিশ্বাসযোগ্য, ঝকঝকে
   স্টার্টআপ ড্যাশবোর্ড ততটা নয়।

   নিয়ম:
   • মোবাইল-ফার্স্ট, প্রতিটি ট্যাপ-লক্ষ্য ≥ ৪৪px, ইনপুট ≥ ৪৮px।
   • সবই সার্ভার-রেন্ডারযোগ্য — কোনো "use client" নেই, প্যানেল হালকা থাকে।
   • প্রতিটি লেবেলের নিচে বাংলা হিন্ট, যাতে কেউ আটকে না যান। */
import Link from "next/link";

/* ── পেজ শিরোনাম ───────────────────────────────────────── */
export function PageHead({ title, sub, action }: {
  title: string; sub?: string; action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="font-display text-[24px] md:text-[29px] font-extrabold text-ink leading-[1.25] tracking-tight">
          {title}
        </h1>
        {/* পিতলের ছোট দাগ — প্রতিটি পাতার শুরুর চিহ্ন */}
        <span className="mt-2.5 block h-[3px] w-12 rounded-full"
          style={{ background: "linear-gradient(90deg, var(--color-brass), rgba(169,118,30,.15))" }} />
        {sub && <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed max-w-2xl">{sub}</p>}
      </div>
      {action}
    </header>
  );
}

/* ── কার্ড = রেজিস্টারের এক পাতা ───────────────────────── */
export function Card({ children, title, desc, aside, id }: {
  children: React.ReactNode; title?: string; desc?: string; aside?: React.ReactNode; id?: string;
}) {
  return (
    <section id={id}
      className="relative bg-paper rounded-2xl border border-rule overflow-hidden
                 shadow-[0_1px_2px_rgba(27,42,36,.04),0_10px_28px_-14px_rgba(27,42,36,.18)]">
      {(title || aside) && (
        <div className="tab-brass relative flex flex-wrap items-start justify-between gap-3
                        px-5 md:px-7 py-4 border-b border-rule bg-[#fcfaf5]">
          <div className="min-w-0">
            {title && <h2 className="font-display text-[17px] font-bold text-ink tracking-tight">{title}</h2>}
            {desc && <p className="mt-1 text-[13.5px] text-ink-soft leading-relaxed max-w-xl">{desc}</p>}
          </div>
          {aside}
        </div>
      )}
      <div className="p-5 md:p-7">{children}</div>
    </section>
  );
}

/* ── ফর্ম ফিল্ড ─────────────────────────────────────────── */
const inputCls =
  "w-full min-h-[48px] rounded-xl border border-rule bg-[#fdfcf9] px-3.5 py-2.5 text-[15.5px] text-ink " +
  "placeholder:text-ink-soft/50 outline-none transition-[border-color,box-shadow,background-color] duration-200 " +
  "hover:border-ink/25 focus:bg-paper focus:border-sky focus:ring-4 focus:ring-sky/12";

export function Field({
  label, name, defaultValue, type = "text", placeholder, textarea, hint, rows = 4, required, dir,
}: {
  label: string; name: string; defaultValue?: string | number; type?: string; placeholder?: string;
  textarea?: boolean; hint?: string; rows?: number; required?: boolean; dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block group">
      <span className="block text-[13.5px] font-bold text-ink mb-1.5 tracking-tight">
        {label}{required && <span className="text-margin"> *</span>}
      </span>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} placeholder={placeholder} rows={rows}
          required={required} dir={dir} className={`${inputCls} resize-y leading-[1.75]`} />
      ) : (
        <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder}
          required={required} dir={dir}
          className={`${inputCls} ${type === "color" ? "h-12 p-1.5 cursor-pointer" : ""} ${type === "number" ? "tabular-nums" : ""}`} />
      )}
      {hint && <span className="mt-1.5 block text-[12.5px] text-ink-soft/90 leading-relaxed">{hint}</span>}
    </label>
  );
}

export function Select({ label, name, defaultValue, options, hint }: {
  label: string; name: string; defaultValue?: string; hint?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-[13.5px] font-bold text-ink mb-1.5 tracking-tight">{label}</span>
      <select name={name} defaultValue={defaultValue} className={`${inputCls} cursor-pointer`}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <span className="mt-1.5 block text-[12.5px] text-ink-soft/90 leading-relaxed">{hint}</span>}
    </label>
  );
}

/** চেকবক্স নয়, সুইচ — অবস্থা এক নজরে বোঝা যায় ও আঙুলে ধরা সহজ */
export function Toggle({ label, name, defaultChecked, hint }: {
  label: string; name: string; defaultChecked?: boolean; hint?: string;
}) {
  return (
    <label className="flex items-start gap-3.5 cursor-pointer select-none
                      rounded-xl border border-rule bg-[#fdfcf9] p-3.5 transition hover:border-ink/25">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="mt-0.5 relative h-7 w-12 shrink-0 rounded-full bg-rule transition-colors duration-200
                       peer-checked:bg-sky peer-focus-visible:ring-4 peer-focus-visible:ring-sky/20">
        <span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm
                         transition-transform duration-200 peer-checked:translate-x-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-bold text-ink text-[15px] leading-tight">{label}</span>
        {hint && <span className="mt-1 block text-[13px] text-ink-soft leading-relaxed">{hint}</span>}
      </span>
    </label>
  );
}

/* ── বোতাম ─────────────────────────────────────────────── */
type BtnProps = {
  children: React.ReactNode; variant?: "primary" | "ghost" | "danger" | "outline";
  size?: "md" | "sm"; href?: string; className?: string; type?: "submit" | "button";
  external?: boolean; title?: string; name?: string; value?: string;
};
export function Btn({
  children, variant = "primary", size = "md", href, className = "", type, external, title, name, value, danger,
}: BtnProps & { danger?: boolean }) {
  const v = danger ? "danger" : variant;
  const sizes = size === "sm" ? "min-h-[40px] px-3.5 text-[13.5px]" : "min-h-[48px] px-5 text-[15px]";
  const variants = {
    /* পিতলের বোতাম — পাতায় একটিই প্রধান কাজ, সেটিই এই রঙ পায় */
    primary:
      "text-white shadow-[0_1px_2px_rgba(27,42,36,.12),0_6px_16px_-8px_rgba(169,118,30,.7)] " +
      "hover:brightness-[1.07] active:brightness-95",
    outline: "bg-paper text-ink border border-rule hover:border-ink/35 hover:bg-[#fcfaf5]",
    ghost: "text-ink-soft hover:text-ink hover:bg-[#efeadf]",
    danger: "bg-paper text-margin border border-margin/30 hover:bg-margin hover:text-white",
  }[v];
  const style = v === "primary"
    ? { background: "linear-gradient(180deg, #b9852a, var(--color-brass))" }
    : undefined;
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-tight
               transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky/20
               ${sizes} ${variants} ${className}`;
  if (href) {
    return external
      ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style} title={title}>{children}</a>
      : <Link href={href} className={cls} style={style} title={title}>{children}</Link>;
  }
  return <button type={type} name={name} value={value} className={cls} style={style} title={title}>{children}</button>;
}

/* ── ব্যাজ ──────────────────────────────────────────────── */
export function Badge({ children, tone = "neutral" }: {
  children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" | "info";
}) {
  const tones = {
    neutral: "bg-[#efeadf] text-ink-soft",
    good: "bg-[#e6f0e9] text-[#1f6b54]",
    warn: "bg-brass-soft text-[#7d560f]",
    bad: "bg-[#f9e9e7] text-margin",
    info: "bg-[#e8eef1] text-[#2a5568]",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-bold ${tones}`}>
      {children}
    </span>
  );
}

/* ── খালি অবস্থা ────────────────────────────────────────── */
export function Empty({ icon = "📭", title, sub }: { icon?: string; title: string; sub?: string }) {
  return (
    <div className="text-center py-14 px-6">
      <p className="text-[34px] mb-3 opacity-80" aria-hidden="true">{icon}</p>
      <p className="font-display font-bold text-ink text-[17px]">{title}</p>
      {sub && <p className="mt-2 text-[14px] text-ink-soft max-w-sm mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

/* ── তালিকার সারি — মোবাইলে কার্ড, ডেস্কটপে সারি ────────
   ব্যাকঅফিসে <table> ছোট পর্দায় সবচেয়ে বেশি ভোগায়; তাই flex সারি,
   যা নিজে থেকেই উপর-নিচে সাজে। */
export function Row({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 md:px-6
                     border-b border-rule last:border-0 transition-colors hover:bg-[#fcfaf5] ${className}`}>
      {children}
    </div>
  );
}

/** ফর্মের নিচে আটকে থাকা সেভ-বার — লম্বা ফর্মে নিচ পর্যন্ত স্ক্রল করতে হয় না */
export function StickySave({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 md:mx-0 mt-7
                    border-t md:border border-rule bg-paper/95 backdrop-blur-sm
                    px-4 md:px-6 py-3.5 md:rounded-2xl
                    shadow-[0_-6px_20px_-12px_rgba(27,42,36,.28)]
                    flex flex-wrap items-center gap-3 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
      {note && <p className="text-[13px] text-ink-soft flex-1 min-w-[180px] leading-relaxed">{note}</p>}
      <div className="flex gap-2.5 ms-auto">{children}</div>
    </div>
  );
}

/* ── পরিসংখ্যান টাইল ────────────────────────────────────── */
export function Stat({ label, value, tone = "neutral", href, hint }: {
  label: string; value: string | number; tone?: "neutral" | "good" | "warn" | "bad"; href?: string; hint?: string;
}) {
  const accent = {
    neutral: "text-ink", good: "text-[#1f6b54]", warn: "text-[#7d560f]", bad: "text-margin",
  }[tone];
  const inner = (
    <>
      <p className="text-[12.5px] font-bold text-ink-soft tracking-tight">{label}</p>
      <p className={`mt-1.5 font-display text-[30px] font-extrabold leading-none tabular-nums ${accent}`}>{value}</p>
      {hint && <p className="mt-2 text-[12px] text-ink-soft leading-snug">{hint}</p>}
    </>
  );
  const cls = `block bg-paper rounded-2xl border border-rule p-4 md:p-5 transition-all duration-200
               ${href ? "hover:border-brass/45 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-16px_rgba(27,42,36,.35)]" : ""}`;
  return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}
