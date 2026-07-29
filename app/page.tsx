"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase/client";
import {
  formatPrice,
  getDeviceToken,
  Property,
} from "./lib/puntahogar";

type SearchFilters = {
  operation: string;
  zone: string;
  propertyType: string;
  priceRange: string;
};

const emptyFilters: SearchFilters = {
  operation: "",
  zone: "",
  propertyType: "",
  priceRange: "",
};

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] =
    useState<SearchFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<SearchFilters>(emptyFilters);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    const deviceToken = getDeviceToken();

    const [propertyResult, favoriteResult] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .eq("status", "Aprobada")
        .order("created_at", { ascending: false }),
      supabase
        .from("favorites")
        .select("property_id")
        .eq("device_token", deviceToken),
    ]);

    if (propertyResult.error) {
      console.error(propertyResult.error);
    } else {
      setProperties((propertyResult.data || []) as Property[]);
    }

    if (favoriteResult.error) {
      console.error(favoriteResult.error);
    } else {
      setFavoriteIds(
        (favoriteResult.data || []).map(
          (item) => Number(item.property_id),
        ),
      );
    }

    setLoading(false);
  }

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const price = Number(property.price) || 0;

      if (
        appliedFilters.operation &&
        property.operation !== appliedFilters.operation
      ) return false;

      if (
        appliedFilters.zone &&
        property.zone !== appliedFilters.zone
      ) return false;

      if (
        appliedFilters.propertyType &&
        property.property_type !== appliedFilters.propertyType
      ) return false;

      if (
        appliedFilters.priceRange === "20000" &&
        price > 20000
      ) return false;

      if (
        appliedFilters.priceRange === "35000" &&
        price > 35000
      ) return false;

      if (
        appliedFilters.priceRange === "50000" &&
        price > 50000
      ) return false;

      if (
        appliedFilters.priceRange === "more-than-50000" &&
        price <= 50000
      ) return false;

      return true;
    });
  }, [properties, appliedFilters]);

  async function toggleFavorite(propertyId: number) {
    const deviceToken = getDeviceToken();
    const isFavorite = favoriteIds.includes(propertyId);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("device_token", deviceToken)
        .eq("property_id", propertyId);

      if (!error) {
        setFavoriteIds((current) =>
          current.filter((id) => id !== propertyId),
        );
      }
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      device_token: deviceToken,
      property_id: propertyId,
    });

    if (!error) {
      setFavoriteIds((current) => [...current, propertyId]);
    }
  }

  async function openWhatsApp(property: Property) {
    await supabase
      .from("properties")
      .update({
        whatsapp_clicks: (property.whatsapp_clicks || 0) + 1,
      })
      .eq("id", property.id);

    let number = property.whatsapp.replace(/\D/g, "");
    if (number.length === 10) number = `1${number}`;

    const message = encodeURIComponent(
      `Hola, estoy interesado en la propiedad: ${property.title}, ubicada en ${property.zone}.`,
    );

    window.open(
      `https://wa.me/${number}?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function search() {
    setAppliedFilters(searchFilters);
    setTimeout(() => {
      document
        .getElementById("propiedades")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="/">
            <h1 className="text-2xl font-bold text-blue-700">PuntaHogar</h1>
            <p className="text-xs text-slate-500">
              Verón, Bávaro y Punta Cana
            </p>
          </a>

          <nav className="flex flex-wrap items-center justify-end gap-3">
            <a href="/favoritos" className="font-medium hover:text-blue-700">
              Favoritos ({favoriteIds.length})
            </a>
            <a href="/mapa" className="font-medium hover:text-blue-700">
              Mapa
            </a>
            <a href="/mis-propiedades" className="font-medium hover:text-blue-700">
              Mis propiedades
            </a>
            <a href="/admin" className="font-medium hover:text-blue-700">
              Administrar
            </a>
            <a
              href="/publicar"
              className="rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white"
            >
              Publicar gratis
            </a>
          </nav>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600 px-5 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold uppercase tracking-widest text-cyan-200">
            Propiedades en Punta Cana
          </p>
          <h2 className="mt-3 max-w-4xl text-4xl font-bold md:text-6xl">
            Encuentra tu próximo hogar en el Caribe
          </h2>

          <div className="mt-9 rounded-2xl bg-white p-4 text-slate-900 shadow-xl">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <select
                value={searchFilters.operation}
                onChange={(event) =>
                  setSearchFilters({
                    ...searchFilters,
                    operation: event.target.value,
                  })
                }
                className="rounded-xl border px-4 py-3"
              >
                <option value="">Alquiler o venta</option>
                <option value="Alquiler">Alquiler</option>
                <option value="Venta">Venta</option>
              </select>

              <select
                value={searchFilters.zone}
                onChange={(event) =>
                  setSearchFilters({
                    ...searchFilters,
                    zone: event.target.value,
                  })
                }
                className="rounded-xl border px-4 py-3"
              >
                <option value="">Todas las zonas</option>
                {[
                  "Verón",
                  "Bávaro",
                  "Pueblo Bávaro",
                  "Friusa",
                  "Downtown Punta Cana",
                  "Punta Cana Village",
                ].map((zone) => (
                  <option key={zone}>{zone}</option>
                ))}
              </select>

              <select
                value={searchFilters.propertyType}
                onChange={(event) =>
                  setSearchFilters({
                    ...searchFilters,
                    propertyType: event.target.value,
                  })
                }
                className="rounded-xl border px-4 py-3"
              >
                <option value="">Tipo de propiedad</option>
                {["Apartamento", "Casa", "Villa", "Penthouse", "Solar"].map(
                  (type) => (
                    <option key={type}>{type}</option>
                  ),
                )}
              </select>

              <select
                value={searchFilters.priceRange}
                onChange={(event) =>
                  setSearchFilters({
                    ...searchFilters,
                    priceRange: event.target.value,
                  })
                }
                className="rounded-xl border px-4 py-3"
              >
                <option value="">Cualquier precio</option>
                <option value="20000">Hasta RD$20,000</option>
                <option value="35000">Hasta RD$35,000</option>
                <option value="50000">Hasta RD$50,000</option>
                <option value="more-than-50000">Más de RD$50,000</option>
              </select>

              <button
                type="button"
                onClick={search}
                className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="propiedades" className="px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold">
            Propiedades disponibles
          </h2>
          <p className="mt-2 text-slate-600">
            {loading
              ? "Cargando propiedades..."
              : `${filteredProperties.length} propiedades encontradas.`}
          </p>

          {!loading && filteredProperties.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
              No hay propiedades aprobadas que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => {
                const favorite = favoriteIds.includes(property.id);

                return (
                  <article
                    key={property.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >
                    <div className="relative h-52 bg-slate-200">
                      {property.images?.[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          Sin fotografía
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleFavorite(property.id)}
                        className={`absolute right-3 top-3 h-11 w-11 rounded-full text-xl ${
                          favorite
                            ? "bg-red-500 text-white"
                            : "bg-white"
                        }`}
                      >
                        {favorite ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="flex gap-2 text-sm">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                          {property.operation}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {property.property_type}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-bold">
                        {property.title}
                      </h3>
                      <p className="mt-2 text-slate-500">{property.zone}</p>
                      <p className="mt-4 text-2xl font-bold text-blue-700">
                        {formatPrice(property)}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                        <span>🛏️ {property.bedrooms}</span>
                        <span>🚿 {property.bathrooms}</span>
                        <span>🚗 {property.parking}</span>
                      </div>

                      <div className="mt-5 grid gap-3">
                        <button
                          type="button"
                          onClick={() => openWhatsApp(property)}
                          className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white"
                        >
                          Contactar por WhatsApp
                        </button>
                        <a
                          href={`/propiedad/${property.id}`}
                          className="rounded-xl bg-slate-900 px-4 py-3 text-center font-semibold text-white"
                        >
                          Ver propiedad
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
