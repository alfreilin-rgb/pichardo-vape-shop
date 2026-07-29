"use client";

import {
  Building2,
  Heart,
  Menu,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

type HeaderProps = {
  favoriteCount: number;
};

export default function Header({
  favoriteCount,
}: HeaderProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#propiedades", label: "Comprar" },
    { href: "/#propiedades", label: "Alquilar" },
    { href: "/mapa", label: "Mapa" },
    { href: "/mis-propiedades", label: "Mis propiedades" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <a href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <Building2 size={24} />
          </span>

          <span>
            <span className="block text-xl font-black tracking-tight text-slate-950">
              PuntaHogar
            </span>
            <span className="block text-xs font-medium text-slate-500">
              Verón · Bávaro · Punta Cana
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-slate-700 transition hover:text-emerald-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="/favoritos"
            className="relative inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <Heart size={19} />
            Favoritos
            {favoriteCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-100 px-1.5 text-xs font-bold text-emerald-800">
                {favoriteCount}
              </span>
            )}
          </a>

          <a
            href="/admin"
            className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <ShieldCheck size={19} />
            Admin
          </a>

          <a
            href="/publicar"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={19} />
            Publicar gratis
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-800 md:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100"
              >
                {link.label}
              </a>
            ))}

            <a
              href="/favoritos"
              className="rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100"
            >
              Favoritos ({favoriteCount})
            </a>

            <a
              href="/admin"
              className="rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100"
            >
              Administrar
            </a>

            <a
              href="/publicar"
              className="mt-2 rounded-xl bg-emerald-600 px-4 py-3 text-center font-bold text-white"
            >
              Publicar gratis
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
