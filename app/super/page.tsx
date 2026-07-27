import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default function SuperHome() { redirect("/super/tenants"); }
