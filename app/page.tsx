"use client";

import { useEffect, useMemo, useState } from "react";
import Categories from "@/components/home/Categories";
import Hero, {
  HomeFilters,
} from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import PropertyCard from "@/components/property/PropertyCard";
import PropertySkeleton from "@/components/property/PropertySkeleton";
import { supabase } from "./lib/supabase/client";
import {
  getDeviceToken,
  Property,
} from "./lib/puntahogar";

const initialFilters: HomeFilters = {
  query: "",
  operation: "",
  propertyType: "",
  bedrooms: "",
  maxPrice: "",
};

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [filters, setFilters] =
    useState<HomeFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<HomeFilters>(initialFilters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHome();
  }, []);

  async function loadHome() {
    setLoading(true);

    const propertyResult = await supabase
      .from("properties")
      .select("*")
      .eq("status", "Aprobada")
      .order("created_at", { ascending: false });

    if (propertyResult.error) {
      console.error(
        "No se pudieron cargar las propiedades:",
        propertyResult.error,
      );
    } else {
      setProperties(
        (propertyResult.data || []) as Property[],
      );
    }

    try {
      const deviceToken = getDeviceToken();
      const favoriteResult = await supabase
        .from("favorites")
        .select("property_id")
        .eq("device_token", deviceToken);

      if (!favoriteResult.error) {
        setFavoriteIds(
          (favoriteResult.data || []).map((item) =>
            Number(item.property_id),
          ),
        );
      } else {
        console.warn(
          "Favoritos no disponibles:",
          favoriteResult.error.message,
        );
      }
    } catch (error) {
      console.warn("No se pudieron cargar favoritos.", error);
    }

    setLoading(false);
  }

  const filteredProperties = useMemo(() => {
    const normalizedQuery = appliedFilters.query
      .trim()
      .toLowerCase();

    return properties.filter((property) => {
      const price = Number(property.price) || 0;

      const matchesQuery =
        !normalizedQuery ||
        property.title
          .toLowerCase()
          .includes(normalizedQuery) ||
        property.zone
          .toLowerCase()
          .includes(normalizedQuery) ||
        (property.reference || "")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesOperation =
        !appliedFilters.operation ||
        property.operation === appliedFilters.operation;

      const matchesType =
        !appliedFilters.propertyType ||
        property.property_type ===
          appliedFilters.propertyType;

      const matchesBedrooms =
        !appliedFilters.bedrooms ||
        Number(property.bedrooms) >=
          Number(appliedFilters.bedrooms);

      const matchesPrice =
        !appliedFilters.maxPrice ||
        price <= Number(appliedFilters.maxPrice);

      return (
        matchesQuery &&
        matchesOperation &&
        matchesType &&
        matchesBedrooms &&
        matchesPrice
      );
    });
  }, [properties, appliedFilters]);

  const stats = useMemo(() => {
    return {
      properties: properties.length,
      views: properties.reduce(
        (total, property) =>
          total + Number(property.views || 0),
        0,
      ),
      whatsappClicks: properties.reduce(
        (total, property) =>
          total + Number(property.whatsapp_clicks || 0),
        0,
      ),
      zones: new Set(
        properties
          .map((property) => property.zone)
          .filter(Boolean),
      ).size,
    };
  }, [properties]);

  function search() {
    setAppliedFilters(filters);

    setTimeout(() => {
      document
        .getElementById("propiedades")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  function selectCategory(category: string) {
    const next = {
      ...filters,
      propertyType: category,
    };

    setFilters(next);
    setAppliedFilters(next);

    setTimeout(() => {
      document
        .getElementById("propiedades")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

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

    const { error } = await supabase
      .from("favorites")
      .insert({
        device_token: deviceToken,
        property_id: propertyId,
      });

    if (!error) {
      setFavoriteIds((current) => [
        ...current,
        propertyId,
      ]);
    } else {
      console.warn(
        "No se pudo guardar el favorito:",
        error.message,
      );
    }
  }

  async function openWhatsApp(property: Property) {
    await supabase
      .from("properties")
      .update({
        whatsapp_clicks:
          Number(property.whatsapp_clicks || 0) + 1,
      })
      .eq("id", property.id);

    let number = property.whatsapp.replace(/\D/g, "");

    if (number.length === 10) {
      number = `1${number}`;
    }

    const message = encodeURIComponent(
      `Hola, estoy interesado en la propiedad "${property.title}" ubicada en ${property.zone}.`,
    );

    window.open(
      `https://wa.me/${number}?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Header favoriteCount={favoriteIds.length} />

      <Hero
        filters={filters}
        onChange={setFilters}
        onSearch={search}
        propertyCount={properties.length}
      />

      <Categories
        selected={filters.propertyType}
        onSelect={selectCategory}
      />

      <Stats {...stats} />

      <section
        id="propiedades"
        className="scroll-mt-24 px-5 py-16 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-bold uppercase tracking-widest text-emerald-700">
                Explora Punta Cana
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                Propiedades disponibles
              </h2>
              <p className="mt-3 text-slate-600">
                {loading
                  ? "Buscando propiedades..."
                  : `${filteredProperties.length} resultado(s) encontrado(s)`}
              </p>
            </div>

            {JSON.stringify(appliedFilters) !==
              JSON.stringify(initialFilters) && (
              <button
                type="button"
                onClick={() => {
                  setFilters(initialFilters);
                  setAppliedFilters(initialFilters);
                }}
                className="w-fit rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {loading ? (
            <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <PropertySkeleton key={index} />
              ))}
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  favorite={favoriteIds.includes(
                    property.id,
                  )}
                  onFavorite={toggleFavorite}
                  onWhatsApp={openWhatsApp}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <h3 className="text-2xl font-black text-slate-950">
                No encontramos propiedades
              </h3>
              <p className="mt-3 text-slate-600">
                Prueba con otros filtros o limpia la búsqueda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilters(initialFilters);
                  setAppliedFilters(initialFilters);
                }}
                className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700"
              >
                Ver todas
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pb-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-emerald-600 p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <p className="font-bold uppercase tracking-widest text-emerald-100">
              ¿Tienes una propiedad?
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-black md:text-4xl">
              Publica gratis y conecta con personas interesadas.
            </h2>
          </div>

          <a
            href="/publicar"
            className="min-w-fit rounded-2xl bg-white px-6 py-4 font-black text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            Publicar propiedad
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
