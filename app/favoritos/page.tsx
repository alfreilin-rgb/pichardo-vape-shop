"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import {
  formatPrice,
  getDeviceToken,
  Property,
} from "../lib/puntahogar";

export default function FavoritosPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    const deviceToken = getDeviceToken();

    const { data, error } = await supabase
      .from("favorites")
      .select("property_id, properties(*)")
      .eq("device_token", deviceToken);

    if (error) {
      console.error(error);
      setProperties([]);
    } else {
      setProperties(
        (data || [])
          .map((item) => item.properties as unknown as Property)
          .filter(
            (property) =>
              property && property.status === "Aprobada",
          ),
      );
    }

    setLoading(false);
  }

  async function removeFavorite(propertyId: number) {
    const deviceToken = getDeviceToken();

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("device_token", deviceToken)
      .eq("property_id", propertyId);

    if (!error) {
      setProperties((current) =>
        current.filter((property) => property.id !== propertyId),
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-widest text-blue-700">
              PuntaHogar
            </p>
            <h1 className="mt-2 text-3xl font-bold">Mis favoritos</h1>
          </div>
          <a href="/" className="rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white">
            Volver
          </a>
        </div>

        {loading ? (
          <p className="mt-10">Cargando favoritos...</p>
        ) : properties.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm">
            No tienes propiedades favoritas.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <article key={property.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="h-48 bg-slate-200">
                  {property.images?.[0] && (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold">{property.title}</h2>
                  <p className="mt-2 text-slate-500">{property.zone}</p>
                  <p className="mt-4 text-2xl font-bold text-blue-700">
                    {formatPrice(property)}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <a
                      href={`/propiedad/${property.id}`}
                      className="rounded-xl bg-slate-900 px-4 py-3 text-center font-semibold text-white"
                    >
                      Ver
                    </a>
                    <button
                      onClick={() => removeFavorite(property.id)}
                      className="rounded-xl border border-red-300 px-4 py-3 font-semibold text-red-700"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
