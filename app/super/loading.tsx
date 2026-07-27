/* সুপার প্যানেলের লোডিং কঙ্কাল */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">পেজ আসছে…</span>

      <div className="sk h-8 w-64 mb-3" />
      <div className="sk h-3 w-12 mb-6" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-rule bg-paper p-5">
            <div className="sk h-3 w-24" />
            <div className="sk h-7 w-16 mt-3" />
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-rule bg-paper overflow-hidden">
            <div className="px-5 md:px-7 py-4 border-b border-rule bg-[#fcfaf5]">
              <div className="sk h-4 w-48" />
            </div>
            <div className="p-5 md:p-7 space-y-3">
              <div className="sk h-5 w-1/3" />
              <div className="sk h-3.5 w-2/3" />
              <div className="sk h-3.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
