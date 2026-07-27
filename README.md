# আমাদেরস্কুল — School Website SaaS Platform

স্কুল, মাদ্রাসা ও কিন্ডারগার্টেনের জন্য multi-tenant বাংলা ওয়েবসাইট প্ল্যাটফর্ম।
এক কোডবেস, এক ডিপ্লয়মেন্ট — প্রতিটি প্রতিষ্ঠান নিজস্ব সাবডোমেইন/ডোমেইনে।

**Stack:** Next.js 15 (App Router) · MongoDB Atlas · Auth.js v5 (ফোন+OTP) · Tailwind v4 · Vercel

## দ্রুত শুরু (লোকাল)

```bash
npm install
cp .env.example .env        # MONGODB_URI ও AUTH_SECRET দিন
npm run seed                # ৩টি ডেমো প্রতিষ্ঠান তৈরি হবে
npm run dev
```

- মার্কেটিং পেজ: http://localhost:3000
- ডেমো সাইট: http://demo-school.localhost:3000 · demo-madrasah.localhost:3000 · demo-kg.localhost:3000
  (Chrome-এ *.localhost এমনিই কাজ করে)
- অ্যাডমিন: http://localhost:3000/admin/login → ফোন `01700000001` → OTP **টার্মিনাল লগে** (SMS env ফাঁকা = dev mode)
- সুপার প্যানেল: /super/login (SUPER_PASSWORD)

## Vercel-এ ডিপ্লয়

1. GitHub-এ পুশ → Vercel-এ import। সব env variable দিন।
2. Vercel > Domains: `amaderschool.com` (বা আপনার ডোমেইন) + `*.amaderschool.com` (wildcard) যোগ করুন।
   DNS: apex A `76.76.21.21`, wildcard CNAME `cname.vercel-dns.com`।
3. `ROOT_DOMAIN=amaderschool.com` সেট করুন।
4. ছবি আপলোডের জন্য Vercel > Storage > Blob তৈরি করে `BLOB_READ_WRITE_TOKEN` দিন।
5. কাস্টম ডোমেইন অটো-ম্যাপিংয়ের জন্য `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` (ও টিম হলে `VERCEL_TEAM_ID`) দিন —
   এরপর সুপার প্যানেল থেকে এক ক্লিকে ক্লায়েন্টের ডোমেইন যুক্ত হবে।

## SMS (প্রোডাকশন OTP)

BulkSMSBD-ধাঁচের যেকোনো HTTP গেটওয়ে:
```
SMS_API_URL=https://bulksmsbd.net/api/smsapi
SMS_API_KEY=xxxx  SMS_SENDER_ID=xxxx
```
ফাঁকা রাখলে OTP সার্ভার লগে প্রিন্ট হয় (ডেমো/ডেভ)।

## সেলস ডেমো ফ্লো (৫ মিনিট)

স্কুলে যাওয়ার আগে: /super/tenants → নাম + ধরন + প্রধান শিক্ষকের ফোন → "সাইট তৈরি করুন" →
`school-name.amaderschool.com` লাইভ লিংক প্রধান শিক্ষককে মোবাইলে দেখান।
তিনি নিজের ফোন নম্বর দিয়ে /admin-এ ঢুকে নোটিশ দিলেই সাইটে সাথে সাথে দেখাবে — এটাই ক্লোজিং মুহূর্ত।

## আর্কিটেকচার (সংক্ষেপে)

- `middleware.ts` — hostname → `/s/[host]` rewrite (সাবডোমেইন + কাস্টম ডোমেইন একই পাইপ)
- `lib/tenant.ts` — unstable_cache + tag; সেটিংস বদলালে revalidateTag → সাইট instant আপডেট, DB চাপ শূন্যপ্রায়
- `lib/dal.ts` — tenant-scoped DAL: প্রতিটি query-তে tenantId বাধ্যতামূলক, cross-tenant leak অসম্ভব
- `templates/` — ৩ ডিজাইন: classic (খাতা-মার্জিন), islamic (মিহরাব খিলান), kids (পেন্সিল-ডোরা, Baloo Da 2)।
  রঙ শুধু tenant.theme থেকে — টেমপ্লেটে hard-coded রঙ নেই, তাই প্রতিটি সাইট "কাস্টম" দেখায়
- `app/admin` — ৫ মেনু, বাংলা, ফোন-OTP; `app/super` — tenant তৈরি, বিলিং, ডোমেইন ম্যাপ

## খরচ

Vercel Pro $20/মাস + Atlas M0 (ফ্রি, পরে M10) + Blob ~$5। First Load JS ~103kB, পেজ ক্যাশড —
৫০০ স্কুলেও একই বিল থাকার মতো আর্কিটেকচার। ৩০ ক্লায়েন্ট × ৳৫০০০ রিনিউয়াল = খরচের ৪–৫ গুণ মার্জিন।

## Roadmap hooks

`tenant.modules` ফ্ল্যাগ — ভবিষ্যতে feeManagement/SMS মডিউল অন করলেই অ্যাডমিন মেনুতে
আপনার কোচিং ম্যানেজমেন্ট SaaS যুক্ত হবে (একই লগইন, একই DB)।
# sass-school
