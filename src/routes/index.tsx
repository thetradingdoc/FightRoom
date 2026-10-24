import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { cards, FIGHT_ROOM_URL, type FightCard } from "@/components/fight-cards/data";

const CardsScene = lazy(() => import("@/components/fight-cards/CardsScene"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fightroom — Automated trading for MMA & UFC" },
      { name: "description", content: "Fightroom is an automated trading platform for MMA and UFC. Browse every UFC card and open the fight room research." },
      { property: "og:title", content: "Fightroom — Automated trading for MMA & UFC" },
      { property: "og:description", content: "Browse UFC 300 to UFC 333 and open the live fight room research." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [hovered, setHovered] = useState<FightCard | null>(null);
  const active = hovered ?? cards[0]!;
  return (
    <main className="relative h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0">
        <ClientOnly>
          <Suspense fallback={null}>
            <CardsScene onHover={setHovered} />
          </Suspense>
        </ClientOnly>
      </div>

      <header className="pointer-events-none absolute left-6 top-6 right-6 flex items-start justify-between">
        <div>
          <p className="font-display text-2xl tracking-tight">FIGHTROOM</p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Automated trading · MMA & UFC</p>
        </div>
        <p className="text-xs text-muted-foreground">scroll to spin · click a card</p>
      </header>

      <section className="pointer-events-none absolute bottom-8 left-6 max-w-md">
        {active.live && (
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" /> Live tonight
          </span>
        )}
        <h1 className="font-display text-6xl leading-none sm:text-8xl">{active.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{active.headline}</p>
      </section>

      <a
        href={FIGHT_ROOM_URL}
        className="absolute bottom-8 right-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition hover:opacity-90"
      >
        Enter UFC 333 fight room →
      </a>
    </main>
  );
}
