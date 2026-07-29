"use client";

import {
  Bath,
  BedDouble,
  Building2,
  Crosshair,
  ListFilter,
  LocateFixed,
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

type UserLocation = {
  latitude: number;
  longitude: number;
};

type PropertyWithDistance = Property & {
  distanceKm?: number;
};

function distanceInKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) {
  const radius = 6371;
  const toRadians = (value: number) =>
    (value * Math.PI) / 180;

  const latitudeDifference = toRadians(
    latitude2 - latitude1,
  );
  const longitudeDifference = toRadians(
    longitude2 - longitude1,
  );

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return 2 * radius * Math.asin(Math.sqrt(a));
}

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
  const [userLocation, setUserLocation] =
    useState<UserLocation | null>(null);
  const [locationMessage, setLocationMessage] =
    useState("");
  const [locating, setLocating] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(10);

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

    const rows: PropertyWithDistance[] = properties
      .map((property) => {
        if (!userLocation) return property;

        return {
          ...property,
          distanceKm: distanceInKm(
            userLocation.latitude,
            userLocation.longitude,
            Number(property.latitude),
            Number(property.longitude),
          ),
        };
      })
      .filter((property) => {
        const matchesQuery =
          !normalized ||
          property.title.toLowerCase().includes(normalized) ||
          property.zone.toLowerCase().includes(normalized);

        const matchesOperation =
          !operation ||
          property.operation === operation;

        const matchesType =
          !propertyType ||
          property.property_type === propertyType;

        const matchesDistance =
          !nearbyOnly ||
          (property.distanceKm !== undefined &&
            property.distanceKm <= nearbyRadius);

        return (
          matchesQuery &&
          matchesOperation &&
          matchesType &&
          matchesDistance
        );
      });

    if (userLocation) {
      rows.sort(
        (a, b) =>
          (a.distanceKm ?? Number.MAX_VALUE) -
          (b.distanceKm ?? Number.MAX_VALUE),
      );
    }

    return rows;
  }, [
    properties,
    query,
    operation,
    propertyType,
    userLocation,
    nearbyOnly,
    nearbyRadius,
  ]);

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

  function locateUser(enableNearby = false) {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Este navegador no admite ubicación.",
      );
      return;
    }

    setLocating(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setUserLocation(location);
        setLocating(false);
        setLocationMessage(
          `Ubicación detectada con una precisión aproximada de ${Math.round(
            position.coords.accuracy,
          )} metros.`,
        );

        if (enableNearby) {
          setNearbyOnly(true);
        }
      },
      (error) => {
        setLocating(false);

        const messages: Record<number, string> = {
          1: "Debes permitir el acceso a tu ubicación.",
          2: "No se pudo determinar tu ubicación.",
          3: "La solicitud de ubicación tardó demasiado.",
        };

        setLocationMessage(
          messages[error.code] ||
            "No se pudo obtener tu ubicación.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  }

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

        <div className="mx-auto grid max-w-[1600px] gap-3 px-5 pb-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_180px_auto_auto]">
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
            onClick={() => locateUser(false)}
            disabled={locating}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
          >
            <LocateFixed size={18} />
            {locating ? "Ubicando..." : "Mi ubicación"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (!userLocation) {
                locateUser(true);
                return;
              }

              setNearbyOnly((value) => !value);
            }}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 font-bold ${
              nearbyOnly
                ? "bg-emerald-600 text-white"
                : "bg-slate-950 text-white"
            }`}
          >
            <Crosshair size={18} />
            {nearbyOnly ? "Mostrando cercanos" : "Cerca de mí"}
          </button>

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

        {(userLocation || locationMessage) && (
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-5 pb-4">
            {userLocation && (
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold">
                Radio:
                <select
                  value={nearbyRadius}
                  onChange={(event) =>
                    setNearbyRadius(
                      Number(event.target.value),
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5"
                >
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                </select>
              </label>
            )}

            {locationMessage && (
              <p className="text-sm font-medium text-slate-600">
                {locationMessage}
              </p>
            )}
          </div>
        )}
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
                const distance =
                  (property as PropertyWithDistance)
                    .distanceKm;

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

                        {distance !== undefined && (
                          <p className="mt-1 text-xs font-bold text-blue-700">
                            A {distance.toFixed(1)} km de ti
                          </p>
                        )}

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
            userLocation={userLocation}
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
