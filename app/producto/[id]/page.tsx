"use client";



import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import {
  supabase,
} from "../../lib/supabase/client";

import {
  useProductList,
} from "../../components/ProductListContext";

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
  status:
    | "Disponible"
    | "Agotado"
    | "Oculto";
};

const WHATSAPP_NUMBER =
  "18095056991";

export default function ProductPage() {
  const params = useParams();

  const {
    addItem,
    totalItems,
  } = useProductList();

  const [
    product,
    setProduct,
  ] = useState<Product | null>(
    null
  );

  const [
    selectedImage,
    setSelectedImage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* CANTIDAD */
  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    added,
    setAdded,
  ] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  async function loadProduct() {
    try {
      setLoading(true);

      setErrorMessage("");

      const id =
        Number(params.id);

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .neq(
          "status",
          "Oculto"
        )
        .maybeSingle();

      if (error) {
        console.error(error);

        setErrorMessage(
          error.message
        );

        return;
      }

      if (!data) {
        setErrorMessage(
          "Producto no encontrado."
        );

        return;
      }

      const loadedProduct =
        data as Product;

      setProduct(
        loadedProduct
      );

      if (
        loadedProduct.images
          ?.length > 0
      ) {
        setSelectedImage(
          loadedProduct.images[0]
        );
      }
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Ocurrió un error al cargar el producto."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-900">

        <p className="text-zinc-600">
          Cargando producto...
        </p>

      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center text-zinc-900">

        <h1 className="text-3xl font-black">
          Producto no disponible
        </h1>

        <p className="mt-3 text-zinc-500">
          {errorMessage}
        </p>

        <a
          href="/"
          className="mt-7 rounded-xl bg-red-600 px-6 py-3 font-black transition hover:bg-red-500"
        >
          Volver al catálogo
        </a>

      </main>
    );
  }

  const available =
    product.status ===
      "Disponible" &&
    Number(product.stock) > 0;

  /* AGREGAR CANTIDAD A LISTA */
  function handleAddToList() {
  if (!product || !available) {
    return;
  }

  addItem(
    {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0],
    },
    quantity
  );

  setAdded(true);

  setTimeout(() => {
    setAdded(false);
  }, 1800);
}

  /* WHATSAPP GENERAL */
  const whatsappMessage =
    encodeURIComponent(
      `Hola Pichardo Vape Shop. Quisiera información sobre el producto "${product.name}"${
        product.flavor
          ? `, sabor ${product.flavor}`
          : ""
      }.`
    );

  const whatsappUrl =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-white text-zinc-900">

      {/* BARRA SUPERIOR */}
      <div className="bg-red-600 px-5 py-2.5 text-center text-xs font-black uppercase tracking-wider sm:text-sm">

        Pichardo Vape Shop ·
        El papá de los precios ·
        +18

      </div>

      {/* HEADER */}
      <header className="border-b border-zinc-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">

          <a
            href="/"
            className="flex items-center gap-3"
          >

            <img
              src="/logo-pichardo.png"
              alt="Pichardo Vape Shop"
              className="h-16 w-16 object-contain md:h-20 md:w-20"
            />

            <div className="hidden sm:block">

              <p className="text-lg font-black uppercase">
                Pichardo
              </p>

              <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
                Vape Shop
              </p>

            </div>

          </a>

          <div className="flex items-center gap-3">

            {/* LISTA */}
            <a
              href="/lista"
              className="relative rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold transition hover:border-red-500"
            >
              🛒 Lista

              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-black">
                  {totalItems}
                </span>
              )}
            </a>

            <a
              href="/"
              className="hidden rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-bold transition hover:border-red-500 hover:text-red-500 sm:block"
            >
              ← Volver
            </a>

          </div>

        </div>

      </header>

      {/* PRODUCTO */}
      <section className="px-5 py-8 md:py-12">

        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">

          {/* GALERÍA */}
          <div>

            <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 md:min-h-[620px]">

              {product.is_sale && (
                <span className="absolute left-5 top-5 z-20 rounded-lg bg-red-600 px-4 py-2 text-xs font-black">
                  OFERTA
                </span>
              )}

              {product.is_new && (
                <span className="absolute right-5 top-5 z-20 rounded-lg bg-violet-600 px-4 py-2 text-xs font-black">
                  NUEVO
                </span>
              )}

              {selectedImage ? (
                <img
                  src={
                    selectedImage
                  }
                  alt={
                    product.name
                  }
                  className="max-h-[600px] w-full object-contain"
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

            {/* MINIATURAS */}
            {product.images?.length >
              1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">

                {product.images.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      className={`min-w-[90px] overflow-hidden rounded-xl border-2 bg-black p-1 transition ${
                        selectedImage ===
                        image
                          ? "border-red-500"
                          : "border-zinc-200 hover:border-zinc-400"
                      }`}
                    >

                      <img
                        src={
                          image
                        }
                        alt={`${product.name} ${
                          index +
                          1
                        }`}
                        className="h-20 w-20 rounded-lg object-contain"
                      />

                    </button>
                  )
                )}

              </div>
            )}

          </div>

          {/* INFORMACIÓN */}
          <div className="flex flex-col">

            <p className="font-black uppercase tracking-[0.2em] text-red-500">
              {product.brand ||
                "Pichardo Vape Shop"}
            </p>

            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-3 text-zinc-500">
              {product.category}
            </p>

            {/* PRECIO */}
            <div className="mt-7 flex flex-wrap items-end gap-4">

              <p className="text-4xl font-black md:text-5xl">
                RD$
                {Number(
                  product.price
                ).toLocaleString(
                  "es-DO"
                )}
              </p>

              {product.old_price && (
                <p className="pb-1 text-lg text-zinc-600 line-through">

                  RD$
                  {Number(
                    product.old_price
                  ).toLocaleString(
                    "es-DO"
                  )}

                </p>
              )}

            </div>

            {/* DISPONIBLE */}
            <div className="mt-5 flex items-center gap-3">

              <span
                className={`h-3 w-3 rounded-full ${
                  available
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

              <p
                className={`font-black ${
                  available
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {available
                  ? "Disponible"
                  : "Agotado"}
              </p>

            </div>

            {/* DETALLES */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">

              {product.flavor && (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">

                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Sabor
                  </p>

                  <p className="mt-2 text-lg font-black">
                    {
                      product.flavor
                    }
                  </p>

                </div>
              )}

              {product.puffs && (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">

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

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">

                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Stock
                </p>

                <p className="mt-2 text-lg font-black">
                  {product.stock}
                </p>

              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">

                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Categoría
                </p>

                <p className="mt-2 text-lg font-black">
                  {
                    product.category
                  }
                </p>

              </div>

            </div>

            {/* =========================
                CANTIDAD
            ========================= */}

            <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">

              <p className="text-sm font-black uppercase tracking-widest text-zinc-500">
                Cantidad
              </p>

              <div className="mt-4 flex items-center gap-3">

                {/* MENOS */}
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (
                        current
                      ) =>
                        Math.max(
                          1,
                          current -
                            1
                        )
                    )
                  }
                  disabled={
                    !available ||
                    quantity <= 1
                  }
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-2xl font-black transition hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>

                {/* NUMERO */}
                <div className="flex h-12 min-w-16 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-xl font-black">

                  {quantity}

                </div>

                {/* MÁS */}
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (
                        current
                      ) =>
                        Math.min(
                          Number(
                            product.stock
                          ),

                          current +
                            1
                        )
                    )
                  }
                  disabled={
                    !available ||
                    quantity >=
                      Number(
                        product.stock
                      )
                  }
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-2xl font-black transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>

              </div>

              {available && (
                <p className="mt-3 text-xs text-zinc-500">
                  Máximo disponible:{" "}
                  {product.stock}
                </p>
              )}

              {/* AGREGAR */}
              <button
                type="button"
                onClick={
                  handleAddToList
                }
                disabled={
                  !available
                }
                className={`mt-5 w-full rounded-xl px-6 py-4 font-black transition ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white hover:bg-red-500"
                } disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500`}
              >

                {!available
                  ? "Producto agotado"
                  : added
                    ? `✓ ${quantity} agregado(s) a la lista`
                    : `+ Agregar ${quantity} a la lista`}

              </button>

              <a
                href="/lista"
                className="mt-3 block w-full rounded-xl border border-zinc-200 bg-white px-6 py-4 text-center font-bold transition hover:border-red-500"
              >
                🛒 Ver mi lista ({totalItems})
              </a>

            </div>

            {/* WHATSAPP */}
            <a
              href={
                whatsappUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block w-full rounded-xl bg-green-600 px-6 py-4 text-center font-black text-white transition hover:bg-green-500"
            >
              Consultar por WhatsApp
            </a>

            {/* DESCRIPCIÓN */}
            {product.description && (
              <div className="mt-8 border-t border-zinc-200 pt-8">

                <h2 className="text-xl font-black">
                  Descripción
                </h2>

                <p className="mt-4 whitespace-pre-line leading-7 text-zinc-600">
                  {
                    product.description
                  }
                </p>

              </div>
            )}

            {/* +18 */}
            <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

              <div className="flex gap-4">

                <div className="flex h-11 w-11 min-w-11 items-center justify-center rounded-xl bg-red-600 text-sm font-black">
                  +18
                </div>

                <div>

                  <p className="font-black">
                    Producto para adultos
                  </p>

                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Contenido destinado exclusivamente a personas mayores de edad.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* BOTÓN FLOTANTE */}
      <a
        href="/lista"
        className="fixed bottom-6 right-6 z-50 flex h-16 min-w-16 items-center justify-center gap-2 rounded-full bg-red-600 px-5 font-black text-white shadow-2xl transition hover:scale-105 hover:bg-red-500"
      >
        🛒

        {totalItems > 0 && (
          <span>
            {totalItems}
          </span>
        )}
      </a>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-zinc-200 bg-black px-5 py-10">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-3">

            <img
              src="/logo-pichardo.png"
              alt="Pichardo Vape Shop"
              className="h-16 w-16 object-contain"
            />

            <div>

              <p className="font-black">
                Pichardo Vape Shop
              </p>

              <p className="text-sm text-zinc-600">
                El papá de los precios.
              </p>

            </div>

          </div>

          <p className="text-sm text-zinc-600">
            © 2026 Pichardo Vape Shop · +18
          </p>

        </div>

      </footer>

    </main>
  );
}