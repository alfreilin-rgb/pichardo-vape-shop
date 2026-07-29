export type PropertyStatus =
  | "Pendiente"
  | "Aprobada"
  | "Rechazada";

export type Property = {
  id: number;
  operation: string;
  property_type: string;
  title: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  meters: number;
  zone: string;
  reference: string | null;
  location_type: "exacta" | "aproximada";
  latitude: number | null;
  longitude: number | null;
  description: string;
  images: string[];
  contact_name: string;
  whatsapp: string;
  email: string;
  status: PropertyStatus;
  views: number;
  whatsapp_clicks: number;
  phone_clicks: number;
  owner_token: string | null;
  created_at: string;
  updated_at: string;
};

const DEVICE_COOKIE = "puntahogar_device";
const OWNER_COOKIE = "puntahogar_owner";

function readCookie(name: string) {
  if (typeof document === "undefined") return "";

  const item = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  return item ? decodeURIComponent(item.split("=")[1]) : "";
}

function createToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateCookie(name: string) {
  const existing = readCookie(name);
  if (existing) return existing;

  const token = createToken();
  document.cookie = `${name}=${encodeURIComponent(
    token,
  )}; path=/; max-age=31536000; samesite=lax`;

  return token;
}

export function getDeviceToken() {
  return getOrCreateCookie(DEVICE_COOKIE);
}

export function getOwnerToken() {
  return getOrCreateCookie(OWNER_COOKIE);
}

export function formatPrice(property: Property) {
  return `${property.currency} ${Number(
    property.price,
  ).toLocaleString("es-DO")}`;
}
