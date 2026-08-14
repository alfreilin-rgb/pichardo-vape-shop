"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Camera,
  Car,
  Check,
  ClipboardCheck,
  FileText,
  Home,
  LandPlot,
  MapPin,
  MessageCircle,
  Store,
  Umbrella,
  WalletCards,
} from "lucide-react";
import PropertyImageUploader from "../components/PropertyImageUploader";
import PropertyLocationMap from "../components/PropertyLocationMap";
import { supabase } from "../lib/supabase/client";
import { getOwnerToken } from "../lib/puntahogar";


const steps = [
  "Tipo",
  "Operación",
  "Detalles",
  "Ubicación",
  "Fotos",
  "Descripción",
  "Contacto",
  "Revisión",
];

const propertyTypes = [
  { value: "Apartamento", label: "Apartamento", icon: Building2 },
  { value: "Casa", label: "Casa", icon: Home },
  { value: "Villa", label: "Villa", icon: Umbrella },
  { value: "Penthouse", label: "Penthouse", icon: Building2 },
  { value: "Solar", label: "Solar", icon: LandPlot },
  { value: "Local comercial", label: "Local comercial", icon: Store },
];

const zones = [
  "Verón",
  "Bávaro",
  "Pueblo Bávaro",
  "Friusa",
  "Downtown Punta Cana",
  "Punta Cana Village",
  "Los Corales",
  "El Cortecito",
  "Cabeza de Toro",
  "Macao",
  "Uvero Alto",
];

export default function PublicarPropiedad() {
  const [latitude, setLatitude] = useState(18.5601);
  const [longitude, setLongitude] = useState(-68.3725);
  const [step, setStep] = useState(0);
  const [tipoUbicacion, setTipoUbicacion] = useState<
    "exacta" | "aproximada"
  >("aproximada");
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [propertyType, setPropertyType] = useState("");
  const [operation, setOperation] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("RD$");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parking, setParking] = useState("");
  const [meters, setMeters] = useState("");
  const [zone, setZone] = useState("Verón");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");

  const progress = ((step + 1) / steps.length) * 100;

  const pricePreview = useMemo(() => {
    const amount = Number(price || 0);
    return `${currency}${amount.toLocaleString("es-DO")}`;
  }, [currency, price]);

  function validateStep() {
    if (step === 0 && !propertyType) {
      alert("Selecciona el tipo de propiedad.");
      return false;
    }

    if (step === 1 && !operation) {
      alert("Selecciona si es para venta o alquiler.");
      return false;
    }

    if (
      step === 2 &&
      (!title.trim() || !price || Number(price) <= 0)
    ) {
      alert("Completa el título y el precio.");
      return false;
    }

    if (step === 4 && propertyImages.length === 0) {
      alert("Debes subir al menos una fotografía.");
      return false;
    }

    if (step === 5 && !description.trim()) {
      alert("Escribe una descripción de la propiedad.");
      return false;
    }

    if (
      step === 6 &&
      (!contactName.trim() || !whatsapp.trim() || !email.trim())
    ) {
      alert("Completa la información de contacto.");
      return false;
    }

    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;
    if (!validateStep()) return;

    const formData = new FormData(event.currentTarget);
    const ownerToken = getOwnerToken();

    const latitudeValue = String(formData.get("latitude") || "").trim();
    const longitudeValue = String(formData.get("longitude") || "").trim();

    setIsSubmitting(true);

    const { error } = await supabase.from("properties").insert({
      operation,
      property_type: propertyType,
      title: title.trim(),
      price: Number(price || 0),
      currency,
      bedrooms: Number(bedrooms || 0),
      bathrooms: Number(bathrooms || 0),
      parking: Number(parking || 0),
      meters: Number(meters || 0),
      zone,
      reference: reference.trim(),
      location_type: tipoUbicacion,
      latitude: latitudeValue ? Number(latitudeValue) : null,
      longitude: longitudeValue ? Number(longitudeValue) : null,
      description: description.trim(),
      images: propertyImages,
      contact_name: contactName.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      status: "Pendiente",
      owner_token: ownerToken,
    });

    if (error) {
      console.error("Error de Supabase:", error);
      alert(`No se pudo guardar la propiedad: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    alert("Propiedad enviada correctamente para revisión.");
    window.location.href = "/mis-propiedades";
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:underline"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </a>

          <span className="text-sm font-bold text-slate-500">
            Paso {step + 1} de {steps.length}
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-white px-6 py-6 md:px-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                  Publicación gratuita
                </p>
                <h1 className="mt-2 text-3xl font-black">
                  Publica tu propiedad
                </h1>
              </div>

              <span className="hidden rounded-2xl bg-emerald-100 p-4 text-emerald-700 sm:block">
                <ClipboardCheck size={28} />
              </span>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 hidden grid-cols-8 gap-2 text-center text-xs font-semibold text-slate-500 lg:grid">
              {steps.map((item, index) => (
                <span
                  key={item}
                  className={index <= step ? "text-emerald-700" : ""}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <input type="hidden" name="latitude" value={latitude} />
            <input type="hidden" name="longitude" value={longitude} />
            <div className="min-h-[520px] p-6 md:p-10">
              {step === 0 && (
                <section>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                    Paso 1
                  </p>
                  <h2 className="mt-2 text-3xl font-black">
                    ¿Qué deseas publicar?
                  </h2>
                  <p className="mt-3 text-slate-600">
                    Selecciona el tipo de propiedad.
                  </p>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {propertyTypes.map((item) => {
                      const Icon = item.icon;
                      const active = propertyType === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setPropertyType(item.value)}
                          className={`rounded-2xl border p-6 text-left transition ${
                            active
                              ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200"
                              : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                          }`}
                        >
                          <Icon
                            size={30}
                            className={
                              active
                                ? "text-emerald-700"
                                : "text-slate-500"
                            }
                          />
                          <span className="mt-5 block text-lg font-black">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 1 && (
                <section>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                    Paso 2
                  </p>
                  <h2 className="mt-2 text-3xl font-black">
                    ¿Qué operación deseas realizar?
                  </h2>
                  <p className="mt-3 text-slate-600">
                    Elige si quieres vender o alquilar.
                  </p>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    {[
                      {
                        value: "Venta",
                        title: "Vender",
                        text: "Publica el precio total de venta.",
                        icon: WalletCards,
                      },
                      {
                        value: "Alquiler",
                        title: "Alquilar",
                        text: "Publica el precio mensual del alquiler.",
                        icon: Home,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = operation === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setOperation(item.value)}
                          className={`rounded-3xl border p-8 text-left transition ${
                            active
                              ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200"
                              : "border-slate-200 hover:border-emerald-300"
                          }`}
                        >
                          <Icon
                            size={34}
                            className={
                              active
                                ? "text-emerald-700"
                                : "text-slate-500"
                            }
                          />
                          <h3 className="mt-6 text-2xl font-black">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-slate-600">{item.text}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 2 && (
                <section>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                    Paso 3
                  </p>
                  <h2 className="mt-2 text-3xl font-black">
                    Información principal
                  </h2>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <label className="md:col-span-2">
                      <span className="mb-2 block font-bold">
                        Título del anuncio
                      </span>
                      <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Ejemplo: Apartamento de 2 habitaciones en Verón"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </label>

                    <label>
                      <span className="mb-2 block font-bold">Precio</span>
                      <input
                        type="number"
                        min="0"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="22000"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </label>

                    <label>
                      <span className="mb-2 block font-bold">Moneda</span>
                      <select
                        value={currency}
                        onChange={(event) => setCurrency(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                      >
                        <option value="RD$">Pesos dominicanos — RD$</option>
                        <option value="US$">Dólares — US$</option>
                      </select>
                    </label>

                    {[
                      ["Habitaciones", bedrooms, setBedrooms, BedDouble],
                      ["Baños", bathrooms, setBathrooms, Bath],
                      ["Parqueos", parking, setParking, Car],
                      ["Metros cuadrados", meters, setMeters, Home],
                    ].map(([label, value, setter, Icon]: any) => (
                      <label key={label}>
                        <span className="mb-2 flex items-center gap-2 font-bold">
                          <Icon size={18} />
                          {label}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step={label === "Baños" ? "0.5" : "1"}
                          value={value}
                          onChange={(event) => setter(event.target.value)}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                        />
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {step === 3 && (
                <section>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                    Paso 4
                  </p>
                  <h2 className="mt-2 text-3xl font-black">
                    Ubicación de la propiedad
                  </h2>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <label>
                      <span className="mb-2 block font-bold">Zona</span>
                      <select
                        value={zone}
                        onChange={(event) => setZone(event.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                      >
                        {zones.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-2 block font-bold">
                        Residencial o referencia
                      </span>
                      <input
                        value={reference}
                        onChange={(event) => setReference(event.target.value)}
                        placeholder="Ejemplo: Residencial Ciudad del Sol"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </label>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {[
                      {
                        value: "aproximada",
                        title: "Ubicación aproximada",
                        text: "Protege la privacidad del propietario.",
                      },
                      {
                        value: "exacta",
                        title: "Ubicación exacta",
                        text: "Muestra el punto exacto seleccionado.",
                      },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setTipoUbicacion(
                            item.value as "exacta" | "aproximada",
                          )
                        }
                        className={`rounded-2xl border p-5 text-left ${
                          tipoUbicacion === item.value
                            ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200"
                            : "border-slate-200"
                        }`}
                      >
                        <MapPin
                          size={24}
                          className="text-emerald-700"
                        />
                        <h3 className="mt-3 font-black">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.text}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <PropertyLocationMap
                      locationType={tipoUbicacion}
                      initialLatitude={latitude}
                      initialLongitude={longitude}
                      onLocationChange={(newLatitude, newLongitude) => {
                        setLatitude(newLatitude);
                        setLongitude(newLongitude);
                      }}
                    />
                  </div>
                </section>
              )}

              {step === 4 && (
                <section>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                    Paso 5
                  </p>
                  <h2 className="mt-2 text-3xl font-black">
                    Agrega fotografías
                  </h2>
                  <p className="mt-3 text-slate-600">
                    La primera imagen será la portada del anuncio.
                  </p>

                  <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <Camera className="text-emerald-700" />
                      <span className="font-bold">
                        {propertyImages.length} fotografía(s) seleccionada(s)
                      </span>
                    </div>

                    <PropertyImageUploader
                      onImagesChange={setPropertyImages}
                    />
                  </div>
                </section>
              )}

              {step === 5 && (
                <section>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                    Paso 6
                  </p>
                  <h2 className="mt-2 text-3xl font-black">
                    Describe la propiedad
                  </h2>

                  <div className="mt-8">
                    <label>
                      <span className="mb-2 flex items-center gap-2 font-bold">
                        <FileText size={18} />
                        Descripción
                      </span>
                      <textarea
                        rows={10}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Describe sus características, condiciones, servicios incluidos, amenidades y cualquier información importante..."
                        className="w-full rounded-2xl border border-slate-300 px-4 py-4 outline-none focus:border-emerald-500"
                      />
                    </label>

                    <p className="mt-3 text-sm text-slate-500">
                      {description.length} caracteres
                    </p>
                  </div>
                </section>
              )}

              {step === 6 && (
                <section>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                    Paso 7
                  </p>
                  <h2 className="mt-2 text-3xl font-black">
                    Información de contacto
                  </h2>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <label>
                      <span className="mb-2 block font-bold">
                        Nombre o inmobiliaria
                      </span>
                      <input
                        value={contactName}
                        onChange={(event) =>
                          setContactName(event.target.value)
                        }
                        placeholder="Nombre del propietario o empresa"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </label>

                    <label>
                      <span className="mb-2 flex items-center gap-2 font-bold">
                        <MessageCircle size={18} />
                        Número de WhatsApp
                      </span>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(event) => setWhatsapp(event.target.value)}
                        placeholder="809-000-0000"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </label>

                    <label className="md:col-span-2">
                      <span className="mb-2 block font-bold">
                        Correo electrónico
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                      />
                    </label>
                  </div>

                  <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
                    No necesitas crear una cuenta. Este navegador conservará
                    acceso a la sección “Mis propiedades”.
                  </div>
                </section>
              )}

              {step === 7 && (
                <section>
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
                    Paso 8
                  </p>
                  <h2 className="mt-2 text-3xl font-black">
                    Revisa antes de enviar
                  </h2>

                  <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
                    {propertyImages[0] ? (
                      <img
                        src={propertyImages[0]}
                        alt="Vista previa"
                        className="h-72 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-72 items-center justify-center bg-slate-100 text-slate-400">
                        Sin fotografía
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                          {operation}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                          {propertyType}
                        </span>
                      </div>

                      <h3 className="mt-5 text-2xl font-black">
                        {title || "Título de la propiedad"}
                      </h3>

                      <p className="mt-2 text-3xl font-black text-emerald-700">
                        {pricePreview}
                      </p>

                      <p className="mt-3 flex items-center gap-2 text-slate-600">
                        <MapPin size={18} />
                        {zone}
                        {reference ? ` · ${reference}` : ""}
                      </p>

                      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          ["Habitaciones", bedrooms || "0"],
                          ["Baños", bathrooms || "0"],
                          ["Parqueos", parking || "0"],
                          ["Metros", `${meters || "0"} m²`],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl bg-slate-50 p-4 text-center"
                          >
                            <p className="text-xl font-black">{value}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                        El anuncio quedará pendiente hasta que el administrador
                        revise la información.
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-5 md:px-10">
              <button
                type="button"
                onClick={previousStep}
                disabled={step === 0 || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={18} />
                Atrás
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
                >
                  Continuar
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700 disabled:bg-slate-400"
                >
                  <Check size={18} />
                  {isSubmitting
                    ? "Enviando..."
                    : "Enviar para revisión"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}