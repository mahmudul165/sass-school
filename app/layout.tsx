import type { Metadata, Viewport } from "next";
import { Noto_Serif_Bengali, Noto_Sans_Bengali, Inter, Amiri } from "next/font/google";
import "./globals.css";

/* ফন্ট বাজেট — বাংলাদেশের ৩জি/৪জি বাস্তবতা ধরে
   ------------------------------------------------------------------
   বাংলা ফন্টে যুক্তাক্ষরের কারণে গ্লিফের সংখ্যা বিশাল; একেকটি ওজন
   ৯০–১৯০kB। তাই প্রতিটি ওজন আলাদা করে "এটা কি সত্যিই লাগছে?" প্রশ্নের
   উত্তর দিয়ে রাখা হয়েছে:

   • sansBn  ৪০০/৬০০/৭০০ — বডি, সেমিবোল্ড ও বোল্ড। ৫০০ বাদ: চোখে ৪০০-এর
     সাথে পার্থক্য নগণ্য, অথচ পুরো একটি বাংলা ওজনের দাম।
   • serifBn ৭০০/৮০০ — শিরোনাম bold ও extrabold-এই ব্যবহৃত হয়।
     ৫০০/৬০০ কোথাও ব্যবহৃত হচ্ছিল না, শুধু ডাউনলোড হচ্ছিল।
   • inter   ৪০০/৬০০ — শুধু ল্যাটিন নাম ও সংখ্যায়; ল্যাটিন সাবসেট হালকা।
   • amiri   ৪০০ — মাদরাসা টেমপ্লেটের বিসমিল্লাহ পঙ্‌ক্তি; bold লাগে না।
   • Baloo Da 2 সম্পূর্ণ বাদ — চারটি বাংলা ওজন নামত, ব্যবহার ছিল
     মার্কেটিং পেজের একটিমাত্র লাইনে। সেটি এখন serifBn ব্যবহার করে।

   display:"swap" — ধীর সংযোগে লেখা আগে দেখা যায়, ফন্ট পরে বসে।
   preload: শুধু বাংলা সান্স — বাকিগুলো লাগলে তখন নামবে। */
const sansBn = Noto_Sans_Bengali({
  subsets: ["bengali"], weight: ["400", "600", "700"],
  variable: "--font-sans-bn", display: "swap", preload: true,
});
const serifBn = Noto_Serif_Bengali({
  subsets: ["bengali"], weight: ["700", "800"],
  variable: "--font-serif-bn", display: "swap", preload: false,
});
const inter = Inter({
  subsets: ["latin"], weight: ["400", "600"],
  variable: "--font-inter", display: "swap", preload: false,
});
const amiri = Amiri({
  subsets: ["arabic"], weight: ["400"],
  variable: "--font-amiri", display: "swap", preload: false,
});

export const metadata: Metadata = {
  title: "আমাদের স্কুল — প্রতিষ্ঠানের নিজস্ব ওয়েবসাইট",
  description: "স্কুল, কলেজ, মাদ্রাসা ও কোচিং সেন্টারের জন্য প্রিমিয়াম বাংলা ওয়েবসাইট প্ল্যাটফর্ম",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${sansBn.variable} ${serifBn.variable} ${inter.variable} ${amiri.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
