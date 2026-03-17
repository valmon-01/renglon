"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Share2, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import TypewriterLoader from "@/app/components/TypewriterLoader";
import ShareModal from "@/app/components/ShareModal";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

type Texto = {
  id: string;
  user_id: string;
  contenido: string;
  titulo: string | null;
  created_at: string;
  consigna: string;
  username: string;
  publicado: boolean;
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
  const router = useRouter();
  const [texto, setTexto] = useState<Texto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likedBy, setLikedBy] = useState<string[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    async function cargar() {
      const [
        { data: textoData },
        { data: { session } },
      ] = await Promise.all([
        supabase
          .from("textos")
          .select("id, user_id, contenido, titulo, created_at, consigna, publicado")
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

  async function handleDelete() {
    setDeleteLoading(true);
    await supabase.from("textos").delete().eq("id", id).eq("user_id", sessionUserId!);
    setDeleteLoading(false);
    setShowDeleteConfirm(false);
    router.push("/perfil");
  }

  async function togglePublicado() {
    if (!texto || toggleLoading) return;
    setToggleLoading(true);
    const next = !texto.publicado;
    await supabase
      .from("textos")
      .update({ publicado: next })
      .eq("id", id)
      .eq("user_id", sessionUserId!);
    setTexto({ ...texto, publicado: next });
    setToggleLoading(false);
  }

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

  if (cargando) return <TypewriterLoader />;

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
      <nav className="sticky top-0 z-20 border-b border-borde bg-papel">
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
        </div>
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

            {/* Renglón 1: @username */}
            <Link
              href={sessionUserId === texto.user_id ? "/perfil" : `/perfil-publico?id=${texto.user_id}`}
              style={{
                display: "block",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "15px",
                color: "#64313E",
                lineHeight: "40px",
                textDecoration: "none",
                marginBottom: 8,
              }}
              className="hover:underline"
            >
              @{username}
            </Link>

            {/* Renglón 2: fecha + consigna */}
            <p
              style={{
                fontSize: "12px",
                color: "#9C8B7E",
                lineHeight: "40px",
                marginBottom: 24,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: "var(--font-sans)",
              }}
            >
              {fechaCorta(texto.created_at)}
              {texto.consigna ? ` — ${texto.consigna.length > 60 ? texto.consigna.slice(0, 60) + "…" : texto.consigna}` : ""}
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

      {/* Likes + Share + acciones owner — fuera del cuaderno */}
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-5">
          <button
            type="button"
            onClick={toggleLike}
            disabled={!sessionUserId}
            aria-label={liked ? "Quitar me gusta" : "Me gusta"}
            title={liked ? "Quitar me gusta" : "Me gusta"}
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

          {texto.publicado && (
            <button
              type="button"
              onClick={() => setShowShare(true)}
              aria-label="Compartir como imagen"
              title="Compartir"
              className="flex flex-col items-center gap-2 text-tinta-suave transition-colors hover:text-borravino"
            >
              <Share2 size={28} strokeWidth={1.5} />
              <span className="text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                Compartir
              </span>
            </button>
          )}

          {sessionUserId === texto.user_id && (
            <>
              <Link
                href={`/editor?edit=${texto.id}`}
                aria-label="Editar escrito"
                title="Editar"
                className="flex flex-col items-center gap-2 text-tinta-suave transition-colors hover:text-borravino"
              >
                <Pencil size={28} strokeWidth={1.5} />
                <span className="text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                  Editar
                </span>
              </Link>

              <button
                type="button"
                onClick={togglePublicado}
                disabled={toggleLoading}
                aria-label={texto.publicado ? "Cambiar a privado" : "Cambiar a público"}
                title={texto.publicado ? "Cambiar a privado" : "Cambiar a público"}
                className="flex flex-col items-center gap-2 text-tinta-suave transition-colors hover:text-borravino disabled:opacity-50"
              >
                {texto.publicado ? (
                  <Eye size={28} strokeWidth={1.5} />
                ) : (
                  <EyeOff size={28} strokeWidth={1.5} />
                )}
                <span className="text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                  {texto.publicado ? "Público" : "Privado"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Eliminar escrito"
                title="Eliminar escrito"
                className="flex flex-col items-center gap-2 text-tinta-suave transition-colors hover:text-borravino"
              >
                <Trash2 size={28} strokeWidth={1.5} />
                <span className="text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                  Eliminar
                </span>
              </button>
            </>
          )}
        </div>

        {sessionUserId === texto.user_id && likedBy.length > 0 && (
          <p className="mt-3 text-xs text-tinta-suave">
            Les gustó a: {likedBy.join(", ")}
          </p>
        )}
      </div>

      {texto.publicado && (
        <ShareModal
          open={showShare}
          onClose={() => setShowShare(false)}
          titulo={texto.titulo}
          contenido={texto.contenido}
          consigna={texto.consigna}
          username={texto.username}
          fecha={texto.created_at}
        />
      )}

      <ConfirmDeleteModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

    </div>
  );
}
