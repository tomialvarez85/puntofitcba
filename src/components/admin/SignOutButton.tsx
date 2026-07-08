"use client";

import { useFormStatus } from "react-dom";

export default function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="block w-full rounded-lg px-4 py-3 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}
