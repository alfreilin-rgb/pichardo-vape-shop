"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "./lib/supabase/client";
import { useProductList } from "./components/ProductListContext";
import BrandsGrid from "./components/BrandsGrid";
import StoreLocation from "./components/StoreLocation";

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
  created_at: string;
};

const categories = [
  {
    name: "Lo Nuevo",
    
  },
  {
    name: "Desechables",
    
  },
  {
    name: "Pods",
  
  },
  {
    name: "Equipos",
   
  },
  {
    name: "Líquidos",
   
  },
  {
    name: "Hookah",
   
  },
];

const PRODUCTS_PER_PAGE = 12;

/* ================================
   TARJETA DE PRODUCTO
================================ */

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addItem } = useProductList();
  const [added, setAdded] = useState(false);

  const available =
    product.status === "Disponible" &&
    Number(product.stock) > 0;

  function handleAddToList() {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images?.[0],
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-950/30">

      {/* IMAGEN */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100">

        {product.is_sale && (
          <span className="absolute left-3 top-3 z-20 rounded-md bg-red-600 px-3 py-1.5 text-xs font-black text-white">
            OFERTA
          </span>
        )}

        {product.is_new &&
          !product.is_sale && (
            <span className="absolute left-3 top-3 z-20 rounded-md bg-violet-600 px-3 py-1.5 text-xs font-black text-white">
              NUEVO
            </span>
          )}

        {product.is_restocked &&
          !product.is_sale &&
          !product.is_new && (
            <span className="absolute left-3 top-3 z-20 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-black text-white">
              DE VUELTA
            </span>
          )}

        {product.featured && (
          <span className="absolute bottom-3 left-3 z-20 rounded-md bg-fuchsia-600 px-3 py-1.5 text-xs font-black text-white">
            DESTACADO
          </span>
        )}

        {!available && (
          <span className="absolute right-3 top-3 z-20 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-black text-white">
            AGOTADO
          </span>
        )}

        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute h-52 w-52 rounded-full bg-red-600/10 blur-3xl" />

            <div className="relative flex h-56 w-28 items-center justify-center rounded-[2.5rem] border border-zinc-200 bg-gradient-to-b from-zinc-200 to-zinc-500 shadow-2xl">

              <div className="h-28 w-5 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />

            </div>
          </>
        )}

      </div>

      {/* INFORMACIÓN */}
      <div className="p-5">

        <p className="text-xs font-bold uppercase tracking-wider text-red-500">
          {product.brand ||
            "Pichardo Vape Shop"}
        </p>

        <h3 className="mt-2 min-h-[56px] text-lg font-black text-zinc-900">
          {product.name}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2">

          {product.flavor && (
            <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              {product.flavor}
            </span>
          )}

          {product.puffs && (
            <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              {Number(
                product.puffs
              ).toLocaleString()}{" "}
              puffs
            </span>
          )}

        </div>

        {/* PRECIO */}
        <div className="mt-5">

          {product.old_price && (
            <p className="text-sm text-zinc-500 line-through">
              RD$
              {Number(
                product.old_price
              ).toLocaleString("es-DO")}
            </p>
          )}

          <p className="text-2xl font-black text-zinc-900">
            RD$
            {Number(
              product.price
            ).toLocaleString("es-DO")}
          </p>

        </div>

        {/* DISPONIBILIDAD */}
        {available ? (
          <p className="mt-2 text-xs font-bold text-emerald-400">
            ● Disponible
          </p>
        ) : (
          <p className="mt-2 text-xs font-bold text-red-400">
            ● Agotado
          </p>
        )}

        <a
          href={`/producto/${product.id}`}
          className="mt-5 block w-full rounded-xl bg-red-600 px-4 py-3 text-center font-bold text-white transition hover:bg-red-500"
        >
          Ver detalles
        </a>
        <button
          type="button"
          onClick={handleAddToList}
          className={`mt-3 block w-full rounded-xl border px-4 py-3 text-center font-bold transition ${
            added
              ? "border-green-500 bg-green-600 text-white"
              : "border-red-500 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white"
          }`}
        >
          {added ? "✓ Agregado a la lista" : "+ Agregar a la lista"}
        </button>
<a
  href={`https://wa.me/18095056991?text=${encodeURIComponent(
    `Hola Pichardo Vape Shop, quisiera información sobre el producto "${product.name}".`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-3 block w-full rounded-xl bg-green-600 px-4 py-3 text-center font-bold text-white transition hover:bg-green-500"
>
  Consultar por WhatsApp
</a>
      </div>

    </article>
  );
}

/* ================================
   SECCIÓN DE PRODUCTOS
================================ */

function ProductSection({
  title,
  subtitle,
  products,
}: {
  title: string;
  subtitle: string;
  products: Product[];
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="px-5 py-16">

      <div className="mx-auto max-w-7xl">

        <div className="mb-8">

          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-500">
            {subtitle}
          </p>

          <h2 className="mt-2 text-3xl font-black text-zinc-900 md:text-4xl">
            {title}
          </h2>

        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </div>

    </section>
  );
}

/* ================================
   HOME
================================ */

export default function Home() {
  const { totalItems } = useProductList();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("Todos");

  const [brand, setBrand] =
    useState("Todas");

  const [sortBy, setSortBy] =
    useState("newest");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  function handleSearchSubmit() {
    setSearch(searchInput.trim());
    setCurrentPage(1);

    setTimeout(() => {
      document
        .getElementById("catalogo-completo")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  function handleCategorySelect(categoryName: string) {
    setCategory(categoryName);
    setCurrentPage(1);

    setTimeout(() => {
      document
        .getElementById("catalogo-completo")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  /* ================================
     CARGAR PRODUCTOS
  ================================ */

useEffect(() => {
  loadProducts();
}, []);

  async function loadProducts() {
    setLoading(true);
    setErrorMessage("");

    try {
      const timeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => {
          reject(
            new Error(
              "La conexión con la tienda tardó demasiado."
            )
          );
        }, 12000);
      });

      const request = supabase
        .from("products")
        .select("*")
        .neq("status", "Oculto")
        .order("created_at", {
          ascending: false,
        });

      const { data, error } = await Promise.race([
        request,
        timeout,
      ]);

      if (error) {
        console.error(
          "Error cargando productos:",
          error
        );

        setErrorMessage(
          `No se pudieron cargar los productos: ${error.message}`
        );

        setProducts([]);
        return;
      }

      setProducts(
        (data || []) as Product[]
      );
    } catch (error) {
      console.error(
        "Error inesperado cargando productos:",
        error
      );

      setProducts([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los productos."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================================
     MARCAS AUTOMÁTICAS
  ================================ */

  const brands = useMemo(() => {
    const uniqueBrands =
      products
        .map((product) =>
          product.brand?.trim()
        )
        .filter(
          (
            item
          ): item is string =>
            Boolean(item)
        );

    return [
      "Todas",
      ...Array.from(
        new Set(uniqueBrands)
      ).sort((a, b) =>
        a.localeCompare(b)
      ),
    ];
  }, [products]);

  /* ================================
     FILTRAR
  ================================ */

  const filteredProducts =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return products.filter(
        (product) => {
          const matchesSearch =
            !query ||
            product.name
              .toLowerCase()
              .includes(query) ||
            (product.brand || "")
              .toLowerCase()
              .includes(query) ||
            (product.flavor || "")
              .toLowerCase()
              .includes(query) ||
            (product.category || "")
              .toLowerCase()
              .includes(query);

          const matchesCategory =
            category === "Todos"
              ? true
              : category === "Lo Nuevo"
                ? product.is_new === true
                : product.category === category;

          const matchesBrand =
            brand === "Todas" ||
            product.brand === brand;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesBrand
          );
        }
      );
    }, [
      products,
      search,
      category,
      brand,
    ]);

  /* ================================
     ORDENAR
  ================================ */

  const sortedProducts =
    useMemo(() => {
      const result = [
        ...filteredProducts,
      ];

      if (
        sortBy === "price-low"
      ) {
        result.sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price)
        );
      }

      if (
        sortBy === "price-high"
      ) {
        result.sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price)
        );
      }

      if (sortBy === "name") {
        result.sort((a, b) =>
          a.name.localeCompare(
            b.name,
            "es"
          )
        );
      }

      if (sortBy === "newest") {
        result.sort(
          (a, b) =>
            new Date(
              b.created_at
            ).getTime() -
            new Date(
              a.created_at
            ).getTime()
        );
      }

      return result;
    }, [
      filteredProducts,
      sortBy,
    ]);

  /* ================================
     PAGINACIÓN
  ================================ */

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedProducts.length /
        PRODUCTS_PER_PAGE
    )
  );

  const paginatedProducts =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        PRODUCTS_PER_PAGE;

      return sortedProducts.slice(
        start,
        start +
          PRODUCTS_PER_PAGE
      );
    }, [
      sortedProducts,
      currentPage,
    ]);

  /* VOLVER A PÁGINA 1 AL FILTRAR */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    category,
    brand,
    sortBy,
  ]);

  /* EVITAR PÁGINA FUERA DE RANGO */
  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    totalPages,
    currentPage,
  ]);

  /* ================================
     SECCIONES
  ================================ */

  const newProducts =
    products
      .filter(
        (product) =>
          product.is_new
      )
      .slice(0, 4);

  const restockedProducts =
    products
      .filter(
        (product) =>
          product.is_restocked
      )
      .slice(0, 4);

  const saleProducts =
    products
      .filter(
        (product) =>
          product.is_sale
      )
      .slice(0, 4);

  const featuredProducts =
    products
      .filter(
        (product) =>
          product.featured
      )
      .slice(0, 4);

  const filtersActive =
    search.trim() !== "" ||
    category !== "Todos" ||
    brand !== "Todas";

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setCategory("Todos");
    setBrand("Todas");
    setCurrentPage(1);
  }

  function goToPage(
    page: number
  ) {
    setCurrentPage(page);

    setTimeout(() => {
      document
        .getElementById(
          "catalogo-completo"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">

      {/* ================================
          BARRA SUPERIOR
      ================================ */}

      <div className="bg-red-600 px-5 py-2.5 text-center text-xs font-black uppercase tracking-wider text-white sm:text-sm">
        Pichardo Vape Shop · El papá de los precios · +18
      </div>

      {/* ================================
          HEADER
      ================================ */}

      <header className="border-b border-zinc-200 bg-white shadow-sm">

        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4">

          <a
            href="/"
            className="flex min-w-fit items-center gap-3"
          >

            <img
              src="/logo-pichardo.png"
              alt="Pichardo Vape Shop"
              className="h-20 w-20 object-contain md:h-24 md:w-24"
            />

            <div className="hidden sm:block">

              <p className="text-xl font-black uppercase tracking-tight">
                Pichardo
              </p>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
                Vape Shop
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                El papá de los precios
              </p>

            </div>

          </a>

          {/* BUSCADOR */}
          <div className="hidden flex-1 md:block">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSearchSubmit();
              }}
              className="flex w-full"
            >
              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Buscar productos, sabores, marcas..."
                className="w-full rounded-l-xl border border-zinc-300 bg-white px-5 py-3.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500"
              />

              <button
                type="submit"
                aria-label="Buscar"
                className="rounded-r-xl bg-red-600 px-5 text-xl text-white transition hover:bg-red-500"
              >
                🔍
              </button>
            </form>
          </div>

          <div className="ml-auto flex items-center gap-3">

            <a
              href="/lista"
              className="relative rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-900 transition hover:border-red-500 hover:text-red-500"
            >
              🛒 Lista

              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-black text-white">
                  {totalItems}
                </span>
              )}
            </a>

            <a
              href="/admin/login"
              className="flex min-w-fit items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-3 text-sm font-bold text-zinc-900 transition hover:border-red-500 hover:text-red-500 sm:px-4"
            >
              Admin
            </a>

          </div>

        </div>

        {/* BUSCADOR MÓVIL */}
        <div className="px-5 pb-4 md:hidden">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSearchSubmit();
            }}
            className="flex w-full"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Buscar productos..."
              className="min-w-0 flex-1 rounded-l-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-red-500"
            />

            <button
              type="submit"
              aria-label="Buscar"
              className="rounded-r-xl bg-red-600 px-5 text-xl text-white transition hover:bg-red-500"
            >
              🔍
            </button>
          </form>
        </div>

      </header>

      {/* ================================
          CATEGORÍAS
      ================================ */}

      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2">

            <button
              type="button"
              onClick={() =>
                handleCategorySelect("Todos")
              }
              className={`min-w-fit rounded-xl border px-6 py-4 font-black transition ${
                category === "Todos"
                  ? "border-red-600 bg-red-600 text-white shadow-md"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-red-500 hover:text-red-500"
              }`}
            >
              Todos
            </button>

            {categories.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() =>
                  handleCategorySelect(item.name)
                }
                className={`min-w-fit rounded-xl border px-6 py-4 font-black transition ${
                  category === item.name
                    ? "border-red-600 bg-red-600 text-white shadow-md"
                    : "border-zinc-200 bg-white text-zinc-800 hover:border-red-500 hover:text-red-500"
                }`}
              >
                {item.name}
              </button>
            ))}

          </div>
        </div>
      </nav>

      {/* ================================
          MARCAS
      ================================ */}

      {brands.length > 1 && (
        <section className="border-b border-zinc-200 bg-white">

          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-5 py-3">

            <span className="mr-2 min-w-fit text-xs font-black uppercase tracking-widest text-zinc-500">
              Marcas:
            </span>

            {brands.map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setBrand(
                      item
                    )
                  }
                  className={`min-w-fit rounded-full border px-4 py-2 text-xs font-bold transition ${
                    brand ===
                    item
                      ? "border-red-500 bg-red-600 text-white"
                      : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:border-red-500 hover:text-red-500"
                  }`}
                >
                  {item}
                </button>
              )
            )}

          </div>

        </section>
      )}

      {/* ================================
          HERO
      ================================ */}

      <section className="px-5 py-6 md:py-10">

        <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-lg lg:grid-cols-2">

          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-red-600/15 blur-[120px]" />

          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-600/15 blur-[120px]" />

          {/* TEXTO */}
          <div className="relative flex flex-col justify-center p-8 md:p-14 lg:p-16">

            <span className="w-fit rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-500">
              Pichardo Vape Shop
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              EL PAPÁ
              <span className="block text-red-500">
                DE LOS PRECIOS.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-600">
              Explora nuestro
              catálogo de
              desechables, pods,
              equipos, líquidos y
              hookah.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <a
                href="#catalogo"
                className="inline-flex rounded-xl bg-red-600 px-7 py-4 font-black text-white transition hover:bg-red-500"
              >
                VER CATÁLOGO
              </a>

              <a
                href="#catalogo-completo"
                className="inline-flex rounded-xl border border-zinc-200 bg-zinc-100 px-7 py-4 font-black text-zinc-900 transition hover:border-red-500"
              >
                TODOS LOS PRODUCTOS
              </a>

            </div>

          </div>

          {/* LOGO */}
          <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-gradient-to-br from-red-950/60 via-black to-violet-950/60">

            <div className="absolute h-80 w-80 rounded-full bg-red-600/15 blur-[100px]" />

            <img
              src="/logo-pichardo.png"
              alt="Pichardo Vape Shop"
              className="relative z-10 w-[70%] max-w-md object-contain drop-shadow-2xl"
            />

          </div>

        </div>

      </section>

      {/* ================================
          BENEFICIOS
      ================================ */}

      <section className="px-5 pb-8">

        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-2xl border border-zinc-200 bg-white sm:grid-cols-2 lg:grid-cols-4">

          <div className="border-b border-zinc-200 p-5 sm:border-r lg:border-b-0">

            <p className="font-black">
              Amplio catálogo
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Variedad de productos
            </p>

          </div>

          <div className="border-b border-zinc-200 p-5 lg:border-b-0 lg:border-r">

            <p className="font-black">
              Nuevos productos
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Inventario actualizado
            </p>

          </div>

          <div className="border-b border-zinc-200 p-5 sm:border-r lg:border-b-0">

            <p className="font-black">
              Ofertas
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              El papá de los precios
            </p>

          </div>

          <div className="p-5">

            <p className="font-black text-red-500">
              +18
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Solo para adultos
            </p>

          </div>

        </div>

      </section>

      {/* ================================
          ERROR
      ================================ */}

      {errorMessage && (
        <div className="mx-auto my-8 max-w-7xl px-5">

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {errorMessage}
          </div>

        </div>
      )}

      {/* ================================
          LOADING
      ================================ */}

      {loading && (
        <section className="px-5 py-20 text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-red-500" />

          <p className="mt-4 text-lg text-zinc-500">
            Cargando productos...
          </p>

        </section>
      )}

      {/* ================================
          SECCIONES DESTACADAS
      ================================ */}

      {!loading &&
        !filtersActive && (
          <>

            {featuredProducts.length >
              0 && (
              <div id="catalogo">

                <ProductSection
                  title="Productos destacados"
                  subtitle="Recomendados"
                  products={
                    featuredProducts
                  }
                />

              </div>
            )}

            {newProducts.length >
              0 && (
              <ProductSection
                title="Nuevos productos"
                subtitle="Recién llegados"
                products={
                  newProducts
                }
              />
            )}

            {restockedProducts.length >
              0 && (
              <div className="bg-zinc-50">

                <ProductSection
                  title="Nuevamente disponibles"
                  subtitle="De vuelta en inventario"
                  products={
                    restockedProducts
                  }
                />

              </div>
            )}

            {saleProducts.length >
              0 && (
              <ProductSection
                title="Zona de ofertas"
                subtitle="El papá de los precios"
                products={
                  saleProducts
                }
              />
            )}

          </>
        )}

      {/* ================================
          CATÁLOGO COMPLETO / RESULTADOS
      ================================ */}

      {!loading && (
        <section
          id="catalogo-completo"
          className="scroll-mt-24 border-t border-zinc-200 bg-white px-5 py-16"
        >

          <div className="mx-auto max-w-7xl">

            {/* CABECERA */}
            <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

              <div>

                <p className="text-sm font-black uppercase tracking-[0.2em] text-red-500">
                  {filtersActive
                    ? "Resultados"
                    : "Catálogo completo"}
                </p>

                <h2 className="mt-2 text-3xl font-black text-zinc-900 md:text-4xl">
                  {filtersActive
                    ? "Productos encontrados"
                    : "Todos los productos"}
                </h2>

                <p className="mt-3 text-zinc-500">
                  {
                    sortedProducts.length
                  }{" "}
                  producto(s)
                </p>

                {/* FILTROS ACTIVOS */}
                {filtersActive && (
                  <div className="mt-4 flex flex-wrap gap-2">

                    {category !==
                      "Todos" && (
                      <span className="rounded-full bg-red-600/10 px-4 py-2 text-xs font-bold text-red-400">
                        {
                          category
                        }
                      </span>
                    )}

                    {brand !==
                      "Todas" && (
                      <span className="rounded-full bg-violet-600/10 px-4 py-2 text-xs font-bold text-violet-300">
                        {brand}
                      </span>
                    )}

                    {search && (
                      <span className="rounded-full bg-blue-600/10 px-4 py-2 text-xs font-bold text-blue-300">
                        “
                        {search}
                        ”
                      </span>
                    )}

                  </div>
                )}

              </div>

              <div className="flex flex-wrap gap-3">

                {filtersActive && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="rounded-xl border border-zinc-200 px-5 py-3 font-bold transition hover:border-red-500 hover:text-red-500"
                  >
                    Limpiar filtros
                  </button>
                )}

              </div>

            </div>

            {/* ORDENAMIENTO */}
            {sortedProducts.length >
              0 && (
              <div className="mb-7 flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center">

                <p className="text-sm text-zinc-500">

                  Mostrando{" "}

                  <strong className="text-zinc-900">
                    {
                      paginatedProducts.length
                    }
                  </strong>{" "}

                  de{" "}

                  <strong className="text-zinc-900">
                    {
                      sortedProducts.length
                    }
                  </strong>{" "}

                  productos

                </p>

                <div className="flex items-center gap-3">

                  <label className="hidden text-sm font-bold text-zinc-500 sm:block">
                    Ordenar:
                  </label>

                  <select
                    value={
                      sortBy
                    }
                    onChange={(
                      event
                    ) =>
                      setSortBy(
                        event
                          .target
                          .value
                      )
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:border-red-500"
                  >

                    <option value="newest">
                      Más nuevos
                    </option>

                    <option value="price-low">
                      Menor precio
                    </option>

                    <option value="price-high">
                      Mayor precio
                    </option>

                    <option value="name">
                      Nombre A-Z
                    </option>

                  </select>

                </div>

              </div>
            )}

            {/* PRODUCTOS */}
            {sortedProducts.length >
              0 ? (
              <>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                  {paginatedProducts.map(
                    (
                      product
                    ) => (
                      <ProductCard
                        key={
                          product.id
                        }
                        product={
                          product
                        }
                      />
                    )
                  )}

                </div>

                {/* PAGINACIÓN */}
                {totalPages >
                  1 && (
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-2">

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        1
                      }
                      onClick={() =>
                        goToPage(
                          Math.max(
                            1,
                            currentPage -
                              1
                          )
                        )
                      }
                      className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 font-bold transition hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ← Anterior
                    </button>

                    {Array.from(
                      {
                        length:
                          totalPages,
                      },
                      (
                        _,
                        index
                      ) =>
                        index +
                        1
                    ).map(
                      (
                        page
                      ) => (
                        <button
                          key={
                            page
                          }
                          type="button"
                          onClick={() =>
                            goToPage(
                              page
                            )
                          }
                          className={`h-12 min-w-12 rounded-xl px-3 font-black transition ${
                            currentPage ===
                            page
                              ? "bg-red-600 text-white"
                              : "border border-zinc-200 bg-zinc-100 text-zinc-600 hover:border-red-500 hover:text-red-500"
                          }`}
                        >
                          {
                            page
                          }
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      disabled={
                        currentPage ===
                        totalPages
                      }
                      onClick={() =>
                        goToPage(
                          Math.min(
                            totalPages,
                            currentPage +
                              1
                          )
                        )
                      }
                      className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 font-bold transition hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Siguiente →
                    </button>

                  </div>
                )}

                {/* INFORMACIÓN DE PÁGINA */}
                {totalPages >
                  1 && (
                  <p className="mt-5 text-center text-sm text-zinc-600">
                    Página{" "}
                    {
                      currentPage
                    }{" "}
                    de{" "}
                    {
                      totalPages
                    }
                  </p>
                )}

              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 py-20 text-center">

                <p className="text-5xl">
                  🔎
                </p>

                <h3 className="mt-5 text-2xl font-black">
                  No encontramos productos
                </h3>

                <p className="mt-3 text-zinc-500">
                  Prueba con otro
                  nombre, sabor,
                  categoría o marca.
                </p>

                {filtersActive && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-black transition hover:bg-red-500"
                  >
                    Ver todos los productos
                  </button>
                )}

              </div>
            )}

          </div>

        </section>
      )}

    {/* ================================
    NUESTRAS MARCAS
================================ */}

<BrandsGrid />

      {/* ================================
          +18
      ================================ */}

      <section className="px-5 py-16">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-violet-700 p-8 text-white md:p-12">

          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">

            <span className="inline-flex rounded-full bg-white/30 px-4 py-2 text-sm font-black">
              +18
            </span>

            <h2 className="mt-5 text-3xl font-black md:text-4xl">
              Contenido exclusivo
              para adultos
            </h2>

            <p className="mt-3 max-w-2xl text-zinc-900/80">
              Este catálogo está
              destinado
              exclusivamente a
              personas mayores de
              edad.
            </p>

          </div>

        </div>
      </section>

      <StoreLocation />

      {/* ================================
          FOOTER
      ================================ */}

      <footer className="border-t border-zinc-800 bg-zinc-950 px-5 py-14 text-white">

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">

          {/* LOGO */}
          <div className="flex items-start gap-4">

            <img
              src="/logo-pichardo.png"
              alt="Pichardo Vape Shop"
              className="h-24 w-24 object-contain"
            />

            <div>

              <p className="text-lg font-black">
                Pichardo Vape Shop
              </p>

              <p className="mt-1 text-sm text-zinc-400">
                El papá de los
                precios.
              </p>

            </div>

          </div>

          {/* CATEGORÍAS */}
          <div>

            <p className="font-black">
              Catálogo
            </p>

            <div className="mt-4 space-y-2 text-sm text-zinc-400">

              <button
                type="button"
                onClick={() => {
                  setCategory(
                    "Desechables"
                  );

                  setTimeout(
                    () => {
                      document
                        .getElementById(
                          "catalogo-completo"
                        )
                        ?.scrollIntoView(
                          {
                            behavior:
                              "smooth",
                          }
                        );
                    },
                    50
                  );
                }}
                className="block hover:text-red-500"
              >
                Desechables
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory(
                    "Equipos"
                  );

                  setTimeout(
                    () => {
                      document
                        .getElementById(
                          "catalogo-completo"
                        )
                        ?.scrollIntoView(
                          {
                            behavior:
                              "smooth",
                          }
                        );
                    },
                    50
                  );
                }}
                className="block hover:text-red-500"
              >
                Equipos
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory(
                    "Pods"
                  );

                  setTimeout(
                    () => {
                      document
                        .getElementById(
                          "catalogo-completo"
                        )
                        ?.scrollIntoView(
                          {
                            behavior:
                              "smooth",
                          }
                        );
                    },
                    50
                  );
                }}
                className="block hover:text-red-500"
              >
                Pods
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory(
                    "Líquidos"
                  );

                  setTimeout(
                    () => {
                      document
                        .getElementById(
                          "catalogo-completo"
                        )
                        ?.scrollIntoView(
                          {
                            behavior:
                              "smooth",
                          }
                        );
                    },
                    50
                  );
                }}
                className="block hover:text-red-500"
              >
                Líquidos
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory(
                    "Hookah"
                  );

                  setTimeout(
                    () => {
                      document
                        .getElementById(
                          "catalogo-completo"
                        )
                        ?.scrollIntoView(
                          {
                            behavior:
                              "smooth",
                          }
                        );
                    },
                    50
                  );
                }}
                className="block hover:text-red-500"
              >
                Hookah
              </button>

            </div>

          </div>

          {/* INFO */}
          <div>

            <p className="font-black">
              Información
            </p>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Catálogo de Pichardo
              Vape Shop. Contenido
              destinado
              exclusivamente a
              mayores de edad.
            </p>

          </div>

        </div>

        <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-3 border-t border-zinc-800 pt-6 text-sm text-zinc-400 sm:flex-row">

          <p>
            © 2026 Pichardo Vape
            Shop
          </p>

          <p>
            El papá de los precios
            · +18
          </p>

        </div>

      </footer>



<a
  href={`https://wa.me/18095056991?text=${encodeURIComponent(
    "Hola Pichardo Vape Shop, quisiera información."
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Contactar por WhatsApp"
  className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-3xl text-white shadow-2xl transition hover:scale-110 hover:bg-green-500"
>
  ☎
</a>

    </main>
  );
}