import f1 from "@/assets/fight-1.jpg";
import f2 from "@/assets/fight-2.jpg";
import f3 from "@/assets/fight-3.jpg";
import f4 from "@/assets/fight-4.jpg";
import f5 from "@/assets/fight-5.jpg";
import f6 from "@/assets/fight-6.jpg";

export const FIGHT_ROOM_URL = "http://127.0.0.1:8765/trading/fightlens.html#fight-room";

const images = [f1, f2, f3, f4, f5, f6];

export type FightCard = {
  id: string;
  title: string;
  headline: string;
  live?: boolean;
  image: string;
};

// Headliners for UFC 300–322 and 333 (from the uploaded feed). 323–332 shown by number only.
const headliners: Record<number, string> = {
  333: "Volkanovski vs Evloev",
  322: "Della Maddalena vs Makhachev",
  321: "Aspinall vs Gane",
  320: "Ankalaev vs Pereira 2",
  319: "du Plessis vs Chimaev",
  318: "Holloway vs Poirier 3",
  317: "Topuria vs Oliveira",
  316: "Dvalishvili vs O'Malley 2",
  315: "Muhammad vs Della Maddalena",
  314: "Volkanovski vs Lopes",
  313: "Pereira vs Ankalaev",
  312: "du Plessis vs Strickland 2",
  311: "Makhachev vs Moicano",
  310: "Pantoja vs Asakura",
  309: "Jones vs Miocic",
  308: "Topuria vs Holloway",
  307: "Pereira vs Rountree",
  306: "O'Malley vs Dvalishvili",
  305: "du Plessis vs Adesanya",
  304: "Edwards vs Muhammad 2",
  303: "Pereira vs Prochazka 2",
  302: "Makhachev vs Poirier",
  301: "Pantoja vs Erceg",
  300: "Pereira vs Hill",
};

export const cards: FightCard[] = Array.from({ length: 34 }, (_, i) => {
  const n = 333 - i;
  return {
    id: `ufc-${n}`,
    title: `UFC ${n}`,
    headline: headliners[n] ?? "Historic card",
    live: n === 333,
    image: images[i % images.length],
  };
});
