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
  const [racha, setRacha] = useState<number>(0);
  const [textos, setTextos] = useState<Texto[]>([]);
  const [tab, setTab] = useState<Tab>("publicados");
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

      <AnimatePresence mode="wait">
        {libroAbierto && (
          <motion.div
            key="libro"
            className="mx-auto max-w-[720px] px-4 pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <NotebookPages
              texts={textos}
              username={username}
              onClose={() => setLibroAbierto(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!libroAbierto && (
      <main className="mx-auto max-w-[720px] px-6 pb-24">

        {/* Tapa de libro */}
        <div
          style={{
            padding: "40px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 400,
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

          {/* Editar perfil — fuera de la tapa */}
          <Link
            href="/editar-perfil"
            style={{ marginTop: 16 }}
            className="flex items-center gap-2 rounded-[6px] border border-borde px-5 py-2 text-sm text-tinta-suave transition-colors hover:border-tinta hover:text-tinta"
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
                {texto.consigna && (
                  <p
                    className="mt-2 font-display italic"
                    style={{ fontSize: "13px", color: "#5C5147" }}
                  >
                    — {texto.consigna}
                  </p>
                )}
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
      )}
    </div>
  );
}
