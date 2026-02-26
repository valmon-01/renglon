"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

const CONSIGNA = "Escribí sobre un objeto que perdiste";
const RACHA = 4; // hardcodeado hasta tener lógica real

function formatFecha(): string {
  return new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).toUpperCase();
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });
  }, []);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-papel">
        <span className="text-sm text-tinta-suave">Cargando…</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-papel">

      {/* Textura de puntos */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #9e8e7e 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.18,
        }}
      />

      {/* Navbar */}
      <nav className="w-full px-6 py-5">
        <div className="mx-auto flex max-w-[600px] items-center justify-between">
          <span className="font-display text-xl italic text-tinta">renglón</span>
          <Link href="/perfil" aria-label="Perfil" className="text-tinta-suave transition-colors hover:text-tinta">
            <UserCircle size={22} strokeWidth={1.5} />
          </Link>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="mx-auto flex max-w-[600px] flex-col items-center px-6 pb-24 pt-10 text-center">

        {/* Fecha */}
        <p className="text-[13px] uppercase tracking-wide text-tinta-suave" style={{ fontFamily: "Inter, sans-serif" }}>
          {formatFecha()}
        </p>

        {/* Label consigna */}
        <p className="mt-8 text-[11px] uppercase tracking-widest text-tinta-suave">
          consigna de hoy
        </p>

        {/* Consigna */}
        <h1
          className="mt-4 font-display italic text-tinta"
          style={{ fontSize: "28px", lineHeight: "1.4" }}
        >
          {CONSIGNA}
        </h1>

        {/* Racha — solo con sesión */}
        {session && (
          <p className="mt-6 text-sm text-tinta-suave">
            🔥 {RACHA} días seguidos
          </p>
        )}

        {/* Mensaje sin sesión */}
        {!session && (
          <p className="mt-6 text-sm text-tinta-suave">
            Iniciá sesión para escribir tu versión
          </p>
        )}

        {/* Acciones */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href={session ? "/editor" : "/login"}
            className="rounded-[6px] bg-borravino px-8 py-3 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90"
          >
            Escribir
          </Link>

          <Link
            href="/feed"
            className="text-sm text-tinta-suave underline underline-offset-4 transition-colors hover:text-tinta"
          >
            Ver lo que escribieron otros
          </Link>
        </div>

      </main>
    </div>
  );
}
