"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import TypewriterLoader from "@/app/components/TypewriterLoader";

interface Texto {
  id: string;
  contenido: string;
  titulo: string | null;
  tags: string[] | null;
  created_at: string;
}

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

function PerfilPublicoContenido() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("id");

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState<string | null>(null);
  const [textos, setTextos] = useState<Texto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [siguiendo, setSiguiendo] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!userId) return;

    async function cargar() {
      const [
        { data: perfil },
        { data: texs },
        { data: { session } },
      ] = await Promise.all([
        supabase.from("profiles").select("username, bio").eq("id", userId).single(),
        supabase
          .from("textos")
          .select("id, contenido, titulo, tags, created_at")
          .eq("user_id", userId)
          .eq("publicado", true)
          .order("created_at", { ascending: false }),
        supabase.auth.getSession(),
      ]);

      setUsername(perfil?.username ?? "Usuario");
      setBio(perfil?.bio ?? null);
      setTextos((texs as Texto[]) ?? []);

      const uid = session?.user.id ?? null;
      setSessionUserId(uid);

      if (uid && uid !== userId) {
        const { data: follow } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", uid)
          .eq("following_id", userId)
          .maybeSingle();
        setSiguiendo(!!follow);
      }

      setCargando(false);
    }

    cargar();
  }, [userId]);

  async function toggleFollow() {
    if (!sessionUserId || !userId) return;
    setToggling(true);
    if (siguiendo) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", sessionUserId)
        .eq("following_id", userId);
      setSiguiendo(false);
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: sessionUserId, following_id: userId });
      setSiguiendo(true);
    }
    setToggling(false);
  }

  if (cargando) return <TypewriterLoader />;

  const esPropioPerfil = sessionUserId === userId;

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
      <nav className="w-full border-b border-borde px-6 py-4">
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-tinta-suave transition-colors hover:text-tinta"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
            Volver
          </button>
          <span className="font-display text-xl italic text-tinta">renglón</span>
        </div>
      </nav>

      <main className="mx-auto max-w-[720px] px-6 pb-24 pt-10">

        {/* Cabecera */}
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-medium"
            style={{ backgroundColor: "#C1DBE8", color: "#64313E" }}
          >
            {iniciales(username)}
          </div>

          <div>
            <h1 className="text-xl font-medium text-tinta">{username}</h1>
            {bio && (
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-tinta-suave">
                {bio}
              </p>
            )}
          </div>

          {!esPropioPerfil && sessionUserId && (
            <button
              type="button"
              onClick={toggleFollow}
              disabled={toggling}
              className={`rounded-[6px] px-6 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
                siguiendo
                  ? "border-[1.5px] border-borravino text-borravino hover:bg-borravino hover:text-blanco-roto"
                  : "bg-borravino text-blanco-roto hover:opacity-90"
              }`}
            >
              {toggling ? "…" : siguiendo ? "Siguiendo" : "Seguir"}
            </button>
          )}
        </div>

        {/* Conteo */}
        <p className="mb-4 text-[11px] uppercase tracking-widest text-tinta-suave">
          {textos.length} {textos.length === 1 ? "texto publicado" : "textos publicados"}
        </p>

        {/* Textos */}
        {textos.length === 0 ? (
          <p className="py-12 text-center font-display italic text-tinta-suave">
            Todavía no hay textos publicados.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {textos.map((texto) => (
              <Link
                key={texto.id}
                href={`/texto/${texto.id}`}
                className="block rounded-[8px] border border-borde bg-papel-oscuro p-5 transition-opacity hover:opacity-80"
              >
                {texto.titulo && (
                  <p className="mb-1 font-display italic text-tinta">{texto.titulo}</p>
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
                <p className="mt-3 text-xs text-tinta-suave">{fechaCorta(texto.created_at)}</p>
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default function PerfilPublico() {
  return (
    <Suspense fallback={<TypewriterLoader />}>
      <PerfilPublicoContenido />
    </Suspense>
  );
}
