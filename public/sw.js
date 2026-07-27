/* সার্ভিস ওয়ার্কার — অস্থির সংযোগের জন্য
   ------------------------------------------------------------------
   বাংলাদেশে সংযোগ প্রায়ই "আছে কিন্তু চলছে না" অবস্থায় থাকে। তখন ব্রাউজারের
   ডিফল্ট আচরণ হলো অনির্দিষ্টকাল ঘোরা, শেষে ডাইনোসর। এই ওয়ার্কার তিনটি
   কাজ করে:

   ১. ছবি ও ফন্ট — cache-first। একবার নামলে আর কখনো নেটওয়ার্কে যায় না।
      সাইটের সবচেয়ে ভারী বাইটগুলো এগুলোই।
   ২. পেজ — network-first, কিন্তু ৩.৫ সেকেন্ডে সাড়া না পেলে ক্যাশ থেকে।
      "নতুন তথ্য" আর "কিছু একটা দেখানো" — দুইয়ের মাঝে এটিই ভারসাম্য।
   ৩. একদম কিছু না পেলে অফলাইন বার্তা — বাংলায়, ফোন নম্বরসহ নয়, শুধু
      "সংযোগ ফিরলে আবার চেষ্টা করুন"।

   ইচ্ছাকৃতভাবে কোনো লাইব্রেরি নেই — Workbox যোগ করলে নিজেই ~২০kB। */
/* সংস্করণ বদলালেই activate-এ পুরোনো সব ক্যাশ মুছে যায় (নিচে দেখুন)।
   v1 → v2 করা হলো ইচ্ছাকৃতভাবে: আগের ওয়ার্কারটি স্থানীয়ভাবেও পাতা ক্যাশ
   করত, ফলে পুরোনো HTML দেখাত আর হাইড্রেশন ভেঙে পড়ত। সংস্করণ বাড়ানোয়
   যেসব ব্রাউজারে পুরোনো ক্যাশ বসে আছে, সেগুলো নিজে থেকেই পরিষ্কার হবে।
   ভবিষ্যতেও ডেপ্লয়ের পর বাসি পাতা সন্দেহ হলে এই সংখ্যাটি বাড়ালেই হবে। */
const VERSION = "v2";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const PAGE_TIMEOUT = 3500;

/* অ্যাডমিন, সুপার প্যানেল ও API কখনো ক্যাশ হয় না — বাসি তথ্য দেখিয়ে
   প্রধান শিক্ষককে বিভ্রান্ত করার চেয়ে ধীরে হলেও সত্যি দেখানো ভালো। */
const NEVER_CACHE = /^\/(admin|super|api)(\/|$)/;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(PAGES).then((c) => c.add("/offline.html")).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const isAsset = (url) =>
  url.pathname.startsWith("/img/") ||
  url.pathname.startsWith("/_next/static/") ||
  /\.(woff2?|png|jpe?g|svg|webp|avif|ico)$/i.test(url.pathname);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* স্থানীয় ডেভেলপমেন্টে কিছুই ক্যাশ করা হয় না। একবার প্রোডাকশন বিল্ড
     চালালে এই ওয়ার্কার localhost-এ রয়ে যায়; পরে `next dev`-এ ঠান্ডা রুট
     কম্পাইল হতে ৩.৫ সেকেন্ডের বেশি লাগায় সময় ফুরিয়ে যেত আর পুরোনো
     ক্যাশ করা পাতা দেখানো হতো — নতুন পরিবর্তন কিছুতেই দেখা যেত না। */
  if (url.hostname === "localhost" || url.hostname.endsWith(".localhost") ||
      url.hostname === "127.0.0.1" || url.hostname === "[::1]") return;
  if (NEVER_CACHE.test(url.pathname)) return;

  /* ১. স্থির সম্পদ — ক্যাশ আগে, না থাকলে নেটওয়ার্ক (এবং রেখে দেওয়া) */
  if (isAsset(url)) {
    event.respondWith(
      caches.match(request).then((hit) =>
        hit ||
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(ASSETS).then((c) => c.put(request, copy));
          }
          return res;
        })
      )
    );
    return;
  }

  /* ২. পেজ — নেটওয়ার্ক আগে, কিন্তু অপেক্ষার সীমা আছে */
  if (request.mode === "navigate") {
    event.respondWith(
      new Promise((resolve) => {
        let settled = false;
        const done = (res) => { if (!settled) { settled = true; resolve(res); } };

        const timer = setTimeout(() => {
          caches.match(request).then((hit) => hit && done(hit));
        }, PAGE_TIMEOUT);

        fetch(request)
          .then((res) => {
            clearTimeout(timer);
            if (res.ok) {
              const copy = res.clone();
              caches.open(PAGES).then((c) => c.put(request, copy));
            }
            done(res);
          })
          .catch(() => {
            clearTimeout(timer);
            caches.match(request)
              .then((hit) => hit || caches.match("/offline.html"))
              .then((res) => done(res || Response.error()));
          });
      })
    );
  }
});
