"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: nombre },
      },
    });

    if (error) {
      setError(error.message);
      setCargando(false);
      return;
    }

    router.push("/home");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-papel px-6">
      {/* Textura de puntos */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #9e8e7e 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.18,
        }}
      />
      <div className="relative w-full max-w-[400px]">

        {/* Header */}
        <h1 className="mb-8 text-center font-display text-4xl italic text-tinta">
          renglón
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-tinta-suave" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              required
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border-0 border-b border-borde bg-transparent py-2 text-base text-tinta outline-none transition-colors placeholder:text-tinta-suave/50 focus:border-borravino"
              style={{ borderBottomWidth: "1.5px" }}
              placeholder="Tu nombre"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-tinta-suave" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-0 border-b border-borde bg-transparent py-2 text-base text-tinta outline-none transition-colors placeholder:text-tinta-suave/50 focus:border-borravino"
              style={{ borderBottomWidth: "1.5px" }}
              placeholder="tu@email.com"
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-tinta-suave" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-0 border-b border-borde bg-transparent py-2 text-base text-tinta outline-none transition-colors placeholder:text-tinta-suave/50 focus:border-borravino"
              style={{ borderBottomWidth: "1.5px" }}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-borravino">{error}</p>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={cargando}
            className="mt-2 rounded-[6px] bg-borravino py-3 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {cargando ? "Creando cuenta…" : "Crear cuenta"}
          </button>

          {/* Link login */}
          <p className="text-center text-sm text-tinta-suave">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-borravino underline underline-offset-2">
              Entrá
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}
