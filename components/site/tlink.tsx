/* TLink — টেন্যান্ট সাইটের ভিতরের লিংক
   ------------------------------------------------------------------
   কেন দরকার: প্রতিষ্ঠানের সাইট দুইভাবে খোলা যায় — সাবডোমেইনে
   (demo-govt.amaderschool.com/about) আর পথে (localhost:3000/demo-govt/about)।
   প্রথমটিতে "/about" লিখলেই চলে, দ্বিতীয়টিতে আগে "/demo-govt" বসাতে হয়।

   প্রতিটি লিংকে আলাদা করে হিসাব না করে এই একটি মোড়কে কাজটি হয়। ভিতরের
   পথ ("/about", "/notice/123") ভিত্তি-পথ পায়; বাইরের ঠিকানা (tel:, mailto:,
   https://) অবিকল থাকে। সাবডোমেইনে ভিত্তি-পথ ফাঁকা, তাই আচরণ আগের মতোই। */
import Link from "next/link";
import type { ComponentProps } from "react";
import { tenantBase, withBase } from "@/lib/base";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

export async function TLink({ href, ...rest }: Props) {
  const base = await tenantBase();
  return <Link href={withBase(base, href)} {...rest} />;
}

/** সাধারণ <a> — PDF, বাইরের সাইট বা #anchor-এর জন্য, তবু ভিতরের পথ হলে
    ভিত্তি-পথ পায়। */
export async function TAnchor({ href, ...rest }: { href: string } & ComponentProps<"a">) {
  const base = await tenantBase();
  return <a href={withBase(base, href)} {...rest} />;
}
