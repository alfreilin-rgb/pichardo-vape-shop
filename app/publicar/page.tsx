"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { getOwnerToken } from "../lib/puntahogar";
import PropertyLocationMap from "../components/PropertyLocationMap";
import PropertyImageUploader from "../components/PropertyImageUploader";

export default function PublicarPropiedad() {
  const [tipoUbicacion, setTipoUbicacion] = useState<
    "exacta" | "aproximada"
  >("aproximada");

  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (propertyImages.length === 0) {
      alert("Debes subir al menos una fotografía.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const ownerToken = getOwnerToken();

    setIsSubmitting(true);

    const latitudeValue = String(
      formData.get("latitude") || "",
    ).trim();

    const longitudeValue = String(
      formData.get("longitude") || "",
    ).trim();

    const { error } = await supabase
      .from("properties")
      .insert({
        operation: String(
          formData.get("operation") || "",
        ),
        property_type: String(
          formData.get("propertyType") || "",
        ),
        title: String(formData.get("title") || ""),
        price: Number(formData.get("price") || 0),
        currency: String(
          formData.get("currency") || "",
        ),
        bedrooms: Number(
          formData.get("bedrooms") || 0,
        ),
        bathrooms: Number(
          formData.get("bathrooms") || 0,
        ),
        parking: Number(
          formData.get("parking") || 0,
        ),
        meters: Number(formData.get("meters") || 0),
        zone: String(formData.get("zone") || ""),
        reference: String(
          formData.get("reference") || "",
        ),
        location_type: tipoUbicacion,
        latitude: latitudeValue
          ? Number(latitudeValue)
          : null,
        longitude: longitudeValue
          ? Number(longitudeValue)
          : null,
        description: String(
          formData.get("description") || "",
        ),
        images: propertyImages,
        contact_name: String(
          formData.get("contactName") || "",
        ),
        whatsapp: String(
          formData.get("whatsapp") || "",
        ),
        email: String(formData.get("email") || ""),
        status: "Pendiente",
        owner_token: ownerToken,
      });

    if (error) {
      console.error("Error de Supabase:", error);

      alert(
        `No se pudo guardar la propiedad: ${error.message}`,
      );

      setIsSubmitting(false);
      return;
    }

    alert(
      "Propiedad enviada correctamente y guardada en Supabase.",
    );

    form.reset();
    setPropertyImages([]);
    setTipoUbicacion("aproximada");

    window.location.href = "/mis-propiedades";
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <a
          href="/"
          className="mb-6 inline-block font-medium text-blue-700 hover:underline"
        >
          ← Volver al inicio
        </a>

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Publicación gratuita
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Publica una propiedad
            </h1>

            <p className="mt-3 text-slate-600">
              Completa la información. La propiedad será revisada antes de
              aparecer públicamente.
            </p>
          </div>

          <form
            className="space-y-8"
            onSubmit={handleSubmit}
          >
            <section>
              <h2 className="mb-4 text-xl font-bold">
                Información principal
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-2 block font-medium">
                    Tipo de operación
                  </span>

                  <select
                    name="operation"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  >
                    <option value="Alquiler">
                      Alquiler
                    </option>
                    <option value="Venta">Venta</option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block font-medium">
                    Tipo de propiedad
                  </span>

                  <select
                    name="propertyType"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  >
                    <option value="Apartamento">
                      Apartamento
                    </option>
                    <option value="Casa">Casa</option>
                    <option value="Villa">Villa</option>
                    <option value="Penthouse">
                      Penthouse
                    </option>
                    <option value="Solar">Solar</option>
                    <option value="Local comercial">
                      Local comercial
                    </option>
                  </select>
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block font-medium">
                    Título del anuncio
                  </span>

                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Ejemplo: Apartamento de 2 habitaciones en Verón"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>

                <label>
                  <span className="mb-2 block font-medium">
                    Precio
                  </span>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    required
                    placeholder="22000"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>

                <label>
                  <span className="mb-2 block font-medium">
                    Moneda
                  </span>

                  <select
                    name="currency"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  >
                    <option value="RD$">
                      Pesos dominicanos — RD$
                    </option>
                    <option value="US$">
                      Dólares — US$
                    </option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block font-medium">
                    Habitaciones
                  </span>

                  <input
                    type="number"
                    name="bedrooms"
                    min="0"
                    placeholder="2"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>

                <label>
                  <span className="mb-2 block font-medium">
                    Baños
                  </span>

                  <input
                    type="number"
                    name="bathrooms"
                    min="0"
                    step="0.5"
                    placeholder="2"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>

                <label>
                  <span className="mb-2 block font-medium">
                    Parqueos
                  </span>

                  <input
                    type="number"
                    name="parking"
                    min="0"
                    placeholder="1"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>

                <label>
                  <span className="mb-2 block font-medium">
                    Metros cuadrados
                  </span>

                  <input
                    type="number"
                    name="meters"
                    min="0"
                    placeholder="85"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold">
                Ubicación
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-2 block font-medium">
                    Zona
                  </span>

                  <select
                    name="zone"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  >
                    <option value="Verón">Verón</option>
                    <option value="Bávaro">Bávaro</option>
                    <option value="Pueblo Bávaro">
                      Pueblo Bávaro
                    </option>
                    <option value="Friusa">Friusa</option>
                    <option value="Downtown Punta Cana">
                      Downtown Punta Cana
                    </option>
                    <option value="Punta Cana Village">
                      Punta Cana Village
                    </option>
                    <option value="Los Corales">
                      Los Corales
                    </option>
                    <option value="El Cortecito">
                      El Cortecito
                    </option>
                    <option value="Cabeza de Toro">
                      Cabeza de Toro
                    </option>
                    <option value="Macao">Macao</option>
                    <option value="Uvero Alto">
                      Uvero Alto
                    </option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block font-medium">
                    Residencial o referencia
                  </span>

                  <input
                    type="text"
                    name="reference"
                    placeholder="Ejemplo: Residencial Ciudad del Sol"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
              </div>

              <div className="mt-6">
                <p className="mb-3 font-medium">
                  ¿Cómo deseas mostrar la ubicación?
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <label
                    className={`cursor-pointer rounded-xl border p-4 ${
                      tipoUbicacion === "aproximada"
                        ? "border-blue-700 bg-blue-50"
                        : "border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="ubicacion"
                      value="aproximada"
                      checked={
                        tipoUbicacion === "aproximada"
                      }
                      onChange={() =>
                        setTipoUbicacion("aproximada")
                      }
                      className="mr-2"
                    />

                    <span className="font-semibold">
                      Ubicación aproximada
                    </span>

                    <p className="mt-2 text-sm text-slate-600">
                      Los visitantes verán solamente el sector o un punto
                      aproximado.
                    </p>
                  </label>

                  <label
                    className={`cursor-pointer rounded-xl border p-4 ${
                      tipoUbicacion === "exacta"
                        ? "border-blue-700 bg-blue-50"
                        : "border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="ubicacion"
                      value="exacta"
                      checked={tipoUbicacion === "exacta"}
                      onChange={() =>
                        setTipoUbicacion("exacta")
                      }
                      className="mr-2"
                    />

                    <span className="font-semibold">
                      Ubicación exacta
                    </span>

                    <p className="mt-2 text-sm text-slate-600">
                      Se mostrará el punto exacto seleccionado en el mapa.
                    </p>
                  </label>
                </div>

                <div className="mt-5">
                  <PropertyLocationMap
                    locationType={tipoUbicacion}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold">
                Descripción y fotografías
              </h2>

              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block font-medium">
                    Descripción
                  </span>

                  <textarea
                    name="description"
                    rows={6}
                    required
                    placeholder="Describe la propiedad, sus condiciones, servicios incluidos y características principales..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>

                <PropertyImageUploader
                  onImagesChange={setPropertyImages}
                />
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold">
                Información de contacto
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-2 block font-medium">
                    Nombre o inmobiliaria
                  </span>

                  <input
                    type="text"
                    name="contactName"
                    required
                    placeholder="Nombre del propietario o empresa"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>

                <label>
                  <span className="mb-2 block font-medium">
                    Número de WhatsApp
                  </span>

                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    placeholder="809-000-0000"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block font-medium">
                    Correo electrónico
                  </span>

                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="correo@ejemplo.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </label>
              </div>
            </section>

            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              La propiedad no se publicará inmediatamente. Primero será
              revisada para evitar anuncios falsos o información incompleta.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting
                ? "Enviando propiedad..."
                : "Enviar propiedad para revisión"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
