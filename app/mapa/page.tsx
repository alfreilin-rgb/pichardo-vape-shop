"use client";

import {
  Bath,
  BedDouble,
  Building2,
  ListFilter,
  MapPin,
  Maximize2,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import PropertiesMap from "../components/PropertiesMap";
import { supabase } from "../lib/supabase/client";
import {
  formatPrice,
  Property,
} from "../lib/puntahogar";

export default function MapaPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [operation, setOperation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileListOpen, setMobileListOpen] =
    useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    setLoading(true);

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "Aprobada")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "No se pudieron cargar las propiedades:",
        error,
      );
    } else {
      const rows = (data || []) as Property[];
      setProperties(rows);
      setSelected(rows[0] || null);
    }

    setLoading(false);
  }

  const filteredProperties = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return properties.filter((property) => {
      const matchesQuery =
        !normalized ||
        property.title.toLowerCase().includes(normalized) ||
        property.zone.toLowerCase().includes(normalized);

      const matchesOperation =
        !operation || property.operation === operation;

      const matchesType =
        !propertyType ||
        property.property_type === propertyType;

      return (
        matchesQuery && matchesOperation && matchesType
      );
    });
  }, [properties, query, operation, propertyType]);

  useEffect(() => {
    if (
      selected &&
      filteredProperties.some(
        (property) => property.id === selected.id,
      )
    ) {
      return;
    }

    setSelected(filteredProperties[0] || null);
  }, [filteredProperties, selected]);

  const handleSelect = useCallback(
    (property: Property) => {
      setSelected(property);
      setMobileListOpen(false);
    },
    [],
  );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-20 max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white"
              aria-label="Volver al inicio"
            >
              <Building2 size={23} />
            </a>

            <div>
              <h1 className="text-xl font-black md:text-2xl">
                Explorar en el mapa
              </h1>
              <p className="text-sm text-slate-500">
                {filteredProperties.length} propiedad(es)
                con ubicación
              </p>
            </div>
          </div>

          <a
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold hover:bg-slate-100"
          >
            ← Volver al inicio
          </a>
        </div>

        <div className="mx-auto grid max-w-[1600px] gap-3 px-5 pb-4 md:grid-cols-[minmax(260px,1fr)_190px_190px_auto]">
          <label className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Buscar por zona o título"
              className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 outline-none focus:border-emerald-500 focus:bg-white"
            />
          </label>

          <select
            value={operation}
            onChange={(event) =>
              setOperation(event.target.value)
            }
            className="h-12 rounded-xl border border-slate-300 bg-slate-50 px-4 outline-none focus:border-emerald-500"
          >
            <option value="">Venta y alquiler</option>
            <option value="Venta">Venta</option>
            <option value="Alquiler">Alquiler</option>
          </select>

          <select
            value={propertyType}
            onChange={(event) =>
              setPropertyType(event.target.value)
            }
            className="h-12 rounded-xl border border-slate-300 bg-slate-50 px-4 outline-none focus:border-emerald-500"
          >
            <option value="">Todos los tipos</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Casa">Casa</option>
            <option value="Villa">Villa</option>
            <option value="Local">Local</option>
            <option value="Solar">Solar</option>
          </select>

          <button
            type="button"
            onClick={() =>
              setMobileListOpen((value) => !value)
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 font-bold text-white lg:hidden"
          >
            <ListFilter size={18} />
            Ver lista
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] lg:h-[calc(100vh-157px)] lg:grid-cols-[420px_1fr]">
        <aside
          className={`border-r border-slate-200 bg-slate-50 p-5 lg:block lg:overflow-y-auto ${
            mobileListOpen ? "block" : "hidden"
          }`}
        >
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-2xl bg-slate-200"
                />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <MapPin
                className="mx-auto text-slate-400"
                size={34}
              />
              <h2 className="mt-4 text-xl font-black">
                No hay resultados
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Prueba cambiando los filtros.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProperties.map((property) => {
                const image =
                  property.images?.[0] ||
                  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=75";

                const active =
                  selected?.id === property.id;

                return (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() =>
                      handleSelect(property)
                    }
                    className={`w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      active
                        ? "border-emerald-600 ring-2 ring-emerald-200"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="grid grid-cols-[130px_1fr]">
                      <img
                        src={image}
                        alt={property.title}
                        className="h-full min-h-40 w-full object-cover"
                      />

                      <div className="min-w-0 p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                          <MapPin size={14} />
                          <span className="truncate">
                            {property.zone}
                          </span>
                        </div>

                        <h2 className="mt-2 line-clamp-2 font-black leading-5 text-slate-950">
                          {property.title}
                        </h2>

                        <p className="mt-2 text-lg font-black text-slate-950">
                          {formatPrice(property)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1">
                            <BedDouble size={14} />
                            {property.bedrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath size={14} />
                            {property.bathrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Maximize2 size={14} />
                            {property.meters} m²
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="relative min-h-[620px] overflow-hidden bg-slate-200 lg:min-h-0">
          <PropertiesMap
            properties={filteredProperties}
            selectedId={selected?.id || null}
            onSelect={handleSelect}
          />

          {selected && (
            <div className="absolute bottom-5 left-1/2 z-10 w-[calc(100%-40px)] max-w-xl -translate-x-1/2 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-2xl backdrop-blur lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-black">
                    {selected.title}
                  </p>
                  <p className="mt-1 font-black text-emerald-700">
                    {formatPrice(selected)}
                  </p>
                </div>

                <a
                  href={`/propiedad/${selected.id}`}
                  className="min-w-fit rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
                >
                  Ver propiedad
                </a>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
