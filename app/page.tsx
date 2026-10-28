import { Suspense } from "react";
import Portfolio from "@/components/portfolio";
import { getContent } from "@/lib/content";
async function Content() {
  return <Portfolio {...await getContent()} />;
}
export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="loading-screen">Preparing something thoughtful…</main>
      }
    >
      <Content />
    </Suspense>
  );
}
