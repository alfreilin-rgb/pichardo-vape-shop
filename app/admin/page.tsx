"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/client";

type ProductStatus = "Disponible" | "Agotado" | "Oculto";

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
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

type Brand = {
  id: number;
  name: string;
  logo: string | null;
};

type ProductForm = {
  name: string;
  brand: string;
  category: string;
  flavor: string;
  puffs: string;
  price: string;
  old_price: string;
  stock: string;
  description: string;
  images: string[];
  is_new: boolean;
  is_restocked: boolean;
  is_sale: boolean;
  featured: boolean;
  status: ProductStatus;
};

const emptyForm: ProductForm = {
  name: "",
  brand: "",
  category: "Desechables",
  flavor: "",
  puffs: "",
  price: "",
  old_price: "",
  stock: "",
  description: "",
  images: [],
  is_new: false,
  is_restocked: false,
  is_sale: false,
  featured: false,
  status: "Disponible",
};

export default function AdminPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<ProductForm>(emptyForm);

  useEffect(() => {
    verifyAdmin();
  }, []);

  async function verifyAdmin() {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: adminRecord, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", session.user.id)
          .maybeSingle();

      if (adminError || !adminRecord) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      await Promise.all([
        loadProducts(),
        loadBrands(),
      ]);
    } catch (error) {
      console.error("Error verificando administrador:", error);

      setErrorMessage(
        "No se pudo verificar la sesión. Intenta volver a iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadBrands() {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name, logo")
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Error cargando marcas:", error);
        return;
      }

      setBrands((data || []) as Brand[]);
    } catch (error) {
      console.error("Error inesperado cargando marcas:", error);
    }
  }

  async function loadProducts() {
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          brand,
          category,
          flavor,
          puffs,
          price,
          old_price,
          stock,
          description,
          images,
          is_new,
          is_restocked,
          is_sale,
          featured,
          status,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);

        setErrorMessage(
          `No se pudieron cargar los productos: ${error.message}`
        );

        setProducts([]);
        return;
      }

      setProducts((data || []) as Product[]);
    } catch (error) {
      console.error("Error inesperado cargando productos:", error);

      setProducts([]);
      setErrorMessage(
        "No se pudieron cargar los productos."
      );
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function openNewProductForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");

    setTimeout(() => {
      document
        .getElementById("product-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  function editProduct(product: Product) {
    setEditingId(product.id);

    setForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      flavor: product.flavor || "",
      puffs: product.puffs?.toString() || "",
      price: product.price?.toString() || "",
      old_price: product.old_price?.toString() || "",
      stock: product.stock?.toString() || "",
      description: product.description || "",
      images: product.images || [],
      is_new: product.is_new,
      is_restocked: product.is_restocked,
      is_sale: product.is_sale,
      featured: product.featured,
      status: product.status,
    });

    setShowForm(true);
    setErrorMessage("");
    setSuccessMessage("");

    setTimeout(() => {
      document
        .getElementById("product-form")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  async function uploadProductImages(files: FileList) {
    try {
      setUploadingImages(true);
      setErrorMessage("");
      setSuccessMessage("");

      const selectedFiles = Array.from(files);

      if (selectedFiles.length === 0) {
        return;
      }

      if (form.images.length + selectedFiles.length > 6) {
        setErrorMessage(
          "Puedes guardar un máximo de 6 imágenes por producto."
        );
        return;
      }

      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          setErrorMessage(
            `"${file.name}" no es un archivo de imagen válido.`
          );
          continue;
        }

        const maxSize = 8 * 1024 * 1024;

        if (file.size > maxSize) {
          setErrorMessage(
            `"${file.name}" supera el máximo permitido de 8 MB.`
          );
          continue;
        }

        const extension =
          file.name.split(".").pop()?.toLowerCase() || "jpg";

        const safeName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}.${extension}`;

        const filePath = safeName;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          console.error(uploadError);

          setErrorMessage(
            `No se pudo subir "${file.name}": ${uploadError.message}`
          );

          continue;
        }

        const { data } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        setForm((current) => ({
          ...current,
          images: [...current.images, ...uploadedUrls],
        }));

        setSuccessMessage(
          `${uploadedUrls.length} imagen(es) subida(s) correctamente.`
        );
      }
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Ocurrió un error inesperado al subir las imágenes."
      );
    } finally {
      setUploadingImages(false);
    }
  }

  function removeImage(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
  }

  function makeMainImage(index: number) {
    setForm((current) => {
      const images = [...current.images];
      const [selected] = images.splice(index, 1);

      return {
        ...current,
        images: [selected, ...images],
      };
    });
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.name.trim()) {
      setErrorMessage("El nombre del producto es obligatorio.");
      setSaving(false);
      return;
    }

    if (!form.brand.trim()) {
      setErrorMessage("Selecciona una marca.");
      setSaving(false);
      return;
    }

    if (!form.price) {
      setErrorMessage("El precio es obligatorio.");
      setSaving(false);
      return;
    }

    if (Number(form.price) < 0) {
      setErrorMessage("El precio no puede ser negativo.");
      setSaving(false);
      return;
    }

    if (form.stock && Number(form.stock) < 0) {
      setErrorMessage("El stock no puede ser negativo.");
      setSaving(false);
      return;
    }

    const productData = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      flavor: form.flavor.trim() || null,
      puffs: form.puffs ? Number(form.puffs) : null,
      price: Number(form.price),
      old_price: form.old_price
        ? Number(form.old_price)
        : null,
      stock: form.stock ? Number(form.stock) : 0,
      description: form.description.trim() || null,
      images: form.images,
      is_new: form.is_new,
      is_restocked: form.is_restocked,
      is_sale: form.is_sale,
      featured: form.featured,
      status: form.status,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);

      if (error) {
        console.error(error);

        setErrorMessage(
          `No se pudo actualizar el producto: ${error.message}`
        );

        setSaving(false);
        return;
      }

      setSuccessMessage("Producto actualizado correctamente.");
    } else {
      const { error } = await supabase
        .from("products")
        .insert(productData);

      if (error) {
        console.error(error);

        setErrorMessage(
          `No se pudo crear el producto: ${error.message}`
        );

        setSaving(false);
        return;
      }

      setSuccessMessage("Producto creado correctamente.");
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);

    await loadProducts();

    setSaving(false);
  }

  async function changeStatus(
    id: number,
    status: ProductStatus
  ) {
    setActionId(id);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase
      .from("products")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setErrorMessage(
        `No se pudo cambiar el estado: ${error.message}`
      );

      setActionId(null);
      return;
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              status,
            }
          : product
      )
    );

    setActionId(null);
  }

  async function deleteProduct(id: number) {
    const selected = products.find(
      (product) => product.id === id
    );

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${
        selected?.name || "este producto"
      }"?`
    );

    if (!confirmed) {
      return;
    }

    setActionId(id);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      setErrorMessage(
        `No se pudo eliminar: ${error.message}`
      );

      setActionId(null);
      return;
    }

    setProducts((current) =>
      current.filter(
        (product) => product.id !== id
      )
    );

    setActionId(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const statistics = useMemo(() => {
    return {
      total: products.length,

      available: products.filter(
        (product) =>
          product.status === "Disponible"
      ).length,

      outOfStock: products.filter(
        (product) =>
          product.status === "Agotado"
      ).length,

      hidden: products.filter(
        (product) =>
          product.status === "Oculto"
      ).length,
    };
  }, [products]);

  function statusClass(status: ProductStatus) {
    if (status === "Disponible") {
      return "bg-emerald-500/10 text-emerald-400";
    }

    if (status === "Agotado") {
      return "bg-red-500/10 text-red-400";
    }

    return "bg-zinc-700 text-zinc-300";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
        <p className="text-zinc-400">
          Cargando inventario...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-4">
            <img
              src="/logo-pichardo.png"
              alt="Pichardo Vape Shop"
              className="h-20 w-20 object-contain"
            />

            <div>
              <p className="text-sm font-black uppercase tracking-widest text-red-500">
                Administración
              </p>

              <h1 className="mt-1 text-3xl font-black">
                Inventario
              </h1>

              <p className="mt-1 text-zinc-500">
                Pichardo Vape Shop
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={openNewProductForm}
              className="rounded-xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-500"
            >
              + Agregar producto
            </button>

            <button
              type="button"
              onClick={loadProducts}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold hover:border-red-500"
            >
              Actualizar
            </button>

            <a
              href="/admin/marcas"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold hover:border-red-500"
            >
              Marcas
            </a>

            <a
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold hover:border-red-500"
            >
              Ver página
            </a>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-zinc-800 px-4 py-3 font-bold hover:bg-zinc-700"
            >
              Cerrar sesión
            </button>

          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
            {successMessage}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-sm text-zinc-500">
              Total
            </p>

            <p className="mt-2 text-3xl font-black">
              {statistics.total}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-sm text-zinc-500">
              Disponibles
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-400">
              {statistics.available}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-sm text-zinc-500">
              Agotados
            </p>

            <p className="mt-2 text-3xl font-black text-red-500">
              {statistics.outOfStock}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-sm text-zinc-500">
              Ocultos
            </p>

            <p className="mt-2 text-3xl font-black text-zinc-400">
              {statistics.hidden}
            </p>
          </div>

        </div>

        {showForm && (
          <form
            id="product-form"
            onSubmit={saveProduct}
            className="mb-10 rounded-3xl border border-red-500/20 bg-[#111111] p-6 md:p-8"
          >

            <div className="mb-6 flex items-center justify-between">

              <div>
                <p className="text-sm font-black uppercase tracking-widest text-red-500">
                  Producto
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {editingId
                    ? "Editar producto"
                    : "Agregar producto"}
                </h2>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-4 py-2 text-zinc-400 hover:text-white"
              >
                Cerrar
              </button>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Nombre *
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Marca *
                </label>

                <select
                  value={form.brand}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      brand: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="">Seleccionar marca</option>

                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.name}>
                      {brand.name}
                    </option>
                  ))}
                </select>

                {brands.length === 0 && (
                  <p className="mt-2 text-xs text-amber-400">
                    No hay marcas activas. Créala primero en Marcas.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Categoría
                </label>

                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="Desechables">
                    Desechables
                  </option>

                  <option value="Pods">
                    Pods
                  </option>

                  <option value="Equipos">
                    Equipos
                  </option>

                  <option value="Líquidos">
                    Líquidos
                  </option>

                  <option value="Hookah">
                    Hookah
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Sabor
                </label>

                <input
                  value={form.flavor}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      flavor: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Puffs
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.puffs}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      puffs: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      stock: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Precio RD$ *
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      price: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Precio anterior
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.old_price}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      old_price: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Estado
                </label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status:
                        event.target.value as ProductStatus,
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
                >
                  <option value="Disponible">
                    Disponible
                  </option>

                  <option value="Agotado">
                    Agotado
                  </option>

                  <option value="Oculto">
                    Oculto
                  </option>
                </select>
              </div>

              {/* MULTI IMÁGENES */}
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Imágenes del producto
                </label>

                <label className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-black p-5 text-center transition hover:border-red-500">

                  <span className="text-3xl">
                    📷
                  </span>

                  <span className="mt-2 font-black">
                    {uploadingImages
                      ? "Subiendo imágenes..."
                      : "Seleccionar imágenes"}
                  </span>

                  <span className="mt-1 text-xs text-zinc-500">
                    Hasta 6 imágenes
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    disabled={uploadingImages}
                    onChange={async (event) => {
                      const files = event.target.files;

                      if (!files) {
                        return;
                      }

                      await uploadProductImages(files);

                      event.target.value = "";
                    }}
                    className="hidden"
                  />

                </label>

              </div>

            </div>

            {/* GALERÍA ADMIN */}
            {form.images.length > 0 && (
              <div className="mt-6">

                <div className="mb-3 flex items-center justify-between">
                  <p className="font-black">
                    Imágenes
                  </p>

                  <p className="text-sm text-zinc-500">
                    {form.images.length}/6
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

                  {form.images.map(
                    (image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="relative overflow-hidden rounded-xl border border-white/10 bg-black p-2"
                      >

                        {index === 0 && (
                          <span className="absolute left-2 top-2 z-10 rounded-md bg-red-600 px-2 py-1 text-[10px] font-black">
                            PRINCIPAL
                          </span>
                        )}

                        <img
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          className="h-32 w-full rounded-lg object-contain"
                        />

                        <div className="mt-2 grid gap-2">

                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                makeMainImage(index)
                              }
                              className="rounded-lg border border-white/10 px-2 py-2 text-xs font-bold hover:border-red-500"
                            >
                              Hacer principal
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              removeImage(index)
                            }
                            className="rounded-lg bg-red-500/10 px-2 py-2 text-xs font-bold text-red-400"
                          >
                            Quitar
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-bold">
                Descripción
              </label>

              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black p-4">
                <input
                  type="checkbox"
                  checked={form.is_new}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_new: event.target.checked,
                    })
                  }
                />

                <span className="font-bold">
                  Nuevo
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black p-4">
                <input
                  type="checkbox"
                  checked={form.is_restocked}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_restocked:
                        event.target.checked,
                    })
                  }
                />

                <span className="font-bold">
                  De vuelta
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black p-4">
                <input
                  type="checkbox"
                  checked={form.is_sale}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_sale: event.target.checked,
                    })
                  }
                />

                <span className="font-bold">
                  Oferta
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black p-4">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      featured: event.target.checked,
                    })
                  }
                />

                <span className="font-bold">
                  Destacado
                </span>
              </label>

            </div>

            <button
              type="submit"
              disabled={
                saving ||
                uploadingImages
              }
              className="mt-7 rounded-xl bg-red-600 px-7 py-4 font-black text-white disabled:opacity-50"
            >
              {saving
                ? "Guardando..."
                : editingId
                  ? "Guardar cambios"
                  : "Crear producto"}
            </button>

          </form>
        )}

        {products.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#111111] p-12 text-center">

            <h2 className="text-2xl font-black">
              No hay productos
            </h2>

            <button
              type="button"
              onClick={openNewProductForm}
              className="mt-6 rounded-xl bg-red-600 px-5 py-3 font-black"
            >
              + Agregar producto
            </button>

          </div>
        ) : (
          <div className="grid gap-5">

            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-2xl border border-white/10 bg-[#111111] p-5"
              >

                <div className="flex flex-col justify-between gap-6 lg:flex-row">

                  <div className="flex flex-col gap-5 sm:flex-row">

                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-44 w-full rounded-xl bg-black object-contain sm:w-48"
                      />
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center rounded-xl bg-black text-zinc-600 sm:w-48">
                        Sin foto
                      </div>
                    )}

                    <div>

                      <div className="flex flex-wrap gap-2">

                        <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm font-bold text-red-400">
                          {product.category}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-bold ${statusClass(
                            product.status
                          )}`}
                        >
                          {product.status}
                        </span>

                        {product.images?.length > 1 && (
                          <span className="rounded-full bg-violet-600/20 px-3 py-1 text-sm font-bold text-violet-300">
                            {product.images.length} fotos
                          </span>
                        )}

                      </div>

                      <h2 className="mt-3 text-2xl font-black">
                        {product.name}
                      </h2>

                      <p className="mt-1 text-zinc-500">
                        {product.brand}
                      </p>

                      <p className="mt-3 text-2xl font-black text-red-500">
                        RD$
                        {Number(
                          product.price
                        ).toLocaleString("es-DO")}
                      </p>

                      <p className="mt-2 text-sm text-zinc-400">
                        Stock: {product.stock}
                      </p>

                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        editProduct(product)
                      }
                      className="rounded-xl bg-blue-600 px-4 py-3 font-bold"
                    >
                      Editar
                    </button>

                    {product.status !==
                      "Disponible" && (
                      <button
                        type="button"
                        disabled={
                          actionId === product.id
                        }
                        onClick={() =>
                          changeStatus(
                            product.id,
                            "Disponible"
                          )
                        }
                        className="rounded-xl bg-emerald-600 px-4 py-3 font-bold disabled:opacity-50"
                      >
                        Disponible
                      </button>
                    )}

                    {product.status !== "Agotado" && (
                      <button
                        type="button"
                        disabled={
                          actionId === product.id
                        }
                        onClick={() =>
                          changeStatus(
                            product.id,
                            "Agotado"
                          )
                        }
                        className="rounded-xl bg-amber-600 px-4 py-3 font-bold disabled:opacity-50"
                      >
                        Agotado
                      </button>
                    )}

                    {product.status !== "Oculto" && (
                      <button
                        type="button"
                        disabled={
                          actionId === product.id
                        }
                        onClick={() =>
                          changeStatus(
                            product.id,
                            "Oculto"
                          )
                        }
                        className="rounded-xl bg-zinc-700 px-4 py-3 font-bold disabled:opacity-50"
                      >
                        Ocultar
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={
                        actionId === product.id
                      }
                      onClick={() =>
                        deleteProduct(product.id)
                      }
                      className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-bold text-red-400 disabled:opacity-50"
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