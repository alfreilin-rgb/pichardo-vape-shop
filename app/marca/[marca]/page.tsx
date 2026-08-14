"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";

type Product = {
  id: number;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  stock: number;
  status: string;
  images: string[] | null;
  flavor?: string | null;
};

export default function BrandPage() {
  const params = useParams();

  const brandName = decodeURIComponent(
    String(params.marca || "")
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandName) return;

    loadProducts();
  }, [brandName]);

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("brand", brandName)
      .neq("status", "Oculto")
      .order("id", { ascending: false });

    if (error) {
      console.error(
        "Error cargando productos:",
        error
      );

      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts((data || []) as Product[]);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">

      {/* BARRA SUPERIOR */}
      <div className="bg-red-600 px-5 py-2.5 text-center text-xs font-black uppercase tracking-wider text-white sm:text-sm">
        Pichardo Vape Shop · El papá de los precios · +18
      </div>

      {/* HEADER */}
      <header className="border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-5">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <img
              src="/logo-pichardo.png"
              alt="Pichardo Vape Shop"
              className="h-16 w-16 object-contain"
            />

            <div className="hidden sm:block">
              <p className="font-black text-zinc-900">
                PICHARDO
              </p>

              <p className="text-xs font-black tracking-widest text-red-500">
                VAPE SHOP
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 font-bold text-zinc-800 transition hover:border-red-500 hover:text-red-500 sm:block"
            >
              ← Volver
            </Link>

            <Link
              href="/lista"
              className="rounded-xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-500"
            >
              🛒 Mi lista
            </Link>
          </div>

        </div>
      </header>

      {/* CABECERA DE MARCA */}
      <section className="border-b border-zinc-200 bg-gradient-to-b from-red-50 to-white px-5 py-14">
        <div className="mx-auto max-w-[1500px]">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
            Productos por marca
          </p>

          <h1 className="mt-3 text-4xl font-black uppercase text-zinc-900 md:text-6xl">
            {brandName}
          </h1>

          <p className="mt-4 text-zinc-600">
            Explora todos los productos disponibles de{" "}
            <strong className="text-zinc-900">
              {brandName}
            </strong>.
          </p>

        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="mx-auto max-w-[1500px] px-5 py-12">

        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-red-500" />

            <p className="mt-4 text-zinc-500">
              Cargando productos...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-20 text-center">

            <div className="text-5xl">
              📦
            </div>

            <h2 className="mt-5 text-2xl font-black text-zinc-900">
              No hay productos de {brandName}
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-zinc-500">
              Todavía no hay productos guardados con esta marca.
            </p>

            <Link
              href="/"
              className="mt-7 inline-block rounded-xl bg-red-600 px-7 py-4 font-black text-white transition hover:bg-red-500"
            >
              Volver a la tienda
            </Link>

          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {products.map((product) => {
              const available =
                product.status === "Disponible" &&
                Number(product.stock) > 0;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-xl"
                >

                  {/* IMAGEN */}
                  <Link href={`/producto/${product.id}`}>
                    <div className="flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100">

                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-zinc-500">
                          Sin imagen
                        </span>
                      )}

                    </div>
                  </Link>

                  {/* INFORMACIÓN */}
                  <div className="p-5">

                    <p className="text-xs font-black uppercase tracking-wider text-red-500">
                      {product.brand}
                    </p>

                    <h2 className="mt-2 min-h-[56px] text-xl font-black text-zinc-900">
                      {product.name}
                    </h2>

                    {product.flavor && (
                      <p className="mt-2 text-sm text-zinc-500">
                        {product.flavor}
                      </p>
                    )}

                    <div className="mt-5">

                      <p className="text-2xl font-black text-zinc-900">
                        RD$
                        {Number(product.price).toLocaleString(
                          "es-DO"
                        )}
                      </p>

                      <p
                        className={`mt-2 text-sm font-bold ${
                          available
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {available
                          ? "● Disponible"
                          : "● Agotado"}
                      </p>

                    </div>

                    <Link
                      href={`/producto/${product.id}`}
                      className="mt-5 block rounded-xl bg-red-600 px-5 py-3 text-center font-black text-white transition hover:bg-red-500"
                    >
                      Ver detalles
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-zinc-200 bg-white px-5 py-10">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div className="flex items-center gap-3">
            <img
              src="/logo-pichardo.png"
              alt="Pichardo Vape Shop"
              className="h-14 w-14 object-contain"
            />

            <div>
              <p className="font-black">
                Pichardo Vape Shop
              </p>

              <p className="text-sm text-zinc-500">
                El papá de los precios.
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-500">
            © 2026 Pichardo Vape Shop · +18
          </p>

        </div>
      </footer>

    </main>
  );
}