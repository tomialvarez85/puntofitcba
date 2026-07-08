"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Sesión iniciada correctamente.");
      window.location.href = "/admin";
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-16 text-zinc-50">
      <div className="mb-8 rounded-2xl bg-white px-8 py-5 shadow-lg">
        <Image src="/logo-mark.png" alt="Punto Fit CBA" width={627} height={377} className="h-20 w-auto sm:h-24" priority />
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-xl"
      >
        <h1 className="text-2xl font-semibold">Acceso administrador</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Ingresá tus credenciales para entrar al panel.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-brand px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        {message ? <p className="mt-4 text-sm text-zinc-300">{message}</p> : null}
      </form>
    </main>
  );
}
