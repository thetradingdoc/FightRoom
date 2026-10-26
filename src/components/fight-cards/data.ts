// Official event art downloaded from ufc.com/event/ufc-NNN into /public/ufc.
export const TRAADE_RESEARCH_URL =
  "http://127.0.0.1:8765/trading/fightlens.html?v=20261024-date-fallback#fight-room";

const events: [number, string][] = [
  [333, "Volkanovski vs Evloev"],
  [332, "Silva vs Wang"],
  [331, "Fight Night Card"],
  [330, "Makhachev vs Machado Garry"],
  [329, "McGregor vs Holloway 2"],
  [328, "Chimaev vs Strickland"],
  [327, "Procházka vs Ulberg"],
  [326, "Holloway vs Oliveira 2"],
  [325, "Volkanovski vs Lopes 2"],
  [324, "Gaethje vs Pimblett"],
  [323, "Dvalishvili vs Yan 2"],
  [322, "Della Maddalena vs Makhachev"],
  [321, "Aspinall vs Gane"],
  [320, "Ankalaev vs Pereira 2"],
  [319, "Du Plessis vs Chimaev"],
  [318, "Holloway vs Poirier 3"],
  [317, "Topuria vs Oliveira"],
  [316, "Dvalishvili vs O'Malley 2"],
  [315, "Muhammad vs Della Maddalena"],
  [314, "Volkanovski vs Lopes"],
  [313, "Pereira vs Ankalaev"],
  [312, "Du Plessis vs Strickland 2"],
  [311, "Makhachev vs Moicano"],
  [310, "Pantoja vs Asakura"],
  [309, "Jones vs Miocic"],
  [308, "Topuria vs Holloway"],
  [307, "Pereira vs Rountree Jr."],
  [306, "O'Malley vs Dvalishvili"],
  [305, "Du Plessis vs Adesanya"],
  [304, "Edwards vs Muhammad 2"],
  [303, "Pereira vs Procházka 2"],
  [302, "Makhachev vs Poirier"],
  [301, "Pantoja vs Erceg"],
  [300, "Pereira vs Hill"],
];

export type FightCard = {
  n: number;
  title: string;
  headline: string;
  image: string;
  live: boolean;
  eventSlug?: string;
  researchDay?: string | null;
};

export const cards: FightCard[] = events.map(([n, headline]) => ({
  n,
  title: `UFC ${n}`,
  headline,
  image: `/ufc/ufc-${n}.jpg`,
  live: n === 333,
}));
