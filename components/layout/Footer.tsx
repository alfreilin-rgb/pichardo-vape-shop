import {
  Building2,
  Mail,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600">
              <Building2 size={23} />
            </span>
            <span className="text-xl font-black">
              PuntaHogar
            </span>
          </div>

          <p className="mt-5 max-w-md leading-7 text-slate-400">
            Conectamos personas con propiedades en Verón,
            Bávaro y Punta Cana de una forma sencilla,
            rápida y segura.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-white">Explorar</h3>
          <div className="mt-4 grid gap-3 text-sm">
            <a href="/#propiedades" className="hover:text-white">
              Propiedades
            </a>
            <a href="/mapa" className="hover:text-white">
              Ver en mapa
            </a>
            <a href="/favoritos" className="hover:text-white">
              Favoritos
            </a>
            <a href="/publicar" className="hover:text-white">
              Publicar propiedad
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white">Contacto</h3>
          <div className="mt-4 grid gap-3 text-sm">
            <span className="flex items-center gap-2">
              <MapPin size={17} />
              Punta Cana, R.D.
            </span>
            <span className="flex items-center gap-2">
              <Mail size={17} />
              contacto@puntahogar.com
            </span>
      <div className="mt-2 text-sm text-slate-400">
  Síguenos próximamente en nuestras redes sociales.
</div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} PuntaHogar. Todos los
        derechos reservados.
      </div>
    </footer>
  );
}
