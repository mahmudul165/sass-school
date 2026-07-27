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
    /* পথ-ভিত্তিক টেন্যান্ট — /demo-govt/about
       কেন দরকার: Vercel-এর *.vercel.app ঠিকানায় ইচ্ছেমতো সাবডোমেইনের DNS
       নেই, তাই demo-govt.<project>.vercel.app কখনো খোলে না। উন্নয়নেও
       সাবডোমেইন সবসময় সুবিধাজনক নয়। তাই মূল ডোমেইনে পথের প্রথম অংশটিকে
       প্রতিষ্ঠানের slug ধরা হয়:

         localhost:3000/demo-govt          → /s/demo-govt
         amarschool-weld.vercel.app/x/about → /s/x/about
         demo-govt.amaderschool.com/about   → সাবডোমেইন, নিচের শাখা

       x-tenant-base হেডারে ভিত্তি-পথ পাঠানো হয়, যাতে টেমপ্লেটের ভিতরের
       লিংকগুলো (TLink) নিজে থেকেই "/demo-govt" যোগ করে নেয়। সাবডোমেইনে
       হেডারটি থাকে না, ভিত্তি-পথ ফাঁকা, আচরণ আগের মতোই — তাই প্রোডাকশনের
       পথ এতটুকুও বদলায় না। */
    const seg = pathname.split("/")[1] || "";
    const RESERVED = /^(admin|super|api|demo|s|_next|offline\.html)$/;
    if (seg && !RESERVED.test(seg)) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-tenant-base", `/${seg}`);
      return NextResponse.rewrite(new URL(`/s${pathname}${search}`, req.url), {
        request: { headers: requestHeaders },
      });
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
