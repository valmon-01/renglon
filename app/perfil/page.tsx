"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import TypewriterLoader from "@/app/components/TypewriterLoader";
import type { User } from "@supabase/supabase-js";
import NotebookPages from "@/app/components/NotebookPages";

interface Texto {
  id: string;
  contenido: string;
  titulo: string | null;
  created_at: string;
  fecha_consigna: string | null;
  publicado: boolean;
  consigna: string;
}

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [palabrasTotales, setPalabrasTotales] = useState<number>(0);
  const [textos, setTextos] = useState<Texto[]>([]);
  const [libroAbierto, setLibroAbierto] = useState(false);
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
        supabase.from("profiles").select("bio, racha_actual, palabras_totales, display_name").eq("id", user.id).single(),
        supabase
          .from("textos")
          .select("id, contenido, titulo, created_at, fecha_consigna, publicado, consigna")
          .eq("user_id", user.id)
          .eq("borrador", false)
          .order("created_at", { ascending: false }),
      ]);

      setBio(prof?.bio ?? null);
      setDisplayName(prof?.display_name ?? null);
      setPalabrasTotales(prof?.palabras_totales ?? 0);
      setTextos((texs as Texto[]) ?? []);
      setCargando(false);
    }

    cargar();
  }, [router]);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDelete(id: string) {
    await supabase.from("textos").delete().eq("id", id).eq("user_id", user!.id);
    setTextos((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleTogglePublicado(id: string, current: boolean) {
    await supabase
      .from("textos")
      .update({ publicado: !current })
      .eq("id", id)
      .eq("user_id", user!.id);
    setTextos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, publicado: !current } : t))
    );
  }

  if (cargando) return <TypewriterLoader />;

  function formatPalabras(n: number): string {
    if (!n) return "—";
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ".")}k`;
    return String(n);
  }

  const username = user?.user_metadata?.username ?? "Usuario";
  const publicados = textos.filter((t) => t.publicado);
  const nombreParaIniciales = displayName || username;
  const iniciales = nombreParaIniciales
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase() ?? "")
    .join("");
  const containerWidth = libroAbierto ? 660 : 480;

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

      {/* Header sticky */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: "#F5F0EA",
        borderBottom: "1px solid rgba(61,53,48,0.15)",
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
      </div>

      {/* Contenedor central */}
      <main
        style={{
          maxWidth: containerWidth,
          margin: "0 auto",
          transition: "max-width 0.3s ease",
          padding: "40px 20px 80px",
        }}
      >
        <AnimatePresence mode="wait">
          {!libroAbierto ? (
            <motion.div
              key="tapa"
              exit={{ opacity: 0, rotateY: -15, x: -20, transition: { duration: 0.3 } }}
              style={{ transformPerspective: 800, transformOrigin: "left center" }}
            >
              {/* Tapa de libro */}
              <div
                style={{
                  maxWidth: 420,
                  margin: "0 auto",
                  width: "100%",
                  position: "relative",
                  backgroundColor: "#64313E",
                  borderRadius: "4px 16px 16px 4px",
                  boxShadow: "-4px 0 0 #4a2230, -8px 0 0 #3a1828, 0 8px 32px rgba(28,25,23,0.2)",
                  padding: "40px 32px 32px 32px",
                  overflow: "hidden",
                }}
              >
                {/* Label renglón */}
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 13,
                    color: "rgba(245,240,232,0.4)",
                    marginBottom: 20,
                    display: "block",
                    textAlign: "center",
                  }}
                >
                  renglón
                </span>

                {/* Avatar */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    backgroundColor: "rgba(193,219,232,0.15)",
                    border: "1px solid rgba(193,219,232,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "16px auto 6px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 20,
                      color: "#F5F0E8",
                    }}
                  >
                    {iniciales}
                  </span>
                </div>

                {/* Display name / Username */}
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 32,
                    color: "#F5F0E8",
                    textAlign: "center",
                    display: "block",
                    marginBottom: 2,
                  }}
                >
                  {displayName || username}
                </span>
                {displayName && (
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 12,
                      color: "rgba(245,240,232,0.4)",
                      textAlign: "center",
                      display: "block",
                      marginBottom: 0,
                    }}
                  >
                    @{username}
                  </span>
                )}

                {/* Bio */}
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    fontStyle: bio ? "normal" : "italic",
                    color: "rgba(245,240,232,0.5)",
                    textAlign: "center",
                    lineHeight: 1.5,
                    marginTop: 32,
                  }}
                >
                  {bio || "Agregá una bio desde Editar perfil"}
                </p>

                {/* Separador */}
                <div
                  style={{
                    height: 1,
                    backgroundColor: "rgba(245,240,232,0.15)",
                    margin: "24px 0",
                  }}
                />

                {/* Stats — fila superior */}
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                  {[
                    { valor: textos.length, label: "escritos" },
                    { valor: publicados.length, label: "publicados" },
                  ].map(({ valor, label }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                          fontSize: 28,
                          color: "var(--color-papel)",
                          display: "block",
                          lineHeight: 1,
                        }}
                      >
                        {valor}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "rgba(245,240,232,0.4)",
                          marginTop: 4,
                          display: "block",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Stats — palabras escritas */}
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                    marginTop: 20,
                    paddingTop: 20,
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 28,
                      color: "var(--color-papel)",
                      display: "block",
                      lineHeight: 1,
                    }}
                  >
                    {formatPalabras(palabrasTotales)}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(245,240,232,0.4)",
                      marginTop: 6,
                      display: "block",
                    }}
                  >
                    palabras escritas
                  </span>
                </div>

                {/* Botón Leer escritos / Escribir primer texto */}
                {textos.length === 0 ? (
                  <Link
                    href="/home"
                    style={{
                      marginTop: 24,
                      width: "100%",
                      padding: "14px 0",
                      backgroundColor: "rgba(245,240,232,0.1)",
                      border: "1px solid rgba(245,240,232,0.2)",
                      borderRadius: 8,
                      color: "#F5F0E8",
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 16,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      textDecoration: "none",
                    }}
                  >
                    Escribí tu primer texto →
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLibroAbierto(true)}
                    style={{
                      marginTop: 24,
                      width: "100%",
                      padding: "14px 0",
                      backgroundColor: "rgba(245,240,232,0.1)",
                      border: "1px solid rgba(245,240,232,0.2)",
                      borderRadius: 8,
                      color: "#F5F0E8",
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 16,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    Leer escritos →
                  </button>
                )}
              </div>

              {/* Editar perfil + Cerrar sesión */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 16 }}>
                <Link
                  href="/editar-perfil"
                  className="flex items-center gap-2 rounded-[6px] border border-borde px-5 py-2 text-sm text-tinta-suave transition-colors hover:border-tinta hover:text-tinta"
                >
                  <PenLine size={14} strokeWidth={1.5} />
                  Editar perfil
                </Link>
                <button
                  type="button"
                  onClick={cerrarSesion}
                  className="flex items-center gap-2 rounded-[6px] border border-borde px-5 py-2 text-sm text-tinta-suave transition-colors hover:border-tinta hover:text-tinta"
                >
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="libro"
              initial={{ opacity: 0, rotateY: 8, x: 20 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformPerspective: 800 }}
            >
              {textos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 32px" }}>
                  <svg width="60" height="40" viewBox="0 0 60 40" style={{ marginBottom: 24 }}>
                    <line x1="10" y1="35" x2="50" y2="5" stroke="#9C8B7E" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#3D3530", margin: "0 0 12px" }}>
                    Tu primer renglón está esperando.
                  </p>
                  <p style={{ fontSize: 14, color: "#9C8B7E", margin: "0 0 24px" }}>
                    Escribí hoy y aparece acá.
                  </p>
                  <Link href="/editor" style={{
                    display: "inline-block",
                    backgroundColor: "#64313E", color: "#F5F0EA",
                    padding: "12px 32px", borderRadius: 8,
                    fontSize: 14, textDecoration: "none"
                  }}>
                    Ir a escribir
                  </Link>
                </div>
              ) : (
                <NotebookPages
                  texts={textos}
                  username={username}
                  userId={user?.id ?? ""}
                  sessionUserId={user?.id ?? ""}
                  onClose={() => setLibroAbierto(false)}
                  onDelete={handleDelete}
                  onTogglePublicado={handleTogglePublicado}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
