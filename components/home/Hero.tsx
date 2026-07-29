"use client";

import {
  BedDouble,
  Building2,
  MapPin,
  Search,
  WalletCards,
} from "lucide-react";

export type HomeFilters = {
  query: string;
  operation: string;
  propertyType: string;
  bedrooms: string;
  maxPrice: string;
};

type HeroProps = {
  filters: HomeFilters;
  onChange: (filters: HomeFilters) => void;
  onSearch: () => void;
  propertyCount: number;
};

export default function Hero({
  filters,
  onChange,
  onSearch,
  propertyCount,
}: HeroProps) {
  function update(
    field: keyof HomeFilters,
    value: string,
  ) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <section
      className="relative isolate overflow-hidden bg-slate-950"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(2,6,23,.93), rgba(2,6,23,.55), rgba(2,6,23,.22)), url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-20 text-white md:py-28">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            {propertyCount} propiedades disponibles
          </span>

          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Encuentra tu próximo hogar en Punta Cana
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
            Casas, apartamentos, villas y locales seleccionados
            en Verón, Bávaro y Punta Cana.
          </p>
        </div>

        <div className="mt-10 rounded-3xl bg-white p-4 text-slate-900 shadow-2xl md:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="relative xl:col-span-2">
              <MapPin
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={filters.query}
                onChange={(event) =>
                  update("query", event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSearch();
                }}
                placeholder="Zona, título o referencia"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </label>

            <label className="relative">
              <WalletCards
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={filters.operation}
                onChange={(event) =>
                  update("operation", event.target.value)
                }
                className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 outline-none focus:border-emerald-500"
              >
                <option value="">Comprar o alquilar</option>
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
              </select>
            </label>

            <label className="relative">
              <Building2
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={filters.propertyType}
                onChange={(event) =>
                  update("propertyType", event.target.value)
                }
                className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 outline-none focus:border-emerald-500"
              >
                <option value="">Tipo</option>
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Villa">Villa</option>
                <option value="Local">Local</option>
                <option value="Solar">Solar</option>
              </select>
            </label>

            <label className="relative">
              <BedDouble
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={filters.bedrooms}
                onChange={(event) =>
                  update("bedrooms", event.target.value)
                }
                className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 outline-none focus:border-emerald-500"
              >
                <option value="">Habitaciones</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </label>

            <button
              type="button"
              onClick={onSearch}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 font-bold text-white transition hover:bg-emerald-700"
            >
              <Search size={20} />
              Buscar
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-500">
              Precio máximo:
            </span>

            {[
              ["", "Cualquiera"],
              ["25000", "RD$25 mil"],
              ["50000", "RD$50 mil"],
              ["100000", "RD$100 mil"],
              ["5000000", "RD$5 MM"],
            ].map(([value, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => update("maxPrice", value)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  filters.maxPrice === value
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
