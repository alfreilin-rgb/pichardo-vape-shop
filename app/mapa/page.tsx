"use client";

import { useEffect, useState } from "react";
import PropertyLocationMap from "../components/PropertyLocationMap";
import { supabase } from "../lib/supabase/client";
import { Property } from "../lib/puntahogar";

export default function MapaPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "Aprobada")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("created_at", { ascending: false });

    if (!error) {
      const rows = (data || []) as Property[];
      setProperties(rows);
      setSelected(rows[0] || null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="font-semibold text-blue-700">← Volver</a>
        <h1 className="mt-4 text-3xl font-bold">Mapa de propiedades</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="max-h-[650px] space-y-3 overflow-auto">
            {properties.map((property) => (
              <button
                key={property.id}
                onClick={() => setSelected(property)}
                className={`w-full rounded-xl bg-white p-4 text-left shadow-sm ${
                  selected?.id === property.id ? "ring-2 ring-blue-600" : ""
                }`}
              >
                <h2 className="font-bold">{property.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{property.zone}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            {selected ? (
              <>
                <PropertyLocationMap
                  locationType={selected.location_type}
                  initialLatitude={selected.latitude || 18.5601}
                  initialLongitude={selected.longitude || -68.3725}
                  readOnly
                />
                <a
                  href={`/propiedad/${selected.id}`}
                  className="mt-4 block rounded-xl bg-blue-700 px-4 py-3 text-center font-semibold text-white"
                >
                  Ver {selected.title}
                </a>
              </>
            ) : (
              <div className="flex min-h-[500px] items-center justify-center">
                No hay propiedades con coordenadas.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
