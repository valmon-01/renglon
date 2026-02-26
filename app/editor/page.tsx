"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Globe, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CONSIGNA = "Escribí sobre un objeto que perdiste";
const META_PALABRAS = 300;

function formatFechaCorta(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const aaaa = d.getFullYear();
  return `${dd}/${mm}/${aaaa}`;
}

function contarPalabras(texto: string): number {
  return texto.trim() === "" ? 0 : texto.trim().split(/\s+/).length;
}

export default function Editor() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [confirmacion, setConfirmacion] = useState<"publicado" | "privado" | null>(null);
  const [pasteMsg, setPasteMsg] = useState(false);

  const wordCount = contarPalabras(contenido);
  const progreso = Math.min((wordCount / META_PALABRAS) * 100, 100);
  const completo = wordCount >= META_PALABRAS;

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    setPasteMsg(true);
    setTimeout(() => setPasteMsg(false), 3500);
  }

  function handleContenidoChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContenido(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }

  async function guardar(publicado: boolean) {
    setGuardando(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await supabase.from("textos").insert({
        user_id: session?.user.id ?? null,
        contenido,
        titulo: titulo.trim() || null,
        consigna: CONSIGNA,
        publicado,
      });

      const hoy = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`renglon_completed_${hoy}`, "1");

      setShowModal(false);
      setConfirmacion(publicado ? "publicado" : "privado");

      setTimeout(() => {
        router.push(publicado ? "/feed" : "/perfil");
      }, 1800);
    } catch {
      setGuardando(false);
    }
  }

  /* ── Pantalla de confirmación ── */
  if (confirmacion) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-papel px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-papel-oscuro">
          {confirmacion === "publicado" ? (
            <Globe size={28} strokeWidth={1.5} className="text-borravino" />
          ) : (
            <Lock size={28} strokeWidth={1.5} className="text-borravino" />
          )}
        </div>
        <p className="font-display text-2xl italic text-tinta">
          {confirmacion === "publicado" ? "Texto publicado" : "Texto guardado"}
        </p>
        <p className="max-w-xs text-sm leading-relaxed text-tinta-suave">
          {confirmacion === "publicado"
            ? "Ya podés leer lo que escribieron los demás."
            : "Tu texto quedó guardado en tu perfil."}
        </p>
      </div>
    );
  }

  /* ── Editor principal ── */
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
          href="/home"
          className="flex items-center gap-2 text-sm text-tinta-suave transition-colors hover:text-tinta"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Volver
        </Link>
        <div className="flex items-center gap-1.5 text-tinta-suave">
          <Check size={14} strokeWidth={2} />
          <span className="text-sm">Guardado</span>
        </div>
      </nav>

      {/* Aviso pegado */}
      {pasteMsg && (
        <div className="border-b border-borde bg-papel-oscuro px-6 py-3 text-center text-sm text-tinta-suave">
          <em>renglón</em> es un espacio de escritura manual — no está permitido pegar texto
        </div>
      )}

      {/* Barra de progreso */}
      <div className="h-[2px] w-full bg-papel-oscuro">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progreso}%`,
            backgroundColor: completo ? "#64313E" : "#C1DBE8",
          }}
        />
      </div>

      {/* Cuaderno */}
      <div className="flex-1 overflow-auto">
        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: "720px",
            minHeight: "calc(100vh - 120px)",
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
              paddingBottom: "120px",
            }}
          >

            {/* Fecha — no editable */}
            <p
              className="select-none text-right font-display italic text-tinta-suave"
              style={{ fontSize: "1rem", lineHeight: "40px" }}
            >
              {formatFechaCorta()}
            </p>

            {/* Consigna — no editable */}
            <p
              className="select-none font-display italic text-tinta"
              style={{ fontSize: "17px", lineHeight: "40px" }}
            >
              {CONSIGNA}
            </p>

            {/* Título */}
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onPaste={handlePaste}
              spellCheck={false}
              placeholder="Título (opcional)"
              className="w-full bg-transparent italic text-tinta outline-none placeholder:text-tinta-suave/40"
              style={{
                fontSize: "17px",
                lineHeight: "40px",
                fontFamily: "Inter, sans-serif",
              }}
            />

            {/* Escritura libre */}
            <textarea
              ref={textareaRef}
              value={contenido}
              onChange={handleContenidoChange}
              onPaste={handlePaste}
              spellCheck={false}
              placeholder="Para que no te frenes con el primer renglón en blanco, acá va uno de cortesía."
              rows={6}
              className="w-full resize-none overflow-hidden bg-transparent text-tinta outline-none placeholder:text-tinta-suave/40"
              style={{
                fontSize: "17px",
                lineHeight: "40px",
                fontFamily: "Inter, sans-serif",
                minHeight: "240px",
              }}
            />


          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-borde bg-papel px-6 py-4">
        <span className="text-sm text-tinta-suave">
          {wordCount} {wordCount === 1 ? "palabra" : "palabras"}
          {!completo && (
            <span className="ml-1 opacity-50">/ {META_PALABRAS}</span>
          )}
          {completo && (
            <span className="ml-2 text-borravino">✓</span>
          )}
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="rounded-[6px] px-4 py-2 text-sm text-tinta-suave transition-colors hover:text-tinta"
          >
            Cancelar
          </Link>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={contenido.trim() === ""}
            className="rounded-[6px] bg-borravino px-5 py-2 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Finalizar texto
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/30 px-4 pb-4 sm:items-center sm:pb-0"
          onClick={() => !guardando && setShowModal(false)}
        >
          <div
            className="w-full max-w-[400px] rounded-[8px] border border-borde bg-blanco-roto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-xl italic text-tinta">
              ¿Qué querés hacer con tu texto?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">
              Solo quienes ya escribieron hoy pueden leer los textos publicados.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => guardar(true)}
                disabled={guardando}
                className="flex items-center justify-center gap-2 rounded-[6px] bg-borravino py-3 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Globe size={16} strokeWidth={1.5} />
                {guardando ? "Publicando…" : "Publicar"}
              </button>
              <button
                type="button"
                onClick={() => guardar(false)}
                disabled={guardando}
                className="flex items-center justify-center gap-2 rounded-[6px] border border-borravino py-3 text-sm font-medium text-borravino transition-colors hover:bg-borravino hover:text-blanco-roto disabled:opacity-50"
                style={{ borderWidth: "1.5px" }}
              >
                <Lock size={16} strokeWidth={1.5} />
                {guardando ? "Guardando…" : "Guardar en privado"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
