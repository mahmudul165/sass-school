"use client";
/* সার্ভিস ওয়ার্কার নিবন্ধন
   ------------------------------------------------------------------
   শুধু পাবলিক সাইটে (অ্যাডমিন প্যানেলে নয় — সেখানে বাসি তথ্য বিপজ্জনক)।
   নিবন্ধন হয় পেজ লোড শেষ হওয়ার পর, যাতে প্রথম রেন্ডারের সাথে
   প্রতিযোগিতা না করে — সস্তা ফোনে এই পার্থক্যটা চোখে পড়ে।
   dev-এ চালানো হয় না, নইলে হট-রিলোড ক্যাশের সাথে লড়ে। */
import { useEffect } from "react";

export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    /* ডেভেলপমেন্টে: আগে থেকে বসে থাকা সার্ভিস ওয়ার্কার সরিয়ে দাও।
       কেন দরকার — একবার প্রোডাকশন বিল্ড চালালে ওয়ার্কারটি এই origin-এ
       (localhost:3000) স্থায়ীভাবে বসে যায়, পরে `next dev` চালালেও থেকে
       যায়। পাতার জন্য কৌশল network-first, সময়সীমা ৩.৫ সেকেন্ড; অথচ
       dev-এ ঠান্ডা রুট কম্পাইল হতে ৩–৫ সেকেন্ড লাগে। ফলে সময় ফুরিয়ে
       গিয়ে পুরোনো ক্যাশ করা HTML দেখানো হতো — নতুন মেনু বা কনটেন্ট
       কিছুতেই আসত না, রিফ্রেশ দিলে মাঝে মাঝে আসত। */
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations?.()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => { /* উপেক্ষা */ });
      if (typeof caches !== "undefined") {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* নিবন্ধন ব্যর্থ হলে সাইট আগের মতোই চলবে — শুধু অফলাইন সুবিধা থাকবে না */
      });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
