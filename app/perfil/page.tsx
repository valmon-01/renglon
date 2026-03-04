"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  consigna: string;
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
  const aa = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${aa}`;
}

function extracto(contenido: string, max = 140): string {
  return contenido.length > max
    ? contenido.slice(0, max).trimEnd() + "…"
    : contenido;
}

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [racha, setRacha] = useState<number>(0);
  const [textos, setTextos] = useState<Texto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [libroAbierto, setLibroAbierto] = useState(false);

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

  function abrirLibro() {
    setLibroAbierto(true);
    setTimeout(() => {
      document.getElementById("escritos")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
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

        {/* Tapa de libreta */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-6 flex flex-col items-center gap-5 px-10 py-10 text-center"
          style={{
            maxWidth: "480px",
            backgroundColor: "#64313E",
            borderRadius: "4px 16px 16px 4px",
            boxShadow: "-4px 0 0 #4a2230, -8px 0 0 #3a1828, 0 8px 32px rgba(28,25,23,0.2)",
          }}
        >
          {/* Label */}
          <p className="font-display italic" style={{ fontSize: "12px", color: "rgba(245,240,232,0.4)" }}>
            renglón
          </p>

          {/* Avatar */}
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-medium"
            style={{ backgroundColor: "rgba(193,219,232,0.2)", color: "#F5F0E8" }}
          >
            {iniciales(username)}
          </div>

          {/* Nombre */}
          <h1
            className="font-display italic"
            style={{ fontSize: "32px", color: "#F5F0E8", lineHeight: 1.2 }}
          >
            {username}
          </h1>

          {/* Bio */}
          {bio && (
            <p style={{ fontSize: "14px", color: "rgba(245,240,232,0.5)", lineHeight: 1.6 }}>
              {bio}
            </p>
          )}

          {/* Separador */}
          <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(245,240,232,0.15)" }} />

          {/* Stats */}
          <div className="flex gap-10">
            <div className="text-center">
              <p className="font-display" style={{ fontSize: "28px", color: "#F5F0E8", lineHeight: 1 }}>
                {textos.length}
              </p>
              <p style={{ fontSize: "10px", color: "rgba(245,240,232,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>
                escritos
              </p>
            </div>
            <div className="text-center">
              <p className="font-display" style={{ fontSize: "28px", color: "#F5F0E8", lineHeight: 1 }}>
                {publicados.length}
              </p>
              <p style={{ fontSize: "10px", color: "rgba(245,240,232,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>
                publicados
              </p>
            </div>
            <div className="text-center">
              <p className="font-display" style={{ fontSize: "28px", color: "#F5F0E8", lineHeight: 1 }}>
                {racha}
              </p>
              <p style={{ fontSize: "10px", color: "rgba(245,240,232,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px" }}>
                días seguidos
              </p>
            </div>
          </div>

          {/* CTA abrir libro */}
          <button
            type="button"
            onClick={abrirLibro}
            className="font-display italic"
            style={{
              backgroundColor: "rgba(245,240,232,0.1)",
              border: "1px solid rgba(245,240,232,0.2)",
              color: "#F5F0E8",
              fontSize: "15px",
              borderRadius: "6px",
              padding: "10px 24px",
              cursor: "pointer",
              marginTop: "4px",
            }}
          >
            Leer escritos →
          </button>
        </motion.div>

        {/* Editar perfil */}
        <div className="mb-10 flex justify-center">
          <Link
            href="/editar-perfil"
            className="flex items-center gap-2 rounded-[6px] border border-borravino px-5 py-2 text-sm text-borravino transition-colors hover:bg-borravino hover:text-blanco-roto"
            style={{ borderWidth: "1.5px" }}
          >
            <PenLine size={14} strokeWidth={1.5} />
            Editar perfil
          </Link>
        </div>

        {/* Libro abierto */}
        <AnimatePresence>
          {libroAbierto && (
            <motion.div
              id="escritos"
              initial={{ opacity: 0, rotateY: -8, x: -20 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformPerspective: 1200 }}
            >
              {/* Cerrar libro */}
              <button
                type="button"
                onClick={() => setLibroAbierto(false)}
                className="mb-6 flex items-center gap-1.5 text-sm text-tinta-suave transition-colors hover:text-tinta"
              >
                ← Cerrar libro
              </button>

              {/* Páginas con stagger */}
              <motion.div
                className="flex flex-col gap-4"
                variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                initial="hidden"
                animate="visible"
              >
                {textos.length === 0 ? (
                  <p className="py-16 text-center font-display italic text-tinta-suave">
                    Todavía no escribiste nada.
                  </p>
                ) : (
                  textos.map((texto) => (
                    <motion.div
                      key={texto.id}
                      variants={{
                        hidden: { opacity: 0, y: 12 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
                      }}
                      className="relative overflow-hidden"
                      style={{
                        backgroundColor: "#FDFAF5",
                        borderRadius: "2px 8px 8px 2px",
                        boxShadow: "2px 2px 8px rgba(28,25,23,0.08), -1px 0 0 #D6CFBF",
                        backgroundImage:
                          "repeating-linear-gradient(to bottom, transparent, transparent 31px, #E8E2D8 31px, #E8E2D8 32px)",
                        backgroundPositionY: "40px",
                        padding: "24px 24px 24px 60px",
                      }}
                    >
                      {/* Línea de margen */}
                      <div
                        className="pointer-events-none absolute bottom-0 top-0"
                        style={{ left: "44px", width: "1px", backgroundColor: "#C1DBE8" }}
                      />

                      {/* Fecha + consigna */}
                      <p
                        className="font-display italic text-tinta-suave"
                        style={{ fontSize: "12px", marginBottom: "8px" }}
                      >
                        {fechaCorta(texto.created_at)}{texto.consigna ? ` — ${texto.consigna}` : ""}
                      </p>

                      {/* Título */}
                      {texto.titulo && (
                        <p
                          className="font-display italic text-tinta"
                          style={{ fontSize: "20px", marginBottom: "8px" }}
                        >
                          {texto.titulo}
                        </p>
                      )}

                      {/* Excerpt */}
                      <p className="text-tinta" style={{ fontSize: "14px", lineHeight: "32px" }}>
                        {extracto(texto.contenido)}
                      </p>

                      {/* Leer completo */}
                      <Link
                        href={`/texto/${texto.id}`}
                        className="mt-3 inline-block text-borravino transition-opacity hover:opacity-70"
                        style={{ fontSize: "13px" }}
                      >
                        Leer completo →
                      </Link>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
