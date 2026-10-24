import * as THREE from "three";
import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Image, ScrollControls, useScroll, Billboard, Text } from "@react-three/drei";
import { easing } from "maath";
import { cards, FIGHT_ROOM_URL, type FightCard } from "./data";

const RADIUS = 5.2;

function Card({ card, angle, onHover }: { card: FightCard; angle: number; onHover: (c: FightCard | null) => void }) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  useFrame((_, delta) => {
    const s = hovered ? 1.35 : 1;
    easing.damp3(ref.current.scale, [1.5 * s, 1 * s, 1], 0.15, delta);
    const m = ref.current.material as unknown as { radius: number; zoom: number };
    easing.damp(m, "radius", hovered ? 0.2 : 0.08, 0.2, delta);
    easing.damp(m, "zoom", hovered ? 1 : 1.25, 0.2, delta);
  });
  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover(card);
    document.body.style.cursor = "pointer";
  };
  const out = () => {
    setHovered(false);
    onHover(null);
    document.body.style.cursor = "auto";
  };
  return (
    <group position={[Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS]} rotation={[0, angle + Math.PI / 2, 0]}>
      <Image
        ref={ref}
        url={card.image}
        transparent
        radius={0.08}
        side={THREE.DoubleSide}
        onPointerOver={over}
        onPointerOut={out}
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = FIGHT_ROOM_URL;
        }}
      />
      {card.live && (
        <Billboard position={[0, 0.85, 0]}>
          <Text fontSize={0.16} color="#e5383b" anchorX="center">
            ● LIVE · UFC 333
          </Text>
        </Billboard>
      )}
    </group>
  );
}

function Rig({ onHover }: { onHover: (c: FightCard | null) => void }) {
  const group = useRef<THREE.Group>(null!);
  const scroll = useScroll();
  useFrame((state, delta) => {
    group.current.rotation.y = -scroll.offset * Math.PI * 2;
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y * 1.5 + 4.5, 10], 0.3, delta);
    state.camera.lookAt(0, 0, 0);
  });
  return (
    <group ref={group} rotation={[0, 0, 0.12]}>
      {cards.map((c, i) => (
        <Card key={c.n} card={c} angle={(i / cards.length) * Math.PI * 2} onHover={onHover} />
      ))}
    </group>
  );
}

export default function CardsScene({ onHover }: { onHover: (c: FightCard | null) => void }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 4.5, 10], fov: 22 }}>
      <fog attach="fog" args={["#0b0b0d", 9, 16]} />
      <Suspense fallback={null}>
        <ScrollControls pages={4} infinite>
          <Rig onHover={onHover} />
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}
