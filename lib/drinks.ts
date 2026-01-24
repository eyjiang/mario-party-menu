import { Drink } from "./types";

export const drinks: Drink[] = [
  {
    id: "super-star",
    name: "Super Star",
    ingredients: ["Vodka", "Pineapple Juice", "Blue Curaçao", "Sprite"],
    hasNaOption: true,
    color: "from-yellow-400 to-yellow-600",
  },
  {
    id: "fire-flower",
    name: "Fire Flower",
    ingredients: ["Rum", "Orange Juice", "Grenadine", "Lime"],
    hasNaOption: true,
    color: "from-orange-400 to-red-500",
  },
  {
    id: "1up-mushroom",
    name: "1-Up Mushroom",
    ingredients: ["Midori", "Coconut Rum", "Pineapple Juice", "Cream"],
    hasNaOption: true,
    color: "from-green-400 to-green-600",
  },
  {
    id: "princess-peach",
    name: "Princess Peach",
    ingredients: ["Peach Schnapps", "Champagne", "Peach Nectar", "Raspberry"],
    hasNaOption: true,
    color: "from-pink-300 to-pink-500",
  },
  {
    id: "blue-shell",
    name: "Blue Shell",
    ingredients: ["Blue Curaçao", "Vodka", "Lemonade", "Soda Water"],
    hasNaOption: true,
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "yoshi-egg",
    name: "Yoshi Egg",
    ingredients: ["Midori", "Vanilla Vodka", "Cream", "Lime Juice"],
    hasNaOption: true,
    color: "from-lime-300 to-green-500",
  },
  {
    id: "wario-gold",
    name: "Wario Gold",
    ingredients: ["Whiskey", "Honey", "Lemon", "Ginger Beer"],
    hasNaOption: true,
    color: "from-yellow-500 to-amber-600",
  },
  {
    id: "bowser-space",
    name: "Bowser Space",
    ingredients: ["Surprise"],
    hasNaOption: false,
    color: "from-gray-700 to-gray-900",
  },
];

export function getDrinkById(id: string): Drink | undefined {
  return drinks.find((d) => d.id === id);
}
