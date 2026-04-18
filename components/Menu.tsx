"use client";

import { drinks } from "@/lib/drinks";

interface MenuProps {
  category: "drinks" | "food";
}

export default function Menu({ category }: MenuProps) {
  const items = drinks.filter((d) => d.category === category);

  return (
    <div>
      <h2 className="text-5xl md:text-6xl font-[family-name:var(--font-great-vibes)] text-white/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.2)] mb-6">
        {category === "drinks" ? "Drinks" : "Food"}
      </h2>

      <div className="space-y-5">
        {items.map((drink, index) => {
          const hasPhoto = !!drink.image;
          const photoOnRight = index % 2 === 0;

          return (
            <div
              key={drink.id}
              className={`flex items-stretch gap-3 ${!photoOnRight && hasPhoto ? "flex-row-reverse" : ""}`}
            >
              <div className="menu-card p-4 flex-1 min-h-[140px] flex flex-col justify-center">
                <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-1">
                  {drink.name}
                  {drink.isNonAlcoholic && (
                    <span className="text-xs font-normal text-gray-500 ml-1.5">
                      (Non-Alcoholic)
                    </span>
                  )}
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-1.5">
                  {drink.ingredients.join(", ")}
                </p>
                <p className="text-xs text-gray-400">
                  &rarr; Allergens:{" "}
                  {drink.allergens.length > 0
                    ? drink.allergens.join(", ")
                    : "None"}
                </p>
                {drink.notes && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    *{drink.notes}
                  </p>
                )}
              </div>

              {hasPhoto && (
                <div className="w-[130px] h-[140px] flex-shrink-0 rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={drink.image}
                    alt={drink.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
