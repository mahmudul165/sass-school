"use client";
/* framer-motion-এর সরু দরজা।
   ------------------------------------------------------------------
   কেন সরাসরি `motion.div` নয়, এই মোড়কটি:

   পুরো framer-motion বান্ডলে ~৩৪kB (gzip)। এই সাইটের দর্শক ৩জি/৪জি-তে,
   ৩৬০px অ্যান্ড্রয়েডে — সেখানে অ্যানিমেশনের জন্য ৩৪kB দেওয়া মানে
   প্রথম নোটিশটি পড়তে দেরি করানো। তাই দুটি সিদ্ধান্ত:

   ১) `m` কম্পোনেন্ট, `motion` নয়। `motion.div` পুরো ফিচার-সেট নিজের
      সাথে টেনে আনে; `m` আনে না — ফিচার আলাদা করে আসে।
   ২) `features` একটি async ফাংশন, স্থির import নয়। ফলে অ্যানিমেশনের
      কোডটুকু প্রথম HTML-এর সাথে নামে না, হাইড্রেশনের পরে নিজে নামে।
      দর্শক ততক্ষণে লেখা পড়তে শুরু করেছেন, আর ড্রয়ার খোলার আগেই
      সেটি প্রস্তুত।

   `strict` — এই সীমা যেন ভুলে ভাঙা না যায়। কেউ `motion.div` লিখলে
   রানটাইমে সঙ্গে সঙ্গে ধরা পড়বে, নীরবে বান্ডল বেড়ে যাবে না।

   নীতি: অ্যানিমেশন কখনো দেখার পূর্বশর্ত নয়। JS না নামলে, হাইড্রেশন
   ব্যর্থ হলে, বা কম-মোশন সেটিং চালু থাকলেও প্রতিটি উপাদান নিজের
   চূড়ান্ত অবস্থায় দৃশ্যমান থাকে — globals.css-এর স্ক্রল-রিভিলে
   JS-নির্ভরতা ঠিক এই কারণেই তুলে দেওয়া হয়েছিল। */
import { LazyMotion } from "framer-motion";

export { m, AnimatePresence, useReducedMotion } from "framer-motion";

const loadFeatures = () => import("framer-motion").then((mod) => mod.domAnimation);

export function Motion({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
