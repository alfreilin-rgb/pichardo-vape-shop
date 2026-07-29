"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkCurrentSession();
  }, []);

  async function checkCurrentSession() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      router.replace("/admin");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setErrorMessage("");

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (error || !data.user) {
      setErrorMessage(
        error?.message ||
          "No se pudo iniciar sesión.",
      );
      setSubmitting(false);
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
        "Esta cuenta existe, pero no tiene permisos de administrador.",
      );

      setSubmitting(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
        <a
          href="/"
          className="font-medium text-blue-700 hover:underline"
        >
          ← Volver al inicio
        </a>

        <div className="mt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
            🔐
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-blue-700">
            PuntaHogar
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Acceso administrativo
          </h1>

          <p className="mt-3 text-slate-600">
            Inicia sesión con la cuenta autorizada en Supabase.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <label className="block">
            <span className="mb-2 block font-medium">
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
              placeholder="admin@puntahogar.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block font-medium">
              Contraseña
            </span>

            <div className="flex gap-2">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrorMessage("");
                }}
                required
                autoComplete="current-password"
                placeholder="Tu contraseña"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="rounded-xl border border-slate-300 px-4 py-3 font-medium hover:bg-slate-50"
              >
                {showPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
          </label>

          {errorMessage && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-700 px-5 py-4 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting
              ? "Verificando..."
              : "Entrar al panel"}
          </button>
        </form>
      </div>
    </main>
  );
}
