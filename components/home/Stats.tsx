import {
  Building2,
  Eye,
  MapPinned,
  MessageCircle,
} from "lucide-react";

type StatsProps = {
  properties: number;
  views: number;
  whatsappClicks: number;
  zones: number;
};

export default function Stats({
  properties,
  views,
  whatsappClicks,
  zones,
}: StatsProps) {
  const items = [
    {
      label: "Propiedades aprobadas",
      value: properties,
      icon: Building2,
    },
    {
      label: "Visitas acumuladas",
      value: views,
      icon: Eye,
    },
    {
      label: "Contactos por WhatsApp",
      value: whatsappClicks,
      icon: MessageCircle,
    },
    {
      label: "Zonas disponibles",
      value: zones,
      icon: MapPinned,
    },
  ];

  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 md:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="bg-slate-950 px-5 py-8 text-center"
            >
              <Icon
                className="mx-auto text-emerald-400"
                size={26}
              />
              <p className="mt-3 text-2xl font-black md:text-3xl">
                {item.value.toLocaleString("es-DO")}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400 md:text-sm">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
