"use client";

import { useProductList } from "../components/ProductListContext";

const WHATSAPP_NUMBER = "18095056991";

export default function ListaPage() {
  const {
    items,
    increase,
    decrease,
    removeItem,
    clearList,
    totalItems,
  } = useProductList();

  const message = [
    "Hola Pichardo Vape Shop, quiero hacer un pedido de:",
    "",
    ...items.flatMap((item, index) => [
      `${index + 1}. ${item.name}`,
      `   Cantidad: ${item.quantity}`,
      "",
    ]),
  ].join("\n");

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* BARRA SUPERIOR */}
      <div className="bg-red-600 px-5 py-2.5 text-center text-sm font-black text-white">
        PICHARDO VAPE SHOP · +18
      </div>

      {/* HEADER */}
      <header className="border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/logo-pichardo.png"
              alt="Pichardo Vape Shop"
              className="h-16 w-16 object-contain"
            />

            <div>
              <p className="font-black text-zinc-900">
                PICHARDO
              </p>

              <p className="text-xs font-black tracking-widest text-red-500">
                VAPE SHOP
              </p>
            </div>
          </a>

          <a
            href="/"
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 font-bold text-zinc-800 transition hover:border-red-500 hover:text-red-500"
          >
            ← Seguir viendo
          </a>
        </div>
      </header>

      {/* CONTENIDO */}
      <section className="px-5 py-12">
        <div className="mx-auto max-w-5xl">

          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-black uppercase tracking-widest text-red-500">
                Mi lista
              </p>

              <h1 className="mt-2 text-4xl font-black text-zinc-900">
                Productos seleccionados
              </h1>

              <p className="mt-3 text-zinc-500">
                {totalItems} artículo(s) en la lista
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearList}
                className="w-fit rounded-xl border border-red-500/30 bg-red-50 px-5 py-3 font-bold text-red-600 transition hover:bg-red-100"
              >
                Vaciar lista
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-20 text-center">

              <p className="text-5xl">
                🛒
              </p>

              <h2 className="mt-5 text-2xl font-black text-zinc-900">
                Tu lista está vacía
              </h2>

              <p className="mt-3 text-zinc-500">
                Agrega productos desde el catálogo.
              </p>

              <a
                href="/"
                className="mt-7 inline-block rounded-xl bg-red-600 px-6 py-4 font-black text-white transition hover:bg-red-500"
              >
                Ver productos
              </a>

            </div>
          ) : (
            <>
              {/* PRODUCTOS */}
              <div className="space-y-4">

                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                  >

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-28 w-28 rounded-xl border border-zinc-200 bg-zinc-50 object-contain"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500">
                        Sin foto
                      </div>
                    )}

                    <div className="flex-1">

                      <h2 className="text-xl font-black text-zinc-900">
                        {item.name}
                      </h2>

                      <p className="mt-2 text-lg font-black text-red-600">
                        RD$
                        {Number(item.price).toLocaleString(
                          "es-DO"
                        )}
                      </p>

                    </div>

                    {/* CANTIDAD */}
                    <div className="flex items-center gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          decrease(item.id)
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 bg-white text-xl font-black text-zinc-900 transition hover:border-red-500"
                      >
                        −
                      </button>

                      <span className="min-w-10 text-center text-xl font-black">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          increase(item.id)
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-xl font-black text-white transition hover:bg-red-500"
                      >
                        +
                      </button>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(item.id)
                      }
                      className="rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 font-bold text-red-600 transition hover:bg-red-100"
                    >
                      Quitar
                    </button>

                  </article>
                ))}

              </div>

              {/* WHATSAPP */}
              <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6">

                <h2 className="text-2xl font-black text-zinc-900">
                  Enviar pedido por WhatsApp
                </h2>

                <p className="mt-3 text-zinc-600">
                  WhatsApp abrirá automáticamente con los nombres y cantidades seleccionadas.
                </p>

                <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-4 font-mono text-sm leading-7 text-zinc-700 shadow-sm">

                  <pre className="whitespace-pre-wrap">
                    {message}
                  </pre>

                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block w-full rounded-xl bg-green-600 px-6 py-4 text-center text-lg font-black text-white transition hover:bg-green-500"
                >
                  Enviar pedido por WhatsApp
                </a>

              </div>
            </>
          )}

        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-zinc-200 bg-white px-5 py-10">

        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 sm:flex-row sm:items-center">

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