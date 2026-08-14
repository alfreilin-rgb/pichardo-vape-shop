"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  flavor: string | null;
  puffs: number | null;
  price: number;
  old_price: number | null;
  stock: number;
  description: string | null;
  images: string[];
  is_new: boolean;
  is_restocked: boolean;
  is_sale: boolean;
  featured: boolean;
  status: "Disponible" | "Agotado" | "Oculto";
};

export default function ProductPage() {
  const params = useParams();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  async function loadProduct() {
    setLoading(true);
    setErrorMessage("");

    const id = Number(params.id);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .neq("status", "Oculto")
      .maybeSingle();

    if (error) {
      console.error(error);

      setErrorMessage(
        `No se pudo cargar el producto: ${error.message}`
      );

      setLoading(false);
      return;
    }

    if (!data) {
      setErrorMessage(
        "Este producto no existe o no está disponible."
      );

      setLoading(false);
      return;
    }

    setProduct(data as Product);
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <p className="text-zinc-400">
          Cargando producto...
        </p>
      </main>
    );
  }

  if (!product || errorMessage) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#080808] px-5 text-center text-white">

        <h1 className="text-3xl font-black">
          Producto no disponible
        </h1>

        <p className="mt-3 text-zinc-500">
          {errorMessage}
        </p>

        <a
          href="/"
          className="mt-7 rounded-xl bg-red-600 px-6 py-3 font-black hover:bg-red-500"
        >
          Volver al catálogo
        </a>

      </main>
    );
  }

  const available =
    product.status === "Disponible" &&
    product.stock > 0;

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* BARRA SUPERIOR */}
      <div className="bg-red-600 px-5 py-2 text-center text-sm font-black">
        PICHARDO VAPE SHOP · EL PAPÁ DE LOS PRECIOS · +18
      </div>

      {/* HEADER */}
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <a
            href="/"
            className="flex items-center gap-3"
          >
            <img
              src="/logo-pichardo.png"
              alt="Pichardo Vape Shop"
              className="h-16 w-16 object-contain"
            />

            <div className="hidden sm:block">
              <p className="font-black">
                PICHARDO
              </p>

              <p className="text-xs font-bold tracking-widest text-red-500">
                VAPE SHOP
              </p>
            </div>
          </a>

          <a
            href="/"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold hover:border-red-500 hover:text-red-500"
          >
            ← Volver al catálogo
          </a>

        </div>
      </header>

      {/* PRODUCTO */}
      <section className="px-5 py-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">

          {/* FOTO */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">

            {product.is_sale && (
              <span className="absolute left-5 top-5 z-20 rounded-lg bg-red-600 px-4 py-2 text-sm font-black">
                OFERTA
              </span>
            )}

            {product.is_new && (
              <span className="absolute right-5 top-5 z-20 rounded-lg bg-violet-600 px-4 py-2 text-sm font-black">
                NUEVO
              </span>
            )}

            <div className="flex min-h-[500px] items-center justify-center p-5 lg:min-h-[650px]">

              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="max-h-[620px] w-full object-contain"
                />
              ) : (
                <div className="text-center text-zinc-600">
                  <p className="text-6xl">
                    📷
                  </p>

                  <p className="mt-3">
                    Sin imagen
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* INFORMACIÓN */}
          <div className="flex flex-col justify-center">

            <p className="font-black uppercase tracking-[0.2em] text-red-500">
              {product.brand || "Pichardo Vape Shop"}
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-3 text-zinc-500">
              {product.category}
            </p>

            {/* PRECIO */}
            <div className="mt-7 flex items-end gap-4">

              <p className="text-4xl font-black">
                RD$
                {Number(product.price).toLocaleString(
                  "es-DO"
                )}
              </p>

              {product.old_price && (
                <p className="pb-1 text-lg text-zinc-600 line-through">
                  RD$
                  {Number(
                    product.old_price
                  ).toLocaleString("es-DO")}
                </p>
              )}

            </div>

            {/* DISPONIBILIDAD */}
            <div className="mt-5 flex items-center gap-3">

              <span
                className={`h-3 w-3 rounded-full ${
                  available
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

              <span
                className={`font-bold ${
                  available
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {available
                  ? "Disponible"
                  : "Agotado"}
              </span>

            </div>

            {/* INFORMACIÓN RÁPIDA */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">

              {product.flavor && (
                <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">

                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Sabor
                  </p>

                  <p className="mt-2 text-lg font-black">
                    {product.flavor}
                  </p>

                </div>
              )}

              {product.puffs && (
                <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">

                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Puffs
                  </p>

                  <p className="mt-2 text-lg font-black">
                    {Number(
                      product.puffs
                    ).toLocaleString()}
                  </p>

                </div>
              )}

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">

                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Disponibilidad
                </p>

                <p className="mt-2 text-lg font-black">
                  {available
                    ? "En inventario"
                    : "No disponible"}
                </p>

              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">

                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Categoría
                </p>

                <p className="mt-2 text-lg font-black">
                  {product.category}
                </p>

              </div>

            </div>

            {/* DESCRIPCIÓN */}
            {product.description && (
              <div className="mt-8 border-t border-white/10 pt-8">

                <h2 className="text-xl font-black">
                  Descripción
                </h2>

                <p className="mt-4 whitespace-pre-line leading-7 text-zinc-400">
                  {product.description}
                </p>

              </div>
            )}

            {/* INFORMACIÓN */}
            <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

              <p className="font-black text-red-400">
                +18
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Producto destinado exclusivamente a
                personas mayores de edad.
              </p>

            </div>

          </div>

        </div>
      </section>

    </main>
  );
}