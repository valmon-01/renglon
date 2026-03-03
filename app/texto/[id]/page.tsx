"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Texto = {
  id: string;
  user_id: string;
  contenido: string;
  titulo: string | null;
  created_at: string;
  consigna: string;
  username: string;
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
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const aaaa = d.getFullYear();
  return `${dd}/${mm}/${aaaa}`;
}

export default function TextoIndividual() {
  const { id } = useParams<{ id: string }>();
  const [texto, setTexto] = useState<Texto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likedBy, setLikedBy] = useState<string[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      const [
        { data: textoData },
        { data: { session } },
      ] = await Promise.all([
        supabase
          .from("textos")
          .select("id, user_id, contenido, titulo, created_at, consigna")
          .eq("id", id)
          .single(),
        supabase.auth.getSession(),
      ]);

      let username = "Autor";
      if (textoData?.user_id) {
        const { data: perfil } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", textoData.user_id)
          .single();
        username = perfil?.username ?? "Autor";
      }

      setTexto(textoData ? { ...textoData, username } as Texto : null);
      const uid = session?.user.id ?? null;
      setSessionUserId(uid);

      // Conteo de likes
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("texto_id", id);
      setLikeCount(count ?? 0);

      // ¿Ya di like?
      if (uid) {
        const { data: myLike } = await supabase
          .from("likes")
          .select("id")
          .eq("texto_id", id)
          .eq("user_id", uid)
          .maybeSingle();
        setLiked(!!myLike);
      }

      // Si soy el autor, cargar quién dio like
      if (uid && textoData?.user_id === uid) {
        const { data: likesData } = await supabase
          .from("likes")
          .select("user_id")
          .eq("texto_id", id);
        if (likesData && likesData.length > 0) {
          const userIds = likesData.map((l) => l.user_id);
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("username")
            .in("id", userIds);
          setLikedBy((profilesData ?? []).map((p) => p.username).filter(Boolean));
        }
      }

      setCargando(false);
    }

    cargar();
  }, [id]);

  async function toggleLike() {
    if (!sessionUserId) return;
    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("texto_id", id)
        .eq("user_id", sessionUserId);
      setLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("likes").insert({ texto_id: id, user_id: sessionUserId });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  }

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-papel">
        <span className="text-sm text-tinta-suave">Cargando…</span>
      </div>
    );
  }

  if (!texto) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-papel">
        <p className="text-tinta-suave">No se encontró el texto.</p>
        <Link href="/feed" className="text-sm text-borravino underline underline-offset-2">
          Volver al feed
        </Link>
      </div>
    );
  }

  const username = texto.username;

  return (
    <div className="relative flex min-h-screen flex-col bg-papel">

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
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-borde bg-papel px-6 py-4">
        <Link
          href="/feed"
          className="flex items-center gap-2 text-sm text-tinta-suave transition-colors hover:text-tinta"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Feed
        </Link>
        <Link
          href={`/perfil-publico?id=${texto.user_id}`}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-70"
        >
          <span className="text-sm text-tinta">{username}</span>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
            style={{ backgroundColor: "#C1DBE8", color: "#64313E" }}
          >
            {iniciales(username)}
          </div>
        </Link>
      </nav>

      {/* Cuaderno */}
      <div className="flex-1 overflow-auto">
        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: "720px",
            minHeight: "calc(100vh - 65px)",
            backgroundColor: "#FDFAF5",
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 39px, #D6CFBF 39px, #D6CFBF 40px)",
            backgroundPositionY: "24px",
          }}
        >
          {/* Línea de margen */}
          <div
            className="pointer-events-none absolute bottom-0 top-0"
            style={{ left: "44px", width: "1px", backgroundColor: "#C1DBE8" }}
          />

          {/* Contenido */}
          <div
            className="relative"
            style={{
              paddingLeft: "52px",
              paddingRight: "52px",
              paddingTop: "24px",
              paddingBottom: "48px",
            }}
          >

            {/* Renglón 1: fecha DD/MM/AAAA — derecha */}
            <p
              className="select-none text-right font-display italic text-tinta-suave"
              style={{ fontSize: "1rem", lineHeight: "40px" }}
            >
              {fechaCorta(texto.created_at)}
            </p>

            {/* Renglón 2: consigna */}
            <p
              className="select-none font-display italic text-tinta-suave"
              style={{ fontSize: "1rem", lineHeight: "40px" }}
            >
              {texto.consigna}
            </p>

            {/* Renglón 3: título (si existe) */}
            {texto.titulo && (
              <p
                className="italic text-tinta"
                style={{
                  fontSize: "1rem",
                  lineHeight: "40px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {texto.titulo}
              </p>
            )}

            {/* Desde renglón 4: texto completo */}
            <div
              className="text-tinta"
              style={{
                fontSize: "1rem",
                lineHeight: "40px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {texto.contenido.split("\n").map((linea, i) => (
                <p key={i}>{linea || "\u00A0"}</p>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Likes — fuera del cuaderno */}
      <div className="flex flex-col items-center py-6 text-center">
        <button
          type="button"
          onClick={toggleLike}
          disabled={!sessionUserId}
          aria-label={liked ? "Quitar me gusta" : "Me gusta"}
          className={`flex flex-col items-center gap-2 transition-colors disabled:cursor-default ${
            liked ? "text-borravino" : "text-tinta-suave hover:text-borravino"
          }`}
        >
          <Heart
            size={28}
            strokeWidth={1.5}
            fill={liked ? "currentColor" : "none"}
          />
          <span className="text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
            {likeCount}
          </span>
        </button>
        {sessionUserId === texto.user_id && likedBy.length > 0 && (
          <p className="mt-3 text-xs text-tinta-suave">
            Les gustó a: {likedBy.join(", ")}
          </p>
        )}
      </div>

    </div>
  );
}
