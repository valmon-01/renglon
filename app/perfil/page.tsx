"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, PenLine } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Texto {
  id: string;
  contenido: string;
  titulo: string | null;
  tags: string[] | null;
  created_at: string;
  publicado: boolean;
}

type Tab = "publicados" | "privados";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function extracto(contenido: string, max = 110): string {
  return contenido.length > max
    ? contenido.slice(0, max).trimEnd() + "…"
    : contenido;
}

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [textos, setTextos] = useState<Texto[]>([]);
  const [tab, setTab] = useState<Tab>("publicados");
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

      const [{ data: prof }, { data: texs }] = await Promise.all([
        supabase.from("profiles").select("bio").eq("id", user.id).single(),
        supabase
          .from("textos")
          .select("id, contenido, titulo, tags, created_at, publicado")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setBio(prof?.bio ?? null);
      setTextos((texs as Texto[]) ?? []);
      setCargando(false);
    }

    cargar();
  }, [router]);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-papel">
        <span className="text-sm text-tinta-suave">Cargando…</span>
      </div>
    );
  }

  const username = user?.user_metadata?.username ?? "Usuario";
  const publicados = textos.filter((t) => t.publicado);
  const privados = textos.filter((t) => !t.publicado);
  const lista = tab === "publicados" ? publicados : privados;

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
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <Link href="/home" className="font-display text-xl italic text-tinta">
            renglón
          </Link>
          <button
            type="button"
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
            className="text-tinta-suave transition-colors hover:text-tinta"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-[720px] px-6 pb-24">

        {/* Cabecera de perfil */}
        <div className="mb-10 flex flex-col items-center gap-4 text-center">

          {/* Avatar */}
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-medium"
            style={{ backgroundColor: "#C1DBE8", color: "#64313E" }}
          >
            {iniciales(username)}
          </div>

          {/* Nombre + bio */}
          <div>
            <h1 className="text-xl font-medium text-tinta">{username}</h1>
            {bio && (
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-tinta-suave">
                {bio}
              </p>
            )}
          </div>

          {/* Estadísticas */}
          <div className="flex gap-10 border-t border-borde pt-6">
            <div className="text-center">
              <p className="text-xl font-medium text-tinta">{textos.length}</p>
              <p className="mt-0.5 text-xs text-tinta-suave">escritos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-medium text-tinta">{publicados.length}</p>
              <p className="mt-0.5 text-xs text-tinta-suave">publicados</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-medium text-tinta">0</p>
              <p className="mt-0.5 text-xs text-tinta-suave">días seguidos</p>
            </div>
          </div>

          {/* Editar perfil */}
          <Link
            href="/editar-perfil"
            className="flex items-center gap-2 rounded-[6px] border border-borravino px-5 py-2 text-sm text-borravino transition-colors hover:bg-borravino hover:text-blanco-roto"
            style={{ borderWidth: "1.5px" }}
          >
            <PenLine size={14} strokeWidth={1.5} />
            Editar perfil
          </Link>

        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-borde">
          {(["publicados", "privados"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 pb-3 text-sm transition-colors ${
                tab === t
                  ? "border-b-2 border-borravino font-medium text-tinta"
                  : "text-tinta-suave hover:text-tinta"
              }`}
              style={tab === t ? { marginBottom: "-1px" } : {}}
            >
              {t === "publicados"
                ? `Publicados (${publicados.length})`
                : `Privados (${privados.length})`}
            </button>
          ))}
        </div>

        {/* Lista de textos */}
        {lista.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display italic text-tinta-suave">
              {tab === "publicados"
                ? "Todavía no publicaste ningún texto."
                : "No tenés textos guardados en privado."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {lista.map((texto) => (
              <Link
                key={texto.id}
                href={`/texto/${texto.id}`}
                className="block rounded-[8px] border border-borde bg-papel-oscuro p-5 transition-opacity hover:opacity-80"
              >
                {texto.titulo && (
                  <p className="mb-1 font-display italic text-tinta">
                    {texto.titulo}
                  </p>
                )}
                <p className="text-sm leading-relaxed text-tinta-suave">
                  {extracto(texto.contenido)}
                </p>
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
                <p className="mt-3 text-xs text-tinta-suave">
                  {fechaCorta(texto.created_at)}
                </p>
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
