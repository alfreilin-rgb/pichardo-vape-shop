"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";

type Brand = {
  id: number;
  name: string;
  logo: string | null;
  active: boolean;
};

export default function BrandsGrid() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    setLoading(true);
    setErrorMessage("");

    try {
      const timeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => {
          reject(
            new Error(
              "La conexión con las marcas tardó demasiado."
            )
          );
        }, 12000);
      });

      const request = supabase
        .from("brands")
        .select("id, name, logo, active")
        .eq("active", true)
        .order("name", {
          ascending: true,
        });

      const { data, error } = await Promise.race([
        request,
        timeout,
      ]);

      if (error) {
        console.error(
          "Error cargando marcas:",
          error
        );

        setBrands([]);
        setErrorMessage(
          `No se pudieron cargar las marcas: ${error.message}`
        );
        return;
      }

      setBrands((data || []) as Brand[]);
    } catch (error) {
      console.error(
        "Error inesperado cargando marcas:",
        error
      );

      setBrands([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las marcas."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white px-4 py-14 text-zinc-900">
      <div className="mx-auto max-w-[1500px]">

        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-500">
            Explora por marca
          </p>

          <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-zinc-900 md:text-4xl">
            Nuestras Marcas
          </h2>

          <div className="mt-4 h-1 w-16 rounded-full bg-red-600" />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-zinc-200 border-t-red-600" />

            <p className="mt-4 text-zinc-500">
              Cargando marcas...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-black text-red-600">
              No pudimos cargar las marcas
            </p>

            <p className="mt-2 text-sm text-zinc-600">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadBrands}
              className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-black text-white transition hover:bg-red-500"
            >
              Intentar de nuevo
            </button>
          </div>
        ) : brands.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {brands.map((brand) => (
              <a
                key={brand.id}
                href={`/marca/${encodeURIComponent(
                  brand.name
                )}`}
                title={`Ver productos ${brand.name}`}
                className="group flex min-h-[150px] flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-400 hover:shadow-lg"
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-[75px] max-w-[85%] object-contain transition duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-xl font-black text-red-600">
                    {brand.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <p className="mt-4 text-center text-sm font-black uppercase text-zinc-700 transition group-hover:text-red-600">
                  {brand.name}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center">
            <p className="text-5xl">
              🏷️
            </p>

            <p className="mt-5 text-xl font-black text-zinc-900">
              Todavía no hay marcas creadas
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Las marcas que agregues aparecerán automáticamente aquí.
            </p>

            <a
              href="/admin/marcas"
              className="mt-6 inline-block rounded-xl bg-red-600 px-6 py-3 font-black text-white transition hover:bg-red-500"
            >
              Crear marca
            </a>
          </div>
        )}

      </div>
    </section>
  );
}