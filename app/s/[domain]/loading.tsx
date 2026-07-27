/* পেজ বদলানোর সময়ের কঙ্কাল
   ------------------------------------------------------------------
   হেডার ও ফুটার layout-এ আছে, তাই সেগুলো সাথে সাথেই দেখা যায় — এখানে
   শুধু মাঝের অংশটুকু। ফলে ক্লিকের সাথে সাথেই পেজ "বদলে গেছে" মনে হয়,
   আর বাকি তথ্য এলে নিঃশব্দে বসে যায়। */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">পেজ আসছে…</span>

      {/* পেজ শিরোনামের ব্যান্ড */}
      <div className="border-b border-n-200" style={{ background: "var(--brand-50)" }}>
        <div className="container-x py-10 md:py-14">
          <div className="sk h-4 w-40" />
          <div className="sk h-9 w-72 max-w-[70%] mt-4" />
          <div className="sk h-4 w-96 max-w-[85%] mt-4" />
        </div>
      </div>

      {/* কনটেন্ট ব্লক */}
      <div className="container-x py-10 md:py-14 space-y-8">
        <div className="grid md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-n-200 bg-white p-6">
              <div className="sk h-12 w-12 rounded-xl" />
              <div className="sk h-5 w-2/3 mt-4" />
              <div className="sk h-3.5 w-full mt-3" />
              <div className="sk h-3.5 w-4/5 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
