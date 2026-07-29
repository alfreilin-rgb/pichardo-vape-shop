"use client";

import {
  Bath,
  BedDouble,
  Camera,
  Car,
  Eye,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
} from "lucide-react";
import {
  formatPrice,
  Property,
} from "@/app/lib/puntahogar";

type PropertyCardProps = {
  property: Property;
  favorite: boolean;
  onFavorite: (id: number) => void;
  onWhatsApp: (property: Property) => void;
};

function relativeDate(value: string) {
  const date = new Date(value);
  const difference = Date.now() - date.getTime();
  const days = Math.max(
    0,
    Math.floor(difference / 86400000),
  );

  if (days === 0) return "Publicado hoy";
  if (days === 1) return "Hace 1 día";
  if (days < 30) return `Hace ${days} días`;

  return date.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
  });
}

export default function PropertyCard({
  property,
  favorite,
  onFavorite,
  onWhatsApp,
}: PropertyCardProps) {
  const image =
    property.images?.[0] ||
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
        <a href={`/propiedad/${property.id}`}>
          <img
            src={image}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </a>

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-950/85 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {property.operation}
          </span>

          <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900 backdrop-blur">
            {property.property_type}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onFavorite(property.id)}
          className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full shadow-sm backdrop-blur transition ${
            favorite
              ? "bg-rose-500 text-white"
              : "bg-white/90 text-slate-800 hover:bg-white"
          }`}
          aria-label="Agregar a favoritos"
        >
          <Heart
            size={21}
            fill={favorite ? "currentColor" : "none"}
          />
        </button>

        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <Camera size={15} />
            {property.images?.length || 0}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <Eye size={15} />
            {property.views || 0}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <MapPin size={17} />
          <span className="truncate">{property.zone}</span>
        </div>

        <a href={`/propiedad/${property.id}`}>
          <h3 className="mt-3 line-clamp-2 min-h-14 text-xl font-black leading-7 text-slate-950 transition group-hover:text-emerald-700">
            {property.title}
          </h3>
        </a>

        <p className="mt-3 text-2xl font-black text-slate-950">
          {formatPrice(property)}
        </p>

        <div className="mt-5 grid grid-cols-4 gap-2 border-y border-slate-100 py-4 text-center text-slate-600">
          <div>
            <BedDouble size={18} className="mx-auto" />
            <span className="mt-1 block text-xs font-bold">
              {property.bedrooms} hab.
            </span>
          </div>
          <div>
            <Bath size={18} className="mx-auto" />
            <span className="mt-1 block text-xs font-bold">
              {property.bathrooms} baños
            </span>
          </div>
          <div>
            <Car size={18} className="mx-auto" />
            <span className="mt-1 block text-xs font-bold">
              {property.parking} parq.
            </span>
          </div>
          <div>
            <Maximize2 size={18} className="mx-auto" />
            <span className="mt-1 block text-xs font-bold">
              {property.meters} m²
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-500">
            {relativeDate(property.created_at)}
          </span>

          <button
            type="button"
            onClick={() => onWhatsApp(property)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <MessageCircle size={17} />
            Contactar
          </button>
        </div>
      </div>
    </article>
  );
}
