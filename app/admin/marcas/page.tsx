"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";


type Brand = {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  active: boolean;
};

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      setMessage(`Error cargando marcas: ${error.message}`);
      return;
    }

    setBrands((data || []) as Brand[]);
  }

  async function uploadLogo(file: File) {
    setUploading(true);
    setMessage("");

    try {
      if (!file.type.startsWith("image/")) {
        setMessage("Selecciona una imagen válida.");
        return;
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "png";

      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${extension}`;

      const { error } = await supabase.storage
        .from("brands")
        .upload(fileName, file, {
          upsert: false,
          contentType: file.type,
          cacheControl: "3600",
        });

      if (error) {
        console.error(error);
        setMessage(`No se pudo subir el logo: ${error.message}`);
        return;
      }

      const { data } = supabase.storage
        .from("brands")
        .getPublicUrl(fileName);

      setLogo(data.publicUrl);
      setMessage("Logo subido correctamente.");
    } catch (error) {
      console.error(error);
      setMessage("Ocurrió un error al subir el logo.");
    } finally {
      setUploading(false);
    }
  }

  async function createBrand(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Escribe el nombre de la marca.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("brands")
      .insert({
        name: name.trim(),
        logo: logo || null,
        description: description.trim() || null,
        active: true,
      });

    if (error) {
      console.error(error);
      setMessage(`No se pudo crear la marca: ${error.message}`);
      setSaving(false);
      return;
    }

    setName("");
    setDescription("");
    setLogo("");
    setMessage("Marca creada correctamente.");

    await loadBrands();
    setSaving(false);
  }

  async function deleteBrand(id: number) {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar esta marca?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage(`No se pudo eliminar: ${error.message}`);
      return;
    }

    setBrands((current) =>
      current.filter((brand) => brand.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-500">
              Administración
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Marcas
            </h1>

            <p className="mt-2 text-zinc-500">
              Crea las marcas que aparecerán en el catálogo.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/admin"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:border-red-500"
            >
              ← Inventario
            </a>

            <a
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:border-red-500"
            >
              Ver tienda
            </a>
          </div>

        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-white/10 bg-[#111111] p-4 text-zinc-300">
            {message}
          </div>
        )}

        <form
          onSubmit={createBrand}
          className="rounded-3xl border border-red-500/20 bg-[#111111] p-6 md:p-8"
>
          <h2 className="text-2xl font-black">
            Nueva marca
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block font-bold">
                Nombre *
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej: Geek Bar"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">
                Logo
              </label>

              <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-black p-4 text-center transition hover:border-red-500">

                <span className="text-3xl">
                  📷
                </span>

                <span className="mt-2 font-black">
                  {uploading
                    ? "Subiendo..."
                    : "Seleccionar logo"}
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  disabled={uploading}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];

                    if (!file) return;

                    await uploadLogo(file);

                    event.target.value = "";
                  }}
                  className="hidden"
                />

              </label>
            </div>

          </div>

          {logo && (
            <div className="mt-6">

              <p className="mb-3 text-sm font-bold text-zinc-500">
                Vista previa
              </p>

              <div className="flex h-40 w-64 items-center justify-center rounded-xl bg-white p-5">

                <img
                  src={logo}
                  alt="Vista previa"
                  className="max-h-full max-w-full object-contain"
                />

              </div>

            </div>
          )}

          <div className="mt-5">
            <label className="mb-2 block font-bold">
              Descripción
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={3}
              placeholder="Descripción opcional de la marca..."
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="mt-6 rounded-xl bg-red-600 px-7 py-4 font-black transition hover:bg-red-500 disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : "Crear marca"}
          </button>

        </form>

        <section className="mt-12">

          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-500">
              Marcas creadas
            </p>

            <h2 className="mt-2 text-3xl font-black">
              {brands.length} marca(s)
            </h2>
          </div>

          {brands.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {brands.map((brand) => (
                <article
                  key={brand.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
                >

                  <div className="flex h-44 items-center justify-center bg-white p-6">

                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-full max-w-[80%] object-contain"
                      />
                    ) : (
                      <span className="text-xl font-black text-zinc-700">
                        {brand.name}
                      </span>
                    )}

                  </div>

                  <div className="p-5">

                    <h3 className="text-xl font-black">
                      {brand.name}
                    </h3>

                    {brand.description && (
                      <p className="mt-2 text-sm leading-6 text-zinc-500">
                        {brand.description}
                      </p>
                    )}

                    <div className="mt-5 flex gap-2">

                      <a
                        href={`/marca/${encodeURIComponent(
                          brand.name
                        )}`}
                        className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-center font-bold"
                      >
                        Ver marca
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          deleteBrand(brand.id)
                        }
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-bold text-red-400"
                      >
                        Eliminar
                      </button>

                    </div>

                  </div>

                </article>
              ))}

            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center text-zinc-500">
              Todavía no has creado ninguna marca.
            </div>
          )}

        </section>

      </div>
    </main>
  );
}