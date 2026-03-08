"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeOff, Heart, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import TypewriterLoader from "@/app/components/TypewriterLoader";

interface Texto {
  id: string;
  contenido: string;
  titulo: string | null;
  tags: string[] | null;
  created_at: string;
  user_id: string;
  username: string;
}

function getHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function tiempoRelativo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "hace menos de 1h";
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

export default function Feed() {
  const hoy = getHoy();
  const router = useRouter();
  const [completado, setCompletado] = useState(false);
  const [consigna, setConsigna] = useState<string | null>(null);
  const [textos, setTextos] = useState<Texto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [likes, setLikes] = useState<Set<string>>(new Set());
  const [likesCounts, setLikesCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    setCompletado(!!localStorage.getItem(`renglon_completed_${hoy}`));

    Promise.all([
      fetch("/api/asignar-consigna-diaria").then((r) => r.json()),
      supabase
        .from("textos")
        .select("id, contenido, titulo, tags, created_at, user_id")
        .eq("publicado", true)
        .order("created_at", { ascending: false }),
    ]).then(async ([consignaData, { data: textosData }]) => {
      setConsigna(consignaData.consigna?.texto ?? null);

      const textos = (textosData ?? []) as Omit<Texto, "username">[];
      if (textos.length === 0) {
        setTextos([]);
        setCargando(false);
        return;
      }

      const userIds = [...new Set(textos.map((t) => t.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      const profileMap = Object.fromEntries(
        (profilesData ?? []).map((p) => [p.id, p.username])
      );

      const textosConUsername = textos.map((t) => ({
        ...t,
        username: profileMap[t.user_id] ?? "Autor",
      }));
      setTextos(textosConUsername);

      const textoIds = textos.map((t) => t.id);
      const { data: likesData } = await supabase
        .from("likes")
        .select("texto_id")
        .in("texto_id", textoIds);
      const counts: Record<string, number> = {};
      for (const like of likesData ?? []) {
        counts[like.texto_id] = (counts[like.texto_id] ?? 0) + 1;
      }
      setLikesCounts(counts);
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

  if (cargando) return <TypewriterLoader />;

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>

      {/* Textura de puntos */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #9e8e7e 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.18,
        }}
      />

      {/* Header sticky */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: "#F5F0EA",
        borderBottom: "1px solid rgba(61,53,48,0.12)",
        padding: "20px 20px 16px",
        textAlign: "center",
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontStyle: "italic",
          fontWeight: 400,
          color: "#64313E",
          margin: 0,
          lineHeight: 1,
        }}>renglón</h1>
        <p style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "#9C8B7E",
          margin: "6px 0 0",
          textAlign: "center",
        }}>
          {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
        </p>
        <p style={{
          fontSize: 13,
          fontStyle: "italic",
          color: "#3D3530",
          margin: "10px auto 0",
          maxWidth: 280,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {consigna ?? "—"}
        </p>
      </div>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 96px" }}>

        {/* Label conteo */}
        <p style={{ fontSize: 11, color: "#9C8B7E", marginTop: 20, marginBottom: 16 }}>
          {textos.length} {textos.length === 1 ? "persona respondió" : "personas respondieron"} hoy
        </p>


        {/* Feed */}
        <div className="relative">

          {/* Cards */}
          <div style={{ filter: !completado ? "blur(4px)" : undefined, pointerEvents: !completado ? "none" : undefined, userSelect: !completado ? "none" : undefined }}>
            {textos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 32px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 32, opacity: 0.3 }}>
                  <div style={{ width: 120, height: 1, backgroundColor: "#3D3530" }} />
                  <div style={{ width: 120, height: 1, backgroundColor: "#3D3530" }} />
                  <div style={{ width: 120, height: 1, backgroundColor: "#3D3530" }} />
                </div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#3D3530", margin: "0 0 12px" }}>
                  Nadie escribió todavía.
                </p>
                <p style={{ fontSize: 14, color: "#9C8B7E", margin: "0 0 24px" }}>
                  Podés ser el primero hoy.
                </p>
                <Link href="/editor" style={{
                  display: "inline-block",
                  backgroundColor: "#64313E", color: "#F5F0EA",
                  padding: "12px 32px", borderRadius: 8,
                  fontSize: 14, textDecoration: "none"
                }}>
                  Escribir ahora
                </Link>
              </div>
            ) : (
              textos.map((texto) => {
                const liked = likes.has(texto.id);
                return (
                  <div
                    key={texto.id}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "0 12px 12px 0",
                      borderLeft: "3px solid #64313E",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      padding: 24,
                      marginBottom: 12,
                      cursor: "pointer",
                    }}
                    onClick={() => router.push(`/texto/${texto.id}`)}
                  >
                    {/* Fila superior */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        backgroundColor: "#64313E",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 500,
                        flexShrink: 0,
                      }}>
                        {texto.username?.slice(0, 2).toUpperCase()}
                      </div>
                      <Link
                        href={`/perfil-publico?id=${texto.user_id}`}
                        style={{ fontSize: 13, color: "#9C8B7E", textDecoration: "none" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        @{texto.username}
                      </Link>
                      <span style={{ fontSize: 11, color: "#C4B8B0", marginLeft: "auto" }}>
                        {tiempoRelativo(texto.created_at)}
                      </span>
                    </div>

                    {/* Título */}
                    <p style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 18,
                      fontStyle: "italic",
                      fontWeight: 400,
                      color: "#3D3530",
                      margin: "14px 0 0",
                    }}>{texto.titulo || "Sin título"}</p>

                    {/* Preview del cuerpo */}
                    <p style={{
                      fontSize: 13,
                      color: "#6B5E57",
                      lineHeight: 1.7,
                      margin: "10px 0 0",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } as React.CSSProperties}>{texto.contenido}</p>

                    {/* Likes */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}
                      onClick={(e) => { e.stopPropagation(); toggleLike(texto.id); }}
                    >
                      <Heart
                        size={15}
                        strokeWidth={1.5}
                        fill={liked ? "#64313E" : "none"}
                        color={liked ? "#64313E" : "#9C8B7E"}
                      />
                      <span style={{ fontSize: 13, color: "#9C8B7E" }}>
                        {(likesCounts[texto.id] ?? 0) + (liked ? 1 : 0)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Overlay bloqueado */}
          {!completado && (
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 16px",
            }}>
              <div style={{
                width: "100%",
                maxWidth: 360,
                backgroundColor: "#FDFAF5",
                border: "1px solid #D6CFBF",
                borderRadius: 8,
                padding: "40px 32px",
                textAlign: "center",
              }}>
                <EyeOff size={28} strokeWidth={1.5} style={{ margin: "0 auto 16px", color: "#5C5147", display: "block" }} />
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontStyle: "italic", color: "#1C1917", margin: 0 }}>
                  Escribí tu versión para leer la de otros
                </p>
                <p style={{ fontSize: 14, color: "#5C5147", lineHeight: 1.6, margin: "8px 0 0" }}>
                  En <em>renglón</em>, primero escribís vos. Así la experiencia es más honesta para todos.
                </p>
                <Link
                  href="/editor"
                  style={{
                    display: "inline-block",
                    marginTop: 24,
                    backgroundColor: "#64313E",
                    color: "#FDFAF5",
                    borderRadius: 6,
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Ir a escribir
                </Link>
                <br />
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(`renglon_completed_${hoy}`, "1");
                    setCompletado(true);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 12,
                    backgroundColor: "transparent",
                    color: "#64313E",
                    border: "1.5px solid #64313E",
                    borderRadius: 6,
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <Pencil size={14} strokeWidth={1.5} />
                  Ya escribí, ver el feed
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
