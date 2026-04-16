import { Drink } from "./types";

export const drinks: Drink[] = [
  // ── Food ──
  {
    id: "beef-kimbap",
    name: "Beef Kimbap",
    category: "food",
    ingredients: ["Beef", "Daikon", "Egg", "Spinach", "Sesame Oil"],
    allergens: ["Egg", "Sesame"],
    notes: "Can make meatless and/or add chili oil",
    options: [
      { id: "meatless", label: "Make meatless" },
      { id: "chili-oil", label: "Add chili oil" },
    ],
    image: "",
    hasNaOption: false,
    color: "", fontClass: "", glowColor: "", borderColor: "", emoji: "",
  },
  {
    id: "hawaiian-roll-sandwiches",
    name: "Hawaiian Roll Sandwiches",
    category: "food",
    ingredients: ["Ham", "Swiss Cheese", "Mayo", "Garlic Butter"],
    allergens: ["Dairy"],
    image: "/images/hawaiian-rolls.jpg",
    hasNaOption: false,
    color: "", fontClass: "", glowColor: "", borderColor: "", emoji: "",
  },
  {
    id: "banana-cake",
    name: "Banana Cake",
    category: "food",
    ingredients: ["Brown Butter Frosting", "Salted Caramel", "Caramelized Banana"],
    allergens: ["Dairy"],
    image: "/images/banana-cake.jpg",
    hasNaOption: false,
    color: "", fontClass: "", glowColor: "", borderColor: "", emoji: "",
  },

  // ── Drinks ──
  {
    id: "clarified-smokey-pineapple-rum",
    name: "Clarified Smokey Pineapple Rum",
    category: "drinks",
    ingredients: ["Milk-Clarified Punch", "Pineapple Juice", "Aged Rum", "Mezcal"],
    allergens: ["Dairy"],
    image: "/images/smokey-pineapple-rum.jpg",
    hasNaOption: false,
    color: "", fontClass: "", glowColor: "", borderColor: "", emoji: "",
  },
  {
    id: "key-lime-pie-cocktail",
    name: "Key Lime Pie Cocktail",
    category: "drinks",
    ingredients: ["Bombay Sapphire Gin", "The Plum I Suppose/Stonefruit", "Key Lime Juice", "Cream", "Egg White", "Soda Water"],
    allergens: ["Dairy", "Egg"],
    image: "/images/key-lime-pie.jpg",
    hasNaOption: false,
    color: "", fontClass: "", glowColor: "", borderColor: "", emoji: "",
  },
  {
    id: "espresso-martini",
    name: "Espresso Martini",
    category: "drinks",
    ingredients: ["Espresso", "Vodka", "Kahlua", "Heavy Cream", "Simple Syrup"],
    allergens: ["Dairy"],
    notes: "Can make dairy-free or replace vodka",
    options: [
      { id: "dairy-free", label: "Make dairy-free" },
      { id: "replace-vodka", label: "Replace vodka" },
    ],
    image: "",
    hasNaOption: false,
    color: "", fontClass: "", glowColor: "", borderColor: "", emoji: "",
  },
  {
    id: "pandan-coconut-fizz",
    name: "Pandan Coconut Fizz",
    category: "drinks",
    ingredients: ["Pandan Syrup", "Coconut Cream", "Lime", "Egg White", "Soda Water"],
    allergens: ["Nuts", "Egg"],
    notes: "Can make egg-free (though the egg provides a luxurious foam)",
    options: [
      { id: "egg-free", label: "Make egg-free" },
    ],
    image: "/images/pandan-coconut-fizz.jpg",
    hasNaOption: false,
    color: "", fontClass: "", glowColor: "", borderColor: "", emoji: "",
  },
  {
    id: "lychee-guava-fizz",
    name: "Lychee Guava Fizz",
    category: "drinks",
    ingredients: ["Lychee Juice", "Guava Juice", "Lemon Juice", "Soda Water"],
    allergens: [],
    isNonAlcoholic: true,
    image: "",
    hasNaOption: false,
    color: "", fontClass: "", glowColor: "", borderColor: "", emoji: "",
  },
];

export function getDrinkById(id: string): Drink | undefined {
  return drinks.find((d) => d.id === id);
}
