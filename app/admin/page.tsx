"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

type Property = {
  id: number;
  operation: string;
  property_type: string;
  title: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  meters: number;
  zone: string;
  reference: string | null;
  location_type: "exacta" | "aproximada";
  latitude: number | null;
  longitude: number | null;
  description: string;
  images: string[];
  contact_name: string;
  whatsapp: string;
  email: string;
  status: "Pendiente" | "Aprobada" | "Rechazada";
  views: number;
  whatsapp_clicks: number;
  phone_clicks: number;
  created_at: string;
  updated_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    verifyAdmin();
  }, [router]);

  async function verifyAdmin() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/admin/login");
      return;
    }

    const { data: adminRecord, error: adminError } =
      await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (adminError || !adminRecord) {
      await supabase.auth.signOut();
      router.replace("/admin/login");
      return;
    }

    await loadProperties();
  }

  async function loadProperties() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando propiedades:", error);
      setErrorMessage(
        `No se pudieron cargar las propiedades: ${error.message}`,
      );
      setProperties([]);
      setLoading(false);
      return;
    }

    setProperties((data || []) as Property[]);
    setLoading(false);
  }

  async function changeStatus(
    id: number,
    status: Property["status"],
  ) {
    setActionId(id);
    setErrorMessage("");

    const { error } = await supabase
      .from("properties")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Error cambiando estado:", error);
      setErrorMessage(
        `No se pudo cambiar el estado: ${error.message}`,
      );
      setActionId(null);
      return;
    }

    setProperties((current) =>
      current.map((property) =>
        property.id === id
          ? { ...property, status }
          : property,
      ),
    );

    setActionId(null);
  }

  async function deleteProperty(id: number) {
    const selected = properties.find(
      (property) => property.id === id,
    );

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${
        selected?.title || "esta propiedad"
      }"? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setActionId(id);
    setErrorMessage("");

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando propiedad:", error);
      setErrorMessage(
        `No se pudo eliminar la propiedad: ${error.message}`,
      );
      setActionId(null);
      return;
    }

    setProperties((current) =>
      current.filter((property) => property.id !== id),
    );

    setActionId(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  function statusStyle(status: Property["status"]) {
    if (status === "Aprobada") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Rechazada") {
      return "bg-red-100 text-red-700";
    }

    return "bg-amber-100 text-amber-700";
  }

  const statistics = useMemo(() => {
    return {
      total: properties.length,
      pending: properties.filter(
        (property) => property.status === "Pendiente",
      ).length,
      approved: properties.filter(
        (property) => property.status === "Aprobada",
      ).length,
      rejected: properties.filter(
        (property) => property.status === "Rechazada",
      ).length,
    };
  }, [properties]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-600">
          Cargando propiedades desde Supabase...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Administración
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Propiedades recibidas
            </h1>

            <p className="mt-2 text-slate-600">
              Los anuncios ahora se cargan directamente desde Supabase.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadProperties}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold hover:bg-slate-50"
            >
              Actualizar
            </button>

            <a
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold hover:bg-slate-50"
            >
              Inicio
            </a>

            <a
              href="/publicar"
              className="rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Publicar
            </a>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total</p>
            <p className="mt-2 text-3xl font-bold">
              {statistics.total}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Pendientes</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {statistics.pending}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Aprobadas</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {statistics.approved}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Rechazadas</p>
            <p className="mt-2 text-3xl font-bold text-red-700">
              {statistics.rejected}
            </p>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold">
              No hay propiedades disponibles
            </h2>

            <p className="mt-3 text-slate-600">
              Comprueba las políticas RLS o publica una propiedad de prueba.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {properties.map((property) => (
              <article
                key={property.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-6 lg:flex-row">
                  <div className="flex flex-col gap-5 sm:flex-row">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-40 w-full rounded-xl object-cover sm:w-52"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center rounded-xl bg-slate-200 text-slate-500 sm:w-52">
                        Sin fotografía
                      </div>
                    )}

                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          {property.operation}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                          {property.property_type}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyle(
                            property.status,
                          )}`}
                        >
                          {property.status}
                        </span>
                      </div>

                      <h2 className="mt-3 text-2xl font-bold">
                        {property.title}
                      </h2>

                      <p className="mt-2 text-slate-600">
                        {property.zone}
                      </p>

                      <p className="mt-3 text-2xl font-bold text-blue-700">
                        {property.currency}{" "}
                        {Number(property.price).toLocaleString("es-DO")}
                      </p>

                      <div className="mt-4 text-sm text-slate-600">
                        <p>
                          <strong>Contacto:</strong>{" "}
                          {property.contact_name}
                        </p>

                        <p className="mt-1">
                          <strong>WhatsApp:</strong>{" "}
                          {property.whatsapp}
                        </p>

                        <p className="mt-1">
                          <strong>Correo:</strong>{" "}
                          {property.email}
                        </p>

                        <p className="mt-1 text-slate-500">
                          Recibida:{" "}
                          {new Date(
                            property.created_at,
                          ).toLocaleString("es-DO")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-3">
                    {property.status !== "Aprobada" && (
                      <button
                        type="button"
                        disabled={actionId === property.id}
                        onClick={() =>
                          changeStatus(
                            property.id,
                            "Aprobada",
                          )
                        }
                        className="rounded-xl bg-green-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
                      >
                        Aprobar
                      </button>
                    )}

                    {property.status !== "Rechazada" && (
                      <button
                        type="button"
                        disabled={actionId === property.id}
                        onClick={() =>
                          changeStatus(
                            property.id,
                            "Rechazada",
                          )
                        }
                        className="rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={actionId === property.id}
                      onClick={() =>
                        deleteProperty(property.id)
                      }
                      className="rounded-xl bg-red-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
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
