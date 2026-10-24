import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const CardsScene = lazy(() => import("@/components/fight-cards/CardsScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fightroom — Automated MMA & UFC Trading platform" },
      { name: "description", content: "Fightroom is an automated MMA & UFC trading platform. Browse every UFC card and open the fight room." },
      { property: "og:title", content: "Fightroom — Automated MMA & UFC Trading platform" },
      { property: "og:description", content: "Browse UFC cards and open the Volkanovski vs Evloev fight room." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="cards-page relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <ClientOnly>
          <Suspense fallback={null}>
            <CardsScene />
          </Suspense>
        </ClientOnly>
      </div>
      <div className="pointer-events-none absolute inset-0 text-[13px]">
        <div className="absolute left-10 top-10">
          Fightroom
          <br />
          Automated MMA &amp; UFC Trading platform
        </div>
      </div>
    </main>
  );
}
