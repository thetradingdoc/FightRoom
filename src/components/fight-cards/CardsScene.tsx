// Faithful port of pmndrs/examples "cards" (App.tsx), with UFC posters as images.
import * as THREE from "three";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { Image, ScrollControls, useScroll, Billboard, Text } from "@react-three/drei";
import { easing, geometry } from "maath";
import { cards } from "./data";
import type { FightCard } from "./data";
import { eventArtwork, fetchUpcomingCard } from "@/lib/fightlens";

extend(geometry as unknown as Record<string, unknown> as never);

const go = (index: number, cardList: FightCard[]) => {
  const card = cardList[index] ?? cardList[0];
  if (!card || (card.n === 0 && !card.eventSlug)) return;
  window.location.href = card.eventSlug
    ? `/fightroom/${encodeURIComponent(card.eventSlug)}`
    : `/fightroom/ufc-${card.n}`;
};

const archiveCards = cards;
const unavailableCard: FightCard = {
  n: 0,
  title: "Upcoming card data",
  headline: "No collected event available",
  image: eventArtwork("No collected card", "Upcoming event data is not saved", "FightRoom"),
  live: false,
};

export default function CardsScene() {
  const [cardList, setCardList] = useState<FightCard[]>([unavailableCard, ...archiveCards]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const saved = await fetchUpcomingCard();
      if (!active) return;
      if (!saved?.event) {
        setCardList([unavailableCard, ...archiveCards]);
        return;
      }
      const event = saved.event;
      const leadBout = saved.bouts.find((bout) => bout.fighters?.length === 2);
      const headline =
        leadBout?.fighters
          .map((fighter) => fighter.name)
          .filter(Boolean)
          .join(" vs. ") || event.name;
      const eventDate = event.start_time
        ? new Date(event.start_time).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "America/New_York",
          })
        : "Date not supplied";
      const collectedCard: FightCard = {
        n: 0,
        title: event.name || "UFC event",
        headline,
        image: event.image_url || eventArtwork(event.name || "UFC event", headline, eventDate),
        live: false,
        eventSlug: event.slug,
        researchDay: saved.research_day,
      };
      const currentNumber = event.slug.match(/^ufc-(\d+)$/i)?.[1];
      setCardList([
        collectedCard,
        ...archiveCards.filter((archive) => String(archive.n) !== currentNumber),
      ]);
    };
    void load();
    const timer = window.setInterval(
      () => {
        if (document.visibilityState === "visible") void load();
      },
      5 * 60 * 1000,
    );
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", load);
    };
  }, []);
  return (
    <Canvas dpr={[1, 1.5]}>
      <color attach="background" args={["#ffffff"]} />
      <Suspense fallback={null}>
        <ScrollControls pages={4} infinite>
          <Scene
            key={cardList[0]?.eventSlug || "no-collected-card"}
            position={[0, -0.9, 0]}
            cardList={cardList}
          />
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}

function Scene({ cardList, ...props }: ThreeElements["group"] & { cardList: FightCard[] }) {
  const ref = useRef<THREE.Group>(null);
  const scroll = useScroll();
  const [hovered, hover] = useState<number | null>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2);
    state.events.update?.();
    easing.damp3(
      state.camera.position,
      [-state.pointer.x * 2, state.pointer.y * 2 + 4.5, 9],
      0.3,
      delta,
    );
    state.camera.lookAt(0, 0, 0);
  });
  return (
    <group ref={ref} {...props}>
      <Cards
        category="2026"
        offset={0}
        from={0}
        len={Math.PI / 4}
        onHover={hover}
        cardList={cardList}
      />
      <Cards
        category="2025"
        offset={8}
        from={Math.PI / 4}
        len={Math.PI / 2}
        position={[0, 0.4, 0]}
        onHover={hover}
        cardList={cardList}
      />
      <Cards
        category=""
        offset={16}
        from={Math.PI / 4 + Math.PI / 2}
        len={Math.PI / 2}
        onHover={hover}
        cardList={cardList}
      />
      <Cards
        category=""
        offset={24}
        from={Math.PI * 1.25}
        len={Math.PI * 2 - Math.PI * 1.25}
        position={[0, -0.4, 0]}
        onHover={hover}
        cardList={cardList}
      />
      <ActiveCard hovered={hovered} cardList={cardList} />
    </group>
  );
}

type CardsProps = ThreeElements["group"] & {
  category: string;
  offset: number;
  from?: number;
  len?: number;
  radius?: number;
  onHover: (i: number | null) => void;
  cardList: FightCard[];
};

function Cards({
  category,
  offset,
  from = 0,
  len = Math.PI * 2,
  radius = 5.25,
  onHover,
  cardList,
  ...props
}: CardsProps) {
  const [hovered, hover] = useState<number | null>(null);
  const amount = Math.min(Math.max(4, Math.round(len * 22)), cardList.length + 3);
  const textPosition = from + (amount / 2 / amount) * len;
  return (
    <group {...props}>
      <Billboard
        position={[
          Math.sin(textPosition) * radius * 1.55,
          0.9,
          Math.cos(textPosition) * radius * 1.55,
        ]}
      >
        <Text fontSize={0.25} anchorX="center" color="black">
          {category}
        </Text>
      </Billboard>
      {Array.from({ length: amount - 3 }, (_, i) => {
        const angle = from + (i / amount) * len;
        const idx = (offset + i) % cardList.length;
        const url = cardList[idx]?.image;
        if (!url) return null;
        return (
          <Card
            key={angle}
            onPointerOver={(e) => (e.stopPropagation(), hover(i), onHover(idx))}
            onPointerOut={() => (hover(null), onHover(null))}
            onClick={(e) => (e.stopPropagation(), go(idx, cardList))}
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            rotation={[0, Math.PI / 2 + angle, 0]}
            active={hovered !== null}
            hovered={hovered === i}
            url={url}
          />
        );
      })}
    </group>
  );
}

type CardProps = ThreeElements["group"] & { url: string; active: boolean; hovered: boolean };

function Card({ url, active, hovered, ...props }: CardProps) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const f = hovered ? 1.4 : active ? 1.25 : 1;
    easing.damp3(ref.current.position, [0, hovered ? 0.25 : 0, 0], 0.1, delta);
    easing.damp3(ref.current.scale, [1.618 * f, 1 * f, 1], 0.15, delta);
  });
  return (
    <group {...props}>
      <Image
        ref={ref}
        transparent
        radius={0.075}
        url={url}
        scale={[1.618, 1]}
        side={THREE.DoubleSide}
      />
    </group>
  );
}

// Shows the latest collected card by default; switches to the hovered card. Click opens its fight room.
function ActiveCard({ hovered, cardList }: { hovered: number | null; cardList: FightCard[] }) {
  const ref = useRef<THREE.Mesh>(null);
  const { width, height } = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  const titleScale = Math.min(1, width / height / 1.2);
  const posterHeight = Math.min(4.8, Math.max(4.3, viewport.height * 0.5));
  const posterWidth = posterHeight / 1.618;
  const isNarrow = width < 760;
  const mat = () =>
    ref.current?.material as unknown as { zoom: number; opacity: number } | undefined;
  const shown = hovered ?? 0;
  useLayoutEffect(() => {
    const material = mat();
    if (material) material.zoom = 0.8;
  }, [shown]);
  useFrame((_, delta) => {
    const material = mat();
    if (!material) return;
    easing.damp(material, "zoom", 1, 0.5, delta);
    easing.damp(material, "opacity", 1, 0.3, delta);
  });
  const card = cardList[shown];
  if (!card) return null;
  return (
    <Billboard>
      <Text
        fontSize={0.36 * Math.max(0.78, titleScale)}
        maxWidth={Math.min(4.6, viewport.width * 0.4)}
        position={
          isNarrow
            ? [0, 1.5 + posterHeight / 2 + 0.55, 0]
            : [posterWidth / 2 + 0.35, 1.5 + posterHeight / 2 + 0.2, 0]
        }
        anchorX={isNarrow ? "center" : "left"}
        color="black"
      >
        {`${card.title}\n${card.headline}`}
      </Text>
      <Image
        ref={ref}
        transparent
        radius={0.3}
        position={[0, 1.5, 0]}
        scale={[posterWidth, posterHeight]}
        url={card.image}
        onClick={(e) => (e.stopPropagation(), go(shown, cardList))}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      />
    </Billboard>
  );
}
