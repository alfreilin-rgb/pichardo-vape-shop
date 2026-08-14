"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setErrorMessage("");

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error || !data.user) {
        setErrorMessage(
          error?.message ||
            "No se pudo iniciar sesión."
        );
        return;
      }

      const { data: adminRecord, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

      if (adminError || !adminRecord) {
        await supabase.auth.signOut();

        setErrorMessage(
          "Esta cuenta existe, pero no tiene permisos de administrador."
        );
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error("Error iniciando sesión:", error);

      setErrorMessage(
        "No se pudo conectar con el servidor. Inténtalo de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-4 py-10 text-white">
      <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-red-600/20 blur-[120px]" />
      <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-red-900/20 blur-[120px]" />

      <div className="relative w-full max-w-md rounded-3xl border border-red-500/20 bg-[#111111] p-7 shadow-2xl md:p-10">
        <a
          href="/"
          className="text-sm font-bold text-zinc-400 transition hover:text-red-500"
        >
          ← Volver a la tienda
        </a>

        <div className="mt-8 text-center">
          <img
            src="/logo-pichardo.png"
            alt="Pichardo Vape Shop"
            className="mx-auto h-28 w-28 object-contain"
          />

          <p className="mt-5 text-sm font-black uppercase tracking-[0.25em] text-red-500">
            Pichardo Vape Shop
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Acceso administrativo
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Inicia sesión para administrar productos, marcas e inventario.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              Correo electrónico
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrorMessage("");
              }}
              required
              autoComplete="email"
              inputMode="email"
              placeholder="Tu correo"
              className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">
              Contraseña
            </span>

            <div className="flex gap-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrorMessage("");
                }}
                required
                autoComplete="current-password"
                placeholder="Tu contraseña"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold transition hover:border-red-500"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </label>

          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-400">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-red-600 px-5 py-4 text-lg font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {submitting
              ? "Verificando..."
              : "Entrar al panel"}
          </button>
        </form>

        <p className="mt-7 text-center text-xs text-zinc-600">
          Pichardo Vape Shop · El papá de los precios
        </p>
      </div>
    </main>
  );
}