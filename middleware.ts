import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api/|_next/|_static/|images/|img/|favicon.ico|robots.txt).*)"],
};

/** ফাইল-সদৃশ পথ: শেষ অংশে এক্সটেনশন আছে (/img/bd/campus.svg, /logo.png, /sitemap.xml)।
    এগুলো কখনো টেন্যান্ট পেজ নয় — public/ থেকে সরাসরি পরিবেশিত হওয়া উচিত।
    matcher-এ শুধু নির্দিষ্ট ফোল্ডার বাদ দিলে ভবিষ্যতে নতুন ফোল্ডার যোগ করার সময়
    ভুলে যাওয়া নিশ্চিত — তাই এক্সটেনশন দেখে সিদ্ধান্ত, যা সবসময় সঠিক থাকে। */
const IS_FILE = /\/[^/]+\.[a-z0-9]{2,5}$/i;

export default function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").replace(/^www\./, "").split(":")[0];
  const root = process.env.ROOT_DOMAIN || "localhost";
  const { pathname, search } = req.nextUrl;

  // স্ট্যাটিক ফাইল — টেন্যান্ট ডোমেইনেও public/ থেকেই যাবে
  if (IS_FILE.test(pathname)) return NextResponse.next();

  // প্ল্যাটফর্মের মূল ডোমেইন → marketing / admin / super যেমন আছে।
  // 127.0.0.1-ও ধরা হয়: কিছু ব্রাউজার/টুল "localhost" খুলতে দেয় না, তখন
  // অ্যাডমিন প্যানেল পরীক্ষা করার আর কোনো উপায় থাকত না।
  if (host === root || host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app")) {
    /* ডেমো প্রিভিউ — সাবডোমেইন ছাড়াই টেন্যান্ট সাইট দেখানোর উপায়।
       কেন দরকার: Vercel-এর *.vercel.app ঠিকানায় ইচ্ছেমতো সাবডোমেইন
       বানানো যায় না (DNS-ই নেই), তাই demo-govt.<project>.vercel.app
       কখনো খুলবে না — ERR_CONNECTION_CLOSED। কাস্টম ডোমেইন যুক্ত না করা
       পর্যন্ত এই কুকিটিই বিকল্প: /demo/<slug> একবার খুললে কুকি বসে, আর
       তারপর মূল ডোমেইনের সব পথ ওই প্রতিষ্ঠানের সাইটে রূপান্তরিত হয়।
       ফলে টেমপ্লেটের ভেতরের "/about", "/notice" লিংকগুলোও অবিকল কাজ করে —
       একটি লিংকও বদলাতে হয় না। */
    const demo = req.cookies.get("demo-tenant")?.value;
    const RESERVED = /^\/(admin|super|api|demo|_next)(\/|$)/;
    if (demo && !RESERVED.test(pathname)) {
      return NextResponse.rewrite(new URL(`/s/${demo}${pathname}${search}`, req.url));
    }
    return NextResponse.next();
  }
  // admin ও super কখনো tenant ডোমেইনে নয়
  /* ঠিকানাটি host হেডার থেকে গড়া হয়, req.url থেকে নয়।
     কারণ দুটি ভুল আগে একসাথে ঘটত:
     ১. "https://${root}${pathname}" লেখা ছিল — স্থানীয়ভাবে পোর্ট ৩০০০ হারিয়ে
        যেত আর প্রোটোকল ভুল হতো, তাই https://localhost/admin খুলত না।
     ২. req.url মিডলওয়্যারে ভেতরের ঠিকানা (localhost:3000) দেখায়, বাইরের
        হোস্ট নয়। সেটি ভিত্তি ধরলে NextResponse.redirect একই origin ভেবে
        আপেক্ষিক "/admin" পাঠাত, ব্রাউজার সেটিকে টেন্যান্ট হোস্টেই মিলিয়ে
        নিত — অনন্ত রিডাইরেক্ট লুপ।
     তাই Location হেডারটি নিজেরাই সম্পূর্ণ ঠিকানা দিয়ে বসানো হয়। */
  if (pathname.startsWith("/admin") || pathname.startsWith("/super")) {
    const hostHeader = req.headers.get("host") || "";
    const port = hostHeader.includes(":") ? `:${hostHeader.split(":")[1]}` : "";
    const isLocal = /(^|\.)localhost$/.test(host) || host === "127.0.0.1";
    const proto = req.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
    return new NextResponse(null, {
      status: 307,
      headers: { Location: `${proto}://${root}${port}${pathname}${search}` },
    });
  }
  // সাবডোমেইন / কাস্টম ডোমেইন → tenant সাইটে internal rewrite
  return NextResponse.rewrite(new URL(`/s/${host}${pathname}${search}`, req.url));
}
