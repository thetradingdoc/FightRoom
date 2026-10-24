// Faithful port of pmndrs/examples "cards" (App.tsx), with UFC posters as images.
import * as THREE from "three";
import { Suspense, useLayoutEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame, type ThreeElements } from "@react-three/fiber";
import { Image, ScrollControls, useScroll, Billboard, Text } from "@react-three/drei";
import { easing, geometry } from "maath";
import { cards, FIGHT_ROOM_URL } from "./data";

extend(geometry as unknown as Record<string, unknown> as never);

const imgs = cards.map((c) => c.image);
const go = () => (window.location.href = FIGHT_ROOM_URL);

export default function CardsScene() {
  return (
    <Canvas dpr={[1, 1.5]}>
      <color attach="background" args={["#ffffff"]} />
      <Suspense fallback={null}>
        <ScrollControls pages={4} infinite>
          <Scene position={[0, 1.5, 0]} />
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}

function Scene(props: ThreeElements["group"]) {
  const ref = useRef<THREE.Group>(null!);
  const scroll = useScroll();
  const [hovered, hover] = useState<number | null>(null);
  useFrame((state, delta) => {
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2);
    state.events.update?.();
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y * 2 + 4.5, 9], 0.3, delta);
    state.camera.lookAt(0, 0, 0);
  });
  return (
    <group ref={ref} {...props}>
      <Cards category="UFC 333" offset={0} from={0} len={Math.PI / 4} onHover={hover} />
      <Cards category="2026" offset={8} from={Math.PI / 4} len={Math.PI / 2} position={[0, 0.4, 0]} onHover={hover} />
      <Cards category="2025" offset={16} from={Math.PI / 4 + Math.PI / 2} len={Math.PI / 2} onHover={hover} />
      <Cards category="2024" offset={24} from={Math.PI * 1.25} len={Math.PI * 2 - Math.PI * 1.25} position={[0, -0.4, 0]} onHover={hover} />
      <ActiveCard hovered={hovered} />
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
};

function Cards({ category, offset, from = 0, len = Math.PI * 2, radius = 5.25, onHover, ...props }: CardsProps) {
  const [hovered, hover] = useState<number | null>(null);
  const amount = Math.round(len * 22);
  const textPosition = from + (amount / 2 / amount) * len;
  return (
    <group {...props}>
      <Billboard position={[Math.sin(textPosition) * radius * 1.4, 0.5, Math.cos(textPosition) * radius * 1.4]}>
        <Text fontSize={0.25} anchorX="center" color="black">
          {category}
        </Text>
      </Billboard>
      {Array.from({ length: amount - 3 }, (_, i) => {
        const angle = from + (i / amount) * len;
        const idx = (offset + i) % imgs.length;
        return (
          <Card
            key={angle}
            onPointerOver={(e) => (e.stopPropagation(), hover(i), onHover(idx))}
            onPointerOut={() => (hover(null), onHover(null))}
            onClick={(e) => (e.stopPropagation(), go())}
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            rotation={[0, Math.PI / 2 + angle, 0]}
            active={hovered !== null}
            hovered={hovered === i}
            url={imgs[idx]!}
          />
        );
      })}
    </group>
  );
}

type CardProps = ThreeElements["group"] & { url: string; active: boolean; hovered: boolean };

function Card({ url, active, hovered, ...props }: CardProps) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    const f = hovered ? 1.4 : active ? 1.25 : 1;
    easing.damp3(ref.current.position, [0, hovered ? 0.25 : 0, 0], 0.1, delta);
    easing.damp3(ref.current.scale, [1.618 * f, 1 * f, 1], 0.15, delta);
  });
  return (
    <group {...props}>
      <Image ref={ref} transparent radius={0.075} url={url} scale={[1.618, 1]} side={THREE.DoubleSide} />
    </group>
  );
}

function ActiveCard({ hovered }: { hovered: number | null }) {
  const ref = useRef<THREE.Mesh>(null!);
  const mat = () => ref.current.material as unknown as { zoom: number; opacity: number };
  useLayoutEffect(() => void (mat().zoom = 0.8), [hovered]);
  useFrame((_, delta) => {
    easing.damp(mat(), "zoom", 1, 0.5, delta);
    easing.damp(mat(), "opacity", Number(hovered !== null), 0.3, delta);
  });
  const card = hovered !== null ? cards[hovered] : null;
  return (
    <Billboard>
      <Text fontSize={0.5} position={[2.15, 3.85, 0]} anchorX="left" color="black">
        {card ? `${card.title}\n${card.headline}` : ""}
      </Text>
      <Image
        ref={ref}
        transparent
        radius={0.3}
        position={[0, 1.5, 0]}
        scale={[3.5, 1.618 * 3.5]}
        url={imgs[hovered ?? 0]!}
      />
    </Billboard>
  );
}
