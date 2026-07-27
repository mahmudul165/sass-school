"use client";
/* কাঠামোবদ্ধ কনটেন্টের সম্পাদক — বিভাগ, ক্লাব, রুটিন ও ফলাফলের ধারা
   ------------------------------------------------------------------
   এগুলো সাধারণ টেক্সট ফিল্ড নয়, তালিকা ও ছক। প্রতিটির জন্য আলাদা টেবিল ও
   সার্ভার অ্যাকশন বানালে কোড তিনগুণ হতো; বদলে প্রতিটি সম্পাদক তার অবস্থা
   একটি লুকোনো JSON ইনপুটে লিখে দেয়, আর সার্ভার অ্যাকশন সেটিই পার্স করে
   tenant.content-এ বসায়। ফলে নতুন কোনো তালিকা যোগ করা মানে শুধু একটি
   কনফিগ লেখা — আর কিছু নয়।

   সবকিছু সাধারণ <input>; কোনো ড্র্যাগ-ড্রপ লাইব্রেরি নেই, কারণ প্রধান শিক্ষক
   বেশিরভাগ সময় ফোনে কাজ করেন যেখানে ড্র্যাগ করা কঠিন — উপরে/নিচে বোতামই নিরাপদ। */
import { useState } from "react";

/* ── ছোট প্রিমিটিভ ─────────────────────────────────────── */
const box =
  "w-full min-h-[46px] rounded-xl border border-rule bg-paper px-3 py-2 text-[15px] text-ink " +
  "placeholder:text-ink-soft/55 outline-none focus:border-sky focus:ring-4 focus:ring-sky/12 transition";

function Lbl({ children }: { children: React.ReactNode }) {
  return <span className="block text-[13px] font-semibold text-ink-soft mb-1">{children}</span>;
}

function IconBtn({ onClick, title, children, tone = "plain" }: {
  onClick: () => void; title: string; children: React.ReactNode; tone?: "plain" | "danger";
}) {
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title}
      className={`h-9 w-9 shrink-0 grid place-items-center rounded-lg border text-[15px] transition ${
        tone === "danger"
          ? "border-margin/30 text-margin hover:bg-margin hover:text-white"
          : "border-rule text-ink-soft hover:border-ink/40 hover:text-ink"
      }`}>
      {children}
    </button>
  );
}

function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="mt-4 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border border-dashed border-rule
                 text-[14.5px] font-semibold text-ink-soft hover:border-sky hover:text-sky transition">
      <span className="text-lg leading-none">+</span> {children}
    </button>
  );
}

/** তালিকার এক একক — উপরে শিরোনাম, ডানে উপর/নিচ/মুছে ফেলার বোতাম */
function Item({ index, count, title, move, remove, children }: {
  index: number; count: number; title: string;
  move: (from: number, to: number) => void; remove: (i: number) => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-rule bg-[#fcfaf5] p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink text-white text-[12.5px] font-bold tabular-nums">
          {index + 1}
        </span>
        <p className="font-bold text-ink text-[14.5px] flex-1 truncate">{title}</p>
        <IconBtn onClick={() => move(index, index - 1)} title="উপরে তুলুন">↑</IconBtn>
        <IconBtn onClick={() => move(index, index + 1)} title="নিচে নামান">↓</IconBtn>
        <IconBtn onClick={() => remove(index)} title="মুছে ফেলুন" tone="danger">✕</IconBtn>
      </div>
      {children}
      <span className="sr-only">{count} টির মধ্যে {index + 1} নম্বর</span>
    </div>
  );
}

/** তালিকা-অবস্থা ব্যবস্থাপনার সাধারণ হুক */
function useList<T>(initial: T[], blank: () => T) {
  const [items, setItems] = useState<T[]>(initial.length ? initial : []);
  const set = (i: number, patch: Partial<T>) =>
    setItems((xs) => xs.map((x, n) => (n === i ? { ...x, ...patch } : x)));
  const add = () => setItems((xs) => [...xs, blank()]);
  const remove = (i: number) => setItems((xs) => xs.filter((_, n) => n !== i));
  const move = (from: number, to: number) =>
    setItems((xs) => {
      if (to < 0 || to >= xs.length) return xs;
      const c = [...xs];
      const [m] = c.splice(from, 1);
      c.splice(to, 0, m);
      return c;
    });
  return { items, set, add, remove, move, setItems };
}

/** লুকোনো ইনপুট — সার্ভার অ্যাকশন এটিই পড়ে */
const Hidden = ({ name, value }: { name: string; value: unknown }) => (
  <input type="hidden" name={name} value={JSON.stringify(value)} />
);

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const commas = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

/* ═══════════ সাধারণ তালিকা-সম্পাদক ═══════════
   সাইটের বেশিরভাগ অংশই "একই আকৃতির কিছু আইটেমের তালিকা" — পাঠক্রম,
   সুযোগ-সুবিধা, অর্জন, কৃতী শিক্ষার্থী, মতামত, প্রশ্নোত্তর, ফি, ভিডিও…
   প্রতিটির জন্য আলাদা সম্পাদক লিখলে একই কোড বারো বার লিখতে হতো।
   বদলে একটিই সম্পাদক, আর প্রতিটি তালিকার জন্য ছোট একটি ফিল্ড-কনফিগ। */
export type FieldSpec = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "list" | "number" | "icon" | "url";
  placeholder?: string;
  hint?: string;
  full?: boolean;   // পুরো প্রস্থ নেবে
};

export function ListEditor({
  name, initial, fields, titleKey, addLabel, emptyNote, max,
}: {
  name: string;
  initial: Record<string, unknown>[];
  fields: FieldSpec[];
  titleKey: string;
  addLabel: string;
  emptyNote?: string;
  max?: number;
}) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.key, f.type === "list" ? [] : f.type === "number" ? 0 : ""]));
  const L = useList<Record<string, unknown>>(initial || [], blank);

  return (
    <div>
      <Hidden name={name} value={L.items} />
      <div className="space-y-3">
        {L.items.map((item, i) => (
          <Item key={i} index={i} count={L.items.length}
            title={String(item[titleKey] || "").trim() || addLabel}
            move={L.move} remove={L.remove}>
            <div className="grid md:grid-cols-2 gap-3">
              {fields.map((f) => {
                const v = item[f.key];
                const cls = f.full ? "md:col-span-2" : "";
                if (f.type === "textarea") {
                  return (
                    <label key={f.key} className={cls}><Lbl>{f.label}</Lbl>
                      <textarea className={`${box} resize-y`} rows={2} value={String(v ?? "")}
                        placeholder={f.placeholder}
                        onChange={(e) => L.set(i, { [f.key]: e.target.value })} />
                      {f.hint && <span className="mt-1 block text-[12px] text-ink-soft">{f.hint}</span>}
                    </label>
                  );
                }
                if (f.type === "list") {
                  return (
                    <label key={f.key} className={cls}><Lbl>{f.label}</Lbl>
                      <input className={box} value={(Array.isArray(v) ? v : []).join(", ")}
                        placeholder={f.placeholder}
                        onChange={(e) => L.set(i, { [f.key]: commas(e.target.value) })} />
                      <span className="mt-1 block text-[12px] text-ink-soft">{f.hint || "কমা দিয়ে আলাদা করুন"}</span>
                    </label>
                  );
                }
                if (f.type === "icon") {
                  return (
                    <label key={f.key} className={cls}><Lbl>{f.label}</Lbl>
                      <select className={box} value={String(v || "sparkles")}
                        onChange={(e) => L.set(i, { [f.key]: e.target.value })}>
                        {ICONS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                      </select>
                    </label>
                  );
                }
                return (
                  <label key={f.key} className={cls}><Lbl>{f.label}</Lbl>
                    <input className={box} type={f.type === "number" ? "number" : "text"}
                      value={String(v ?? "")} placeholder={f.placeholder}
                      onChange={(e) => L.set(i, { [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })} />
                    {f.hint && <span className="mt-1 block text-[12px] text-ink-soft">{f.hint}</span>}
                  </label>
                );
              })}
            </div>
          </Item>
        ))}
      </div>
      {!L.items.length && emptyNote && (
        <p className="text-[14px] text-ink-soft py-3 leading-relaxed">{emptyNote}</p>
      )}
      {(!max || L.items.length < max) && <AddBtn onClick={L.add}>{addLabel}</AddBtn>}
    </div>
  );
}

/** এক লাইনের তালিকা (যেমন "আমাদের সম্পর্কে" পেজের টিক-পয়েন্ট) */
export function SimpleListEditor({ name, initial, placeholder, hint }: {
  name: string; initial: string[]; placeholder?: string; hint?: string;
}) {
  const [text, setText] = useState((initial || []).join("\n"));
  return (
    <div>
      <Hidden name={name} value={lines(text)} />
      <textarea className={`${box} resize-y font-[inherit]`} rows={5} value={text} placeholder={placeholder}
        onChange={(e) => setText(e.target.value)} />
      <p className="mt-1.5 text-[12.5px] text-ink-soft leading-relaxed">{hint || "প্রতি লাইনে একটি করে লিখুন।"}</p>
    </div>
  );
}

/* ═══════════ ১. বিভাগসমূহ ═══════════ */
export type Department = { name: string; level?: string; head?: string; desc?: string; subjects?: string[]; students?: string; icon?: string };

const ICONS = [
  { value: "book", label: "বই" }, { value: "flask", label: "বিজ্ঞান" }, { value: "graduation", label: "স্নাতক টুপি" },
  { value: "monitor", label: "কম্পিউটার" }, { value: "sparkles", label: "তারা" }, { value: "library", label: "পাঠাগার" },
  { value: "users", label: "দল" }, { value: "trophy", label: "ট্রফি" }, { value: "heart", label: "হৃদয়" },
];

export function DepartmentsEditor({ initial }: { initial: Department[] }) {
  const L = useList<Department>(initial, () => ({ name: "", level: "", head: "", desc: "", subjects: [] }));
  return (
    <div>
      <Hidden name="departments" value={L.items} />
      <div className="space-y-3">
        {L.items.map((d, i) => (
          <Item key={i} index={i} count={L.items.length} title={d.name || "নতুন বিভাগ"} move={L.move} remove={L.remove}>
            <div className="grid md:grid-cols-2 gap-3">
              <label><Lbl>বিভাগের নাম</Lbl>
                <input className={box} value={d.name} placeholder="বিজ্ঞান বিভাগ"
                  onChange={(e) => L.set(i, { name: e.target.value })} /></label>
              <label><Lbl>স্তর / শ্রেণি</Lbl>
                <input className={box} value={d.level || ""} placeholder="নবম–দশম"
                  onChange={(e) => L.set(i, { level: e.target.value })} /></label>
              <label><Lbl>বিভাগীয় প্রধান</Lbl>
                <input className={box} value={d.head || ""} placeholder="নাম দিলে কার্ডে দেখাবে"
                  onChange={(e) => L.set(i, { head: e.target.value })} /></label>
              <label><Lbl>শিক্ষার্থী সংখ্যা</Lbl>
                <input className={box} value={d.students || ""} placeholder="২৪০"
                  onChange={(e) => L.set(i, { students: e.target.value })} /></label>
              <label className="md:col-span-2"><Lbl>সংক্ষিপ্ত বিবরণ</Lbl>
                <textarea className={`${box} resize-y`} rows={2} value={d.desc || ""}
                  onChange={(e) => L.set(i, { desc: e.target.value })} /></label>
              <label className="md:col-span-2"><Lbl>বিষয়সমূহ — কমা দিয়ে আলাদা করুন</Lbl>
                <input className={box} value={(d.subjects || []).join(", ")} placeholder="পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান"
                  onChange={(e) => L.set(i, { subjects: commas(e.target.value) })} /></label>
              <label><Lbl>আইকন</Lbl>
                <select className={box} value={d.icon || "book"} onChange={(e) => L.set(i, { icon: e.target.value })}>
                  {ICONS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select></label>
            </div>
          </Item>
        ))}
      </div>
      {!L.items.length && (
        <p className="text-[14px] text-ink-soft py-3">
          কোনো বিভাগ যোগ করা নেই — সাইটে তখন পাঠক্রম থেকে স্বয়ংক্রিয়ভাবে বিভাগ দেখানো হবে।
        </p>
      )}
      <AddBtn onClick={L.add}>বিভাগ যোগ করুন</AddBtn>
    </div>
  );
}

/* ═══════════ ২. ক্লাব ═══════════ */
export type Club = { name: string; icon?: string; desc?: string; moderator?: string; day?: string; members?: string };

export function ClubsEditor({ initial }: { initial: Club[] }) {
  const L = useList<Club>(initial, () => ({ name: "", desc: "", moderator: "", day: "", members: "" }));
  return (
    <div>
      <Hidden name="clubs" value={L.items} />
      <div className="space-y-3">
        {L.items.map((c, i) => (
          <Item key={i} index={i} count={L.items.length} title={c.name || "নতুন ক্লাব"} move={L.move} remove={L.remove}>
            <div className="grid md:grid-cols-2 gap-3">
              <label><Lbl>ক্লাবের নাম</Lbl>
                <input className={box} value={c.name} placeholder="বিতর্ক ক্লাব"
                  onChange={(e) => L.set(i, { name: e.target.value })} /></label>
              <label><Lbl>পরিচালক শিক্ষক</Lbl>
                <input className={box} value={c.moderator || ""} placeholder="মোঃ হাসান মাহমুদ"
                  onChange={(e) => L.set(i, { moderator: e.target.value })} /></label>
              <label><Lbl>কার্যদিবস</Lbl>
                <input className={box} value={c.day || ""} placeholder="প্রতি বুধবার"
                  onChange={(e) => L.set(i, { day: e.target.value })} /></label>
              <label><Lbl>সদস্য সংখ্যা</Lbl>
                <input className={box} value={c.members || ""} placeholder="৪৫"
                  onChange={(e) => L.set(i, { members: e.target.value })} /></label>
              <label className="md:col-span-2"><Lbl>বিবরণ</Lbl>
                <textarea className={`${box} resize-y`} rows={2} value={c.desc || ""}
                  onChange={(e) => L.set(i, { desc: e.target.value })} /></label>
              <label><Lbl>আইকন</Lbl>
                <select className={box} value={c.icon || "sparkles"} onChange={(e) => L.set(i, { icon: e.target.value })}>
                  {ICONS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select></label>
            </div>
          </Item>
        ))}
      </div>
      <AddBtn onClick={L.add}>ক্লাব যোগ করুন</AddBtn>
    </div>
  );
}

/* ═══════════ ৩. রুটিন ═══════════
   পিরিয়ড কলাম ও দিনের সারি — সত্যিকারের ছক হিসেবেই সম্পাদনা হয়,
   কারণ রুটিন মানুষ ছক হিসেবেই ভাবে। মোবাইলে ছকটি পাশে স্ক্রল করে। */
export type RoutineTable = { title: string; note?: string; pdfUrl?: string; periods: string[]; rows: { day: string; cells: string[] }[] };

const DEFAULT_PERIODS = ["১ম · ১০:০০", "২য় · ১০:৫০", "৩য় · ১১:৪০", "বিরতি · ১২:৩০", "৪র্থ · ১:০০", "৫ম · ১:৫০", "৬ষ্ঠ · ২:৪০"];
const DEFAULT_DAYS = ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার"];

export function RoutineEditor({ initial }: { initial: RoutineTable[] }) {
  const blank = (): RoutineTable => ({
    title: "", note: "", periods: [...DEFAULT_PERIODS],
    rows: DEFAULT_DAYS.map((day) => ({ day, cells: DEFAULT_PERIODS.map(() => "") })),
  });
  const L = useList<RoutineTable>(initial, blank);

  /** কলাম সংখ্যা বদলালে প্রতিটি সারিকে সেই মাপে মিলিয়ে নিতে হয় */
  const setPeriods = (i: number, text: string) => {
    const periods = lines(text);
    const rows = L.items[i].rows.map((r) => ({
      ...r,
      cells: periods.map((_, n) => r.cells[n] ?? ""),
    }));
    L.set(i, { periods, rows });
  };
  const setCell = (i: number, r: number, c: number, v: string) => {
    const rows = L.items[i].rows.map((row, n) =>
      n === r ? { ...row, cells: row.cells.map((cell, m) => (m === c ? v : cell)) } : row);
    L.set(i, { rows });
  };
  const setDay = (i: number, r: number, v: string) => {
    const rows = L.items[i].rows.map((row, n) => (n === r ? { ...row, day: v } : row));
    L.set(i, { rows });
  };
  const addDay = (i: number) => {
    const t = L.items[i];
    L.set(i, { rows: [...t.rows, { day: "", cells: t.periods.map(() => "") }] });
  };
  const removeDay = (i: number, r: number) =>
    L.set(i, { rows: L.items[i].rows.filter((_, n) => n !== r) });

  return (
    <div>
      <Hidden name="routine" value={L.items} />
      <div className="space-y-4">
        {L.items.map((t, i) => (
          <Item key={i} index={i} count={L.items.length} title={t.title || "নতুন রুটিন"} move={L.move} remove={L.remove}>
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <label><Lbl>রুটিনের শিরোনাম</Lbl>
                <input className={box} value={t.title} placeholder="ষষ্ঠ – অষ্টম শ্রেণি"
                  onChange={(e) => L.set(i, { title: e.target.value })} /></label>
              <label><Lbl>PDF লিংক (ঐচ্ছিক)</Lbl>
                <input className={box} value={t.pdfUrl || ""} placeholder="https://…"
                  onChange={(e) => L.set(i, { pdfUrl: e.target.value })} /></label>
              <label className="md:col-span-2"><Lbl>পিরিয়ড — প্রতি লাইনে একটি। “নাম · সময়” লিখলে দুই লাইনে দেখাবে</Lbl>
                <textarea className={`${box} resize-y font-mono text-[13.5px]`} rows={4}
                  value={t.periods.join("\n")} onChange={(e) => setPeriods(i, e.target.value)} /></label>
              <label className="md:col-span-2"><Lbl>নিচের নোট (ঐচ্ছিক)</Lbl>
                <input className={box} value={t.note || ""} placeholder="ব্যবহারিক ক্লাস শুক্রবার সকালে"
                  onChange={(e) => L.set(i, { note: e.target.value })} /></label>
            </div>

            <div className="overflow-x-auto rounded-xl border border-rule bg-paper">
              <table className="border-collapse min-w-[640px] w-full">
                <thead>
                  <tr className="bg-[#efeadf]">
                    <th className="px-3 py-2 text-left text-[12.5px] font-bold text-ink-soft w-32">বার</th>
                    {t.periods.map((p, c) => (
                      <th key={c} className="px-2 py-2 text-center text-[12px] font-bold text-ink-soft whitespace-nowrap">{p}</th>
                    ))}
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((row, r) => (
                    <tr key={r} className="border-t border-rule">
                      <td className="p-1.5">
                        <input className={`${box} !min-h-[40px] !text-[13.5px] font-semibold`} value={row.day}
                          placeholder="শনিবার" onChange={(e) => setDay(i, r, e.target.value)} />
                      </td>
                      {t.periods.map((_, c) => (
                        <td key={c} className="p-1.5">
                          <input className={`${box} !min-h-[40px] !text-[13.5px] text-center`} value={row.cells[c] ?? ""}
                            onChange={(e) => setCell(i, r, c, e.target.value)} />
                        </td>
                      ))}
                      <td className="p-1.5 text-center">
                        <IconBtn onClick={() => removeDay(i, r)} title="এই দিনটি মুছুন" tone="danger">✕</IconBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AddBtn onClick={() => addDay(i)}>দিন যোগ করুন</AddBtn>
          </Item>
        ))}
      </div>
      <AddBtn onClick={L.add}>নতুন রুটিন ছক</AddBtn>
    </div>
  );
}

/* ═══════════ ৪. ফলাফলের ধারা (চার্ট) ═══════════ */
export type ResultSeries = { exam: string; note?: string; rows: { year: string; passRate: number; gpa5?: number; appeared?: number; passed?: number }[] };

export function ResultChartEditor({ initial }: { initial: ResultSeries[] }) {
  const blank = (): ResultSeries => ({ exam: "", note: "", rows: [{ year: "", passRate: 0, gpa5: 0, appeared: 0, passed: 0 }] });
  const L = useList<ResultSeries>(initial, blank);

  const setRow = (i: number, r: number, patch: Partial<ResultSeries["rows"][number]>) =>
    L.set(i, { rows: L.items[i].rows.map((row, n) => (n === r ? { ...row, ...patch } : row)) });
  const addRow = (i: number) =>
    L.set(i, { rows: [...L.items[i].rows, { year: "", passRate: 0, gpa5: 0, appeared: 0, passed: 0 }] });
  const removeRow = (i: number, r: number) =>
    L.set(i, { rows: L.items[i].rows.filter((_, n) => n !== r) });

  const numCls = `${box} !min-h-[40px] !text-[13.5px] text-center tabular-nums`;

  return (
    <div>
      <Hidden name="resultChart" value={L.items} />
      <div className="space-y-4">
        {L.items.map((s, i) => (
          <Item key={i} index={i} count={L.items.length} title={s.exam || "নতুন পরীক্ষা"} move={L.move} remove={L.remove}>
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <label><Lbl>পরীক্ষার নাম</Lbl>
                <input className={box} value={s.exam} placeholder="এসএসসি পরীক্ষা"
                  onChange={(e) => L.set(i, { exam: e.target.value })} /></label>
              <label><Lbl>নোট (ঐচ্ছিক)</Lbl>
                <input className={box} value={s.note || ""} placeholder="বোর্ড প্রকাশিত ফল অনুযায়ী"
                  onChange={(e) => L.set(i, { note: e.target.value })} /></label>
            </div>

            <div className="overflow-x-auto rounded-xl border border-rule bg-paper">
              <table className="border-collapse min-w-[560px] w-full">
                <thead>
                  <tr className="bg-[#efeadf] text-[12.5px] font-bold text-ink-soft">
                    <th className="px-3 py-2 text-left w-28">সাল</th>
                    <th className="px-2 py-2">অংশগ্রহণ</th>
                    <th className="px-2 py-2">উত্তীর্ণ</th>
                    <th className="px-2 py-2">পাসের হার %</th>
                    <th className="px-2 py-2">জিপিএ-৫</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {s.rows.map((row, r) => (
                    <tr key={r} className="border-t border-rule">
                      <td className="p-1.5">
                        <input className={`${box} !min-h-[40px] !text-[13.5px]`} value={row.year} placeholder="২০২৫"
                          onChange={(e) => setRow(i, r, { year: e.target.value })} />
                      </td>
                      <td className="p-1.5"><input type="number" min={0} className={numCls} value={row.appeared ?? 0}
                        onChange={(e) => setRow(i, r, { appeared: Number(e.target.value) })} /></td>
                      <td className="p-1.5"><input type="number" min={0} className={numCls} value={row.passed ?? 0}
                        onChange={(e) => setRow(i, r, { passed: Number(e.target.value) })} /></td>
                      <td className="p-1.5"><input type="number" min={0} max={100} className={numCls} value={row.passRate}
                        onChange={(e) => setRow(i, r, { passRate: Number(e.target.value) })} /></td>
                      <td className="p-1.5"><input type="number" min={0} className={numCls} value={row.gpa5 ?? 0}
                        onChange={(e) => setRow(i, r, { gpa5: Number(e.target.value) })} /></td>
                      <td className="p-1.5 text-center">
                        <IconBtn onClick={() => removeRow(i, r)} title="এই সারিটি মুছুন" tone="danger">✕</IconBtn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AddBtn onClick={() => addRow(i)}>বছর যোগ করুন</AddBtn>
          </Item>
        ))}
      </div>
      <AddBtn onClick={L.add}>পরীক্ষা যোগ করুন</AddBtn>
      <p className="mt-4 text-[13px] text-ink-soft leading-relaxed">
        সাল অনুযায়ী পাসের হার ও জিপিএ-৫ দিলে “ফলাফল” পেজে স্বয়ংক্রিয়ভাবে চার্ট তৈরি হয়।
        কিছু না দিলে প্রতিষ্ঠানের ধরন অনুযায়ী নমুনা চার্ট দেখানো হবে।
      </p>
    </div>
  );
}
