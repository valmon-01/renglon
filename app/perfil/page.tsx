"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, PenLine } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import NotebookPages from "@/app/components/NotebookPages";

interface Texto {
  id: string;
  contenido: string;
  titulo: string | null;
  tags: string[] | null;
  created_at: string;
  publicado: boolean;
  consigna: string;
}

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [racha, setRacha] = useState<number>(0);
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
        supabase.from("profiles").select("bio, racha_actual").eq("id", user.id).single(),
        supabase
          .from("textos")
          .select("id, contenido, titulo, tags, created_at, publicado, consigna")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setBio(prof?.bio ?? null);
      setRacha(prof?.racha_actual ?? 0);
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
                  width: "100%",
                  position: "relative",
                  backgroundColor: "#64313E",
                  borderRadius: "4px 16px 16px 4px",
                  boxShadow: "-4px 0 0 #4a2230, -8px 0 0 #3a1828, 0 12px 40px rgba(28,25,23,0.25)",
                  padding: "40px 32px 32px 40px",
                  overflow: "hidden",
                }}
              >
                {/* Label renglón */}
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 12,
                    color: "rgba(245,240,232,0.35)",
                    marginBottom: 20,
                    display: "block",
                  }}
                >
                  renglón
                </span>

                {/* Avatar */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    backgroundColor: "rgba(193,219,232,0.15)",
                    border: "1px solid rgba(193,219,232,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
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
                    {username[0]?.toUpperCase() ?? "U"}
                  </span>
                </div>

                {/* Username */}
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 28,
                    color: "#F5F0E8",
                    textAlign: "center",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  {username}
                </span>

                {/* Bio */}
                {bio && (
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      color: "rgba(245,240,232,0.45)",
                      textAlign: "center",
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {bio}
                  </p>
                )}

                {/* Separador */}
                <div
                  style={{
                    height: 1,
                    backgroundColor: "rgba(245,240,232,0.12)",
                    margin: "24px 0",
                  }}
                />

                {/* Stats */}
                <div style={{ display: "flex", justifyContent: "space-around" }}>
                  {[
                    { valor: textos.length, label: "escritos" },
                    { valor: publicados.length, label: "publicados" },
                    { valor: racha, label: "días" },
                  ].map(({ valor, label }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                          fontSize: 26,
                          color: "#F5F0E8",
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
                          color: "rgba(245,240,232,0.35)",
                          marginTop: 4,
                          display: "block",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Botón Leer escritos */}
                <button
                  type="button"
                  onClick={() => setLibroAbierto(true)}
                  style={{
                    marginTop: 28,
                    width: "100%",
                    padding: "13px 0",
                    backgroundColor: "rgba(245,240,232,0.08)",
                    border: "1px solid rgba(245,240,232,0.18)",
                    borderRadius: 8,
                    color: "#F5F0E8",
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 15,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  Leer escritos →
                </button>
              </div>

              {/* Editar perfil */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                <Link
                  href="/editar-perfil"
                  className="flex items-center gap-2 rounded-[6px] border border-borde px-5 py-2 text-sm text-tinta-suave transition-colors hover:border-tinta hover:text-tinta"
                >
                  <PenLine size={14} strokeWidth={1.5} />
                  Editar perfil
                </Link>
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
              <NotebookPages
                texts={textos}
                username={username}
                onClose={() => setLibroAbierto(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
