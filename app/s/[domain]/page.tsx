import { loadHome, type Params } from "@/lib/page";

export const dynamic = "force-dynamic";

export default async function Home({ params }: Params) {
  const { T, ...data } = await loadHome(params);
  return <T.Home {...data} />;
}
