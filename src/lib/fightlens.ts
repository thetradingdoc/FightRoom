export type CollectedFighter = {
  fighter_id: string | null;
  slug: string | null;
  name: string | null;
  corner: string | null;
  image_url: string | null;
};

export type CollectedMarketSide = {
  name: string | null;
  price: string | null;
  price_currency: string | null;
  price_source: string | null;
  observed_at: string | null;
};

export type CollectedBout = {
  bout_id: string | null;
  card_section: string | null;
  card_position: number | null;
  bout_order: number | null;
  weight_class: string | null;
  title_bout: boolean | null;
  status: string | null;
  is_cancelled: boolean | null;
  fighters: CollectedFighter[];
  polymarket: null | {
    match_method?: string;
    identity_status?: string;
    market_id: string | null;
    market_slug: string | null;
    market_title: string | null;
    market_updated_at: string | null;
    sides: CollectedMarketSide[];
    last_trade_price: string | null;
    last_trade_at: string | null;
    book_fetched_at: string | null;
  };
};

export type CollectedUpcomingCard = {
  schema_version: string;
  status: string;
  research_day: string | null;
  daily_run_id: string | null;
  collected_at: string | null;
  source_snapshot_key?: string;
  event: null | {
    event_id: string | null;
    slug: string;
    name: string;
    start_time: string;
    venue: string | null;
    location: string | null;
    image_url: string | null;
  };
  bout_count: number;
  market_match_count: number;
  market_match_status?: string;
  bouts: CollectedBout[];
};

const WORKER_BASE =
  import.meta.env.VITE_FIGHTLENS_API_BASE ||
  "https://traade-fightlens-day.paybreadcrumbs.workers.dev";

export async function fetchUpcomingCard(): Promise<CollectedUpcomingCard | null> {
  try {
    const response = await fetch(`${WORKER_BASE}/api/fightlens/v1/upcoming-card`, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as CollectedUpcomingCard;
    if (payload.status !== "READY" || !payload.event?.slug || !Array.isArray(payload.bouts))
      return null;
    return payload;
  } catch {
    return null;
  }
}

export function researchUrl(day: string | null, eventSlug: string) {
  const url = new URL("http://127.0.0.1:8765/trading/fightlens.html#fight-room");
  if (day) url.searchParams.set("day", day);
  url.searchParams.set("event", eventSlug);
  return url.toString();
}

export function eventArtwork(title: string, headline: string, date: string) {
  const escape = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[char] || char,
    );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1120" viewBox="0 0 720 1120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#101815"/><stop offset=".54" stop-color="#145d3d"/><stop offset="1" stop-color="#b6e65a"/></linearGradient><radialGradient id="r"><stop stop-color="#d3f17d" stop-opacity=".55"/><stop offset="1" stop-color="#d3f17d" stop-opacity="0"/></radialGradient></defs><rect width="720" height="1120" rx="42" fill="url(#g)"/><circle cx="550" cy="290" r="340" fill="url(#r)"/><path d="M0 840 720 555v565H0Z" fill="#08100d" fill-opacity=".52"/><text x="52" y="92" fill="#d7f0b0" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="6">FIGHTROOM · COLLECTED CARD</text><text x="52" y="590" fill="#fff" font-family="Arial,sans-serif" font-size="54" font-weight="700">${escape(title.slice(0, 24))}</text><foreignObject x="52" y="640" width="610" height="240"><div xmlns="http://www.w3.org/1999/xhtml" style="font:700 42px Arial,sans-serif;line-height:1.12;color:white;overflow-wrap:anywhere">${escape(headline.slice(0, 60))}</div></foreignObject><text x="52" y="1030" fill="#d7f0b0" font-family="Arial,sans-serif" font-size="24" letter-spacing="3">${escape(date.toUpperCase())}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
