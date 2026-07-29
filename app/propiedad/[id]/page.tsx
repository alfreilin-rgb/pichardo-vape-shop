"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PropertyLocationMap from "../../components/PropertyLocationMap";
import { supabase } from "../../lib/supabase/client";
import { formatPrice, Property } from "../../lib/puntahogar";

export default function PropertyDetailPage() {
  const params = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperty();
  }, [params.id]);

  async function loadProperty() {
    const id = Number(params.id);

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .eq("status", "Aprobada")
      .single();

    if (error || !data) {
      setProperty(null);
      setLoading(false);
      return;
    }

    const current = data as Property;
    const viewedKey = `puntahogar-viewed-${id}`;

    if (!sessionStorage.getItem(viewedKey)) {
      const newViews = (current.views || 0) + 1;
      await supabase
        .from("properties")
        .update({ views: newViews })
        .eq("id", id);

      current.views = newViews;
      sessionStorage.setItem(viewedKey, "1");
    }

    setProperty(current);
    setSelectedImage(current.images?.[0] || "");
    setLoading(false);
  }

  async function contactWhatsApp() {
    if (!property) return;

    await supabase
      .from("properties")
      .update({
        whatsapp_clicks: (property.whatsapp_clicks || 0) + 1,
      })
      .eq("id", property.id);

    let number = property.whatsapp.replace(/\D/g, "");
    if (number.length === 10) number = `1${number}`;

    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(
        `Hola, estoy interesado en ${property.title}.`,
      )}`,
      "_blank",
    );
  }

  async function registerPhone() {
    if (!property) return;

    await supabase
      .from("properties")
      .update({
        phone_clicks: (property.phone_clicks || 0) + 1,
      })
      .eq("id", property.id);
  }

  if (loading) return <main className="p-10 text-center">Cargando...</main>;

  if (!property) {
    return (
      <main className="p-10 text-center">
        <h1 className="text-3xl font-bold">Propiedad no encontrada</h1>
        <a href="/" className="mt-5 inline-block text-blue-700">Volver</a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <a href="/" className="font-semibold text-blue-700 hover:underline">← Volver</a>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
              {selectedImage ? (
                <img src={selectedImage} alt={property.title} className="h-[500px] w-full rounded-xl object-cover" />
              ) : (
                <div className="flex h-96 items-center justify-center bg-slate-200">Sin fotografía</div>
              )}

              {property.images?.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {property.images.map((image) => (
                    <button key={image} onClick={() => setSelectedImage(image)}>
                      <img src={image} alt="" className="h-24 w-full rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm">
              <p className="font-semibold text-blue-700">{property.zone}</p>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">{property.title}</h1>
              <p className="mt-5 text-3xl font-bold text-blue-700">
                {formatPrice(property)}
              </p>
              <p className="mt-4 text-sm font-medium text-slate-600">
                👁 {property.views || 0} visitas
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 border-y border-slate-200 py-6 text-center text-slate-800 sm:grid-cols-4">
                <div><strong>{property.bedrooms}</strong><br />Habitaciones</div>
                <div><strong>{property.bathrooms}</strong><br />Baños</div>
                <div><strong>{property.parking}</strong><br />Parqueos</div>
                <div><strong>{property.meters}</strong><br />m²</div>
              </div>
              <h2 className="mt-8 text-2xl font-bold text-slate-900">Descripción</h2>
              <p className="mt-4 whitespace-pre-line leading-7 text-slate-700">
                {property.description}
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Ubicación</h2>
              <div className="mt-5">
                <PropertyLocationMap
                  locationType={property.location_type}
                  initialLatitude={property.latitude || 18.5601}
                  initialLongitude={property.longitude || -68.3725}
                  readOnly
                />
              </div>
            </div>
          </div>

          <aside className="sticky top-6 h-fit rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Publicado por</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{property.contact_name}</p>
            <button
              onClick={contactWhatsApp}
              className="mt-6 w-full rounded-xl bg-green-600 px-5 py-4 font-semibold text-white hover:bg-green-700"
            >
              Contactar por WhatsApp
            </button>
            <a
              href={`tel:${property.whatsapp}`}
              onClick={registerPhone}
              className="mt-3 block rounded-xl border border-slate-300 bg-white px-5 py-4 text-center font-semibold text-slate-900 hover:bg-slate-100"
            >
              Llamar
            </a>
          </aside>
        </div>
      </div>
    </main>
  );
}