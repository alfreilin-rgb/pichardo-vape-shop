"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import {
  formatPrice,
  getOwnerToken,
  Property,
} from "../lib/puntahogar";

export default function MisPropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    const ownerToken = getOwnerToken();

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_token", ownerToken)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setProperties((data || []) as Property[]);
    setLoading(false);
  }

  async function deleteProperty(id: number) {
    if (!window.confirm("¿Seguro que deseas eliminar esta propiedad?")) {
      return;
    }

    const ownerToken = getOwnerToken();

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id)
      .eq("owner_token", ownerToken);

    if (!error) {
      setProperties((current) =>
        current.filter((property) => property.id !== id),
      );
    }
  }

  function statusStyle(status: string) {
    if (status === "Aprobada") return "bg-green-100 text-green-700";
    if (status === "Rechazada") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-widest text-blue-700">
              Panel del anunciante
            </p>
            <h1 className="mt-2 text-3xl font-bold">Mis propiedades</h1>
          </div>
          <div className="flex gap-3">
            <a href="/" className="rounded-xl border bg-white px-4 py-3 font-semibold">
              Inicio
            </a>
            <a href="/publicar" className="rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white">
              Nueva propiedad
            </a>
          </div>
        </div>

        {loading ? (
          <p className="mt-10">Cargando...</p>
        ) : properties.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center">
            No has publicado propiedades desde este navegador.
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <article key={property.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="relative h-48 bg-slate-200">
                  {property.images?.[0] && (
                    <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
                  )}
                  <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-sm font-semibold ${statusStyle(property.status)}`}>
                    {property.status}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold">{property.title}</h2>
                  <p className="mt-2 text-slate-500">{property.zone}</p>
                  <p className="mt-4 text-2xl font-bold text-blue-700">
                    {formatPrice(property)}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center text-sm">
                    <div><strong>{property.views || 0}</strong><br />Visitas</div>
                    <div><strong>{property.whatsapp_clicks || 0}</strong><br />WhatsApp</div>
                    <div><strong>{property.phone_clicks || 0}</strong><br />Llamadas</div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {property.status === "Aprobada" && (
                      <a href={`/propiedad/${property.id}`} className="rounded-xl bg-slate-900 px-4 py-3 text-center font-semibold text-white">
                        Ver
                      </a>
                    )}
                    <button
                      onClick={() => deleteProperty(property.id)}
                      className="rounded-xl border border-red-300 px-4 py-3 font-semibold text-red-700"
                    >
                      Eliminar
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
