"use client";

import {
  Building2,
  Home,
  LandPlot,
  Store,
  Umbrella,
} from "lucide-react";

type CategoriesProps = {
  selected: string;
  onSelect: (category: string) => void;
};

const categories = [
  { label: "Todas", value: "", icon: Home },
  {
    label: "Apartamentos",
    value: "Apartamento",
    icon: Building2,
  },
  { label: "Casas", value: "Casa", icon: Home },
  { label: "Villas", value: "Villa", icon: Umbrella },
  { label: "Locales", value: "Local", icon: Store },
  { label: "Solares", value: "Solar", icon: LandPlot },
];

export default function Categories({
  selected,
  onSelect,
}: CategoriesProps) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-5 py-6">
        {categories.map((category) => {
          const Icon = category.icon;
          const active = selected === category.value;

          return (
            <button
              key={category.label}
              type="button"
              onClick={() => onSelect(category.value)}
              className={`flex min-w-fit items-center gap-2 rounded-2xl border px-5 py-3 font-semibold transition ${
                active
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
              }`}
            >
              <Icon size={19} />
              {category.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
