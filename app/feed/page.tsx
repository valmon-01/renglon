"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EyeOff, Heart, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CONSIGNA = "Escribí sobre un objeto que perdiste";
const FILTROS = ["Recientes", "Populares", "Breves"] as const;
type Filtro = (typeof FILTROS)[number];

interface Texto {
  id: string;
  contenido: string;
  titulo: string | null;
  tags: string[] | null;
  created_at: string;
  user_id: string;
  profiles: { username: string }[] | { username: string } | null;
}

function getHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatFecha(): string {
  return new Date()
    .toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

function fechaRelativa(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} día${dias > 1 ? "s" : ""}`;
}

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function contarPalabras(texto: string): number {
  return texto.trim() === "" ? 0 : texto.trim().split(/\s+/).length;
}

export default function Feed() {
  const hoy = getHoy();
  const [completado, setCompletado] = useState(false);
  const [textos, setTextos] = useState<Texto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("Recientes");
  const [likes, setLikes] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompletado(!!localStorage.getItem(`renglon_completed_${hoy}`));

    supabase
      .from("textos")
      .select("id, contenido, titulo, tags, created_at, user_id, profiles(username)")
      .eq("publicado", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTextos((data as Texto[]) ?? []);
        setCargando(false);
      });
  }, [hoy]);

  function toggleLike(id: string) {
    setLikes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function textosFiltrados(): Texto[] {
    if (filtro === "Breves") {
      return [...textos].sort(
        (a, b) => contarPalabras(a.contenido) - contarPalabras(b.contenido)
      );
    }
    return textos;
  }

  const lista = textosFiltrados();

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
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <Link href="/home" className="font-display text-xl italic text-tinta">
            renglón
          </Link>
          <Link
            href="/perfil"
            className="text-sm text-tinta-suave transition-colors hover:text-tinta"
          >
            Mi perfil
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-[720px] px-6 pb-24">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-widest text-tinta-suave">
            Feed del día · {formatFecha()}
          </p>
          <h1 className="mt-3 font-display text-2xl italic text-tinta">
            {CONSIGNA}
          </h1>

          <div className="mt-6 flex items-center justify-between border-t border-borde pt-4">
            <span className="text-sm text-tinta-suave">
              {textos.length}{" "}
              {textos.length === 1 ? "persona respondió" : "personas respondieron"} hoy
            </span>

            {completado ? (
              <span className="flex items-center gap-1.5 rounded-full bg-papel-oscuro px-3 py-1.5 text-xs text-tinta-suave">
                <span className="text-borravino">✓</span> Ya escribiste hoy
              </span>
            ) : (
              <Link
                href="/editor"
                className="flex items-center gap-1.5 rounded-[6px] bg-borravino px-4 py-2 text-xs font-medium text-blanco-roto transition-opacity hover:opacity-90"
              >
                <Pencil size={12} strokeWidth={1.5} />
                Escribir mi versión
              </Link>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-2">
          {FILTROS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                filtro === f
                  ? "bg-borravino text-blanco-roto"
                  : "bg-papel-oscuro text-tinta-suave hover:text-tinta"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="relative">

          {/* Cards */}
          <div
            className={`flex flex-col gap-4 ${
              !completado ? "pointer-events-none select-none blur-sm" : ""
            }`}
          >
            {lista.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <p className="font-display text-xl italic text-tinta">
                  Todavía nadie escribió hoy. ¡Sé el primero!
                </p>
                <Link
                  href="/editor"
                  className="rounded-[6px] bg-borravino px-6 py-2.5 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90"
                >
                  Ir a escribir
                </Link>
              </div>
            ) : (
              lista.map((texto) => {
                const username =
                  (Array.isArray(texto.profiles)
                    ? texto.profiles[0]?.username
                    : texto.profiles?.username) ?? "Autor";
                const liked = likes.has(texto.id);

                return (
                  <article
                    key={texto.id}
                    className="rounded-[8px] border border-borde bg-papel-oscuro p-6"
                  >
                    {/* Autor + fecha */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                          style={{ backgroundColor: "#C1DBE8", color: "#64313E" }}
                        >
                          {iniciales(username)}
                        </div>
                        <span className="text-sm font-medium text-tinta">{username}</span>
                      </div>
                      <span className="text-xs text-tinta-suave">
                        {fechaRelativa(texto.created_at)}
                      </span>
                    </div>

                    {/* Título */}
                    {texto.titulo && (
                      <p className="mb-2 font-display italic text-tinta">
                        {texto.titulo}
                      </p>
                    )}

                    {/* Extracto */}
                    <p className="line-clamp-4 text-sm leading-relaxed text-tinta">
                      {texto.contenido}
                    </p>

                    {/* Tags */}
                    {texto.tags && texto.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {texto.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-[4px] bg-cielo px-2 py-0.5 text-xs text-borravino"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        href={`/texto/${texto.id}`}
                        className="text-xs text-borravino underline underline-offset-2 transition-opacity hover:opacity-70"
                      >
                        Leer completo
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleLike(texto.id)}
                        aria-label={liked ? "Quitar me gusta" : "Me gusta"}
                        className={`transition-colors ${
                          liked ? "text-borravino" : "text-tinta-suave hover:text-borravino"
                        }`}
                      >
                        <Heart
                          size={16}
                          strokeWidth={1.5}
                          fill={liked ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Overlay bloqueado */}
          {!completado && (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="w-full max-w-sm rounded-[8px] border border-borde bg-blanco-roto px-8 py-10 text-center">
                <EyeOff
                  size={28}
                  strokeWidth={1.5}
                  className="mx-auto mb-4 text-tinta-suave"
                />
                <p className="font-display text-lg italic text-tinta">
                  Escribí tu versión para leer la de otros
                </p>
                <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
                  En <em>renglón</em>, primero escribís vos. Así la experiencia
                  es más honesta para todos.
                </p>
                <Link
                  href="/editor"
                  className="mt-6 inline-block rounded-[6px] bg-borravino px-6 py-2.5 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90"
                >
                  Ir a escribir
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
