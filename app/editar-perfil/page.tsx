"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

function iniciales(nombre: string): string {
  if (!nombre.trim()) return "?";
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function EditarPerfil() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [nombre, setNombre] = useState("");
  const [bio, setBio] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setNombre(user.user_metadata?.username ?? "");

      const { data: prof } = await supabase
        .from("profiles")
        .select("bio")
        .eq("id", user.id)
        .single();

      setBio(prof?.bio ?? "");
      setCargando(false);
    }

    cargar();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setGuardando(true);

    await Promise.all([
      supabase.auth.updateUser({ data: { username: nombre.trim() } }),
      supabase.from("profiles").upsert({
        id: user.id,
        username: nombre.trim(),
        bio: bio.trim() || null,
      }),
    ]);

    setGuardando(false);
    setGuardado(true);
    setTimeout(() => router.push("/perfil"), 1000);
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-papel">
        <span className="text-sm text-tinta-suave">Cargando…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-papel">

      {/* Navbar */}
      <nav className="w-full px-6 py-5">
        <div className="mx-auto flex max-w-[480px] items-center justify-between">
          <Link
            href="/perfil"
            className="flex items-center gap-2 text-sm text-tinta-suave transition-colors hover:text-tinta"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            Perfil
          </Link>
          {guardado && (
            <div className="flex items-center gap-1.5 text-tinta-suave">
              <Check size={14} strokeWidth={2} />
              <span className="text-sm">Cambios guardados</span>
            </div>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-[480px] px-6 pb-24 pt-6">

        {/* Avatar */}
        <div className="mb-10 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-medium"
            style={{ backgroundColor: "#C1DBE8", color: "#64313E" }}
          >
            {iniciales(nombre)}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-tinta-suave" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border-0 border-b border-borde bg-transparent py-2 text-base text-tinta outline-none transition-colors focus:border-borravino"
              style={{ borderBottomWidth: "1.5px" }}
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-tinta-suave" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Contá algo sobre vos…"
              className="resize-none border-0 border-b border-borde bg-transparent py-2 text-base text-tinta outline-none transition-colors placeholder:text-tinta-suave/40 focus:border-borravino"
              style={{ borderBottomWidth: "1.5px" }}
            />
          </div>

          {/* Email — deshabilitado */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-tinta-suave" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              disabled
              value={user?.email ?? ""}
              className="border-0 border-b border-borde bg-transparent py-2 text-base text-tinta-suave/50 outline-none"
              style={{ borderBottomWidth: "1.5px" }}
            />
            <p className="mt-1 text-xs text-tinta-suave/50">
              No se puede cambiar
            </p>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={guardando || guardado}
            className="mt-2 rounded-[6px] bg-borravino py-3 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {guardando
              ? "Guardando…"
              : guardado
              ? "¡Cambios guardados!"
              : "Guardar cambios"}
          </button>

        </form>
      </main>
    </div>
  );
}
