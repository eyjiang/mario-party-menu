import { Drink } from "./types";

export const drinks: Drink[] = [
  {
    id: "yoshis-egg",
    name: "Yoshis Egg",
    ingredients: ["Melona", "Sprite", "Soju"],
    hasNaOption: false,
    color: "from-green-400 to-green-600",
  },
  {
    id: "waluigi-tales-flight",
    name: "Waluigi Tales Flight",
    ingredients: ["Violette", "Maraschino", "Gin", "Lemon (garnish)"],
    hasNaOption: false,
    color: "from-purple-500 to-purple-700",
  },
  {
    id: "brothers-highball",
    name: "Brothers Highball",
    ingredients: ["Shiso leaves", "Plum", "Gin"],
    hasNaOption: false,
    color: "from-red-400 to-red-600",
  },
  {
    id: "marios-bawlz",
    name: "Mario's Bawlz",
    ingredients: ["Grenadine", "Sprite", "Vodka"],
    hasNaOption: false,
    color: "from-red-500 to-red-700",
  },
  {
    id: "daisy",
    name: "Daisy",
    ingredients: ["Sago", "Mango puree", "Coconut cream", "Prosecco"],
    hasNaOption: true,
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "bowser-bomb",
    name: "Bowser Bomb",
    ingredients: ["Hot chocolate (20g to 60g water)", "Vodka (1 shot) svedka", "Vanilla extract (2 drops)", "Sprinkles", "Oat milk (25g)", "Cold foam"],
    hasNaOption: true,
    color: "from-orange-600 to-red-700",
  },
  {
    id: "donkey-kong",
    name: "Donkey Kong",
    ingredients: ["Banana liq (1)", "Bourbon (.5)", "Kahlua (1)", "Mozart (.5)", "Plaintain chip"],
    hasNaOption: false,
    color: "from-amber-600 to-amber-800",
  },
  {
    id: "bowser-space",
    name: "Bowser Space",
    ingredients: ["Surprise"],
    hasNaOption: true,
    color: "from-gray-700 to-gray-900",
  },
];

export function getDrinkById(id: string): Drink | undefined {
  return drinks.find((d) => d.id === id);
}
