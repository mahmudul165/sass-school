/* অ্যাডমিন প্যানেলের লোডিং কঙ্কাল — শেল (স্পাইন ও হেডার) layout-এ থাকে,
   তাই মেনু সাথে সাথেই দেখা যায়; শুধু কাজের জায়গাটুকু এখানে। */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">পেজ আসছে…</span>

      <div className="sk h-8 w-56 mb-3" />
      <div className="sk h-3 w-12 mb-6" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-rule bg-paper p-5">
            <div className="sk h-3 w-20" />
            <div className="sk h-7 w-14 mt-3" />
          </div>
        ))}
      </div>

      <div className="space-y-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-rule bg-paper overflow-hidden">
            <div className="px-5 md:px-7 py-4 border-b border-rule bg-[#fcfaf5]">
              <div className="sk h-4 w-40" />
            </div>
            <div className="p-5 md:p-7 grid md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j}>
                  <div className="sk h-3 w-24 mb-2" />
                  <div className="sk h-12 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
