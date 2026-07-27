import type { NextConfig } from "next";

/* পারফরম্যান্স কনফিগ — বাংলাদেশের নেটওয়ার্ক বাস্তবতা ধরে
   ------------------------------------------------------------------
   ধরে নেওয়া হয়েছে: দর্শক মোবাইলে, ৩জি/৪জি-তে, ল্যাটেন্সি বেশি ও অস্থির,
   ডিভাইস সস্তা। তাই প্রতিটি সিদ্ধান্ত "কম বাইট, কম রাউন্ড-ট্রিপ, কম
   জাভাস্ক্রিপ্ট পার্সিং" — এই তিনটির পক্ষে। */
const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  /* lucide-react থেকে ~৫৫টি আইকন named import হয়। ব্যারেল ফাইল ধরে
     tree-shaking অনির্ভরযোগ্য ও ধীর; এই ফ্ল্যাগ প্রতিটি আইকনকে সরাসরি
     তার নিজের ফাইল থেকে আনে — বান্ডল ছোট, বিল্ডও দ্রুত। */
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    // AVIF আগে — একই মানে WebP-র চেয়েও ছোট
    formats: ["image/avif", "image/webp"],
    // বাংলাদেশে বেশিরভাগ পর্দা ছোট; অপ্রয়োজনীয় বড় ভ্যারিয়েন্ট বানানো বন্ধ
    deviceSizes: [360, 414, 640, 828, 1080, 1280, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },

  async headers() {
    return [
      {
        /* নিজস্ব আঁকা SVG দৃশ্যগুলো কখনো বদলায় না। immutable ক্যাশে দিলে
           দ্বিতীয়বার সাইট খোলায় এগুলোর জন্য একটিও রিকোয়েস্ট যায় না —
           অস্থির ব্যান্ডউইথে এটিই সবচেয়ে বড় স্বস্তি। */
        source: "/img/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // সার্ভিস ওয়ার্কার কখনো ক্যাশ করা যাবে না, নইলে আপডেট আটকে যায়
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
