import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cards, TRAADE_RESEARCH_URL } from "@/components/fight-cards/data";
import {
  eventArtwork,
  fetchUpcomingCard,
  researchUrl,
  type CollectedUpcomingCard,
} from "@/lib/fightlens";

export const Route = createFileRoute("/fightroom/$eventId")({
  validateSearch: (search: Record<string, unknown>) => ({
    bout: typeof search["bout"] === "string" ? search["bout"] : undefined,
  }),
  beforeLoad: ({ search }) => {
    // Retire the legacy bout-detail URL; research always opens in the existing TRAADE view.
    if (search.bout) {
      throw redirect({ href: TRAADE_RESEARCH_URL, statusCode: 302, throw: true });
    }
  },
  head: ({ params }) => ({
    meta: [
      { title: "FightRoom · UFC " + params.eventId.replace("ufc-", "") },
      { name: "description", content: "FightRoom UFC event replay and card archive." },
    ],
  }),
  component: FightroomEvent,
});

function FightroomEvent() {
  const { eventId } = Route.useParams();
  const archiveRef = useRef<HTMLDivElement>(null);
  const [collectedCard, setCollectedCard] = useState<CollectedUpcomingCard | null>(null);
  const [cardChecked, setCardChecked] = useState(false);
  useEffect(() => {
    let active = true;
    fetchUpcomingCard().then((saved) => {
      if (!active) return;
      setCollectedCard(saved);
      setCardChecked(true);
    });
    return () => {
      active = false;
    };
  }, [eventId]);

  if (!cardChecked) {
    return (
      <main className="fr-lovable-page" aria-busy="true">
        <header className="fr-lovable-header">
          <a className="fr-lovable-brand" href="/" aria-label="FightRoom home">
            FIGHT<span>ROOM</span>
          </a>
          <p>UFC EVENT RESEARCH · SAVED CARD</p>
          <a className="fr-lovable-enter" href="/">
            Back to cards <ArrowUpRight size={16} />
          </a>
        </header>
        <section className="fr-lovable-unavailable" aria-live="polite">
          <p className="fr-lovable-eyebrow">LOADING SAVED CARD</p>
          <h1>{eventId.toUpperCase()}</h1>
        </section>
      </main>
    );
  }
  // Check the collected event first: UFC-number slugs such as `ufc-334` are
  // valid Cito slugs too and must not fall through to the static archive page.
  if (collectedCard?.event?.slug === eventId) return <CollectedEventPage card={collectedCard} />;

  if (!/^ufc-\d+$/.test(eventId)) {
    return (
      <main className="fr-lovable-page">
        <header className="fr-lovable-header">
          <a className="fr-lovable-brand" href="/" aria-label="FightRoom home">
            FIGHT<span>ROOM</span>
          </a>
          <p>UFC EVENT RESEARCH · COLLECTED CARD</p>
          <a className="fr-lovable-enter" href="/">
            Back to cards <ArrowUpRight size={16} />
          </a>
        </header>
        <section className="fr-lovable-unavailable">
          <p className="fr-lovable-eyebrow">NO SAVED CARD</p>
          <h1>This card is not in the latest collection.</h1>
          <a className="fr-lovable-cta" href="/">
            Back to FightRoom <ArrowUpRight size={18} />
          </a>
        </section>
      </main>
    );
  }

  const eventNumber = Number(eventId.replace(/^ufc-/, ""));
  const selected = cards.find((card) => card.n === eventNumber);
  const featured = cards.find((card) => card.n === 333) ?? cards[0];
  if (!selected) {
    return (
      <main className="fr-lovable-page">
        <header className="fr-lovable-header">
          <a className="fr-lovable-brand" href="/" aria-label="FightRoom home">
            FIGHT<span>ROOM</span>
          </a>
          <p>UFC EVENT RESEARCH · SAVED CARD</p>
          <a className="fr-lovable-enter" href="/">
            Back to cards <ArrowUpRight size={16} />
          </a>
        </header>
        <section className="fr-lovable-unavailable">
          <p className="fr-lovable-eyebrow">NO SAVED CARD</p>
          <h1>UFC {eventNumber} is not in the latest collection.</h1>
        </section>
      </main>
    );
  }
  if (!featured) return null;
  const hasResearch = selected.n === 333;

  const scrollArchive = (direction: -1 | 1) => {
    archiveRef.current?.scrollBy({ left: direction * 420, behavior: "smooth" });
  };

  return (
    <main className="fr-lovable-page">
      <header className="fr-lovable-header">
        <a className="fr-lovable-brand" href="/" aria-label="FightRoom home">
          FIGHT<span>ROOM</span>
        </a>
        <p>FIGHT NIGHT, EXPLAINED · FAN DEMO</p>
        <a className="fr-lovable-enter" href={TRAADE_RESEARCH_URL}>
          Enter FightRoom <ArrowUpRight size={16} />
        </a>
      </header>

      <section className="fr-lovable-feature" aria-labelledby="fr-feature-title">
        <div className="fr-lovable-copy">
          <p className="fr-lovable-eyebrow">
            <CalendarDays size={15} />{" "}
            {hasResearch ? "FEATURED REPLAY · OCTOBER 24, 2026" : "EVENT CARD · UFC " + selected.n}
          </p>
          <h1 id="fr-feature-title">
            {hasResearch ? (
              <>
                One fight.
                <br />
                <em>The full story.</em>
              </>
            ) : (
              <>
                {selected.title}.<br />
                <em>Event archive.</em>
              </>
            )}
          </h1>
          <p className="fr-lovable-description">
            {hasResearch
              ? "Explore the evidence, understand the old price, try a paper pick, then reveal the official result."
              : "This event artwork is in the archive, but no verified FightRoom research is connected."}
          </p>
          <a className="fr-lovable-cta" href={TRAADE_RESEARCH_URL}>
            Open UFC 333 FightRoom <ArrowUpRight size={18} />
          </a>
          <p className="fr-lovable-note">
            {hasResearch
              ? "Replay only · no live odds · no real money"
              : "Archive artwork · no verified research"}
          </p>
        </div>
        <a
          className="fr-lovable-poster"
          href={TRAADE_RESEARCH_URL}
          aria-label="Open the TRAADE FightRoom research dashboard"
        >
          <img
            src={(hasResearch ? featured : selected).image}
            alt={(hasResearch ? featured : selected).title + " event artwork"}
          />
          <span className="fr-lovable-poster-copy">
            <small>
              {hasResearch ? "UFC 333 · POST-EVENT REPLAY" : selected.title + " · ARCHIVE ART"}
            </small>
            <strong>
              {hasResearch ? (
                <>
                  Volkanovski
                  <br />
                  vs. Evloev
                </>
              ) : (
                selected.headline
              )}
            </strong>
            <span>
              {hasResearch ? "Open the FightRoom dashboard" : "View featured research"}{" "}
              <ArrowUpRight size={14} />
            </span>
          </span>
        </a>
      </section>

      <section className="fr-lovable-archive" aria-labelledby="fr-archive-title">
        <div className="fr-lovable-archive-heading">
          <div>
            <p className="fr-lovable-eyebrow">EVENT CARDS</p>
            <h2 id="fr-archive-title">Explore the archive</h2>
          </div>
          <div className="fr-lovable-archive-controls">
            <span>Only UFC 333 has research in this demo.</span>
            <button
              type="button"
              aria-label="Previous event cards"
              onClick={() => scrollArchive(-1)}
            >
              <ArrowLeft size={18} />
            </button>
            <button type="button" aria-label="Next event cards" onClick={() => scrollArchive(1)}>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="fr-lovable-card-row" ref={archiveRef}>
          {cards
            .filter((card) => card.n !== selected.n)
            .map((card) => (
              <a className="fr-lovable-event-card" href={"/fightroom/ufc-" + card.n} key={card.n}>
                <img src={card.image} alt="" loading="lazy" />
                <span className="fr-lovable-card-shade" />
                <span className="fr-lovable-card-copy">
                  <small>UFC {card.n} · ARCHIVE ART</small>
                  <strong>{card.headline}</strong>
                  <span>No verified research loaded</span>
                </span>
              </a>
            ))}
        </div>
        <p className="fr-lovable-disclaimer">
          FightRoom is a fan-facing demo. The paper ticket is simulated and does not place a bet.
        </p>
      </section>
    </main>
  );
}

function CollectedEventPage({ card }: { card: CollectedUpcomingCard }) {
  const event = card.event;
  if (!event) return null;
  const leadBout = card.bouts.find((bout) => bout.fighters?.length === 2);
  const leadNames =
    leadBout?.fighters
      .map((fighter) => fighter.name)
      .filter(Boolean)
      .join(" vs. ") || "Fight card";
  const eventDate = event.start_time
    ? new Date(event.start_time).toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: "full",
        timeStyle: "short",
      }) + " ET"
    : "Schedule time not supplied";
  const artwork = event.image_url || eventArtwork(event.name, leadNames, eventDate);
  const research = researchUrl(card.research_day, event.slug);
  const formatPrice = (price: string | null, currency: string | null) => {
    if (price == null) return "price not saved";
    const numeric = Number(price);
    if (
      currency?.toUpperCase() === "USD" &&
      Number.isFinite(numeric) &&
      numeric >= 0 &&
      numeric <= 1
    ) {
      return `${Math.round(numeric * 100)}¢`;
    }
    return [price, currency].filter(Boolean).join(" ");
  };
  const formatSavedAt = (value: string | null) => {
    if (!value || !Number.isFinite(Date.parse(value))) return null;
    return (
      new Date(value).toLocaleString("en-US", {
        timeZone: "America/New_York",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }) + " ET"
    );
  };

  return (
    <main className="fr-lovable-page">
      <header className="fr-lovable-header">
        <a className="fr-lovable-brand" href="/" aria-label="FightRoom home">
          FIGHT<span>ROOM</span>
        </a>
        <p>UFC EVENT RESEARCH · COLLECTED CARD</p>
        <a className="fr-lovable-enter" href={research}>
          Open research <ArrowUpRight size={16} />
        </a>
      </header>
      <section className="fr-lovable-feature" aria-labelledby="fr-feature-title">
        <div className="fr-lovable-copy">
          <p className="fr-lovable-eyebrow">
            <CalendarDays size={15} /> UPCOMING CARD · {eventDate}
          </p>
          <h1 id="fr-feature-title">{event.name}</h1>
          <p className="fr-lovable-description">
            {card.bout_count} saved bouts · {card.market_match_count} Polymarket matchups in this
            collection.
          </p>
          <a className="fr-lovable-cta" href={research}>
            Open this card’s research <ArrowUpRight size={18} />
          </a>
          <p className="fr-lovable-note">
            Collected{" "}
            {card.collected_at
              ? new Date(card.collected_at).toLocaleString("en-US", {
                  timeZone: "America/New_York",
                  dateStyle: "medium",
                  timeStyle: "short",
                }) + " ET"
              : "time not supplied"}
          </p>
        </div>
        <a
          className="fr-lovable-poster"
          href={research}
          aria-label={`Open research for ${event.name}`}
        >
          <img src={artwork} alt={`${event.name} collected event card`} />
          <span className="fr-lovable-poster-copy">
            <small>COLLECTED EVENT · {event.start_time?.slice(0, 10) || "DATE NOT SUPPLIED"}</small>
            <strong>{leadNames}</strong>
            <span>
              Open event research <ArrowUpRight size={14} />
            </span>
          </span>
        </a>
      </section>
      <section className="fr-lovable-archive" aria-labelledby="fr-bouts-title">
        <div className="fr-lovable-archive-heading">
          <div>
            <p className="fr-lovable-eyebrow">SAVED FROM CITO · {card.bout_count} BOUTS</p>
            <h2 id="fr-bouts-title">Fights on this card</h2>
            <p className="fr-event-price-note">
              Saved Polymarket prices are cents per share, not a prediction.
            </p>
          </div>
          <span className="fr-event-captured">
            R2 snapshot · {card.research_day || "day unavailable"}
          </span>
        </div>
        <div className="fr-lovable-bout-grid">
          {card.bouts.map((bout, index) => (
            <article
              className="fr-lovable-bout"
              key={bout.bout_id || `${bout.bout_order || index}`}
            >
              <div className="fr-lovable-bout-title">
                <span>{bout.title_bout ? "TITLE BOUT" : bout.card_section || "BOUT"}</span>
                <small>{bout.weight_class || "Weight class not supplied"}</small>
              </div>
              <h3>
                {bout.fighters.map((fighter) => fighter.name || "Name not supplied").join(" vs. ")}
              </h3>
              <p>
                {bout.polymarket?.market_slug
                  ? "Polymarket · " +
                    bout.polymarket.sides
                      .map(
                        (side) =>
                          (side.name || "Side") +
                          " " +
                          formatPrice(side.price, side.price_currency),
                      )
                      .join(" · ")
                  : "No matching Polymarket matchup saved in this collection."}
              </p>
              {bout.polymarket?.sides[0]?.observed_at && (
                <small className="fr-event-price-time">
                  Saved quote ·{" "}
                  {formatSavedAt(bout.polymarket.sides[0].observed_at) || "time unavailable"}
                </small>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
