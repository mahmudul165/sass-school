/* স্ট্যান্ডার্ড পেজ ব্লক — সব টেমপ্লেটে অভিন্ন
   ------------------------------------------------------------------
   সভাপতির বাণী, অধ্যক্ষের বাণী, বিভাগসমূহ, রুটিন, ক্লাব ও লগইন —
   এই পেজগুলো প্রতিটি প্রতিষ্ঠানে একই তথ্য একই ভঙ্গিতে দেখায়, তাই এগুলো
   টেমপ্লেটে নকল না করে এখানে একবার লেখা। রঙ ও ছন্দ ব্র্যান্ড ভেরিয়েবল
   থেকেই আসে, ফলে প্রতিটি টেমপ্লেটে এগুলো "নিজেরই অংশ" মনে হয়।

   সবগুলোই সার্ভার কম্পোনেন্ট — ব্রাউজারে কোনো জাভাস্ক্রিপ্ট যায় না। */
import { TLink } from "@/components/site/tlink";
import { Section, SectionHead, Btn, Figure, Avatar } from "./ui";
import { Icon } from "./icons";
import { dict, messageOf, type Lang } from "@/lib/i18n";
import { toBnDigits } from "@/lib/digits";
import type { Person, Department, RoutineTable, Club } from "@/lib/content";

const n = (v: string | number, lang: Lang) => (lang === "bn" ? toBnDigits(String(v)) : String(v));

/* ── ১. সভাপতি / অধ্যক্ষের বাণী ─────────────────────────
   বাংলাদেশে এই পেজ দুটি নিছক আনুষ্ঠানিকতা নয় — অভিভাবক এখান থেকেই
   প্রতিষ্ঠানের "সুর" বোঝেন। তাই ছবি বড়, বার্তা অনুচ্ছেদে ভাঙা, নিচে স্বাক্ষর-ধাঁচ। */
export function PersonMessage({
  person, lang = "bn", institution, fallbackRole,
}: {
  person?: Person; lang?: Lang; institution: string; fallbackRole: string;
}) {
  const t = dict(lang);
  if (!person?.name) {
    return (
      <Section tone="plain">
        <div className="max-w-2xl mx-auto rounded-2xl border border-n-200 bg-n-50 p-8 md:p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand">
            <Icon name="quote" size={26} />
          </span>
          <h2 className="mt-4 t-h3 text-n-900">{messageOf(fallbackRole, lang)}</h2>
          <p className="mt-3 text-n-600">
            {lang === "en"
              ? "This message will be published shortly. Until then, our office will be glad to answer any question."
              : "বাণীটি শিগগিরই প্রকাশিত হবে। ততক্ষণ পর্যন্ত যেকোনো জিজ্ঞাসায় প্রতিষ্ঠানের অফিসে যোগাযোগ করুন।"}
          </p>
          <Btn href="/contact" variant="outline" className="mt-6">{t.contactUs}</Btn>
        </div>
      </Section>
    );
  }

  const paras = String(person.message || "").split(/\n{2,}/).filter(Boolean);
  return (
    <>
      <Section tone="plain">
        <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
          {/* ছবি ও পরিচয় */}
          <aside data-reveal className="lg:sticky lg:top-28">
            <Figure src={person.photo} alt={person.name} ratio="aspect-[3/4]" icon="users"
              rounded="rounded-2xl" className="shadow-e2" />
            <div className="mt-5 rounded-2xl border border-n-200 bg-n-50 p-5 text-center">
              <p className="font-display font-bold text-[19px] text-n-900 leading-tight">{person.name}</p>
              <p className="mt-1 text-[14.5px] font-semibold text-brand">{person.role}</p>
              <p className="mt-1.5 text-[13.5px] text-n-500">{institution}</p>
              {person.since && (
                <p className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-[12.5px] text-n-500 hairline tnum">
                  {lang === "en" ? "In office since" : "দায়িত্বে"} {n(person.since, lang)}
                </p>
              )}
            </div>
          </aside>

          {/* বার্তা */}
          <div data-reveal style={{ ["--reveal-delay" as string]: "90ms" }}>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand">
              <Icon name="quote" size={24} />
            </span>
            <h2 className="mt-5 font-display t-h2 text-n-900">{messageOf(person.role, lang)}</h2>
            <div className="mt-6 space-y-5 text-n-700 leading-[2] text-[16.5px]">
              {(paras.length ? paras : [person.message || ""]).map((p, i) => (
                <p key={i} className={i === 0 ? "first-letter:text-[2.6em] first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:leading-[0.9] first-letter:text-brand" : ""}>
                  {p}
                </p>
              ))}
            </div>
            <div className="mt-9 border-t border-n-200 pt-6 flex flex-wrap items-center gap-4">
              <Avatar src={person.photo} name={person.name} size={52} />
              <div>
                <p className="font-bold text-n-900">{person.name}</p>
                <p className="text-[13.5px] text-n-500">{person.role}, {institution}</p>
              </div>
              <div className="ms-auto flex flex-wrap gap-3">
                <Btn href="/about" variant="outline" className="!min-h-[46px] !px-5 !text-[14.5px]">{t.navAbout}</Btn>
                <Btn href="/contact" variant="primary" className="!min-h-[46px] !px-5 !text-[14.5px]">{t.contactUs}</Btn>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

/* ── ২. বিভাগসমূহ ──────────────────────────────────────── */
export function DepartmentGrid({ departments, lang = "bn" }: { departments: Department[]; lang?: Lang }) {
  const t = dict(lang);
  if (!departments.length) {
    return <Section tone="plain"><p className="text-center text-n-500 py-10">{t.emptyDepartments}</p></Section>;
  }
  return (
    <Section tone="plain">
      <div className="grid md:grid-cols-2 gap-5">
        {departments.map((d, i) => (
          <article key={d.name + i} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 2) * 80}ms` }}
            className="lift rounded-2xl border border-n-200 bg-white p-6 md:p-7 flex flex-col">
            <div className="flex items-start gap-4">
              <span className="grid h-13 w-13 shrink-0 place-items-center rounded-xl bg-brand text-brand-on"
                style={{ height: 52, width: 52 }}>
                <Icon name={d.icon || "book"} size={24} />
              </span>
              <div className="min-w-0">
                <h2 className="font-display t-h3 text-n-900 leading-tight">{d.name}</h2>
                {d.level && <p className="mt-1 text-[13.5px] font-semibold text-brand">{d.level}</p>}
              </div>
            </div>

            {d.desc && <p className="mt-4 text-n-600 leading-relaxed text-[15.5px]">{d.desc}</p>}

            {d.subjects?.length ? (
              <div className="mt-5">
                <p className="t-eyebrow text-n-400 mb-2.5">{t.deptSubjects}</p>
                <ul className="flex flex-wrap gap-2">
                  {d.subjects.map((s) => (
                    <li key={s} className="rounded-lg bg-brand-50 px-3 py-1.5 text-[13.5px] font-medium text-brand-800">{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(d.head || d.students) && (
              <div className="mt-5 pt-4 border-t border-n-100 flex flex-wrap gap-x-8 gap-y-2 text-[14px]">
                {d.head && (
                  <span className="inline-flex items-center gap-2 text-n-600">
                    <Icon name="userCheck" size={16} className="text-brand" />
                    <span className="text-n-400">{t.deptHead}:</span> <b className="text-n-800">{d.head}</b>
                  </span>
                )}
                {d.students && (
                  <span className="inline-flex items-center gap-2 text-n-600">
                    <Icon name="users" size={16} className="text-brand" />
                    <span className="text-n-400">{t.deptStudents}:</span> <b className="text-n-800 tnum">{d.students}</b>
                  </span>
                )}
              </div>
            )}

            <div className="mt-6 pt-1 mt-auto flex flex-wrap gap-3">
              <Btn href="/teachers" variant="outline" className="!min-h-[44px] !px-4 !text-[14px]" icon="users">{t.navTeachers}</Btn>
              <Btn href="/admission#apply" variant="ghost" className="!min-h-[44px] !px-4 !text-[14px]" iconRight="arrowRight">{t.applyNow}</Btn>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ── ৩. রুটিন ──────────────────────────────────────────
   মোবাইলে টেবিল অনুভূমিক স্ক্রল করে, কিন্তু প্রথম কলাম (বার) আটকে থাকে —
   না হলে স্ক্রল করতে করতে কোন দিনের ঘর দেখছেন তা হারিয়ে যায়। */
export function RoutineTables({ routine, lang = "bn" }: { routine: RoutineTable[]; lang?: Lang }) {
  const t = dict(lang);
  if (!routine.length) {
    return <Section tone="plain"><p className="text-center text-n-500 py-10">{t.emptyRoutine}</p></Section>;
  }
  return (
    <Section tone="plain">
      <div className="space-y-10">
        {routine.map((r, ri) => (
          <section key={r.title + ri} data-reveal>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display t-h3 text-n-900 inline-flex items-center gap-2.5">
                <Icon name="calendar" size={20} className="text-brand" /> {r.title}
              </h2>
              {r.pdfUrl && (
                <Btn href={r.pdfUrl} variant="outline" external icon="download"
                  className="!min-h-[42px] !px-4 !text-[14px]">{t.routineDownload}</Btn>
              )}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-n-200 bg-white">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <caption className="sr-only">{r.title}</caption>
                <thead>
                  <tr style={{ background: "var(--brand-700)" }} className="text-white">
                    <th scope="col" className="sticky left-0 z-10 px-4 py-3.5 text-[13.5px] font-bold whitespace-nowrap"
                      style={{ background: "var(--brand-700)" }}>{t.routineDay}</th>
                    {r.periods.map((p) => {
                      const [head, time] = p.split("·").map((s) => s.trim());
                      return (
                        <th key={p} scope="col" className="px-3 py-3 text-[13px] font-bold text-center whitespace-nowrap">
                          {n(head, lang)}
                          {time && <span className="block font-medium opacity-75 text-[11.5px] tnum">{n(time, lang)}</span>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((row, i) => (
                    <tr key={row.day} className={i % 2 ? "bg-n-50/60" : "bg-white"}>
                      <th scope="row" className="sticky left-0 z-10 px-4 py-3 text-[14px] font-bold text-n-900 whitespace-nowrap border-r border-n-200"
                        style={{ background: i % 2 ? "var(--n-50)" : "#fff" }}>
                        {row.day}
                      </th>
                      {row.cells.map((c, ci) => {
                        const isBreak = /বিরতি|টিফিন|break|Break/i.test(c);
                        return (
                          <td key={ci}
                            className={`px-3 py-3 text-[14px] text-center border-l border-n-100 ${
                              isBreak ? "font-semibold text-accent-800 bg-accent-50" : "text-n-700"
                            }`}>
                            {c}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {r.note && <p className="mt-3 text-[14px] text-n-500 flex gap-2"><Icon name="bulb" size={16} className="mt-0.5 shrink-0 text-accent-500" />{r.note}</p>}
          </section>
        ))}
      </div>

      <p className="mt-8 text-[14.5px] text-n-500 flex gap-2 justify-center text-center">
        <Icon name="bell" size={17} className="mt-0.5 shrink-0 text-brand" />
        {t.routineNote} <TLink href="/notice" className="text-brand font-semibold hover:underline">{t.navNotice}</TLink>
      </p>
    </Section>
  );
}

/* ── ৪. ক্লাব ও সহশিক্ষা ────────────────────────────────── */
export function ClubGrid({ clubs, lang = "bn" }: { clubs: Club[]; lang?: Lang }) {
  const t = dict(lang);
  if (!clubs.length) {
    return <Section tone="plain"><p className="text-center text-n-500 py-10">{t.emptyClub}</p></Section>;
  }
  return (
    <Section tone="plain">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {clubs.map((c, i) => (
          <article key={c.name + i} data-reveal style={{ ["--reveal-delay" as string]: `${(i % 3) * 70}ms` }}
            className="lift rounded-2xl border border-n-200 bg-white overflow-hidden flex flex-col">
            <span className="block h-1.5" style={{ background: i % 2 ? "var(--accent-600)" : "var(--brand-600)" }} />
            <div className="p-6 flex-1 flex flex-col">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand">
                <Icon name={c.icon || "sparkles"} size={23} />
              </span>
              <h2 className="mt-4 font-display text-[18px] font-bold text-n-900">{c.name}</h2>
              {c.desc && <p className="mt-2 text-[15px] text-n-600 leading-relaxed flex-1">{c.desc}</p>}
              <dl className="mt-5 pt-4 border-t border-n-100 space-y-2 text-[13.5px]">
                {c.moderator && (
                  <div className="flex gap-2"><dt className="text-n-400 shrink-0">{t.clubModerator}:</dt>
                    <dd className="font-semibold text-n-800">{c.moderator}</dd></div>
                )}
                {c.day && (
                  <div className="flex gap-2"><dt className="text-n-400 shrink-0">{t.clubDay}:</dt>
                    <dd className="font-semibold text-n-800">{c.day}</dd></div>
                )}
                {c.members && (
                  <div className="flex gap-2"><dt className="text-n-400 shrink-0">{t.clubMembers}:</dt>
                    <dd className="font-semibold text-n-800 tnum">{n(c.members, lang)}</dd></div>
                )}
              </dl>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl p-7 md:p-9 text-center" style={{ background: "var(--brand-50)" }}>
        <h2 className="t-h3 text-n-900">
          {lang === "en" ? "Want to join a club?" : "কোনো ক্লাবে যুক্ত হতে চাও?"}
        </h2>
        <p className="mt-2.5 text-n-600 max-w-xl mx-auto">
          {lang === "en"
            ? "Give your name to your class teacher, or leave your number here — the moderator will get in touch."
            : "নিজ শ্রেণি শিক্ষকের কাছে নাম দাও, অথবা এখানে নম্বর রেখে যাও — পরিচালক শিক্ষক যোগাযোগ করবেন।"}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Btn href="/contact" variant="primary" iconRight="arrowRight">{t.contactUs}</Btn>
          <Btn href="/gallery" variant="outline">{t.navGallery}</Btn>
        </div>
      </div>
    </Section>
  );
}

/* ── ৫. লগইন ────────────────────────────────────────────
   এখানে ভুয়া লগইন ফর্ম নেই। প্রতিষ্ঠান অ্যাডমিন প্ল্যাটফর্মের মূল ডোমেইনে
   ইউজারনেম ও পাসওয়ার্ড দিয়ে ঢোকেন, আর শিক্ষার্থী/অভিভাবক কর্নার উন্মুক্ত — যা সত্য,
   ঠিক তা-ই দেখানো হয়। প্রতিষ্ঠানের নিজস্ব পোর্টাল থাকলে সেই লিংক বসে। */
export function LoginOptions({
  lang = "bn", adminUrl, studentUrl, parentUrl, phone,
}: {
  lang?: Lang; adminUrl: string; studentUrl?: string; parentUrl?: string; phone?: string;
}) {
  const t = dict(lang);
  const cards = [
    {
      icon: "userCheck", title: t.loginAdmin, desc: t.loginAdminDesc, cta: t.loginAdminCta,
      href: adminUrl, external: true, primary: true,
    },
    {
      icon: "graduation", title: t.loginStudent, desc: t.loginStudentDesc, cta: t.loginStudentCta,
      href: studentUrl || "/portal", external: Boolean(studentUrl),
    },
    {
      icon: "handHeart", title: t.loginParent, desc: t.loginParentDesc, cta: t.loginParentCta,
      href: parentUrl || "/portal#parents", external: Boolean(parentUrl),
    },
  ];

  return (
    <Section tone="plain">
      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {cards.map((c, i) => (
          <article key={c.title} data-reveal
            style={{
              ["--reveal-delay" as string]: `${i * 80}ms`,
              ...(c.primary ? { borderColor: "var(--brand-600)" } : null),
            }}
            className={`rounded-2xl p-7 flex flex-col text-center ${
              c.primary ? "border-2 bg-brand-50" : "border border-n-200 bg-white"
            }`}>
            <span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${
              c.primary ? "bg-brand text-brand-on" : "bg-brand-50 text-brand"
            }`}>
              <Icon name={c.icon} size={26} />
            </span>
            <h2 className="mt-5 font-display text-[19px] font-bold text-n-900">{c.title}</h2>
            <p className="mt-2.5 text-[15px] text-n-600 leading-relaxed flex-1">{c.desc}</p>
            <Btn href={c.href} external={c.external} variant={c.primary ? "primary" : "outline"}
              className="mt-6 w-full" iconRight="arrowRight">{c.cta}</Btn>
          </article>
        ))}
      </div>

      <div className="mt-10 max-w-3xl mx-auto rounded-2xl border border-n-200 bg-n-50 p-6 text-center">
        <p className="text-n-600 text-[15px] flex flex-wrap items-center justify-center gap-2">
          <Icon name="bulb" size={18} className="text-accent-600" />
          {t.loginHelp}
          {phone && (
            <a href={`tel:${phone}`} className="font-bold text-brand hover:underline tnum">{phone}</a>
          )}
        </p>
      </div>
    </Section>
  );
}

/** পেজের নিচে অভিন্ন কল-টু-অ্যাকশন */
export function PageCta({ lang = "bn", title, sub }: { lang?: Lang; title?: string; sub?: string }) {
  const t = dict(lang);
  return (
    <Section tone="soft" size="sm">
      <SectionHead
        title={title || (lang === "en" ? "Would you like to visit our campus?" : "আমাদের ক্যাম্পাস ঘুরে দেখতে চান?")}
        sub={sub || (lang === "en"
          ? "Visit us on any working day, or call ahead to fix a time."
          : "যেকোনো কর্মদিবসে সরাসরি আসুন, অথবা ফোন করে সময় ঠিক করে নিন।")}
        className="!mb-7"
      />
      <div className="flex flex-wrap gap-3 justify-center">
        <Btn href="/admission#apply" variant="primary" size="lg" iconRight="arrowRight">{t.applyNow}</Btn>
        <Btn href="/contact" variant="outline" size="lg">{t.contactUs}</Btn>
      </div>
    </Section>
  );
}
